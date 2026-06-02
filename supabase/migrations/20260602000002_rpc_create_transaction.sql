-- RPC to predictably create transactions, transaction_items, and update stock atomically
CREATE OR REPLACE FUNCTION create_transaction_with_items(
  p_organization_id UUID,
  p_contact_id UUID,
  p_type transaction_type,
  p_reference_number VARCHAR,
  p_tax_rate NUMERIC,
  p_idempotency_key UUID,
  p_payment_status payment_status_type,
  p_items JSONB -- Array of { "product_id": uuid, "quantity": int, "unit_price": numeric, "version": int }
) RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_item JSONB;
  v_subtotal NUMERIC := 0.00;
  v_total_amount NUMERIC := 0.00;
  v_item_total NUMERIC;
  v_product_stock INTEGER;
  v_product_version INTEGER;
  v_is_service BOOLEAN;
BEGIN
  -- 1. Idempotency Check
  SELECT id INTO v_transaction_id 
  FROM transactions 
  WHERE organization_id = p_organization_id AND idempotency_key = p_idempotency_key;
  
  IF v_transaction_id IS NOT NULL THEN
    RETURN v_transaction_id;
  END IF;

  -- 2. Calculate Subtotal from items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_total := (v_item->>'quantity')::INTEGER * (v_item->>'unit_price')::NUMERIC;
    v_subtotal := v_subtotal + v_item_total;
  END LOOP;

  v_total_amount := v_subtotal + (v_subtotal * p_tax_rate);

  -- 3. Create Transaction
  INSERT INTO transactions (
    organization_id, contact_id, type, reference_number, subtotal, tax_rate, total_amount, payment_status, idempotency_key
  )
  VALUES (
    p_organization_id, p_contact_id, p_type, p_reference_number, v_subtotal, p_tax_rate, v_total_amount, p_payment_status, p_idempotency_key
  )
  RETURNING id INTO v_transaction_id;

  -- 4. Process Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_total := (v_item->>'quantity')::INTEGER * (v_item->>'unit_price')::NUMERIC;

    -- Add Transaction Item
    INSERT INTO transaction_items (
      transaction_id, product_id, quantity, unit_price, total_price
    )
    VALUES (
      v_transaction_id, (v_item->>'product_id')::UUID, (v_item->>'quantity')::INTEGER, (v_item->>'unit_price')::NUMERIC, v_item_total
    );

    -- Stock and Concurrency Update
    IF p_type = 'SALE' THEN
      SELECT current_stock, version, is_service INTO v_product_stock, v_product_version, v_is_service
      FROM products_or_services
      WHERE id = (v_item->>'product_id')::UUID AND organization_id = p_organization_id;

      IF v_is_service = FALSE THEN
        IF v_product_stock < (v_item->>'quantity')::INTEGER THEN
          RAISE EXCEPTION 'INSUFFICIENT_STOCK';
        END IF;

        UPDATE products_or_services
        SET current_stock = current_stock - (v_item->>'quantity')::INTEGER,
            version = version + 1
        WHERE id = (v_item->>'product_id')::UUID AND version = coalesce((v_item->>'version')::INTEGER, v_product_version);
        
        IF NOT FOUND THEN
          RAISE EXCEPTION 'CONCURRENT_UPDATE_CONFLICT';
        END IF;
      END IF;
    ELSIF p_type = 'PURCHASE' THEN
      SELECT version, is_service INTO v_product_version, v_is_service
      FROM products_or_services
      WHERE id = (v_item->>'product_id')::UUID AND organization_id = p_organization_id;

      IF v_is_service = FALSE THEN
        UPDATE products_or_services
        SET current_stock = current_stock + (v_item->>'quantity')::INTEGER,
            version = version + 1
        WHERE id = (v_item->>'product_id')::UUID AND version = coalesce((v_item->>'version')::INTEGER, v_product_version);
        
        IF NOT FOUND THEN
          RAISE EXCEPTION 'CONCURRENT_UPDATE_CONFLICT';
        END IF;
      END IF;
    END IF;

  END LOOP;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS) on all tables

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_or_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies

-- 1. Organizations Policy: Users can only select their own organization
CREATE POLICY "tenant_isolation_orgs" ON organizations
  FOR ALL
  USING (
    id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- 2. Profiles Policy: Users can only see profiles in their organization
CREATE POLICY "tenant_isolation_profiles" ON profiles
  FOR ALL
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- 3. Contacts Policy
CREATE POLICY "tenant_isolation_contacts" ON contacts
  FOR ALL
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- 4. Products or Services Policy
CREATE POLICY "tenant_isolation_products" ON products_or_services
  FOR ALL
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- 5. Transactions Policy
CREATE POLICY "tenant_isolation_transactions" ON transactions
  FOR ALL
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- 6. Transaction Items Policy (Derived from transactions)
CREATE POLICY "tenant_isolation_transaction_items" ON transaction_items
  FOR ALL
  USING (
    transaction_id IN (
      SELECT id FROM transactions 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

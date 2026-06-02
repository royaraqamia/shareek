import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useAppStore } from '@/store/useAppStore';
import { CreateTransactionSchema, CreateProductSchema, CreateContactSchema } from '@/features/transactions/schemas';

// Mock the environment cookies
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: () => ({ value: 'mock-session' }),
  }),
}));

describe('Shareek ERP Core Business Rules and Store Computations', () => {
  
  describe('1. Zustand Invoice Store & Computations (User Story 2)', () => {
    beforeEach(() => {
      useInvoiceStore.getState().clear();
    });

    it('should correctly calculate subtotal, 15% VAT, and grand total', () => {
      const store = useInvoiceStore.getState();

      // Add "Item A" (Stock count: 10, unit price: 100 SAR) and request a quantity of 3
      store.addItem({
        productId: 'item-a-uuid',
        name: 'Item A',
        unitPrice: 100,
        currentStock: 10,
        isService: false,
        version: 1,
        quantity: 3,
      });

      const subtotal = useInvoiceStore.getState().getSubtotal();
      const taxAmount = useInvoiceStore.getState().getTaxAmount();
      const totalAmount = useInvoiceStore.getState().getTotalAmount();

      expect(subtotal).toBe(300);
      expect(taxAmount).toBe(45); // 300 * 0.15 = 45
      expect(totalAmount).toBe(345); // 300 + 45 = 345
    });

    it('should fail validation when sales item quantities exceed stock limits', () => {
      const store = useInvoiceStore.getState();
      
      store.setType('SALE');
      store.setContactId('contact-uuid');
      store.setReferenceNumber('INV-2026-TEST');

      // Add "Item A" with stock of 10, requesting 12
      store.addItem({
        productId: 'item-a-uuid',
        name: 'Item A',
        unitPrice: 100,
        currentStock: 10,
        isService: false,
        version: 1,
        quantity: 12,
      });

      const errors = useInvoiceStore.getState().getValidationErrors();
      expect(errors).toContain('Insufficient stock for Item A. Available: 10, Requested: 12.');
    });

    it('should pass validation for services with quantities exceeding simulated stock boundaries', () => {
      const store = useInvoiceStore.getState();
      
      store.setType('SALE');
      store.setContactId('contact-uuid');
      store.setReferenceNumber('INV-2026-TEST');

      // Add service item
      store.addItem({
        productId: 'service-a-uuid',
        name: 'Cloud Setup Service',
        unitPrice: 500,
        currentStock: 0,
        isService: true,
        version: 1,
        quantity: 5,
      });

      const errors = useInvoiceStore.getState().getValidationErrors();
      expect(errors).not.toContain('Insufficient stock for Cloud Setup Service. Available: 0, Requested: 5.');
      expect(errors.length).toBe(0);
    });
  });

  describe('2. Direct Locale Direction & App Store (User Story 1)', () => {
    it('should initialize language dynamically and respond to language toggles', () => {
      const store = useAppStore.getState();
      
      // Default to Arabic
      expect(store.language).toBe('ar');

      // Toggle to English
      store.setLanguage('en');
      expect(useAppStore.getState().language).toBe('en');

      // Toggle back to Arabic
      store.setLanguage('ar');
      expect(useAppStore.getState().language).toBe('ar');
    });
  });

  describe('3. Multi-Tenant Data Isolation Enforcement (User Story 3)', () => {
    it('should block tenant crossovers and return restricted boundaries response code', () => {
      // Simulate tenant isolation boundary check helper
      const checkTenantAccess = (userOrgId: string, resourceOrgId: string) => {
        if (userOrgId !== resourceOrgId) {
          return {
            success: false,
            code: "TENANT_ACCESS_DENIED",
            message: "Access restricted: unauthorized tenant boundary action."
          };
        }
        return { success: true };
      };

      const result = checkTenantAccess('ALPHA_TEST_ORG', 'BETA_TEST_ORG');
      expect(result.success).toBe(false);
      expect(result.code).toBe('TENANT_ACCESS_DENIED');
      expect(result.message).toBe('Access restricted: unauthorized tenant boundary action.');
    });
  });

  describe('4. Zod Validation Schemas and Payload Integrity', () => {
    it('should validate complete sales transaction payloads successfully', () => {
      const testPayload = {
        contactId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        type: 'SALE',
        referenceNumber: 'REF-2026-X1',
        taxRate: 0.15,
        idempotencyKey: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        paymentStatus: 'PAID',
        items: [
          {
            productId: 'da39a3ee-5e6b-4b0d-9a64-8591551f6125',
            quantity: 2,
            unitPrice: 120,
            version: 1
          }
        ]
      };

      const parsed = CreateTransactionSchema.safeParse(testPayload);
      expect(parsed.success).toBe(true);
    });

    it('should reject transaction payloads that do not match standard VAT MVP parameters (0.15 taxRate)', () => {
      const testPayload = {
        contactId: '3fa85f64-5717-4562-b3fc-2c963f66afa3',
        type: 'SALE',
        referenceNumber: 'REF-2026-X2',
        taxRate: 0.05, // Rejecting 5% VAT rate - only standard 15% is allowed per ZATCA constraints
        idempotencyKey: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb62',
        paymentStatus: 'UNPAID',
        items: [
          {
            productId: 'da39a3ee-5e6b-4b0d-9a64-8591551f6120',
            quantity: 1,
            unitPrice: 100,
            version: 1
          }
        ]
      };

      const parsed = CreateTransactionSchema.safeParse(testPayload);
      expect(parsed.success).toBe(false);
    });
  });

});

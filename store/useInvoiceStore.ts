import { create } from 'zustand';

export type InvoiceItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  currentStock: number;
  isService: boolean;
  version: number;
};

interface InvoiceState {
  items: InvoiceItem[];
  taxRate: number;
  contactId: string | null;
  type: 'SALE' | 'PURCHASE';
  referenceNumber: string;

  // Actions
  addItem: (item: Omit<InvoiceItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateUnitPrice: (productId: string, unitPrice: number) => void;
  removeItem: (productId: string) => void;
  setContactId: (contactId: string | null) => void;
  setType: (type: 'SALE' | 'PURCHASE') => void;
  setReferenceNumber: (referenceNumber: string) => void;
  clear: () => void;

  // Computed state getters
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getTotalAmount: () => number;
  getValidationErrors: () => string[];
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  items: [],
  taxRate: 0.15,
  contactId: null,
  type: 'SALE',
  referenceNumber: '',

  addItem: (newItem) => set((state) => {
    const existingItem = state.items.find(i => i.productId === newItem.productId);
    const addQuantity = newItem.quantity || 1;
    
    if (existingItem) {
      return {
        items: state.items.map(item =>
          item.productId === newItem.productId
            ? { ...item, quantity: item.quantity + addQuantity }
            : item
        )
      };
    }

    return {
      items: [...state.items, { ...newItem, quantity: addQuantity }]
    };
  }),

  updateQuantity: (productId, quantity) => set((state) => ({
    items: state.items.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    )
  })),

  updateUnitPrice: (productId, unitPrice) => set((state) => ({
    items: state.items.map(item => 
      item.productId === productId ? { ...item, unitPrice } : item
    )
  })),

  removeItem: (productId) => set((state) => ({
    items: state.items.filter(item => item.productId !== productId)
  })),

  setContactId: (contactId) => set({ contactId }),
  setType: (type) => set({ type }),
  setReferenceNumber: (referenceNumber) => set({ referenceNumber }),
  clear: () => set({ items: [], contactId: null, type: 'SALE', referenceNumber: '' }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  },

  getTaxAmount: () => {
    return get().getSubtotal() * get().taxRate;
  },

  getTotalAmount: () => {
    const subtotal = get().getSubtotal();
    return subtotal + (subtotal * get().taxRate);
  },

  getValidationErrors: () => {
    const { items, type, contactId, referenceNumber } = get();
    const errors: string[] = [];

    if (items.length === 0) {
      errors.push('Invoice must contain at least one item.');
    }

    if (!contactId) {
      errors.push('Please select a contact (client or supplier).');
    }

    if (!referenceNumber.trim()) {
      errors.push('Reference number is required.');
    }

    if (type === 'SALE') {
      items.forEach(item => {
        if (!item.isService && item.quantity > item.currentStock) {
          errors.push(`Insufficient stock for ${item.name}. Available: ${item.currentStock}, Requested: ${item.quantity}.`);
        }
      });
    }

    return errors;
  }
}));

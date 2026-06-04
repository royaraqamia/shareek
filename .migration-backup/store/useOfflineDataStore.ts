import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OfflineMutationPayload = {
  id: string; // unique internal id for the queued event
  type: 'CREATE_TASK' | 'UPDATE_TASK' | 'CREATE_CONTACT' | 'UPDATE_CONTACT' | 'CREATE_INVENTORY' | 'UPDATE_INVENTORY' | 'CREATE_TRANSACTION';
  data: any;
  timestamp: number;
};

interface OfflineDataState {
  // Caches for read operations
  tasks: any[];
  contacts: any[];
  inventory: any[];
  transactions: any[];
  
  // Pending mutations
  mutationQueue: OfflineMutationPayload[];
  
  // Actions
  setTasks: (tasks: any[]) => void;
  setContacts: (contacts: any[]) => void;
  setInventory: (inventory: any[]) => void;
  setTransactions: (transactions: any[]) => void;
  
  enqueueMutation: (mutation: Omit<OfflineMutationPayload, 'id' | 'timestamp'>) => void;
  dequeueMutation: (id: string) => void;
  clearQueue: () => void;
}

export const useOfflineDataStore = create<OfflineDataState>()(
  persist(
    (set, get) => ({
      tasks: [],
      contacts: [],
      inventory: [],
      transactions: [],
      mutationQueue: [],
      
      setTasks: (tasks) => set({ tasks }),
      setContacts: (contacts) => set({ contacts }),
      setInventory: (inventory) => set({ inventory }),
      setTransactions: (transactions) => set({ transactions }),
      
      enqueueMutation: (mutation) => {
        const payload: OfflineMutationPayload = {
          ...mutation,
          id: crypto.randomUUID(),
          timestamp: Date.now()
        };
        set({ mutationQueue: [...get().mutationQueue, payload] });
      },
      
      dequeueMutation: (id) => {
        set({ mutationQueue: get().mutationQueue.filter(m => m.id !== id) });
      },
      
      clearQueue: () => set({ mutationQueue: [] })
    }),
    {
      name: 'shareek-offline-data',
    }
  )
);

import { useEffect, useState } from 'react';
import { useOfflineDataStore, OfflineMutationPayload } from '@/store/useOfflineDataStore';
import { toast } from '@/utils/toast';

// Import all actions
import { createTaskAction, updateTaskAction } from '@/features/tasks/actions';
import { createContact } from '@/features/contacts/actions';
import { createProduct } from '@/features/inventory/actions';
import { createTransaction } from '@/features/transactions/actions';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const { mutationQueue, dequeueMutation } = useOfflineDataStore();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && mutationQueue.length > 0 && !isSyncing) {
      syncOfflineData();
    }
  }, [isOnline, mutationQueue.length, isSyncing]);

  const processMutation = async (mutation: OfflineMutationPayload) => {
    try {
      let res;
      switch (mutation.type) {
        case 'CREATE_TASK':
          res = await createTaskAction(mutation.data);
          break;
        case 'UPDATE_TASK':
          res = await updateTaskAction(mutation.data);
          break;
        case 'CREATE_CONTACT':
          res = await createContact(mutation.data);
          break;
        case 'CREATE_TRANSACTION':
          res = await createTransaction(mutation.data);
          break;
        case 'CREATE_INVENTORY':
          res = await createProduct(mutation.data);
          break;
        // Add more actions here if necessary
        default:
          console.warn('Unknown offline mutation type:', mutation.type);
          return true; // Dequeue unknown
      }
      if (res?.success) return true;
      if (res && ('error' in res || 'code' in res)) {
        console.error('Offline mutation failed:', res);
        return false;
      }
      return true; // Dequeue if undefined
    } catch (e) {
      console.error('Exception running mutation offline sync:', e);
      return false; // Keep in queue
    }
  };

  const syncOfflineData = async () => {
    setIsSyncing(true);
    toast.success('تمت استعادة الاتصال بالإنترنت. جاري مزامنة البيانات...');
    
    // We copy the queue locally to avoid concurrent modification issues
    const queue = useOfflineDataStore.getState().mutationQueue;
    let successCount = 0;

    for (const mutation of queue) {
      const success = await processMutation(mutation);
      if (success) {
        dequeueMutation(mutation.id);
        successCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`اكتملت المزامنة بنجاح لعدد ${successCount} عملية متبقية.`);
    }
    
    setIsSyncing(false);
  };

  return { isOnline, isSyncing, pendingCount: mutationQueue.length };
}

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  MasterTimMarketing, 
  MasterAkunAds, 
  LaporanHarianAds, 
  LaporanHarianCS, 
  DataProspekCRM, 
  TargetKPIMarketing 
} from '../types/app';
import { db, auth } from '../firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface MarketingState {
  timMarketing: MasterTimMarketing[];
  akunAds: MasterAkunAds[];
  laporanAds: LaporanHarianAds[];
  laporanCS: LaporanHarianCS[];
  prospekCRM: DataProspekCRM[];
  targetKPI: TargetKPIMarketing[];
  isLoaded: boolean;
  unsubscribes: (() => void)[];
  
  init: () => Promise<void>;
  cleanup: () => void;
  
  addLaporanAds: (data: Omit<LaporanHarianAds, 'id'>) => void;
  updateLaporanAds: (id: string, data: Partial<LaporanHarianAds>) => void;
  deleteLaporanAds: (id: string) => void;
  
  addLaporanCS: (data: Omit<LaporanHarianCS, 'id'>) => void;
  updateLaporanCS: (id: string, data: Partial<LaporanHarianCS>) => void;
  deleteLaporanCS: (id: string) => void;
  
  addProspekCRM: (data: Omit<DataProspekCRM, 'id'>) => void;
  updateProspekCRM: (id: string, data: Partial<DataProspekCRM>) => void;
  deleteProspekCRM: (id: string) => void;
  
  addTimMarketing: (data: Omit<MasterTimMarketing, 'id'>) => void;
  deleteTimMarketing: (id: string) => void;
  
  addAkunAds: (data: Omit<MasterAkunAds, 'id'>) => void;
  deleteAkunAds: (id: string) => void;
  
  addTargetKPI: (data: Omit<TargetKPIMarketing, 'id'>) => void;
  updateTargetKPI: (id: string, data: Partial<TargetKPIMarketing>) => void;
  deleteTargetKPI: (id: string) => void;
}

const addDocument = async (collectionName: string, data: any) => {
  try {
    await setDoc(doc(db, collectionName, data.id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${collectionName}/${data.id}`);
  }
};

const updateDocument = async (collectionName: string, id: string, updates: any) => {
  try {
    await updateDoc(doc(db, collectionName, id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
  }
};

const deleteDocument = async (collectionName: string, id: string) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
};

export const useMarketingStore = create<MarketingState>((set, get) => ({
  timMarketing: [],
  akunAds: [],
  laporanAds: [],
  laporanCS: [],
  prospekCRM: [],
  targetKPI: [],
  isLoaded: false,
  unsubscribes: [],

  init: async () => {
    if (get().isLoaded) return;

    const unsubscribes: (() => void)[] = [];

    const setupListener = (collectionName: string, stateKey: keyof MarketingState) => {
      const unsub = onSnapshot(collection(db, collectionName), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        set({ [stateKey]: data } as any);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, collectionName);
      });
      unsubscribes.push(unsub);
    };

    setupListener('timMarketing', 'timMarketing');
    setupListener('akunAds', 'akunAds');
    setupListener('laporanAds', 'laporanAds');
    setupListener('laporanCS', 'laporanCS');
    setupListener('prospekCRM', 'prospekCRM');
    setupListener('targetKPI', 'targetKPI');

    set({ isLoaded: true, unsubscribes });
  },

  cleanup: () => {
    get().unsubscribes.forEach(unsub => unsub());
    set({ isLoaded: false, unsubscribes: [] });
  },

  addLaporanAds: (data) => {
    const newItem = { ...data, id: uuidv4() };
    set((state) => ({ laporanAds: [newItem, ...state.laporanAds] }));
    addDocument('laporanAds', newItem);
  },
  
  updateLaporanAds: (id, data) => {
    set((state) => ({
      laporanAds: state.laporanAds.map(item => item.id === id ? { ...item, ...data } : item)
    }));
    updateDocument('laporanAds', id, data);
  },
  
  deleteLaporanAds: (id) => {
    set((state) => ({
      laporanAds: state.laporanAds.filter(item => item.id !== id)
    }));
    deleteDocument('laporanAds', id);
  },

  addLaporanCS: (data) => {
    const newItem = { ...data, id: uuidv4() };
    set((state) => ({ laporanCS: [newItem, ...state.laporanCS] }));
    addDocument('laporanCS', newItem);
  },
  
  updateLaporanCS: (id, data) => {
    set((state) => ({
      laporanCS: state.laporanCS.map(item => item.id === id ? { ...item, ...data } : item)
    }));
    updateDocument('laporanCS', id, data);
  },
  
  deleteLaporanCS: (id) => {
    set((state) => ({
      laporanCS: state.laporanCS.filter(item => item.id !== id)
    }));
    deleteDocument('laporanCS', id);
  },

  addProspekCRM: (data) => {
    const newItem = { ...data, id: uuidv4() };
    set((state) => ({ prospekCRM: [newItem, ...state.prospekCRM] }));
    addDocument('prospekCRM', newItem);
  },
  
  updateProspekCRM: (id, data) => {
    set((state) => ({
      prospekCRM: state.prospekCRM.map(item => item.id === id ? { ...item, ...data } : item)
    }));
    updateDocument('prospekCRM', id, data);
  },
  
  deleteProspekCRM: (id) => {
    set((state) => ({
      prospekCRM: state.prospekCRM.filter(item => item.id !== id)
    }));
    deleteDocument('prospekCRM', id);
  },

  addTimMarketing: (data) => {
    const newItem = { ...data, id: uuidv4() };
    set((state) => ({ timMarketing: [newItem, ...state.timMarketing] }));
    addDocument('timMarketing', newItem);
  },
  
  deleteTimMarketing: (id) => {
    set((state) => ({
      timMarketing: state.timMarketing.filter(item => item.id !== id)
    }));
    deleteDocument('timMarketing', id);
  },

  addAkunAds: (data) => {
    const newItem = { ...data, id: uuidv4() };
    set((state) => ({ akunAds: [newItem, ...state.akunAds] }));
    addDocument('akunAds', newItem);
  },
  
  deleteAkunAds: (id) => {
    set((state) => ({
      akunAds: state.akunAds.filter(item => item.id !== id)
    }));
    deleteDocument('akunAds', id);
  },

  addTargetKPI: (data) => {
    const newItem = { ...data, id: uuidv4() };
    set((state) => ({ targetKPI: [newItem, ...state.targetKPI] }));
    addDocument('targetKPI', newItem);
  },
  
  updateTargetKPI: (id, data) => {
    set((state) => ({
      targetKPI: state.targetKPI.map(item => item.id === id ? { ...item, ...data } : item)
    }));
    updateDocument('targetKPI', id, data);
  },
  
  deleteTargetKPI: (id) => {
    set((state) => ({
      targetKPI: state.targetKPI.filter(item => item.id !== id)
    }));
    deleteDocument('targetKPI', id);
  }
}));

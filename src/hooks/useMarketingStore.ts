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
import { fetchFromGoogleSheets, postToGoogleSheets } from '../services/googleSheetsService';

const STORAGE_KEYS = {
  TIM_MARKETING: 'app_tim_marketing',
  AKUN_ADS: 'app_akun_ads',
  LAPORAN_ADS: 'app_laporan_ads',
  LAPORAN_CS: 'app_laporan_cs',
  PROSPEK_CRM: 'app_prospek_crm',
  TARGET_KPI: 'app_target_kpi',
};

// Initial Mock Data
const INITIAL_TIM: MasterTimMarketing[] = [
  { id: 'MKT-01', namaLengkap: 'Ahmad Advertiser', posisi: 'Advertiser', status: 'Aktif' },
  { id: 'MKT-02', namaLengkap: 'Budi CS', posisi: 'CS Admin', status: 'Aktif' },
];

const INITIAL_AKUN: MasterAkunAds[] = [
  { id: 'ADS-01', namaAkun: 'FB_Kampus_Utama', platform: 'Facebook' },
  { id: 'ADS-02', namaAkun: 'IG_Promo_Maret', platform: 'Instagram' },
];

interface MarketingState {
  timMarketing: MasterTimMarketing[];
  akunAds: MasterAkunAds[];
  laporanAds: LaporanHarianAds[];
  laporanCS: LaporanHarianCS[];
  prospekCRM: DataProspekCRM[];
  targetKPI: TargetKPIMarketing[];
  isLoaded: boolean;
  
  init: () => Promise<void>;
  
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

export const useMarketingStore = create<MarketingState>((set, get) => ({
  timMarketing: [],
  akunAds: [],
  laporanAds: [],
  laporanCS: [],
  prospekCRM: [],
  targetKPI: [],
  isLoaded: false,

  init: async () => {
    if (get().isLoaded) return;

    // Load from localStorage first
    const loadedTim = localStorage.getItem(STORAGE_KEYS.TIM_MARKETING);
    const loadedAkun = localStorage.getItem(STORAGE_KEYS.AKUN_ADS);
    const loadedLaporanAds = localStorage.getItem(STORAGE_KEYS.LAPORAN_ADS);
    const loadedLaporanCS = localStorage.getItem(STORAGE_KEYS.LAPORAN_CS);
    const loadedProspek = localStorage.getItem(STORAGE_KEYS.PROSPEK_CRM);
    const loadedKPI = localStorage.getItem(STORAGE_KEYS.TARGET_KPI);

    set({
      timMarketing: loadedTim ? JSON.parse(loadedTim) : INITIAL_TIM,
      akunAds: loadedAkun ? JSON.parse(loadedAkun) : INITIAL_AKUN,
      laporanAds: loadedLaporanAds ? JSON.parse(loadedLaporanAds) : [],
      laporanCS: loadedLaporanCS ? JSON.parse(loadedLaporanCS) : [],
      prospekCRM: loadedProspek ? JSON.parse(loadedProspek) : [],
      targetKPI: loadedKPI ? JSON.parse(loadedKPI) : [],
      isLoaded: true
    });

    // Then sync with Google Sheets
    const sheetsData = await fetchFromGoogleSheets();
    if (sheetsData) {
      set((state) => {
        const newState = { ...state };
        
        const mergeData = (local: any[], remote: any[]) => {
          if (!remote || remote.length === 0) return local;
          const remoteIds = new Set(remote.map((r: any) => r.id));
          const localOnly = local.filter((l: any) => !remoteIds.has(l.id));
          
          // Keep remote items, but append local items that aren't on remote yet
          // This prevents newly added items from disappearing before they sync
          return [...remote, ...localOnly];
        };

        if (sheetsData.TimMarketing) newState.timMarketing = mergeData(state.timMarketing, sheetsData.TimMarketing);
        if (sheetsData.AkunAds) newState.akunAds = mergeData(state.akunAds, sheetsData.AkunAds);
        if (sheetsData.LaporanAds) newState.laporanAds = mergeData(state.laporanAds, sheetsData.LaporanAds);
        if (sheetsData.LaporanCS) newState.laporanCS = mergeData(state.laporanCS, sheetsData.LaporanCS);
        if (sheetsData.ProspekCRM) newState.prospekCRM = mergeData(state.prospekCRM, sheetsData.ProspekCRM);
        if (sheetsData.TargetKPI) newState.targetKPI = mergeData(state.targetKPI, sheetsData.TargetKPI);
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEYS.TIM_MARKETING, JSON.stringify(newState.timMarketing));
        localStorage.setItem(STORAGE_KEYS.AKUN_ADS, JSON.stringify(newState.akunAds));
        localStorage.setItem(STORAGE_KEYS.LAPORAN_ADS, JSON.stringify(newState.laporanAds));
        localStorage.setItem(STORAGE_KEYS.LAPORAN_CS, JSON.stringify(newState.laporanCS));
        localStorage.setItem(STORAGE_KEYS.PROSPEK_CRM, JSON.stringify(newState.prospekCRM));
        localStorage.setItem(STORAGE_KEYS.TARGET_KPI, JSON.stringify(newState.targetKPI));
        
        return newState;
      });
    }
  },

  addLaporanAds: (data) => {
    const newItem = { ...data, id: uuidv4() };
    set((state) => {
      const newData = [newItem, ...state.laporanAds];
      localStorage.setItem(STORAGE_KEYS.LAPORAN_ADS, JSON.stringify(newData));
      return { laporanAds: newData };
    });
    postToGoogleSheets('add', 'LaporanAds', newItem);
  },
  
  updateLaporanAds: (id, data) => {
    set((state) => {
      const newData = state.laporanAds.map(item => item.id === id ? { ...item, ...data } : item);
      localStorage.setItem(STORAGE_KEYS.LAPORAN_ADS, JSON.stringify(newData));
      return { laporanAds: newData };
    });
    postToGoogleSheets('update', 'LaporanAds', { id, ...data });
  },
  
  deleteLaporanAds: (id) => {
    set((state) => {
      const newData = state.laporanAds.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.LAPORAN_ADS, JSON.stringify(newData));
      return { laporanAds: newData };
    });
    postToGoogleSheets('delete', 'LaporanAds', { id });
  },

  addLaporanCS: (data) => {
    const newItem = { ...data, id: uuidv4() };
    set((state) => {
      const newData = [newItem, ...state.laporanCS];
      localStorage.setItem(STORAGE_KEYS.LAPORAN_CS, JSON.stringify(newData));
      return { laporanCS: newData };
    });
    postToGoogleSheets('add', 'LaporanCS', newItem);
  },
  
  updateLaporanCS: (id, data) => {
    set((state) => {
      const newData = state.laporanCS.map(item => item.id === id ? { ...item, ...data } : item);
      localStorage.setItem(STORAGE_KEYS.LAPORAN_CS, JSON.stringify(newData));
      return { laporanCS: newData };
    });
    postToGoogleSheets('update', 'LaporanCS', { id, ...data });
  },
  
  deleteLaporanCS: (id) => {
    set((state) => {
      const newData = state.laporanCS.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.LAPORAN_CS, JSON.stringify(newData));
      return { laporanCS: newData };
    });
    postToGoogleSheets('delete', 'LaporanCS', { id });
  },

  addProspekCRM: (data) => {
    const newItem = { ...data, id: uuidv4() };
    set((state) => {
      const newData = [newItem, ...state.prospekCRM];
      localStorage.setItem(STORAGE_KEYS.PROSPEK_CRM, JSON.stringify(newData));
      return { prospekCRM: newData };
    });
    postToGoogleSheets('add', 'ProspekCRM', newItem);
  },
  
  updateProspekCRM: (id, data) => {
    set((state) => {
      const newData = state.prospekCRM.map(item => item.id === id ? { ...item, ...data } : item);
      localStorage.setItem(STORAGE_KEYS.PROSPEK_CRM, JSON.stringify(newData));
      return { prospekCRM: newData };
    });
    postToGoogleSheets('update', 'ProspekCRM', { id, ...data });
  },
  
  deleteProspekCRM: (id) => {
    set((state) => {
      const newData = state.prospekCRM.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.PROSPEK_CRM, JSON.stringify(newData));
      return { prospekCRM: newData };
    });
    postToGoogleSheets('delete', 'ProspekCRM', { id });
  },

  addTimMarketing: (data) => {
    const newItem = { ...data, id: uuidv4() };
    set((state) => {
      const newData = [newItem, ...state.timMarketing];
      localStorage.setItem(STORAGE_KEYS.TIM_MARKETING, JSON.stringify(newData));
      return { timMarketing: newData };
    });
    postToGoogleSheets('add', 'TimMarketing', newItem);
  },
  
  deleteTimMarketing: (id) => {
    set((state) => {
      const newData = state.timMarketing.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.TIM_MARKETING, JSON.stringify(newData));
      return { timMarketing: newData };
    });
    postToGoogleSheets('delete', 'TimMarketing', { id });
  },

  addAkunAds: (data) => {
    const newItem = { ...data, id: uuidv4() };
    set((state) => {
      const newData = [newItem, ...state.akunAds];
      localStorage.setItem(STORAGE_KEYS.AKUN_ADS, JSON.stringify(newData));
      return { akunAds: newData };
    });
    postToGoogleSheets('add', 'AkunAds', newItem);
  },
  
  deleteAkunAds: (id) => {
    set((state) => {
      const newData = state.akunAds.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.AKUN_ADS, JSON.stringify(newData));
      return { akunAds: newData };
    });
    postToGoogleSheets('delete', 'AkunAds', { id });
  },

  addTargetKPI: (data) => {
    const newItem = { ...data, id: uuidv4() };
    set((state) => {
      const newData = [newItem, ...state.targetKPI];
      localStorage.setItem(STORAGE_KEYS.TARGET_KPI, JSON.stringify(newData));
      return { targetKPI: newData };
    });
    postToGoogleSheets('add', 'TargetKPI', newItem);
  },
  
  updateTargetKPI: (id, data) => {
    set((state) => {
      const newData = state.targetKPI.map(item => item.id === id ? { ...item, ...data } : item);
      localStorage.setItem(STORAGE_KEYS.TARGET_KPI, JSON.stringify(newData));
      return { targetKPI: newData };
    });
    postToGoogleSheets('update', 'TargetKPI', { id, ...data });
  },
  
  deleteTargetKPI: (id) => {
    set((state) => {
      const newData = state.targetKPI.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.TARGET_KPI, JSON.stringify(newData));
      return { targetKPI: newData };
    });
    postToGoogleSheets('delete', 'TargetKPI', { id });
  }
}));

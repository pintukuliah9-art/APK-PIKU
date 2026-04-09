export const DEFAULT_GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwiypLD5DjdL9Dcq49PQ7hjLQ8aDNEgRRzKv_WN6LPeADh0D80Km2hZYoHB_PzMYO0y/exec';

export type SyncAction = 'add' | 'update' | 'delete';

function getMarketingUrl() {
  try {
    const settingsStr = localStorage.getItem('app_settings');
    if (settingsStr) {
      const settings = JSON.parse(settingsStr);
      if (settings.googleScriptUrl_marketing) {
        return settings.googleScriptUrl_marketing;
      }
    }
  } catch (e) {
    console.error('Error parsing settings:', e);
  }
  return (import.meta as any).env.VITE_GOOGLE_SHEETS_URL || DEFAULT_GOOGLE_SHEETS_URL;
}

export async function fetchFromGoogleSheets() {
  const url = getMarketingUrl();
  if (!url) return null;
  
  try {
    const sheetsToFetch = [
      { key: 'TimMarketing', name: 'master_tim_marketing' },
      { key: 'AkunAds', name: 'master_akun_ads' },
      { key: 'LaporanAds', name: 'laporan_harian_ads' },
      { key: 'LaporanCS', name: 'laporan_harian_cs' },
      { key: 'ProspekCRM', name: 'data_prospek_crm' },
      { key: 'TargetKPI', name: 'target_kpi_marketing' }
    ];

    const combinedData: any = {};
    
    const fetchPromises = sheetsToFetch.map(async (sheet) => {
      try {
        const fetchUrl = new URL(url);
        fetchUrl.searchParams.delete('action');
        fetchUrl.searchParams.delete('sheetName');
        fetchUrl.searchParams.append('action', 'read');
        fetchUrl.searchParams.append('sheetName', sheet.name);
        fetchUrl.searchParams.append('_t', Date.now().toString());

        const response = await fetch(fetchUrl.toString(), {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success') {
            combinedData[sheet.key] = result.data;
          }
        }
      } catch (e) {
        // Ignore individual sheet errors
      }
    });

    await Promise.all(fetchPromises);
    return combinedData;
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    return null;
  }
}

export async function postToGoogleSheets(action: SyncAction, table: string, data: any) {
  const url = getMarketingUrl();
  if (!url) return false;

  try {
    let mappedAction = action === 'add' ? 'create' : action;
    let sheetName = '';
    
    switch (table) {
      case 'TimMarketing': sheetName = 'master_tim_marketing'; break;
      case 'AkunAds': sheetName = 'master_akun_ads'; break;
      case 'LaporanAds': sheetName = 'laporan_harian_ads'; break;
      case 'LaporanCS': sheetName = 'laporan_harian_cs'; break;
      case 'ProspekCRM': sheetName = 'data_prospek_crm'; break;
      case 'TargetKPI': sheetName = 'target_kpi_marketing'; break;
      default: sheetName = table;
    }

    const payload = {
      action: mappedAction,
      sheetName,
      id: data?.id,
      data: mappedAction !== 'delete' ? data : undefined
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // GAS requires text/plain for CORS
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) throw new Error('Failed to post to Google Sheets');
    const result = await response.json();
    return result.status === 'success';
  } catch (error) {
    console.error('Error posting to Google Sheets:', error);
    return false;
  }
}

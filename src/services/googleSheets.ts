import { SavedReport, Transaction, AppSettings } from '../types/app';

export async function fetchFromGoogleSheets(scriptUrl: string) {
  try {
    // Add cache-busting parameter
    const urlObj = new URL(scriptUrl);
    urlObj.searchParams.append('_t', Date.now().toString());
    
    // If the URL already has action=getAllData, we might want to handle it differently,
    // but the new backend doesn't support getAllData. We need to fetch each sheet.
    const sheetsToFetch = [
      { key: 'reports', name: 'saved_reports' },
      { key: 'internalReports', name: 'saved_internal_reports' },
      { key: 'marketingReports', name: 'saved_marketing_reports' },
      { key: 'adminReports', name: 'saved_admin_reports' },
      { key: 'financeReports', name: 'saved_finance_reports' },
      { key: 'transactions', name: 'transactions' },
      { key: 'dailyAllocations', name: 'daily_allocations' },
      { key: 'kasLedger', name: 'kas_ledger' },
      { key: 'students', name: 'students' },
      { key: 'studentPayments', name: 'student_payments' },
      { key: 'interKasLoans', name: 'inter_kas_loans' },
      { key: 'studentAdministrations', name: 'student_administrations' },
      { key: 'suratList', name: 'surat' },
      { key: 'inventarisList', name: 'inventaris' },
      { key: 'employees', name: 'employees' },
      { key: 'attendances', name: 'attendances' },
      { key: 'leaveRequests', name: 'leave_requests' },
      { key: 'settings', name: 'app_settings' }
    ];

    const combinedData: any = {};
    
    // Fetch all sheets in parallel
    const fetchPromises = sheetsToFetch.map(async (sheet) => {
      try {
        const fetchUrl = new URL(scriptUrl);
        // Remove any existing action/sheetName params just in case
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
    
    // For settings, the backend returns an array of rows, but the app expects an object.
    if (Array.isArray(combinedData.settings)) {
      if (combinedData.settings.length > 0) {
        combinedData.settings = combinedData.settings[0]; // Assuming settings is a single row
      } else {
        delete combinedData.settings; // Remove if empty so we don't spread an empty array
      }
    }

    return combinedData;
  } catch (error) {
    // Suppress console.error to avoid spamming the console on network/CORS errors
    throw error;
  }
}

export async function postToGoogleSheets(
  scriptUrl: string, 
  action: string, 
  data: any
) {
  try {
    let mappedAction = 'create';
    let sheetName = '';
    let id = data?.id;

    const actionLower = action.toLowerCase();
    
    // Determine action type
    if (actionLower.includes('delete_all') || actionLower.includes('deleteall')) {
      mappedAction = 'deleteAll';
    } else if (actionLower.includes('update') || actionLower.includes('edit')) {
      mappedAction = 'update';
    } else if (actionLower.includes('delete') || actionLower.includes('remove')) {
      mappedAction = 'delete';
    } else if (actionLower.includes('create') || actionLower.includes('add')) {
      mappedAction = 'create';
    }

    // Determine sheet name
    if (actionLower.includes('report')) {
      if (actionLower.includes('internal')) sheetName = 'saved_internal_reports';
      else if (actionLower.includes('marketing')) sheetName = 'saved_marketing_reports';
      else if (actionLower.includes('admin')) sheetName = 'saved_admin_reports';
      else if (actionLower.includes('finance')) sheetName = 'saved_finance_reports';
      else sheetName = 'saved_reports';
    } else if (actionLower.includes('transaction')) {
      sheetName = 'transactions';
    } else if (actionLower.includes('allocation')) {
      sheetName = 'daily_allocations';
    } else if (actionLower.includes('ledger')) {
      sheetName = 'kas_ledger';
    } else if (actionLower.includes('student_payment') || actionLower.includes('studentpayment')) {
      sheetName = 'student_payments';
    } else if (actionLower.includes('student_administration') || actionLower.includes('studentadministration')) {
      sheetName = 'student_administrations';
    } else if (actionLower.includes('student')) {
      sheetName = 'students';
    } else if (actionLower.includes('interkasloan') || actionLower.includes('inter_kas_loan')) {
      sheetName = 'inter_kas_loans';
    } else if (actionLower.includes('surat')) {
      sheetName = 'surat';
    } else if (actionLower.includes('inventaris')) {
      sheetName = 'inventaris';
    } else if (actionLower.includes('employee')) {
      sheetName = 'employees';
    } else if (actionLower.includes('attendance')) {
      sheetName = 'attendances';
    } else if (actionLower.includes('leave_request') || actionLower.includes('leaverequest')) {
      sheetName = 'leave_requests';
    } else if (actionLower.includes('settings')) {
      sheetName = 'app_settings';
    }

    if (!sheetName) {
      // Fallback to original behavior if we can't map it
      const response = await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify({ action, data, payload: data }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    }

    const payload = {
      action: mappedAction,
      sheetName,
      id: id,
      data: mappedAction !== 'delete' ? data : undefined
    };

    // If it's a batch action, we might need to handle it differently.
    // The new backend doesn't support batch.
    if (action === 'BATCH_TRANSACTIONS') {
      // Handle batch manually
      if (data.adds) {
        for (const item of data.adds) {
          await fetch(scriptUrl, { method: 'POST', body: JSON.stringify({ action: 'create', sheetName: 'transactions', data: item }) });
        }
      }
      if (data.deletes) {
        for (const id of data.deletes) {
          await fetch(scriptUrl, { method: 'POST', body: JSON.stringify({ action: 'delete', sheetName: 'transactions', id }) });
        }
      }
      return { status: 'success' };
    }

    const response = await fetch(scriptUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    // Suppress console.error to avoid spamming the console on network/CORS errors
    throw error;
  }
}

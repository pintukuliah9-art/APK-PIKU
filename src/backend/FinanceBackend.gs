/**
 * BACKEND KEUANGAN - GOOGLE APPS SCRIPT
 * 
 * Cara Penggunaan:
 * 1. Buka Google Sheets yang sama (Database Pintu Kuliah)
 * 2. Klik Ekstensi > Apps Script
 * 3. Buat file script baru (File > New > Script) dan beri nama "FinanceBackend.gs"
 * 4. Hapus kode yang ada, paste seluruh kode ini
 * 5. Simpan (Ctrl+S)
 * 6. Klik Terapkan (Deploy) > Deployment Baru
 * 7. Pilih jenis: Aplikasi Web (Web App)
 * 8. Akses: Siapa saja (Anyone)
 * 9. Salin URL Web App yang dihasilkan dan masukkan ke pengaturan aplikasi (Backend Keuangan)
 */

const SHEETS = {
  TRANSACTIONS: 'Transactions',
  DAILY_ALLOCATIONS: 'DailyAllocations',
  KAS_LEDGER: 'KasLedger',
  STUDENT_PAYMENTS: 'StudentPayments',
  INTER_KAS_LOANS: 'InterKasLoans'
};

const COLS = {
  TRANSACTIONS: ['id', 'reportId', 'date', 'partnerName', 'type', 'category', 'amount', 'description', 'json_data'],
  DAILY_ALLOCATIONS: ['id', 'date', 'totalIncome', 'json_data'],
  KAS_LEDGER: ['id', 'kasId', 'date', 'inAmount', 'outAmount', 'json_data'],
  STUDENT_PAYMENTS: ['id', 'date', 'studentName', 'json_data'],
  INTER_KAS_LOANS: ['id', 'date', 'fromKasId', 'toKasId', 'amount', 'json_data']
};

function setupFinance() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Object.keys(SHEETS).forEach(key => {
    const sheetName = SHEETS[key];
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(COLS[key]);
      sheet.setFrozenRows(1);
    }
  });
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    const transactions = getSheetData(ss, SHEETS.TRANSACTIONS, rowToJSON);
    const dailyAllocations = getSheetData(ss, SHEETS.DAILY_ALLOCATIONS, rowToJSON);
    const kasLedger = getSheetData(ss, SHEETS.KAS_LEDGER, rowToJSON);
    const studentPayments = getSheetData(ss, SHEETS.STUDENT_PAYMENTS, rowToJSON);
    const interKasLoans = getSheetData(ss, SHEETS.INTER_KAS_LOANS, rowToJSON);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: {
        transactions,
        dailyAllocations,
        kasLedger,
        studentPayments,
        interKasLoans
      }
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    // Handle CORS preflight
    if (!e.postData) {
      return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    const payload = params.data;
    
    setupFinance(); // Ensure sheets exist

    if (action === 'SAVE_TRANSACTION') {
      saveRow(SHEETS.TRANSACTIONS, payload.id, transactionToRow(payload));
    } else if (action === 'DELETE_TRANSACTION') {
      deleteRow(SHEETS.TRANSACTIONS, payload.id);
    } else if (action === 'DELETE_ALL_TRANSACTIONS') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(SHEETS.TRANSACTIONS);
      if (sheet && sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
      }
    } else if (action === 'BATCH_TRANSACTIONS') {
      if (payload.deletes && payload.deletes.length > 0) {
        payload.deletes.forEach(id => deleteRow(SHEETS.TRANSACTIONS, id));
      }
      if (payload.adds && payload.adds.length > 0) {
        payload.adds.forEach(t => saveRow(SHEETS.TRANSACTIONS, t.id, transactionToRow(t)));
      }
    } else if (action === 'addDailyAllocation' || action === 'updateDailyAllocation') {
      saveRow(SHEETS.DAILY_ALLOCATIONS, payload.id, dailyAllocationToRow(payload));
    } else if (action === 'deleteDailyAllocation') {
      deleteRow(SHEETS.DAILY_ALLOCATIONS, payload.id);
    } else if (action === 'addLedgerEntry' || action === 'updateLedgerEntry') {
      saveRow(SHEETS.KAS_LEDGER, payload.id, kasLedgerToRow(payload));
    } else if (action === 'deleteLedgerEntry') {
      deleteRow(SHEETS.KAS_LEDGER, payload.id);
    } else if (action === 'addStudentPayment' || action === 'updateStudentPayment') {
      saveRow(SHEETS.STUDENT_PAYMENTS, payload.id, studentPaymentToRow(payload));
    } else if (action === 'deleteStudentPayment') {
      deleteRow(SHEETS.STUDENT_PAYMENTS, payload.id);
    } else if (action === 'addInterKasLoan' || action === 'updateInterKasLoan') {
      saveRow(SHEETS.INTER_KAS_LOANS, payload.id, interKasLoanToRow(payload));
    } else if (action === 'deleteInterKasLoan') {
      deleteRow(SHEETS.INTER_KAS_LOANS, payload.id);
    } else if (action === 'SYNC_ALL') {
      saveCollection(SHEETS.TRANSACTIONS, payload.transactions, transactionToRow);
      saveCollection(SHEETS.DAILY_ALLOCATIONS, payload.dailyAllocations, dailyAllocationToRow);
      saveCollection(SHEETS.KAS_LEDGER, payload.kasLedger, kasLedgerToRow);
      saveCollection(SHEETS.STUDENT_PAYMENTS, payload.studentPayments, studentPaymentToRow);
      saveCollection(SHEETS.INTER_KAS_LOANS, payload.interKasLoans, interKasLoanToRow);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Action not found in Finance Backend'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Finance action completed successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// --- Helpers for Mapping ---

function rowToJSON(row) {
  try {
    const jsonStr = row[row.length - 1];
    if (!jsonStr) return null;
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}

function transactionToRow(t) { return [t.id, t.reportId || '', t.date, t.partnerName || '', t.type || '', t.category || '', t.amount || 0, t.description || '', JSON.stringify(t)]; }
function dailyAllocationToRow(d) { return [d.id, d.date, d.totalIncome || 0, JSON.stringify(d)]; }
function kasLedgerToRow(k) { return [k.id, k.kasId || '', k.date, k.inAmount || 0, k.outAmount || 0, JSON.stringify(k)]; }
function studentPaymentToRow(p) { return [p.id, p.date, p.studentName || '', JSON.stringify(p)]; }
function interKasLoanToRow(l) { return [l.id, l.date, l.fromKasId || '', l.toKasId || '', l.amount || 0, JSON.stringify(l)]; }

// --- CRUD Helpers ---

function getSheetData(ss, sheetName, parserFn) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  return data.map(parserFn).filter(item => item !== null);
}

function saveRow(sheetName, id, rowData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

function deleteRow(sheetName, id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function saveCollection(sheetName, items, rowMapper) {
  if (!items || items.length === 0) return;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  const existingIds = {};
  for (let i = 1; i < data.length; i++) {
    existingIds[data[i][0]] = i + 1;
  }
  
  items.forEach(item => {
    const rowData = rowMapper(item);
    const rowIndex = existingIds[item.id];
    
    if (rowIndex) {
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
      existingIds[item.id] = sheet.getLastRow();
    }
  });
}

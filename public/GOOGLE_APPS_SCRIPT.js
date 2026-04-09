/**
 * GOOGLE APPS SCRIPT CODE
 * =======================
 * 
 * Salin kode di bawah ini ke editor Google Apps Script Anda.
 * Cara penggunaan:
 * 1. Buka https://script.google.com/
 * 2. Klik "New Project"
 * 3. Hapus semua kode yang ada, lalu tempelkan kode ini.
 * 4. Simpan project (Ctrl+S).
 * 5. Jalankan fungsi 'setup' sekali untuk membuat Sheet dan Kolom.
 *    - Pilih 'setup' dari dropdown di toolbar atas.
 *    - Klik 'Run'.
 *    - Berikan izin (Review Permissions -> Choose Account -> Advanced -> Go to ... (unsafe) -> Allow).
 * 6. Klik "Deploy" -> "New deployment".
 * 7. Pilih type "Web app".
 * 8. Description: "Backend TIM PIKU".
 * 9. Execute as: "Me".
 * 10. Who has access: "Anyone" (Penting agar aplikasi bisa akses).
 * 11. Klik "Deploy".
 * 12. Salin "Web app URL" yang muncul.
 * 13. Tempel URL tersebut di menu Pengaturan aplikasi TIM PIKU Anda.
 */

const SHEETS = {
  REPORTS: 'Reports',
  TRANSACTIONS: 'Transactions',
  SETTINGS: 'Settings',
  DAILY_ALLOCATIONS: 'DailyAllocations',
  KAS_LEDGER: 'KasLedger',
  STUDENTS: 'Students',
  STUDENT_PAYMENTS: 'StudentPayments',
  INTER_KAS_LOANS: 'InterKasLoans',
  STUDENT_ADMINISTRATIONS: 'StudentAdministrations',
  MARKETING_REPORTS: 'MarketingReports',
  INTERNAL_REPORTS: 'InternalReports'
};

const COLS = {
  REPORTS: ['id', 'partnerName', 'month', 'year', 'status', 'updatedAt', 'json_data'],
  TRANSACTIONS: ['id', 'reportId', 'date', 'partnerName', 'type', 'category', 'amount', 'description', 'json_data'],
  SETTINGS: ['key', 'value'],
  DAILY_ALLOCATIONS: ['id', 'date', 'totalIncome', 'json_data'],
  KAS_LEDGER: ['id', 'kasId', 'date', 'inAmount', 'outAmount', 'json_data'],
  STUDENTS: ['id', 'name', 'kampus', 'json_data'],
  STUDENT_PAYMENTS: ['id', 'date', 'studentName', 'json_data'],
  INTER_KAS_LOANS: ['id', 'date', 'fromKasId', 'toKasId', 'amount', 'json_data'],
  STUDENT_ADMINISTRATIONS: ['id', 'studentName', 'json_data'],
  MARKETING_REPORTS: ['id', 'date', 'json_data'],
  INTERNAL_REPORTS: ['id', 'partnerName', 'month', 'year', 'json_data']
};

function setup() {
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
  // If action is specified, handle it
  if (e.parameter.action === 'getAllData') {
    // Legacy support for financeData format if needed, but we return standard format
    const data = getAllData();
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = getAllData();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    const payload = params.data;
    
    if (action === 'SYNC_ALL') {
      saveAllData(payload);
    } else if (action === 'SAVE_REPORT') {
      saveRow(SHEETS.REPORTS, payload.id, reportToRow(payload));
    } else if (action === 'DELETE_REPORT') {
      deleteRow(SHEETS.REPORTS, payload.id);
    } else if (action === 'DELETE_ALL_REPORTS') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(SHEETS.REPORTS);
      if (sheet && sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
      }
    } else if (action === 'SAVE_INTERNAL_REPORT') {
      saveRow(SHEETS.INTERNAL_REPORTS, payload.id, internalReportToRow(payload));
    } else if (action === 'DELETE_INTERNAL_REPORT') {
      deleteRow(SHEETS.INTERNAL_REPORTS, payload.id);
    } else if (action === 'SAVE_TRANSACTION') {
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
    } else if (action === 'SAVE_SETTINGS') {
      saveSettings(payload);
    } else if (action === 'addDailyAllocation' || action === 'updateDailyAllocation') {
      saveRow(SHEETS.DAILY_ALLOCATIONS, payload.id, dailyAllocationToRow(payload));
    } else if (action === 'deleteDailyAllocation') {
      deleteRow(SHEETS.DAILY_ALLOCATIONS, payload.id);
    } else if (action === 'addLedgerEntry' || action === 'updateLedgerEntry') {
      saveRow(SHEETS.KAS_LEDGER, payload.id, kasLedgerToRow(payload));
    } else if (action === 'deleteLedgerEntry') {
      deleteRow(SHEETS.KAS_LEDGER, payload.id);
    } else if (action === 'SAVE_STUDENT') {
      saveRow(SHEETS.STUDENTS, payload.id, studentToRow(payload));
    } else if (action === 'DELETE_STUDENT') {
      deleteRow(SHEETS.STUDENTS, payload.id);
    } else if (action === 'addStudentPayment' || action === 'updateStudentPayment') {
      saveRow(SHEETS.STUDENT_PAYMENTS, payload.id, studentPaymentToRow(payload));
    } else if (action === 'deleteStudentPayment') {
      deleteRow(SHEETS.STUDENT_PAYMENTS, payload.id);
    } else if (action === 'addInterKasLoan' || action === 'updateInterKasLoan') {
      saveRow(SHEETS.INTER_KAS_LOANS, payload.id, interKasLoanToRow(payload));
    } else if (action === 'deleteInterKasLoan') {
      deleteRow(SHEETS.INTER_KAS_LOANS, payload.id);
    } else if (action === 'SAVE_STUDENT_ADMINISTRATION') {
      saveRow(SHEETS.STUDENT_ADMINISTRATIONS, payload.id, studentAdministrationToRow(payload));
    } else if (action === 'DELETE_STUDENT_ADMINISTRATION') {
      deleteRow(SHEETS.STUDENT_ADMINISTRATIONS, payload.id);
    } else if (action === 'SAVE_MARKETING_REPORT') {
      saveRow(SHEETS.MARKETING_REPORTS, payload.id, marketingReportToRow(payload));
    } else if (action === 'DELETE_MARKETING_REPORT') {
      deleteRow(SHEETS.MARKETING_REPORTS, payload.id);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const reports = getSheetData(ss, SHEETS.REPORTS, rowToJSON);
  const transactions = getSheetData(ss, SHEETS.TRANSACTIONS, rowToJSON);
  const settings = getSettingsData(ss);
  
  const dailyAllocations = getSheetData(ss, SHEETS.DAILY_ALLOCATIONS, rowToJSON);
  const kasLedger = getSheetData(ss, SHEETS.KAS_LEDGER, rowToJSON);
  const students = getSheetData(ss, SHEETS.STUDENTS, rowToJSON);
  const studentPayments = getSheetData(ss, SHEETS.STUDENT_PAYMENTS, rowToJSON);
  const interKasLoans = getSheetData(ss, SHEETS.INTER_KAS_LOANS, rowToJSON);
  const studentAdministrations = getSheetData(ss, SHEETS.STUDENT_ADMINISTRATIONS, rowToJSON);
  const marketingReports = getSheetData(ss, SHEETS.MARKETING_REPORTS, rowToJSON);
  const internalReports = getSheetData(ss, SHEETS.INTERNAL_REPORTS, rowToJSON);
  
  return { 
    reports, 
    transactions, 
    settings,
    dailyAllocations,
    kasLedger,
    students,
    studentPayments,
    interKasLoans,
    studentAdministrations,
    marketingReports,
    internalReports
  };
}

function getSheetData(ss, sheetName, parserFn) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  return data.map(parserFn).filter(item => item !== null);
}

function getSettingsData(ss) {
  const sheet = ss.getSheetByName(SHEETS.SETTINGS);
  if (!sheet || sheet.getLastRow() <= 1) return null;
  
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  const settings = {};
  data.forEach(row => {
    try {
      settings[row[0]] = JSON.parse(row[1]);
    } catch (e) {
      settings[row[0]] = row[1];
    }
  });
  
  if (settings['app_settings']) return settings['app_settings'];
  return null;
}

// --- Helpers for Mapping ---

function rowToJSON(row) {
  try {
    // The JSON data is always in the last column
    const jsonStr = row[row.length - 1];
    if (!jsonStr) return null;
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}

function reportToRow(r) { return [r.id, r.partnerName, r.month, r.year, r.status, r.updatedAt, JSON.stringify(r)]; }
function internalReportToRow(r) { return [r.id, r.partnerName, r.month, r.year, JSON.stringify(r)]; }
function transactionToRow(t) { return [t.id, t.reportId || '', t.date, t.partnerName, t.type, t.category, t.amount, t.description, JSON.stringify(t)]; }
function dailyAllocationToRow(d) { return [d.id, d.date, d.totalIncome, JSON.stringify(d)]; }
function kasLedgerToRow(k) { return [k.id, k.kasId, k.date, k.inAmount, k.outAmount, JSON.stringify(k)]; }
function studentToRow(s) { return [s.id, s.name, s.kampus, JSON.stringify(s)]; }
function studentPaymentToRow(p) { return [p.id, p.date, p.studentName, JSON.stringify(p)]; }
function interKasLoanToRow(l) { return [l.id, l.date, l.fromKasId, l.toKasId, l.amount, JSON.stringify(l)]; }
function studentAdministrationToRow(a) { return [a.id, a.studentName, JSON.stringify(a)]; }
function marketingReportToRow(m) { return [m.id, m.date, JSON.stringify(m)]; }

// --- CRUD Helpers ---

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

function saveSettings(settings) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.SETTINGS);
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  let found = false;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'app_settings') {
      sheet.getRange(i + 1, 2).setValue(JSON.stringify(settings));
      found = true;
      break;
    }
  }
  
  if (!found) {
    sheet.appendRow(['app_settings', JSON.stringify(settings)]);
  }
}

function saveAllData(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const saveCollection = (sheetName, items, rowMapper) => {
    if (!items || items.length === 0) return;
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    
    // We don't clear contents to avoid deleting data that wasn't synced
    // Instead we update existing or append new
    items.forEach(item => {
      saveRow(sheetName, item.id, rowMapper(item));
    });
  };
  
  saveCollection(SHEETS.REPORTS, payload.reports, reportToRow);
  saveCollection(SHEETS.TRANSACTIONS, payload.transactions, transactionToRow);
  saveCollection(SHEETS.DAILY_ALLOCATIONS, payload.dailyAllocations, dailyAllocationToRow);
  saveCollection(SHEETS.KAS_LEDGER, payload.kasLedger, kasLedgerToRow);
  saveCollection(SHEETS.STUDENTS, payload.students, studentToRow);
  saveCollection(SHEETS.STUDENT_PAYMENTS, payload.studentPayments, studentPaymentToRow);
  saveCollection(SHEETS.INTER_KAS_LOANS, payload.interKasLoans, interKasLoanToRow);
  saveCollection(SHEETS.STUDENT_ADMINISTRATIONS, payload.studentAdministrations, studentAdministrationToRow);
  saveCollection(SHEETS.MARKETING_REPORTS, payload.marketingReports, marketingReportToRow);
  saveCollection(SHEETS.INTERNAL_REPORTS, payload.internalReports, internalReportToRow);
  
  if (payload.settings) {
    saveSettings(payload.settings);
  }
}


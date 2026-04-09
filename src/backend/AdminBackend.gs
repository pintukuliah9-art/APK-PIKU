/**
 * BACKEND ADMINISTRASI - GOOGLE APPS SCRIPT
 * 
 * Cara Penggunaan:
 * 1. Buka Google Sheets yang sama (Database Pintu Kuliah)
 * 2. Klik Ekstensi > Apps Script
 * 3. Buat file script baru (File > New > Script) dan beri nama "AdminBackend.gs"
 * 4. Hapus kode yang ada, paste seluruh kode ini
 * 5. Simpan (Ctrl+S)
 * 6. Klik Terapkan (Deploy) > Deployment Baru
 * 7. Pilih jenis: Aplikasi Web (Web App)
 * 8. Akses: Siapa saja (Anyone)
 * 9. Salin URL Web App yang dihasilkan dan masukkan ke pengaturan aplikasi (Backend Administrasi)
 */

const SHEETS = {
  STUDENTS: 'Students',
  STUDENT_ADMINISTRATIONS: 'StudentAdministrations',
  SURAT: 'Surat',
  INVENTARIS: 'Inventaris',
  EMPLOYEES: 'Employees',
  ATTENDANCES: 'Attendances',
  LEAVE_REQUESTS: 'LeaveRequests'
};

const COLS = {
  STUDENTS: ['id', 'name', 'kampus', 'json_data'],
  STUDENT_ADMINISTRATIONS: ['id', 'studentName', 'json_data'],
  SURAT: ['id', 'nomorSurat', 'perihal', 'json_data'],
  INVENTARIS: ['id', 'kodeBarang', 'namaBarang', 'json_data'],
  EMPLOYEES: ['id', 'nik', 'namaLengkap', 'json_data'],
  ATTENDANCES: ['id', 'employeeId', 'tanggal', 'json_data'],
  LEAVE_REQUESTS: ['id', 'employeeId', 'tanggalMulai', 'json_data']
};

function setupAdmin() {
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
    
    const students = getSheetData(ss, SHEETS.STUDENTS, rowToJSON);
    const studentAdministrations = getSheetData(ss, SHEETS.STUDENT_ADMINISTRATIONS, rowToJSON);
    const suratList = getSheetData(ss, SHEETS.SURAT, rowToJSON);
    const inventarisList = getSheetData(ss, SHEETS.INVENTARIS, rowToJSON);
    const employees = getSheetData(ss, SHEETS.EMPLOYEES, rowToJSON);
    const attendances = getSheetData(ss, SHEETS.ATTENDANCES, rowToJSON);
    const leaveRequests = getSheetData(ss, SHEETS.LEAVE_REQUESTS, rowToJSON);
    const settings = getSettings(ss);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: {
        students,
        studentAdministrations,
        suratList,
        inventarisList,
        employees,
        attendances,
        leaveRequests,
        settings
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
    
    setupAdmin(); // Ensure sheets exist

    if (action === 'SAVE_STUDENT') {
      saveRow(SHEETS.STUDENTS, payload.id, studentToRow(payload));
    } else if (action === 'DELETE_STUDENT') {
      deleteRow(SHEETS.STUDENTS, payload.id);
    } else if (action === 'SAVE_STUDENT_ADMINISTRATION') {
      saveRow(SHEETS.STUDENT_ADMINISTRATIONS, payload.id, studentAdministrationToRow(payload));
    } else if (action === 'DELETE_STUDENT_ADMINISTRATION') {
      deleteRow(SHEETS.STUDENT_ADMINISTRATIONS, payload.id);
    } else if (action === 'SAVE_SURAT') {
      saveRow(SHEETS.SURAT, payload.id, suratToRow(payload));
    } else if (action === 'DELETE_SURAT') {
      deleteRow(SHEETS.SURAT, payload.id);
    } else if (action === 'SAVE_INVENTARIS') {
      saveRow(SHEETS.INVENTARIS, payload.id, inventarisToRow(payload));
    } else if (action === 'DELETE_INVENTARIS') {
      deleteRow(SHEETS.INVENTARIS, payload.id);
    } else if (action === 'SAVE_EMPLOYEE') {
      saveRow(SHEETS.EMPLOYEES, payload.id, employeeToRow(payload));
    } else if (action === 'DELETE_EMPLOYEE') {
      deleteRow(SHEETS.EMPLOYEES, payload.id);
    } else if (action === 'SAVE_ATTENDANCE') {
      saveRow(SHEETS.ATTENDANCES, payload.id, attendanceToRow(payload));
    } else if (action === 'DELETE_ATTENDANCE') {
      deleteRow(SHEETS.ATTENDANCES, payload.id);
    } else if (action === 'SAVE_LEAVE_REQUEST') {
      saveRow(SHEETS.LEAVE_REQUESTS, payload.id, leaveRequestToRow(payload));
    } else if (action === 'DELETE_LEAVE_REQUEST') {
      deleteRow(SHEETS.LEAVE_REQUESTS, payload.id);
    } else if (action === 'UPDATE_SETTINGS') {
      return handleUpdateSettings(payload);
    } else if (action === 'SYNC_ALL') {
      saveCollection(SHEETS.STUDENTS, payload.students, studentToRow);
      saveCollection(SHEETS.STUDENT_ADMINISTRATIONS, payload.studentAdministrations, studentAdministrationToRow);
      saveCollection(SHEETS.SURAT, payload.suratList, suratToRow);
      saveCollection(SHEETS.INVENTARIS, payload.inventarisList, inventarisToRow);
      saveCollection(SHEETS.EMPLOYEES, payload.employees, employeeToRow);
      saveCollection(SHEETS.ATTENDANCES, payload.attendances, attendanceToRow);
      saveCollection(SHEETS.LEAVE_REQUESTS, payload.leaveRequests, leaveRequestToRow);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Action not found in Admin Backend'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Admin action completed successfully'
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

function studentToRow(s) { return [s.id, s.name, s.kampus || '', JSON.stringify(s)]; }
function studentAdministrationToRow(a) { return [a.id, a.namaLengkap || a.studentName || '', JSON.stringify(a)]; }
function suratToRow(s) { return [s.id, s.nomorSurat || '', s.perihal || '', JSON.stringify(s)]; }
function inventarisToRow(i) { return [i.id, i.kodeBarang || '', i.namaBarang || '', JSON.stringify(i)]; }
function employeeToRow(e) { return [e.id, e.nik || '', e.namaLengkap || '', JSON.stringify(e)]; }
function attendanceToRow(a) { return [a.id, a.employeeId || '', a.tanggal || '', JSON.stringify(a)]; }
function leaveRequestToRow(l) { return [l.id, l.employeeId || '', l.tanggalMulai || '', JSON.stringify(l)]; }

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

function getSettings(ss) {
  const sheet = ss.getSheetByName('Settings');
  if (!sheet) return {};
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return {};
  
  const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  const settings = {};
  
  data.forEach(row => {
    const key = row[0];
    const value = row[1];
    
    if (key) {
      try {
        // Coba parse JSON string kembali menjadi object/array
        settings[key] = JSON.parse(value);
      } catch (e) {
        // Jika bukan JSON, biarkan sebagai string
        settings[key] = value;
      }
    }
  });
  
  return settings;
}

function handleUpdateSettings(settingsData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Settings');
  
  // Buat sheet 'Settings' jika belum ada
  if (!sheet) {
    sheet = ss.insertSheet('Settings');
    sheet.appendRow(['Key', 'Value']);
    sheet.getRange('A1:B1').setFontWeight('bold');
  }
  
  // Hapus data settings yang lama
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 2).clearContent();
  }
  
  // Konversi object settings menjadi baris data
  const rows = [];
  for (const [key, value] of Object.entries(settingsData)) {
    // Simpan object/array sebagai JSON string
    const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
    rows.push([key, valueToStore]);
  }
  
  // Tulis data settings yang baru
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Settings updated successfully'
  })).setMimeType(ContentService.MimeType.JSON);
}

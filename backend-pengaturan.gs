// backend-pengaturan.gs
// Salin dan tempel kode ini ke Google Apps Script editor Anda (Extensions > Apps Script di Google Sheets)

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const payload = data.data;

    // Handle updating settings
    if (action === 'UPDATE_SETTINGS') {
      return handleUpdateSettings(payload);
    }
    
    // Tambahkan action lain di sini jika diperlukan...
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Action not found'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
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

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getAllData') {
    return handleGetAllData();
  }
  
  // Default response
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Backend Pengaturan is running'
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleGetAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const result = {
    settings: getSettings(ss)
    // Tambahkan pengambilan data lain di sini jika diperlukan...
  };
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    data: result
  })).setMimeType(ContentService.MimeType.JSON);
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

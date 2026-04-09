/**
 * BACKEND MARKETING - GOOGLE APPS SCRIPT
 * 
 * Cara Penggunaan:
 * 1. Buka Google Sheets baru, beri nama "Database Marketing Pintu Kuliah"
 * 2. Klik Ekstensi > Apps Script
 * 3. Hapus kode yang ada, paste seluruh kode ini
 * 4. Simpan (Ctrl+S)
 * 5. Klik Terapkan (Deploy) > Deployment Baru
 * 6. Pilih jenis: Aplikasi Web (Web App)
 * 7. Akses: Siapa saja (Anyone)
 * 8. Salin URL Web App yang dihasilkan dan masukkan ke pengaturan aplikasi (Backend Marketing)
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

const TABLES = {
  TimMarketing: ['id', 'namaLengkap', 'posisi', 'status'],
  AkunAds: ['id', 'namaAkun', 'platform', 'status'],
  LaporanAds: ['id', 'tanggal', 'idAkun', 'namaCampaign', 'jangkauan', 'impresi', 'linkClicks', 'leadsDihasilkan', 'spend'],
  LaporanCS: ['id', 'tanggal', 'idKaryawan', 'leadsDiterima', 'chatMerespon', 'closingReguler', 'closingRPL', 'closingAkselerasi'],
  ProspekCRM: ['id', 'tanggal', 'namaProspek', 'noWhatsApp', 'programDiminati', 'statusProspek', 'idKaryawanHandle'],
  TargetKPI: ['id', 'bulan', 'tahun', 'targetLeads', 'targetClosing', 'targetCPA']
};

function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  for (const [tableName, headers] of Object.entries(TABLES)) {
    let sheet = ss.getSheetByName(tableName);
    if (!sheet) {
      sheet = ss.insertSheet(tableName);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f4f6');
      sheet.setFrozenRows(1);
    }
  }
}

function doGet(e) {
  try {
    initializeSheets();
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const result = {};
    
    for (const [tableName, headers] of Object.entries(TABLES)) {
      const sheet = ss.getSheetByName(tableName);
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        if (data.length > 1) {
          const rows = data.slice(1);
          result[tableName] = rows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });
        } else {
          result[tableName] = [];
        }
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: result
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    if (!e.postData) {
      return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    initializeSheets();
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const requestData = JSON.parse(e.postData.contents);
    
    const action = requestData.action; // 'add', 'update', 'delete'
    const table = requestData.table;   // 'TimMarketing', etc.
    const payload = requestData.data;  // object with id and fields
    
    // Legacy support
    if (action === 'SAVE_MARKETING_REPORT' || action === 'DELETE_MARKETING_REPORT' || action === 'SYNC_ALL') {
       return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Legacy action ignored. Please use the new app version.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (!TABLES[table]) {
      throw new Error(`Table ${table} not found`);
    }

    const sheet = ss.getSheetByName(table);
    const headers = TABLES[table];
    
    if (action === 'add') {
      const rowData = headers.map(header => payload[header] !== undefined ? payload[header] : '');
      sheet.appendRow(rowData);
    } 
    else if (action === 'update') {
      const data = sheet.getDataRange().getValues();
      const rowIndex = data.findIndex(row => row[0] === payload.id);
      if (rowIndex > 0) {
        const rowData = headers.map((header, index) => payload[header] !== undefined ? payload[header] : data[rowIndex][index]);
        sheet.getRange(rowIndex + 1, 1, 1, rowData.length).setValues([rowData]);
      }
    }
    else if (action === 'delete') {
      const data = sheet.getDataRange().getValues();
      const rowIndex = data.findIndex(row => row[0] === payload.id);
      if (rowIndex > 0) {
        sheet.deleteRow(rowIndex + 1);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: `Action ${action} on ${table} successful`
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

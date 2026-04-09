// backend.gs
// Salin dan tempel kode ini ke Google Apps Script editor Anda (Extensions > Apps Script di Google Sheets)

// Daftar lengkap semua sheet beserta nama kolomnya yang sudah disesuaikan dengan formulir aplikasi
const SCHEMA = {
  'saved_reports': ['id', 'partnerName', 'month', 'year', 'summary', 'pintuKuliah', 'kunciSarjana', 'detailedIncome', 'detailedExpense', 'signature', 'createdAt', 'updatedAt', 'status'],
  'saved_internal_reports': ['id', 'month', 'year', 'summary', 'marketing', 'finance', 'admin', 'hr', 'attachments', 'signature', 'createdAt', 'updatedAt', 'status'],
  'saved_marketing_reports': ['id', 'periodeLaporan', 'picMarketing', 'month', 'year', 'foreword', 'conclusion', 'adsSummary', 'campaignRecaps', 'dailyAdsExpenses', 'csRecaps', 'crmProspects', 'attachments', 'signature', 'createdAt', 'updatedAt', 'status'],
  'saved_admin_reports': ['id', 'periodeLaporan', 'picAdministrasi', 'month', 'year', 'foreword', 'conclusion', 'mailRecaps', 'inventoryItems', 'regulerData', 'rplData', 'akselerasiData', 'attachments', 'signature', 'createdAt', 'updatedAt', 'status'],
  'saved_finance_reports': ['id', 'periodeLaporan', 'month', 'year', 'pintuKuliah', 'kunciSarjana', 'attachments', 'signature', 'createdAt', 'updatedAt', 'status'],
  'transactions': ['id', 'reportId', 'date', 'partnerName', 'type', 'category', 'amount', 'description'],
  'daily_allocations': ['id', 'date', 'totalIncome', 'allocations', 'notes', 'transactionId'],
  'kas_ledger': ['id', 'kasId', 'date', 'depositDate', 'inAmount', 'outAmount', 'loanedOutAmount', 'borrowedAmount', 'notes', 'kampus', 'referenceId', 'transactionId'],
  'students': ['id', 'name', 'phone', 'program', 'registrationDate', 'fileStatus', 'documents', 'notes'],
  'student_payments': ['id', 'date', 'studentName', 'kampus', 'totalSetor', 'totalTagih', 'statusTagihan', 'sudahBayar', 'sisaTagihan', 'ketBerkas', 'catatanKeuangan', 'periodePengiriman', 'transactionId'],
  'inter_kas_loans': ['id', 'borrowerKasId', 'lenderKasId', 'amount', 'purpose', 'date', 'dueDate', 'status'],
  
  // INI ADALAH KOLOM ADMINISTRASI MAHASISWA YANG SUDAH DISAMAKAN DENGAN FORMULIR
  'student_administrations': [
    'id', 'tanggalDaftar', 'jalurInput', 'koordinator', 'program', 'perguruanTinggi', 'programStudi', 
    'kloterInput', 'periodePendaftaran', 'periodeKuliah', 'namaLengkap', 'tempatLahir', 'tanggalLahir', 
    'jenisKelamin', 'agama', 'nik', 'namaIbu', 'kelurahan', 'kecamatan', 'kabupatenKota', 'provinsi', 
    'email', 'noHp', 'lulusSmaS1', 'lulusKuliah', 'linkDoc', 'ketDokumen', 'statusBerkas', 'catatanMahasiswa', 
    'tanggalInput', 'statusData', 'linkPddikti', 'linkPisn', 'nimNpm', 'nomorIjazah', 'tanggalMasuk', 
    'tanggalLulus', 'pasPhoto', 'judulSkripsi', 'banPt', 'gelarAkademik', 'ketRevisi',
    'totalSetor', 'statusTagihan', 'totalTagih', 'sudahBayar', 'sisaTagihan', 'ketBerkas', 'catatanKeuangan', 'periodePengiriman'
  ],
  
  'master_tim_marketing': ['id', 'namaLengkap', 'posisi', 'status'],
  'master_akun_ads': ['id', 'namaAkun', 'platform'],
  'laporan_harian_ads': ['id', 'tanggal', 'akunAdsId', 'campaignName', 'anggaran', 'impresi', 'klik', 'ctr', 'cpc', 'leads', 'cpl', 'closing', 'cpa', 'roas', 'keterangan'],
  'laporan_harian_cs': ['id', 'tanggal', 'timMarketingId', 'leadsMasuk', 'leadsValid', 'leadsFollowUp', 'closing', 'konversi', 'potensiRevenue', 'keterangan'],
  'data_prospek_crm': ['id', 'tanggalMasuk', 'namaProspek', 'sumberLeads', 'kampusTujuan', 'programDiminati', 'statusFollowUp', 'timMarketingId', 'keterangan'],
  'target_kpi_marketing': ['id', 'bulan', 'tahun', 'targetLeads', 'targetClosing', 'targetCPL', 'targetCPA'],
  'surat': ['id', 'jenis', 'nomorSurat', 'tanggalSurat', 'pengirimPenerima', 'perihal', 'keterangan', 'fileUrl'],
  'inventaris': ['id', 'kodeBarang', 'namaBarang', 'kategori', 'jumlah', 'kondisi', 'lokasi', 'keterangan', 'tanggalMasuk'],
  'employees': ['id', 'nik', 'namaLengkap', 'tempatLahir', 'tanggalLahir', 'alamat', 'jabatan', 'departemen', 'tanggalBergabung', 'statusKaryawan', 'status', 'noHp', 'email', 'kontakDarurat', 'sisaCuti', 'gajiPokok', 'rekeningBank'],
  'attendances': ['id', 'employeeId', 'tanggal', 'status', 'jamMasuk', 'jamKeluar', 'lemburMulai', 'lemburSelesai', 'keterlambatanMenit', 'keterangan'],
  'leave_requests': ['id', 'employeeId', 'tanggalMulai', 'tanggalSelesai', 'jumlahHari', 'jenisCuti', 'alasan', 'status', 'catatanHR'],
  'app_settings': ['id', 'googleScriptUrl', 'googleScriptUrl_marketing', 'googleScriptUrl_finance', 'googleScriptUrl_admin', 'defaultSigner', 'programPaths', 'studyPrograms', 'adAccounts', 'admins', 'coordinators', 'campusesReguler', 'campusesRPL', 'campusesAkselerasi', 'adminOptions', 'incomeCategories', 'expenseCategories', 'theme', 'hrJabatan', 'hrDepartemen', 'hrStatusKaryawan']
};

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  for (const sheetName in SCHEMA) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    const headers = SCHEMA[sheetName];
    const existingHeaders = getHeaders(sheet);
    
    if (existingHeaders.length === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
    } else {
      const missingHeaders = headers.filter(h => !existingHeaders.includes(h));
      if (missingHeaders.length > 0) {
        const newHeaders = existingHeaders.concat(missingHeaders);
        if (newHeaders.length > sheet.getMaxColumns()) {
          sheet.insertColumnsAfter(sheet.getMaxColumns(), newHeaders.length - sheet.getMaxColumns());
        }
        sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
        sheet.getRange(1, 1, 1, newHeaders.length).setFontWeight("bold").setBackground("#f3f3f3");
      }
    }
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const sheetName = payload.sheetName;
    const data = payload.data;
    const id = payload.id;

    if (!sheetName) return createJsonResponse({ status: 'error', message: 'sheetName is required' });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (SCHEMA[sheetName]) {
         if (SCHEMA[sheetName].length > sheet.getMaxColumns()) {
           sheet.insertColumnsAfter(sheet.getMaxColumns(), SCHEMA[sheetName].length - sheet.getMaxColumns());
         }
         sheet.appendRow(SCHEMA[sheetName]);
         sheet.getRange(1, 1, 1, SCHEMA[sheetName].length).setFontWeight("bold").setBackground("#f3f3f3");
      }
    }

    if (action === 'create') return handleCreate(sheet, data);
    else if (action === 'update') return handleUpdate(sheet, id, data);
    else if (action === 'delete') return handleDelete(sheet, id);
    else if (action === 'deleteAll') return handleDeleteAll(sheet);
    else if (action === 'read') return handleRead(sheet);
    else return createJsonResponse({ status: 'error', message: 'Unknown action' });
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    const sheetName = e.parameter.sheetName;

    if (action === 'read' && sheetName) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        if (SCHEMA[sheetName]) {
           if (SCHEMA[sheetName].length > sheet.getMaxColumns()) {
             sheet.insertColumnsAfter(sheet.getMaxColumns(), SCHEMA[sheetName].length - sheet.getMaxColumns());
           }
           sheet.appendRow(SCHEMA[sheetName]);
           sheet.getRange(1, 1, 1, SCHEMA[sheetName].length).setFontWeight("bold").setBackground("#f3f3f3");
        }
        return createJsonResponse({ status: 'success', data: [] }); 
      }
      return handleRead(sheet);
    }
    return createJsonResponse({ status: 'error', message: 'Gunakan metode POST' });
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

function handleCreate(sheet, data) {
  let headers = getHeaders(sheet);
  if (headers.length === 0) {
    headers = Object.keys(data);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
  }

  const newKeys = Object.keys(data).filter(key => !headers.includes(key));
  if (newKeys.length > 0) {
    headers = headers.concat(newKeys);
    if (headers.length > sheet.getMaxColumns()) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
    }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
  }

  const rowData = headers.map(header => {
    let val = data[header];
    return (typeof val === 'object' && val !== null) ? JSON.stringify(val) : (val !== undefined ? val : '');
  });

  sheet.appendRow(rowData);
  return createJsonResponse({ status: 'success', message: 'Data berhasil ditambahkan' });
}

function handleUpdate(sheet, id, data) {
  if (!id) return createJsonResponse({ status: 'error', message: 'ID diperlukan untuk update' });

  let headers = getHeaders(sheet);
  if (headers.length === 0) return createJsonResponse({ status: 'error', message: 'Sheet kosong' });

  const newKeys = Object.keys(data).filter(key => !headers.includes(key));
  if (newKeys.length > 0) {
    headers = headers.concat(newKeys);
    if (headers.length > sheet.getMaxColumns()) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
    }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
  }

  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const idIndex = headers.indexOf('id');

  if (idIndex === -1) return createJsonResponse({ status: 'error', message: 'Kolom id tidak ditemukan' });

  for (let i = 1; i < values.length; i++) {
    if (values[i][idIndex] === id) {
      const rowData = headers.map((header, index) => {
        if (data[header] !== undefined) {
          let val = data[header];
          return (typeof val === 'object' && val !== null) ? JSON.stringify(val) : val;
        }
        return values[i][index];
      });
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([rowData]);
      return createJsonResponse({ status: 'success', message: 'Data berhasil diupdate' });
    }
  }
  
  // Jika ini adalah app_settings dan id adalah settings_1 tapi belum ada, kita buat baru
  if (sheet.getName() === 'app_settings' && id === 'settings_1') {
    return handleCreate(sheet, data);
  }
  
  return createJsonResponse({ status: 'error', message: 'Data tidak ditemukan' });
}

function handleDelete(sheet, id) {
  if (!id) return createJsonResponse({ status: 'error', message: 'ID diperlukan' });
  const headers = getHeaders(sheet);
  const values = sheet.getDataRange().getValues();
  const idIndex = headers.indexOf('id');

  for (let i = 1; i < values.length; i++) {
    if (values[i][idIndex] === id) {
      sheet.deleteRow(i + 1);
      return createJsonResponse({ status: 'success', message: 'Data berhasil dihapus' });
    }
  }
  return createJsonResponse({ status: 'error', message: 'Data tidak ditemukan' });
}

function handleDeleteAll(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  return createJsonResponse({ status: 'success', message: 'Semua data berhasil dihapus' });
}

function handleRead(sheet) {
  const headers = getHeaders(sheet);
  if (headers.length === 0) return createJsonResponse({ status: 'success', data: [] });

  const values = sheet.getDataRange().getValues();
  const result = [];

  for (let i = 1; i < values.length; i++) {
    const obj = {};
    let hasData = false;
    for (let j = 0; j < headers.length; j++) {
      let val = values[i][j];
      if (val !== "") hasData = true;
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      obj[headers[j]] = val;
    }
    if (hasData) result.push(obj);
  }
  return createJsonResponse({ status: 'success', data: result });
}

function getHeaders(sheet) {
  const lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) return [];
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
}

function createJsonResponse(responseObject) {
  return ContentService.createTextOutput(JSON.stringify(responseObject)).setMimeType(ContentService.MimeType.JSON);
}

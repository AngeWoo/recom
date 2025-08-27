// 快取過期時間（秒）。600 秒 = 10 分鐘。您可以根據需求調整。
const CACHE_EXPIRATION_IN_SECONDS = 600; 
const CACHE_KEY = 'v2_spreadsheet_data'; // 快取的唯一鍵名

/**
 * 將工作表轉換為 JSON 物件陣列的輔助函式
 */
function sheetToJSON(sheet) {
  if (!sheet) return [];
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(header => header.toString().trim());
  const data = values.slice(1);
  
  return data.map(row => {
    const rowData = {};
    headers.forEach((header, index) => {
      if (header) {
        rowData[header] = row[index];
      }
    });
    return rowData;
  });
}

/**
 * 從 Google Sheet 讀取所有資料的核心函式
 */
function fetchAllSheetData() {
  console.log('執行慢速讀取：從 Google Sheet 抓取即時資料...');
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  const sheetNames = {
    attractions: '景點資訊',
    transportation: '交通資訊',
    hotels: '住宿資訊',
    restaurants: '餐廳資訊',
    worshipSteps: '參拜步驟',
    qa: 'Q&A',
    docContent: '文件內容'
  };

  const results = {};
  for (const key in sheetNames) {
    const sheet = spreadsheet.getSheetByName(sheetNames[key]);
    results[key] = sheet ? sheetToJSON(sheet) : [];
  }
  return results;
}

/**
 * 當 Web App 收到 GET 請求時執行的主函式
 */
function doGet(e) {
  try {
    const cache = CacheService.getScriptCache();
    const callback = e.parameter.callback;

    // 新增功能：強制刷新快取
    // 如果您在網址後面加上 ?refresh=true，就可以強制清除快取並重新抓取
    if (e.parameter.refresh === 'true') {
      cache.remove(CACHE_KEY);
      console.log('快取已被強制清除。');
    }

    let cachedData = cache.get(CACHE_KEY);
    
    if (cachedData !== null) {
      console.log('快取命中 (Cache Hit)! 直接從快取提供資料。');
    } else {
      console.log('快取未命中 (Cache Miss)。執行資料庫讀取...');
      const freshData = fetchAllSheetData();
      const jsonString = JSON.stringify(freshData);
      cache.put(CACHE_KEY, jsonString, CACHE_EXPIRATION_IN_SECONDS);
      cachedData = jsonString;
    }

    if (callback) {
      const jsonpOutput = `${callback}(${cachedData})`;
      return ContentService.createTextOutput(jsonpOutput)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService.createTextOutput(cachedData)
      .setMimeType(ContentService.MimeType.JSON)
      .withHeaders({'Access-Control-Allow-Origin': '*'});

  } catch (error) {
    const errorResult = { status: 'error', message: error.message };
    // ... (錯誤處理部分不變)
    const errorJsonString = JSON.stringify(errorResult);
    const callback = e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(`${callback}(${errorJsonString})`).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(errorJsonString).setMimeType(ContentService.MimeType.JSON).withHeaders({'Access-Control-Allow-Origin': '*'});
  }
}

/**
 * 處理 CORS 預檢請求 (OPTIONS)
 */
function doOptions(e) {
  return ContentService.createTextOutput('')
    .withHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}
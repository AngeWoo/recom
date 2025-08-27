// --- START: 設定區 ---

// New CSV URLs from Google Sheets
const CSV_URLS = {
    attractions: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZqeYWGl2A4-elzpMtIqHriHbHap3rttyFdwjeyi4Bs69w5TziEk_HR0AwxaLNOlGTWRCrfX4W5fzU/pub?gid=0&single=true&output=csv',
    transportation: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZqeYWGl2A4-elzpMtIqHriHbHap3rttyFdwjeyi4Bs69w5TziEk_HR0AwxaLNOlGTWRCrfX4W5fzU/pub?gid=965763203&single=true&output=csv',
    hotels: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZqeYWGl2A4-elzpMtIqHriHbHap3rttyFdwjeyi4Bs69w5TziEk_HR0AwxaLNOlGTWRCrfX4W5fzU/pub?gid=234560979&single=true&output=csv',
    restaurants: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZqeYWGl2A4-elzpMtIqHriHbHap3rttyFdwjeyi4Bs69w5TziEk_HR0AwxaLNOlGTWRCrfX4W5fzU/pub?gid=679464914&single=true&output=csv',
    worshipSteps: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZqeYWGl2A4-elzpMtIqHriHbHap3rttyFdwjeyi4Bs69w5TziEk_HR0AwxaLNOlGTWRCrfX4W5fzU/pub?gid=1513868775&single=true&output=csv',
    qa: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZqeYWGl2A4-elzpMtIqHriHbHap3rttyFdwjeyi4Bs69w5TziEk_HR0AwxaLNOlGTWRCrfX4W5fzU/pub?gid=1920070534&single=true&output=csv',
    docContent: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZqeYWGl2A4-elzpMtIqHriHbHap3rttyFdwjeyi4Bs69w5TziEk_HR0AwxaLNOlGTWRCrfX4W5fzU/pub?gid=1205883126&single=true&output=csv'
};

const SHINYUAN_COORDS = [35.6888, 139.4135];
const FETCH_TIMEOUT = 15000;

// --- START: 本地備份資料 ---
const LOCAL_BACKUP_DATA = {
    attractions: [
        { "id": 1, "name_zh": "國營昭和紀念公園", "name_jp": "国営昭和記念公園", "description": "佔地廣闊的國營公園，四季皆有不同花卉盛開，是放鬆身心的絕佳去處。", "photos": "images/showa_kinen_park.jpg" },
        { "id": 2, "name_zh": "高幡不動尊金剛寺", "name_jp": "高幡不動尊金剛寺", "description": "關東三大不動之一，歷史悠久，寺內有許多重要文化財。", "photos": "images/takahata_fudoson.jpg" },
        { "id": 3, "name_zh": "三麗鷗彩虹樂園", "name_jp": "サンリオピューロランド", "description": "集結Hello Kitty等三麗鷗明星的室內主題樂園，不受天氣影響。", "photos": "images/sanrio_puroland.jpg" }
    ],
    transportation: [
        { "from_location": "羽田機場", "to_location": "立川", "transport_type": "利木津巴士", "duration": 90, "cost": 1800, "description": "一車直達，適合行李多者。" },
        { "from_location": "羽田機場", "to_location": "立川", "transport_type": "電車(經川崎)", "duration": 80, "cost": 990, "description": "CP值高，需轉乘一次。" },
        { "from_location": "成田機場", "to_location": "立川", "transport_type": "N'EX + JR中央線", "duration": 120, "cost": 3250, "description": "舒適，但需在新宿轉乘。" },
        { "from_location": "成田機場", "to_location": "立川", "transport_type": "Skyliner + JR山手線/中央線", "duration": 110, "cost": 2720, "description": "速度快，但需轉乘兩次。" }
    ],
    hotels: [
        { "id": 1, "name": "立川皇宮飯店 (Palace Hotel Tachikawa)", "price_per_night": 15000, "rating": 4.5, "amenities": "車站直達, 健身房, 泳池", "booking_url": "https://www.palace-t.co.jp/" },
        { "id": 2, "name": "東京立川索拉諾飯店 (SORANO HOTEL)", "price_per_night": 30000, "rating": 4.8, "amenities": "無邊際泳池, Spa, 景觀房", "booking_url": "https://soranohotel.com/" },
        { "id": 3, "name": "東橫INN 立川站北口 (Toyoko Inn Tokyo Tachikawa-eki Kita-guchi)", "price_per_night": 8000, "rating": 4.0, "amenities": "含早餐, CP值高, 近車站", "booking_url": "https://www.toyoko-inn.com/search/detail/00026" }
    ],
    restaurants: [
        { "id": 1, "name_zh": "一蘭拉麵 立川店", "description": "知名的客製化豚骨拉麵連鎖店。", "address": "東京都立川市曙町２丁目３−５", "opening_hours": "10:00-22:00", "price_range": "¥1000-¥2000", "coordinates": "35.6987, 139.4152" },
        { "id": 2, "name_zh": "AFURI 拉麵 立川店", "description": "以清爽的柚子鹽味拉麵聞名。", "address": "東京都立川市曙町２丁目１−１ ルミネ立川 1F", "opening_hours": "11:00-23:00", "price_range": "¥1000-¥2000", "coordinates": "35.6983, 139.4138" }
    ],
    worshipSteps: [
        { "step_id": 1, "title": "奉納", "short_description": "於總受付填寫奉獻單，表達虔誠心意。", "long_description": "抵達親苑後，首先前往「總受付」(總服務台)，領取並填寫奉獻單。這是表達對佛陀與教主感恩之心的重要一步。" },
        { "step_id": 2, "title": "進入本堂", "short_description": "脫鞋後，莊嚴地進入本堂。", "long_description": "奉納完成後，請至本堂入口處，依序脫下鞋履並放入鞋櫃中。懷著恭敬的心，安靜地步入本堂。" },
        { "step_id": 3, "title": "參拜儀式", "short_description": "參與誦經或靜心冥想，沉澱心靈。", "long_description": "在本堂內找到位置後，可參與正在進行的誦經法會，或自行靜坐冥想，向本尊表達您的祈願與感謝。" },
        { "step_id": 4, "title": "領取御守", "short_description": "於指定處所，領取平安的祝福。", "long_description": "參拜結束後，可至御守授予處，為自己與家人挑選平安健康的御守，將這份祝福帶回家。" }
    ],
    qa: [
        { "category": "交通", "question": "從羽田機場到立川最推薦的方式是什麼？", "answer": "若您攜帶大型行李，最推薦搭乘【利木津巴士】，可一車直達。若預算有限，可選擇搭乘【電車】經由川崎站轉乘。" },
        { "category": "交通", "question": "從成田機場有利木津巴士直達立川嗎？", "answer": "很抱歉，目前成田機場直達立川的利木津巴士處於長期停駛狀態。您需搭乘N'EX或Skyliner進入市區後再轉車。" },
        { "category": "參拜", "question": "參拜時有特定的服裝要求嗎？", "answer": "沒有嚴格規定，但建議穿著莊重、整潔的服裝，避免過於暴露或奇特的衣物。" }
    ],
    docContent: [
        { "type": "回歸親苑手冊", "content": "詳細介紹親苑的核心精神、歷史沿革以及參拜的深層意義。", "url": "回歸親苑.pdf" },
        { "type": "親苑參拜地圖", "content": "提供真如苑總本部整體區域的詳細地圖。", "url": "親苑參拜地圖.pdf" }
    ]
};
// --- END: 本地備份資料 ---

// 全域變數
let currentData = { attractions: [], restaurants: [], hotels: [], transportation: [], docContent: [] };
let worshipStepsData = [];
let allQaData = [];
let searchCorpus = [];
let heroMapInstance = null;
let dataSourceStatus = 'loading';

document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Main application initialization function
 */
async function initializeApp() {
    console.log('app.js: DOMContentLoaded 事件觸發，開始初始化...');
    makeModalDraggable(document.getElementById('aiChatModal'));
    bindEventListeners();
    handleNavActiveState();
    displayExchangeRate();

    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.95); z-index:2000; display:flex; flex-direction:column; justify-content:center; align-items:center;">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3 text-muted">資料載入中...</p>
        </div>`;
    loadingIndicator.style.display = 'flex';
    document.body.prepend(loadingIndicator);

    try {
        await loadAllDataFromCsv();
        dataSourceStatus = 'api';
        console.log('✅ 資料來源: 線上 CSV');
    } catch (error) {
        console.warn(`⚠️ 無法從 CSV 載入即時資料: ${error.message}`);
        showGlobalErrorBanner(`無法載入即時資料，已切換至離線備份模式。`);
        console.log('🔄 切換至本地備份資料模式...');
        loadAllDataFromBackup();
        dataSourceStatus = 'backup';
        console.log('🔄 資料來源: 本地備份');
    }

    buildSearchCorpus();
    if (document.getElementById('heroMap') || document.getElementById('shinyuanMap')) initializePage('homeOrShinyuan');
    if (document.getElementById('qa-accordion-container')) initializePage('qa');
    
    updateFooterDataSourceStatus();
    
    loadingIndicator.style.display = 'none';
}

/**
 * Parses a CSV string into an array of objects. Handles quoted fields containing commas.
 * @param {string} csvText The CSV string to parse.
 * @returns {Array<Object>} An array of objects representing the CSV data.
 */
function parseCsv(csvText) {
    if (!csvText || typeof csvText !== 'string') return [];
    
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    // Regex to split a CSV row, correctly handling quoted fields.
    const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(regex);
        const obj = {};
        
        headers.forEach((header, index) => {
            if (header && values[index] !== undefined) {
                let value = values[index].trim();
                // Remove surrounding quotes if they exist
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                // Replace double double-quotes with a single double-quote (CSV standard for escaping)
                obj[header] = value.replace(/""/g, '"');
            } else if (header) {
                obj[header] = ''; // Ensure all headers have a key
            }
        });
        data.push(obj);
    }
    return data;
}


/**
 * Fetches all data from the Google Sheets CSV URLs.
 * @param {boolean} force - If true, appends a timestamp to bypass cache.
 */
async function loadAllDataFromCsv(force = false) {
    console.log(`正透過 CSV 從 Google Sheets 載入資料... (強制更新: ${force})`);
    
    const dataPromises = Object.entries(CSV_URLS).map(async ([key, url]) => {
        try {
            const fetchUrl = force ? `${url}&_=${new Date().getTime()}` : url;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
            
            const response = await fetch(fetchUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${key}`);
            }
            const csvText = await response.text();
            const jsonData = parseCsv(csvText);
            return { key, data: jsonData };
        } catch (error) {
            console.error(`讀取 ${key} CSV 失敗:`, error);
            return { key, data: [] };
        }
    });

    const results = await Promise.all(dataPromises);

    results.forEach(({ key, data }) => {
        switch (key) {
            case 'qa':
                allQaData = data;
                break;
            case 'worshipSteps':
                worshipStepsData = data;
                break;
            default:
                if (currentData.hasOwnProperty(key)) {
                    currentData[key] = data;
                }
                break;
        }
    });
    
    console.log("✅ CSV 資料成功載入並解析:", { ...currentData, allQaData, worshipStepsData });
}

/**
 * Loads all data from the local backup object.
 */
function loadAllDataFromBackup() {
    console.log('正在從本地端載入備份資料...');
    currentData.attractions = LOCAL_BACKUP_DATA.attractions;
    currentData.transportation = LOCAL_BACKUP_DATA.transportation;
    currentData.hotels = LOCAL_BACKUP_DATA.hotels;
    currentData.restaurants = LOCAL_BACKUP_DATA.restaurants;
    currentData.docContent = LOCAL_BACKUP_DATA.docContent;
    worshipStepsData = LOCAL_BACKUP_DATA.worshipSteps;
    allQaData = LOCAL_BACKUP_DATA.qa;
    console.log("✅ 本地備份資料已成功載入！");
}

/**
 * Event handler for the force refresh button.
 * @param {Event} event
 */
async function handleForceRefresh(event) {
    event.preventDefault(); 
    const button = event.currentTarget;
    const originalContent = button.innerHTML;

    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>更新中...`;

    try {
        await loadAllDataFromCsv(true); 
        dataSourceStatus = 'api'; 
        buildSearchCorpus(); 
        updateFooterDataSourceStatus(); 
        alert('資料已成功更新為最新版本！'); 
    } catch (error) {
        console.error('強制更新失敗:', error);
        alert('更新失敗，請檢查您的網路連線後再試。'); 
    } finally {
        button.disabled = false;
        button.innerHTML = originalContent;
    }
}

function showGlobalErrorBanner(message) {
    const banner = document.createElement('div');
    banner.className = 'global-error-banner';
    banner.textContent = message;
    
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background-color: #dc3545;
        color: white;
        text-align: center;
        padding: 10px;
        z-index: 9999;
        font-size: 0.9rem;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;

    document.body.prepend(banner);
}

function updateFooterDataSourceStatus() {
    let placeholder = document.getElementById('data-source-placeholder');
    let appendTarget = placeholder || document.querySelector('footer .container');

    if (!appendTarget) {
        console.warn('找不到適合的頁腳元素來顯示資料狀態。');
        return;
    }
    
    const oldStatus = document.querySelector('.data-source-status');
    if (oldStatus) oldStatus.remove();

    const statusDiv = document.createElement('div');
    statusDiv.className = 'data-source-status';
    
    let statusText = '', statusColor = '', titleText = '';

    if (dataSourceStatus === 'api') {
        statusText = '🟢 資料來源：線上即時';
        statusColor = '#d1e7dd';
        titleText = '目前顯示的資料是從 Google Sheet 即時更新的最新版本。';
    } else if (dataSourceStatus === 'backup') {
        statusText = '🟠 資料來源：離線備份';
        statusColor = '#fff3cd';
        titleText = '無法連接即時資料庫，目前顯示的是內建的備份資料，可能不是最新版本。';
    } else {
        return; 
    }

    statusDiv.textContent = statusText;
    statusDiv.title = titleText;
    statusDiv.style.cssText = `
        margin-top: 1rem;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        border-radius: 0.25rem;
        background-color: ${statusColor};
        color: #333;
        display: inline-block;
        text-align: center;
    `;
    
    appendTarget.appendChild(statusDiv);
}

function bindEventListeners() {
    document.body.addEventListener('click', function(event) {
        const actionTarget = event.target.closest('[data-action]');
        if (actionTarget) {
            event.preventDefault();
            const action = actionTarget.dataset.action;
            console.log(`Action triggered: ${action}`);
            switch (action) {
                case 'transportation':
                    showTransportation();
                    break;
                case 'hotels':
                    showHotels();
                    break;
                case 'passport':
                    showPassportInfo();
                    break;
            }
        }
    });

    document.getElementById("main-search-form")?.addEventListener("submit", handleMainSearch);
    document.querySelectorAll("#btn-ai-chat").forEach(e => e.addEventListener("click", openAIChat));
    document.getElementById("qa-category-filter")?.addEventListener("click", e => {
        if (e.target.matches("button")) {
            document.querySelectorAll("#qa-category-filter button").forEach(btn => btn.classList.remove("active"));
            e.target.classList.add("active");
            renderQAItems(e.target.dataset.category);
        }
    });
    document.getElementById("btn-send-ai-message")?.addEventListener("click", sendSearchMessage);
    document.getElementById("chatInput")?.addEventListener("keypress", handleChatKeyPress);
}


// --- Functions for planning steps and other modals ---
function onPlanningStepClick(type) {
    const actions = {
        transportation: showTransportation,
        hotels: showHotels,
    };
    if (actions[type]) {
        actions[type]();
    }
}

function showTransportation() {
    showInfoModal("交通資訊", currentData.transportation);
}

function showHotels() {
    showInfoModal("住宿推薦", currentData.hotels);
}

function showPassportInfo() {
    const title = "護照效期注意事項";
    const content = `
        <div class="text-center mb-4">
            <i class="fas fa-passport fa-4x" style="color: var(--bs-primary, #6c757d);"></i>
        </div>
        <div class="alert alert-warning" role="alert">
            <h4 class="alert-heading"><i class="fas fa-exclamation-triangle me-2"></i>重要提醒：六個月效期規則</h4>
            <p>入境日本時，您的護照有效期**必須從您預計的「入境日本日期」算起，超過六個月以上**。這是許多國家的標準入境要求，以確保您在旅途中護照不會失效。</p>
            <hr>
            <p class="mb-0">請立即檢查您護照上的有效期限！如果所剩時間不足，建議您儘早前往外交部領事事務局辦理換發新護照，以免耽誤行程。</p>
        </div>
        <h5>如何檢查：</h5>
        <ul class="list-group">
            <li class="list-group-item"><strong>1. 拿出護照：</strong>翻到有您照片和個人資料的那一頁。</li>
            <li class="list-group-item"><strong>2. 確認日期：</strong>找到「有效期限」或 "Date of Expiry" 欄位。</li>
            <li class="list-group-item"><strong>3. 計算方式：</strong>例如，如果您預計 <strong>2025年10月15日</strong> 入境日本，您的護照有效期限至少應晚於 <strong>2026年4月15日</strong> 才算安全。</li>
        </ul>
        <div class="d-grid mt-4">
             <a href="https://www.boca.gov.tw/cp-110-531-eda75-1.html" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                <i class="fas fa-link me-2"></i> 前往外交部領事事務局網站
             </a>
        </div>
    `;
    showInfoModal(title, content, true);
}


function showInfoModal(title, data, isHtmlContent = false) {
    const modalElement = document.getElementById("infoModal");
    if (!modalElement) return;

    const modalTitle = document.getElementById("infoModalTitle");
    const modalBody = document.getElementById("infoModalBody");
    
    modalTitle.textContent = title;

    if (isHtmlContent) {
        modalBody.innerHTML = data;
    } else if (data && data.length > 0) {
        modalBody.innerHTML = data.map(item => {
            let content = "";
            let cardTitle = item.name_zh || item.name_jp || item.name || "詳細資訊";
            if (item.transport_type) {
                cardTitle = `${item.from_location} → ${item.to_location}`;
                content += `<p><strong>交通工具：</strong>${item.transport_type}</p><p><strong>時間：</strong>${item.duration}分鐘 | <strong>費用：</strong>¥${item.cost}</p>`;
            }
            if (item.price_per_night) {
                content += `<p><strong>地址：</strong>${item.address || "N/A"}</p><p><strong>房價：</strong>¥${item.price_per_night}/晚</p>`;
            }
            if (item.opening_hours) {
                content += `<p><strong>地址：</strong>${item.address || "N/A"}</p><p><strong>營業時間：</strong>${item.opening_hours}</p><p><strong>價位：</strong>${item.price_range || "N/A"}</p>`;
            }
            if (item.rating) {
                content += `<p><strong>評分：</strong>${item.rating}/5</p>`;
            }

            let bookingLink = "";
            if (item.booking_url) {
                bookingLink = `<div class="mt-3"><a href="${item.booking_url}" class="btn btn-primary" target="_blank" rel="noopener noreferrer"><i class="fas fa-calendar-check me-2"></i> 前往訂房</a></div>`;
            }

            let mapLink = "";
            if (item.coordinates && item.opening_hours) {
                mapLink = `<div class="mt-3"><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name_zh || item.name_jp)}" class="btn btn-outline-success" target="_blank" rel="noopener noreferrer"><i class="fas fa-map-marker-alt me-2"></i> 在地圖上查看</a></div>`;
            }
            
            const remarks = linkify(item.備註 || "");
            let remarksHtml = item.備註 ? `<div class="remark-section mt-3"><small><strong>備註：</strong> ${remarks}</small></div>` : "";

            return `<div class="card mb-3"><div class="card-body"><h5>${cardTitle}</h5><hr>${content}<p class="mt-2">${(item.description || "") + (item.tips ? `<br><span class="text-muted small">${item.tips}</span>` : "")}</p>${mapLink}${bookingLink}${remarksHtml}</div></div>`;
        }).join("");
    } else {
        modalBody.innerHTML = '<div class="alert alert-warning">此類別的資料目前無法載入，請稍後再試。</div>';
    }
    
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}
// --- End of functions for planning steps ---

async function displayExchangeRate() {
    const displays = document.querySelectorAll(".exchange-rate-display");
    if (displays.length === 0) return;

    const primaryUrl = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/twd.json';
    const fallbackUrl = 'https://api.frankfurter.app/latest?from=TWD&to=JPY';
    const timeout = 5000;

    const fetchWithTimeout = (url) => Promise.race([
        fetch(url),
        new Promise((_, reject) => setTimeout(() => reject(new Error("請求超時 (Timeout)")), timeout))
    ]);
    
    const updateDisplays = (html) => {
        displays.forEach(el => {
            el.innerHTML = html;
            el.classList.remove("placeholder");
        });
    };

    try {
        console.log(`🚀 [1/2] 嘗試從主要 API 獲取匯率: ${primaryUrl}`);
        const response = await fetchWithTimeout(primaryUrl);
        if (!response.ok) throw new Error(`主要 API 請求失敗，狀態: ${response.status}`);
        const data = await response.json();
        const rate = data?.twd?.jpy;
        if (typeof rate !== 'number') throw new Error("主要 API 回應格式不符");
        const rateFormatted = rate.toFixed(2);
        const html = `<i class="fas fa-sync-alt fa-fw me-1" title="即時匯率"></i> 1 TWD ≈ ${rateFormatted} JPY`;
        updateDisplays(html);
        console.log(`✅ 成功從主要 API 獲取匯率: 1 TWD = ${rate} JPY`);
    } catch (err) {
        console.warn(`⚠️ 主要 API 失敗: ${err.message}`);
        try {
            console.log(`🚀 [2/2] 嘗試從備援 API 獲取匯率: ${fallbackUrl}`);
            const response = await fetchWithTimeout(fallbackUrl);
            if (!response.ok) throw new Error(`備援 API 請求失敗，狀態: ${response.status}`);
            const data = await response.json();
            const rate = data?.rates?.JPY;
            if (typeof rate !== 'number') throw new Error("備援 API 回應格式不符");
            const rateFormatted = rate.toFixed(2);
            const html = `<i class="fas fa-sync-alt fa-fw me-1" title="即時匯率 (來源: 備援)"></i> 1 TWD ≈ ${rateFormatted} JPY`;
            updateDisplays(html);
            console.log(`✅ 成功從備援 API 獲取匯率: 1 TWD = ${rate} JPY`);
        } catch (fallbackErr) {
            console.error(`❌ 主要與備援 API 皆失敗: ${fallbackErr.message}`);
            const errorHtml = `<i class="fas fa-exclamation-triangle fa-fw me-1" title="錯誤"></i> 匯率載入失敗`;
            displays.forEach(el => {
                el.innerHTML = errorHtml;
                el.classList.remove("placeholder");
                el.style.color = "#ffc107";
            });
        }
    }
}

function initializePage(pageType) {
    const pageInitializers = {
        homeOrShinyuan: () => {
            if (document.getElementById('shinyuanMap')) {
                console.log("初始化首頁 (親苑)...");
                renderWorshipSteps();
            }
        },
        qa: () => {
            console.log("初始化Q&A頁...");
            const container = document.getElementById("qa-accordion-container");
            if (container) container.innerHTML = "";
            renderQACategories();
            renderQAItems('all');
        }
    };
    pageInitializers[pageType]?.();
}

function getImageUrl(path) {
    if (!path || typeof path !== 'string') return "";
    if (path.startsWith("http")) {
        return path;
    }
    // Remove any leading slash to treat it as a relative path from the HTML file.
    return path.startsWith('/') ? path.substring(1) : path;
}


function makeModalDraggable(modalEl) {
    if (!modalEl) return;
    const dialog = modalEl.querySelector('.modal-dialog');
    const header = modalEl.querySelector('.modal-header');
    if (!dialog || !header) return;

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;

    header.onmousedown = (e) => {
        e = e || window.event;
        if (e.target.closest("button")) return; // Don't drag if clicking a button
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        isDragging = true;
        dialog.classList.add('is-draggable');
        dialog.style.transform = 'none'; // Required to use top/left
        dialog.style.top = dialog.offsetTop + "px";
        dialog.style.left = dialog.offsetLeft + "px";
        document.body.classList.add('is-dragging');
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    };

    function elementDrag(e) {
        if (!isDragging) return;
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        dialog.style.top = (dialog.offsetTop - pos2) + "px";
        dialog.style.left = (dialog.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        isDragging = false;
        document.body.classList.remove('is-dragging');
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function renderWorshipSteps() {
    const container = document.getElementById("worship-steps-container");
    if (!container) return;
    
    container.innerHTML = " ";
    if (!worshipStepsData || worshipStepsData.length === 0) {
        container.innerHTML = '<p class="text-muted text-center col-12">目前沒有參拜步驟資料。</p>';
        return;
    }
    
    const icons = [
        { id: 'icon-worship-donation', class: 'fa-solid fa-hand-holding-dollar' },
        { id: 'icon-worship-enter', class: 'fa-solid fa-torii-gate' },
        { id: 'icon-worship-ceremony', class: 'fa-solid fa-person-praying' },
        { id: 'icon-worship-complete', class: 'fa-solid fa-gift' }
    ];

    container.innerHTML = worshipStepsData.map((step, index) => {
        const icon = icons[index] || icons[0];
        return `
        <div class="col-md-6 col-lg-3">
            <a href="#" class="info-card h-100" data-step-id="${step.step_id || index}">
                <div class="info-card-icon">
                    <i id="${icon.id}" class="${icon.class}"></i>
                </div>
                <h5 class="info-card-title">${step.title}</h5>
                <p class="info-card-subtitle">${step.short_description}</p>
            </a>
        </div>`;
    }).join('');
}

function handleNavActiveState() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
        const linkPage = link.getAttribute("href").split("/").pop() || "index.html";
        link.classList.remove("active");
        if (currentPage === linkPage) {
            link.classList.add("active");
        }
    });
}

function renderQACategories() {
    const container = document.getElementById("qa-category-filter");
    if (!container) return;
    if (!allQaData || allQaData.length === 0) {
        container.innerHTML = '<p class="text-muted p-2">無分類資料</p>';
        return;
    }
    const categories = ['all', ...new Set(allQaData.map(item => item.category).filter(Boolean))];
    container.innerHTML = categories.map(cat =>
        `<button type="button" class="list-group-item list-group-item-action ${cat === 'all' ? 'active' : ''}" data-category="${cat}">
            ${cat === 'all' ? '全部問題' : cat}
        </button>`
    ).join('');
}

function renderQAItems(category) {
    const container = document.getElementById("qa-accordion-container");
    if (!container) return;
    const items = category === 'all' ? allQaData : allQaData.filter(item => item.category === category);
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="text-muted text-center p-5">此分類下沒有問題。</p>';
        return;
    }
    
    container.innerHTML = items.map((item, index) => {
        const collapseId = `qa-${category.replace(/\s+/g, '-')}-${index}`;
        const answer = linkify(item.answer || "").replace(/\n/g, "<br>");
        const imageUrl = getImageUrl(item.image_url);
        const imageHtml = imageUrl ? `<img src="${imageUrl}" class="img-fluid mt-3" alt="問題附圖">` : "";
        const remarks = linkify(item.備註 || "");
        const remarksHtml = item.備註 ? `<div class="remark-section mt-3"><small><strong>備註：</strong> ${remarks}</small></div>` : "";

        return `<div class="accordion-item">
            <h2 class="accordion-header" id="heading-${collapseId}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${collapseId}">
                    ${item.question || "無標題問題"}
                </button>
            </h2>
            <div id="collapse-${collapseId}" class="accordion-collapse collapse" data-bs-parent="#qa-accordion-container">
                <div class="accordion-body">${answer}${imageHtml}${remarksHtml}</div>
            </div>
        </div>`;
    }).join('');
}

function handleMainSearch(e) {
    e.preventDefault();
    const input = document.getElementById("main-search-input");
    const query = input.value.trim();
    if (query) {
        openAIChat();
        document.getElementById("chatInput").value = query;
        sendSearchMessage();
        input.value = "";
    }
}

function openAIChat() {
    const modalEl = document.getElementById("aiChatModal");
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

function truncateText(text, length = 80) {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
}

function buildSearchCorpus() {
    searchCorpus = [];
    const categories = {
        attractions: "景點資訊", transportation: "交通資訊", hotels: "住宿資訊",
        restaurants: "餐廳資訊", worshipSteps: "參拜步驟", qa: "Q&A", docContent: "文件內容"
    };
    const schemas = {
        [categories.attractions]: { title: "name_zh", summary: "description" },
        [categories.transportation]: { title: "from_location", summary: "description" },
        [categories.hotels]: { title: "name", summary: "amenities" },
        [categories.restaurants]: { title: "name_zh", summary: "description" },
        [categories.qa]: { title: "question", summary: "answer" },
        [categories.worshipSteps]: { title: "title", summary: "long_description" },
        [categories.docContent]: { title: "type", summary: "content" }
    };

    const processData = (data, category, schema) => {
        (data || []).forEach(item => {
            if (!item || Object.values(item).every(v => !v)) return;
            let title = item[schema.title] || (category === categories.transportation ? `${item.from_location}到${item.to_location}` : "無標題");
            const cleanTitle = title.includes("/") ? title.split("/")[0].trim() : title;
            const summary = item[schema.summary] || "";
            const fullText = Object.values(item).join(" ").toLowerCase();
            searchCorpus.push({
                type: category,
                title: cleanTitle,
                content: fullText,
                summary: truncateText(summary, 100),
                full_summary: summary
            });
        });
    };

    processData(currentData.attractions, categories.attractions, schemas[categories.attractions]);
    processData(currentData.transportation, categories.transportation, schemas[categories.transportation]);
    processData(currentData.hotels, categories.hotels, schemas[categories.hotels]);
    processData(currentData.restaurants, categories.restaurants, schemas[categories.restaurants]);
    processData(allQaData, categories.qa, schemas[categories.qa]);
    processData(worshipStepsData, categories.worshipSteps, schemas[categories.worshipSteps]);
    processData(currentData.docContent, categories.docContent, schemas[categories.docContent]);
    
    console.log(`全文檢索資料庫建立完成，共 ${searchCorpus.length} 筆資料。`);
}

function localFullTextSearch(query) {
    if (!query) return [];
    const lowerCaseQuery = query.toLowerCase();
    
    return searchCorpus.map(item => {
        let score = 0;
        const title = (item.title || "").toLowerCase();
        const content = (item.content || "").toLowerCase();
        
        if (title === lowerCaseQuery) score += 100;
        else if (title.includes(lowerCaseQuery)) score += 50;
        
        if (content.includes(lowerCaseQuery)) score += 20;
        
        query.split(/\s+/).filter(Boolean).forEach(term => {
            if (content.includes(term)) score += 1;
            if (title.includes(term)) score += 5;
        });
        
        return { ...item, score: score };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
}

function handleChatKeyPress(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendSearchMessage();
    }
}

function sendSearchMessage() {
    const input = document.getElementById("chatInput");
    const query = input.value.trim();
    if (query) {
        addChatMessage(query, "user");
        input.value = "";
        addChatMessage("搜尋中...", "bot", { id: "typing-indicator" });

        setTimeout(() => {
            document.getElementById("typing-indicator")?.remove();
            const results = localFullTextSearch(query);
            if (results.length > 0) {
                const message = "根據您提供的資訊，我找到了以下相關內容：\n\n" + results.slice(0, 5).map((item, index) => {
                    const summary = item.full_summary || item.summary;
                    let summaryText = "";
                    if (summary) {
                        summaryText = summary.startsWith("http") ? `: <a href="${summary}" target="_blank" rel="noopener noreferrer">${summary}</a>` : ": " + summary;
                    }
                    return `${index + 1}. **${item.title} (${item.type})**${summaryText}`;
                }).join("\n\n");
                addChatMessage(message, "bot", { source_type: "本地資料庫", sources: results.slice(0, 3).map(r => r.title) });
            } else {
                addChatMessage("抱歉，無法找到相關答案。請嘗試更換關鍵字，或瀏覽網站上的 Q&A 頁面。", "bot", { source_type: "無結果" });
            }
        }, 500);
    }
}

function linkify(text) {
    if (!text) return "";
    // Avoid linkifying if it already contains an anchor tag
    if (text.includes("<a href")) return text;
    return text.replace(/(https?:\/\/[a-zA-Z0-9.\/~_#@?&=%-]+)/g, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
}

function addChatMessage(text, type, options = {}) {
    const container = document.getElementById("chatMessages");
    if (!container) return;

    const messageWrapper = document.createElement("div");
    messageWrapper.className = `message ${type}-message`;
    if (options.id) messageWrapper.id = options.id;

    let htmlText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (type === 'bot') {
        htmlText = linkify(htmlText);
    }
    htmlText = htmlText.replace(/\n/g, "<br>");
    
    let sourceTypeBadge = "";
    if (type === 'bot' && options.source_type) {
        const badgeClasses = { "本地資料庫": "badge-local", "無結果": "badge-default" };
        sourceTypeBadge = `<span class="source-type-badge ${badgeClasses[options.source_type] || 'badge-error'}">${options.source_type}</span>`;
    }

    let sourcesHtml = "";
    if (type === 'bot' && options.sources && options.sources.length > 0) {
        const sourceItems = options.sources.map(s => `<li>${truncateText(s, 20)}</li>`).join('');
        sourcesHtml = `<div class="source-container"><p class="source-title">參考資料來源：</p><ul>${sourceItems}</ul></div>`;
    }

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    
    const messageTextDiv = document.createElement("div");
    messageTextDiv.className = "message-text";
    messageTextDiv.innerHTML = htmlText;

    messageContent.innerHTML = sourceTypeBadge;
    messageContent.appendChild(messageTextDiv);
    if (sourcesHtml) {
        messageContent.innerHTML += sourcesHtml;
    }

    messageWrapper.appendChild(messageContent);
    container.appendChild(messageWrapper);
    container.scrollTop = container.scrollHeight;
}
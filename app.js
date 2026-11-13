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
    setupSearchUI();
    handleNavActiveState();
    displayExchangeRate(); // 呼叫統一的匯率函式
    setupBackToTopHorse(); // 啟用回到頂部白馬功能

    const loadingIndicator = document.getElementById('loading-indicator');
    if(loadingIndicator) loadingIndicator.style.display = 'flex';
    else {
        const indicator = document.createElement('div');
        indicator.id = 'loading-indicator';
        indicator.innerHTML = `<div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.95); z-index:2000; display:flex; flex-direction:column; justify-content:center; align-items:center;"><div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div><p class="mt-3 text-muted">資料載入中...</p></div>`;
        document.body.prepend(indicator);
    }
    
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
    if (parseFindHash()) setTimeout(applySearchHighlight, 0); // 由搜尋結果進入：標示關鍵字並捲動到該段落
    if (document.getElementById('heroMap') || document.getElementById('shinyuanMap')) initializePage('homeOrShinyuan');
    if (document.getElementById('qa-accordion-container')) initializePage('qa');
    
    updateFooterDataSourceStatus();
    
    const finalLoadingIndicator = document.getElementById('loading-indicator');
    if(finalLoadingIndicator) finalLoadingIndicator.style.display = 'none';
}

function parseCsv(csvText) {
    if (!csvText || typeof csvText !== 'string') return [];
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(regex);
        const obj = {};
        headers.forEach((header, index) => {
            if (header && values[index] !== undefined) {
                let value = values[index].trim();
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                obj[header] = value.replace(/""/g, '"');
            } else if (header) {
                obj[header] = '';
            }
        });
        data.push(obj);
    }
    return data;
}

async function loadAllDataFromCsv(force = false) {
    console.log(`正透過 CSV 從 Google Sheets 載入資料... (強制更新: ${force})`);
    const dataPromises = Object.entries(CSV_URLS).map(async ([key, url]) => {
        try {
            const fetchUrl = force ? `${url}&_=${new Date().getTime()}` : url;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
            const response = await fetch(fetchUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${key}`);
            const csvText = await response.text();
            return { key, data: parseCsv(csvText) };
        } catch (error) {
            console.error(`讀取 ${key} CSV 失敗:`, error);
            return { key, data: [] };
        }
    });
    const results = await Promise.all(dataPromises);
    results.forEach(({ key, data }) => {
        if (key === 'qa') allQaData = data;
        else if (key === 'worshipSteps') worshipStepsData = data;
        else if (currentData.hasOwnProperty(key)) currentData[key] = data;
    });
    console.log("✅ CSV 資料成功載入並解析:", { ...currentData, allQaData, worshipStepsData });
}

function loadAllDataFromBackup() {
    console.log('正在從本地端載入備份資料...');
    Object.assign(currentData, LOCAL_BACKUP_DATA);
    worshipStepsData = LOCAL_BACKUP_DATA.worshipSteps;
    allQaData = LOCAL_BACKUP_DATA.qa;
    console.log("✅ 本地備份資料已成功載入！");
}

function showGlobalErrorBanner(message) {
    const banner = document.createElement('div');
    banner.className = 'global-error-banner';
    banner.textContent = message;
    banner.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; background-color: #dc3545; color: white; text-align: center; padding: 10px; z-index: 9999; font-size: 0.9rem; box-shadow: 0 2px 5px rgba(0,0,0,0.2);`;
    document.body.prepend(banner);
}

// START: 修改後的 updateFooterDataSourceStatus 函式
/**
 * 更新頁尾的資料來源狀態。現在此功能已被禁用。
 */
function updateFooterDataSourceStatus() {
    // 此功能已根據使用者要求移除，故將函式內容清空。
    return;
    
    /* 原始碼保留，方便未來恢復
    const appendTarget = document.getElementById('data-source-placeholder') || document.querySelector('footer .container');
    if (!appendTarget) return;
    let oldStatus = appendTarget.querySelector('.data-source-status');
    if (oldStatus) oldStatus.remove();
    const statusDiv = document.createElement('div');
    statusDiv.className = 'data-source-status';
    const isAPI = dataSourceStatus === 'api';
    statusDiv.textContent = isAPI ? '🟢 資料來源：線上即時' : '🟠 資料來源：離線備份';
    statusDiv.title = isAPI ? '目前顯示的是從 Google Sheet 即時更新的最新版本。' : '無法連接即時資料庫，目前顯示的是內建的備份資料，可能不是最新版本。';
    statusDiv.style.cssText = `margin-top: 1rem; padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius: 0.25rem; background-color: ${isAPI ? '#d1e7dd' : '#fff3cd'}; color: #333; display: inline-block; text-align: center;`;
    appendTarget.appendChild(statusDiv);
    */
}
// END: 修改後的 updateFooterDataSourceStatus 函式

function bindEventListeners() {
    document.body.addEventListener('click', (event) => {
        const actionTarget = event.target.closest('[data-action]');
        if (actionTarget) {
            event.preventDefault();
            const action = actionTarget.dataset.action;
            const actions = { transportation: showTransportation, hotels: showHotels };
            if (actions[action]) actions[action]();
        }
    });
    document.querySelectorAll("#btn-ai-chat").forEach(e => e.addEventListener("click", openAIChat));
    document.getElementById("btn-send-ai-message")?.addEventListener("click", sendSearchMessage);
    document.getElementById("chatInput")?.addEventListener("keypress", handleChatKeyPress);
    document.getElementById("qa-category-filter")?.addEventListener("click", (e) => {
        if (e.target.matches("button.list-group-item")) {
            document.querySelectorAll("#qa-category-filter button").forEach(btn => btn.classList.remove("active"));
            e.target.classList.add("active");
            renderQAItems(e.target.dataset.category);
        }
    });
}

function showTransportation() { showInfoModal("交通資訊", currentData.transportation); }
function showHotels() { showInfoModal("住宿推薦", currentData.hotels); }

function showInfoModal(title, data) {
    const modalElement = document.getElementById("infoModal");
    if (!modalElement) return;
    document.getElementById("infoModalTitle").textContent = title;
    const modalBody = document.getElementById("infoModalBody");
    if (data && data.length > 0) {
        modalBody.innerHTML = data.map(item => {
            let content = "", cardTitle = item.name_zh || item.name_jp || item.name || "詳細資訊";
            if (item.transport_type) {
                cardTitle = `${item.from_location} → ${item.to_location}`;
                content += `<p><strong>交通工具：</strong>${item.transport_type}</p><p><strong>時間：</strong>${item.duration}分鐘 | <strong>費用：</strong>¥${item.cost}</p>`;
            }
            if (item.price_per_night) content += `<p><strong>房價：</strong>¥${item.price_per_night}/晚</p>`;
            const bookingLink = item.booking_url ? `<div class="mt-3"><a href="${item.booking_url}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">前往訂房</a></div>` : "";
            return `<div class="card mb-3"><div class="card-body"><h5>${cardTitle}</h5><hr>${content}<p class="mt-2">${item.description || ""}</p>${bookingLink}</div></div>`;
        }).join("");
    } else {
        modalBody.innerHTML = '<div class="alert alert-warning">此類別的資料目前無法載入。</div>';
    }
    new bootstrap.Modal(modalElement).show();
}

async function displayExchangeRate() {
    const displays = document.querySelectorAll(".exchange-rate-display, #twd-to-jpy-rate");
    if (displays.length === 0) return;
    const url = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/twd.json';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        const rate = data?.twd?.jpy;
        if (typeof rate !== 'number') throw new Error('Invalid data format');
        displays.forEach(el => {
            if (el.id === 'twd-to-jpy-rate') {
                el.innerHTML = `(匯率 1 : ${rate.toFixed(2)} JPY)`;
            } else {
                el.innerHTML = `<i class="fas fa-sync-alt fa-fw me-1" title="即時匯率"></i> 1 TWD ≈ ${rate.toFixed(2)} JPY`;
            }
        });
    } catch (error) {
        console.error("Error fetching TWD->JPY rate:", error);
        displays.forEach(el => {
             if (el.id === 'twd-to-jpy-rate') {
                el.innerHTML = `(匯率載入失敗)`;
            } else {
                el.innerHTML = `<i class="fas fa-exclamation-triangle me-1"></i> 匯率載入失敗`;
            }
        });
    }
}

function initializePage(pageType) {
    if (pageType === 'homeOrShinyuan' && document.getElementById('shinyuanMap')) {
        renderWorshipSteps();
    } else if (pageType === 'qa') {
        renderQACategories();
        renderQAItems('all');
    }
}

function makeModalDraggable(modalEl) {
    if (!modalEl) return;
    const dialog = modalEl.querySelector('.modal-dialog');
    const header = modalEl.querySelector('.modal-header');
    if (!dialog || !header) return;
    let isDragging = false, pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    header.onmousedown = (e) => {
        if (e.target.closest("button")) return;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        isDragging = true;
        dialog.classList.add('is-draggable');
        dialog.style.transform = 'none';
        dialog.style.top = `${dialog.offsetTop}px`;
        dialog.style.left = `${dialog.offsetLeft}px`;
        document.onmouseup = () => {
            isDragging = false;
            document.onmouseup = document.onmousemove = null;
        };
        document.onmousemove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            dialog.style.top = `${dialog.offsetTop - pos2}px`;
            dialog.style.left = `${dialog.offsetLeft - pos1}px`;
        };
    };
}

function handleNavActiveState() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".navbar-nav .nav-link, .navbar-brand").forEach(link => {
        const linkPage = (link.getAttribute("href") || "").split("/").pop() || "index.html";
        if (linkPage === "ui.html" && currentPage === "") return; // 首頁特殊處理
        link.classList.toggle("active", currentPage === linkPage);
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
        const imageHtml = imageUrl ? `<img src="${imageUrl}" class="img-fluid rounded mt-3" alt="問題附圖">` : "";
        const remarks = linkify(item.備註 || "");
        const remarksHtml = remarks ? `<div class="remark-section mt-3" style="background-color: #f8f9fa; border-left: 3px solid #6c757d; padding: 10px; font-size: 0.9em;"><small><strong>備註：</strong> ${remarks}</small></div>` : "";
        return `<div class="accordion-item">
            <h2 class="accordion-header" id="heading-${collapseId}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${collapseId}">
                    ${item.question || "無標題問題"}
                </button>
            </h2>
            <div id="collapse-${collapseId}" class="accordion-collapse collapse" data-bs-parent="#qa-accordion-container">
                <div class="accordion-body">
                    ${answer}
                    ${imageHtml}
                    ${remarksHtml}
                </div>
            </div>
        </div>`;
    }).join('');
}

function getImageUrl(path) {
    if (!path || typeof path !== 'string') return "";
    if (path.startsWith("http")) return path;
    return path.startsWith('/') ? path.substring(1) : path;
}

function linkify(text) {
    if (!text) return "";
    if (text.includes("<a href")) return text;
    const urlRegex = /(https?:\/\/[^\s,]+)/g;
    return text.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
}

// ====================================================================
// 站內搜尋：Google Sheets 資料 + 各頁面內文 + 文件下載連結
// ====================================================================

// --- 搜尋設定 ---
const SITE_INDEX_ENTRY = 'index.html';   // 由首頁的連結自動找出要建立索引的頁面
const SITE_PAGES_FALLBACK = [            // 首頁讀取失敗時的備用清單
    '01S.html', '02S.html', '03S.html', '04S.html', '05S.html', '06S.html', '07S.html',
    '08S.html', '09S.html', '10S.html', '11S.html', '12S.html', '13S.html', 'qas.html'
];
const SEARCH_PAGE_SIZE = 6;              // 每次顯示幾筆結果
const SEARCH_MAX_PER_PAGE = 3;           // 同一頁面最多列出幾筆，避免洗版
const SEARCH_SUGGESTIONS = ['利木津巴士', '接心申請', '研修所', '住宿', '時刻表'];

const HEADING_SELECTOR = 'h1,h2,h3,h4,h5,h6';
const INDEX_SKIP_SELECTOR = 'script,style,noscript,template,nav,footer,iframe,svg,canvas,.modal,.lfp-trail,#floating-horses-container,.back-to-home-btn-container,.visually-hidden';
const BLOCK_TAGS = /^(P|DIV|LI|TR|TD|TH|SECTION|ARTICLE|UL|OL|TABLE|THEAD|TBODY|BR|HR|BUTTON|DT|DD|BLOCKQUOTE|A)$/;
const FILE_LINK_PATTERN = /\.(pdf|xlsx?|docx?|pptx?)$/i;
const CJK_PATTERN = /[぀-ヿ㐀-鿿]/;
const QUERY_SPLIT_PATTERN = /[\s,，。、？?！!；;：:「」『』（）()【】]+/;
const QUERY_STOP_PATTERN = /請問|如何|怎麼|怎麽|怎樣|什麼|甚麼|哪裡|哪裏|哪些|有沒有|可以|是否|需要|[的嗎呢嘛啊呀吧了]/g;

let pageCorpus = [];
let pageIndexPromise = null;
let pageIndexFailed = false;

// --- 共用小工具 ---
function normalizeText(value) {
    return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function escapeHtml(text) {
    return String(text ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countOccurrences(text, term) {
    let count = 0, pos = text.indexOf(term);
    while (pos !== -1) { count++; pos = text.indexOf(term, pos + term.length); }
    return count;
}

function buildHitRegExp(hits) {
    const terms = [...hits].filter(Boolean).sort((a, b) => b.length - a.length).map(escapeRegExp);
    return terms.length ? new RegExp(`(${terms.join('|')})`, 'gi') : null;
}

/** 將文字轉為 HTML，並把命中的關鍵字包上 <mark> */
function highlightHtml(text, hits) {
    const regex = buildHitRegExp(hits);
    if (!regex) return escapeHtml(text);
    return text.split(regex).map((part, i) => i % 2 ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part)).join('');
}

function finalizeEntry(entry) {
    entry.title = normalizeText(entry.title);
    entry.text = normalizeText(entry.text);
    entry.crumb = normalizeText(entry.crumb);
    entry._title = entry.title.toLowerCase();
    entry._text = entry.text.toLowerCase();
    entry._crumb = entry.crumb.toLowerCase();
    return entry;
}

function openAIChat() {
    const modalEl = document.getElementById("aiChatModal");
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

// --- 索引 1：Google Sheets 資料 ---
function buildSearchCorpus() {
    searchCorpus = [];
    const isHttp = value => /^https?:\/\//i.test(value || '');
    const sources = [
        { data: currentData.attractions, type: "景點資訊", title: i => i.name_zh || i.name_jp },
        { data: currentData.transportation, type: "交通資訊", title: i => [i.from_location, i.to_location].filter(Boolean).join(" → ") + (i.transport_type ? `（${i.transport_type}）` : "") },
        { data: currentData.hotels, type: "住宿資訊", title: i => i.name, url: i => isHttp(i.booking_url) ? i.booking_url : "12S.html" },
        { data: currentData.restaurants, type: "餐廳資訊", title: i => i.name_zh || i.name },
        { data: allQaData, type: "Q&A", title: i => i.question, url: () => "qas.html", at: i => i.question ? `q:${normalizeText(i.question)}` : "" },
        { data: worshipStepsData, type: "參拜步驟", title: i => i.title },
        { data: currentData.docContent, type: "文件內容", title: i => i.type, url: i => i.url || "" }
    ];
    sources.forEach(source => {
        (source.data || []).forEach(item => {
            if (!item || Object.values(item).every(v => !v)) return;
            const title = normalizeText(source.title(item)) || "無標題";
            const url = source.url ? String(source.url(item) || "").trim() : "";
            // 內文：排除網址欄位與標題本身，讓摘要更好讀
            const text = Object.values(item)
                .map(v => String(v ?? ""))
                .filter(v => v && !isHttp(v) && normalizeText(v) !== title)
                .join(" ");
            searchCorpus.push(finalizeEntry({
                type: source.type,
                title,
                crumb: "",
                url,
                at: source.at ? source.at(item) : "",
                isFile: FILE_LINK_PATTERN.test(url) && !isHttp(url),
                text
            }));
        });
    });
    console.log(`資料表索引建立完成，共 ${searchCorpus.length} 筆資料。`);
}

// --- 索引 2：各頁面內文（第一次開啟搜尋時才載入） ---
function ensurePageIndex() {
    if (!pageIndexPromise) {
        pageIndexPromise = buildPageIndex().catch(error => {
            console.warn('頁面內文索引建立失敗:', error);
            pageIndexFailed = true;
        });
    }
    return pageIndexPromise;
}

async function fetchPageDocument(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    try {
        // no-cache：每次向伺服器確認是否有新版本，頁面更新後搜尋結果會同步
        const response = await fetch(url, { cache: 'no-cache', signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status} (${url})`);
        return new DOMParser().parseFromString(await response.text(), 'text/html');
    } finally {
        clearTimeout(timeoutId);
    }
}

function isLocalLink(href) {
    return !!href && !/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href);
}

function addFileEntry(files, href, label, pageTitle) {
    if (files.has(href)) return;
    let fileName = href.split('/').pop().replace(FILE_LINK_PATTERN, '');
    try { fileName = decodeURIComponent(fileName); } catch (e) { /* 保留原字串 */ }
    files.set(href, {
        type: '文件下載',
        title: fileName,
        crumb: pageTitle,
        url: href,
        at: '',
        isFile: true,
        text: label && label !== fileName ? label : ''
    });
}

async function buildPageIndex() {
    const files = new Map();
    let pages = [];
    try {
        const indexDoc = await fetchPageDocument(SITE_INDEX_ENTRY);
        indexDoc.querySelectorAll('a[href]').forEach(link => {
            const href = (link.getAttribute('href') || '').trim();
            if (!isLocalLink(href)) return;
            const label = normalizeText(link.textContent);
            if (FILE_LINK_PATTERN.test(href)) {
                addFileEntry(files, href, label, '首頁');
            } else if (/^[^?#]+\.html?$/i.test(href) && href.toLowerCase() !== SITE_INDEX_ENTRY && !pages.some(p => p.url === href)) {
                pages.push({ url: href, label });
            }
        });
    } catch (error) {
        console.warn('無法讀取首頁以取得頁面清單，改用備用清單:', error);
    }
    if (pages.length === 0) pages = SITE_PAGES_FALLBACK.map(url => ({ url, label: '' }));

    const results = await Promise.all(pages.map(async page => {
        try {
            return indexPageDocument(await fetchPageDocument(page.url), page, files);
        } catch (error) {
            console.warn(`頁面 ${page.url} 建立索引失敗:`, error);
            return [];
        }
    }));
    const entries = results.flat().concat([...files.values()]);
    if (entries.length === 0) pageIndexFailed = true;
    pageCorpus = entries.map(finalizeEntry);
    console.log(`頁面內文索引建立完成，共 ${pages.length} 個頁面、${pageCorpus.length} 個段落/文件。`);
}

/** 把一個頁面依標題切成多個段落，每個段落是一筆可搜尋的資料 */
function indexPageDocument(doc, page, files) {
    const root = doc.querySelector('main') || doc.body;
    if (!root) return [];
    const pageTitle = page.label || normalizeText(doc.title) || page.url;
    const headingIndex = new Map(Array.from(root.querySelectorAll(HEADING_SELECTOR)).map((el, i) => [el, i]));
    const chunks = [];
    const stack = [];
    let current = { title: pageTitle, at: '', crumb: [], parts: [] };
    chunks.push(current);

    const walk = node => {
        node.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                current.parts.push(child.nodeValue);
                return;
            }
            if (child.nodeType !== Node.ELEMENT_NODE || child.matches(INDEX_SKIP_SELECTOR) || child.hidden) return;
            if (/^H[1-6]$/.test(child.tagName)) {
                const text = normalizeText(child.textContent);
                if (!text) return;
                const level = Number(child.tagName[1]);
                while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
                current = { title: text, at: `h${headingIndex.get(child)}`, crumb: stack.map(s => s.text).slice(-2), parts: [] };
                stack.push({ level, text });
                chunks.push(current);
                return;
            }
            if (child.tagName === 'A') {
                const href = (child.getAttribute('href') || '').trim();
                if (isLocalLink(href) && FILE_LINK_PATTERN.test(href)) addFileEntry(files, href, normalizeText(child.textContent), pageTitle);
            }
            const isBlock = BLOCK_TAGS.test(child.tagName);
            if (isBlock) current.parts.push(' ');
            walk(child);
            if (isBlock) current.parts.push(' ');
        });
    };
    walk(root);

    return chunks
        .map(chunk => ({
            type: '頁面內文',
            title: chunk.title,
            crumb: [pageTitle, ...chunk.crumb].filter((t, i, arr) => t && arr.indexOf(t) === i && t !== chunk.title).join(' › '),
            url: page.url,
            at: chunk.at,
            isFile: false,
            text: chunk.parts.join('')
        }))
        .filter(entry => entry.at || normalizeText(entry.text));
}

// --- 查詢與排序 ---
function parseSearchQuery(query) {
    const normalized = normalizeText(query).toLowerCase();
    const seen = new Set();
    const terms = [];
    normalized.split(QUERY_SPLIT_PATTERN).filter(Boolean).forEach(text => {
        if (seen.has(text)) return;
        seen.add(text);
        // 中文沒有空格：完整字串找不到時，改用「去除虛詞後的雙字組合」比對
        const grams = new Set();
        if (CJK_PATTERN.test(text) && text.length >= 3) {
            text.replace(QUERY_STOP_PATTERN, ' ').split(' ').forEach(piece => {
                for (let i = 0; i < piece.length - 1; i++) grams.add(piece.slice(i, i + 2));
            });
        }
        terms.push({ text, grams: [...grams] });
    });
    return { terms };
}

function scoreEntry(entry, parsed) {
    let score = 0, matched = 0;
    const hits = new Set();
    parsed.terms.forEach(term => {
        const inTitle = entry._title.includes(term.text);
        const inText = entry._text.includes(term.text);
        const inCrumb = entry._crumb.includes(term.text);
        if (inTitle || inText || inCrumb) {
            matched += 1;
            if (inTitle) score += entry._title === term.text ? 100 : 60;
            if (inText) score += 20 + Math.min(countOccurrences(entry._text, term.text), 5) * 2;
            if (inCrumb) score += 10;
            if (inTitle || inText) hits.add(term.text);
            return;
        }
        if (term.grams.length) {
            const found = term.grams.filter(g => entry._title.includes(g) || entry._text.includes(g));
            const coverage = found.length / term.grams.length;
            if (coverage >= 0.6) {
                matched += coverage;
                score += coverage * 18 + found.filter(g => entry._title.includes(g)).length * 4;
                found.forEach(g => hits.add(g));
            }
        }
    });
    if (hits.size === 0) return null;   // 只命中頁面名稱不算
    if (parsed.terms.length > 1) score = matched >= parsed.terms.length ? score + 40 : score * 0.5;
    return { score, hits: [...hits] };
}

function buildSnippet(entry, hits) {
    const text = entry.text;
    if (!text) return '';
    let pos = -1;
    hits.forEach(hit => {
        const found = entry._text.indexOf(hit);
        if (found !== -1 && (pos === -1 || found < pos)) pos = found;
    });
    const start = pos > 30 ? pos - 30 : 0;
    const end = Math.min(text.length, start + 120);
    return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}

function siteSearch(query) {
    const parsed = parseSearchQuery(query);
    if (parsed.terms.length === 0) return [];
    const scored = [];
    searchCorpus.concat(pageCorpus).forEach(entry => {
        const result = scoreEntry(entry, parsed);
        if (result) scored.push({ entry, score: result.score, hits: result.hits });
    });
    scored.sort((a, b) => b.score - a.score);

    const seenKeys = new Set();
    const perPage = new Map();
    return scored.filter(({ entry }) => {
        const key = entry.isFile ? `file:${entry.url}` : `${entry.type}|${entry.url}|${entry.at}|${entry.title}`;
        if (seenKeys.has(key)) return false;
        seenKeys.add(key);
        if (entry.url && !entry.isFile) {
            const count = perPage.get(entry.url) || 0;
            if (count >= SEARCH_MAX_PER_PAGE) return false;
            perPage.set(entry.url, count + 1);
        }
        return true;
    }).map(item => ({ ...item, snippet: buildSnippet(item.entry, item.hits) }));
}

// 保留舊名稱，避免其他頁面仍在呼叫
function localFullTextSearch(query) {
    return siteSearch(query).map(r => ({ ...r.entry, score: r.score, summary: r.snippet }));
}

// --- 搜尋視窗介面 ---
function setupSearchUI() {
    injectSearchStyles();
    const modalEl = document.getElementById("aiChatModal");
    if (!modalEl) return;
    const input = document.getElementById("chatInput");
    if (input) input.placeholder = "輸入關鍵字，例如：利木津巴士、接心申請";

    const greeting = modalEl.querySelector("#chatMessages .bot-message .message-content");
    if (greeting) {
        greeting.innerHTML = `您好！輸入關鍵字即可搜尋全站內容，包含各頁面內文、交通、住宿、Q&amp;A 與文件下載。多個關鍵字請用空格分開。
            <div class="ss-chips">${SEARCH_SUGGESTIONS.map(s => `<button type="button" class="ss-chip" data-search-suggestion="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('')}</div>`;
    }

    modalEl.addEventListener("show.bs.modal", () => { ensurePageIndex(); });
    modalEl.addEventListener("shown.bs.modal", () => input?.focus());
    modalEl.addEventListener("click", event => {
        const chip = event.target.closest("[data-search-suggestion]");
        if (chip) {
            sendSearchMessage(chip.dataset.searchSuggestion);
            return;
        }
        // 結果就在目前頁面：不重新載入，直接關閉視窗並捲動到該段落
        const link = event.target.closest("a.ss-card");
        if (link && link.target !== "_blank" && link.pathname === window.location.pathname && link.hash.startsWith("#find=")) {
            event.preventDefault();
            history.replaceState(null, "", link.href);
            modalEl.addEventListener("hidden.bs.modal", applySearchHighlight, { once: true });
            bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        }
    });
}

function injectSearchStyles() {
    if (document.getElementById("site-search-styles")) return;
    const style = document.createElement("style");
    style.id = "site-search-styles";
    style.textContent = `
        #aiChatModal .message-content.ss-results { width: 100%; max-width: 100%; }
        .ss-summary { margin-bottom: .6rem; font-size: .95rem; }
        .ss-list { display: flex; flex-direction: column; gap: .5rem; }
        .ss-card { display: block; padding: .65rem .8rem; border: 1px solid #d5dae0; border-radius: 10px; background: #fff; color: #212529; text-decoration: none; text-align: left; transition: border-color .15s ease, box-shadow .15s ease; }
        a.ss-card:hover, a.ss-card:focus-visible { border-color: #0077B6; box-shadow: 0 2px 8px rgba(0, 0, 0, .12); color: #212529; }
        .ss-meta { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem; font-size: .75rem; color: #6c757d; margin-bottom: .2rem; }
        .ss-badge { flex-shrink: 0; padding: .1rem .45rem; border-radius: 50rem; background: #e7f1f8; color: #0b5a85; font-weight: 700; }
        .ss-title { font-weight: 700; line-height: 1.35; }
        a.ss-card .ss-title { color: #0b5a85; }
        .ss-snippet { margin-top: .2rem; font-size: .85rem; line-height: 1.5; color: #495057; overflow-wrap: anywhere; }
        .ss-card mark, mark.ss-hit { padding: 0 .1em; border-radius: 3px; background: #ffe58a; color: #212529; }
        .ss-more { margin-top: .6rem; }
        .ss-chips { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: .6rem; }
        .ss-chip { padding: .2rem .7rem; border: 1px solid #adb5bd; border-radius: 50rem; background: #fff; color: #343a40; font-size: .85rem; }
        .ss-chip:hover { border-color: #0077B6; color: #0b5a85; }
        .ss-target { outline: 3px solid #ee9b00; outline-offset: 4px; border-radius: 4px; scroll-margin-top: 90px; }
    `;
    document.head.appendChild(style);
}

function handleChatKeyPress(event) {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        sendSearchMessage();
    }
}

async function sendSearchMessage(presetQuery) {
    const input = document.getElementById("chatInput");
    const query = (typeof presetQuery === "string" ? presetQuery : input?.value || "").trim();
    if (!query) return;
    const userMessage = addChatMessage(query, "user");
    if (input) input.value = "";
    const indicator = addChatMessage("搜尋中...", "bot");
    await ensurePageIndex();
    indicator?.remove();
    const resultMessage = renderSearchResults(query, siteSearch(query));
    // 只捲動對話區，讓「提問＋結果」從頂端開始顯示（不影響背後的頁面）
    const container = document.getElementById("chatMessages");
    const anchorMessage = userMessage || resultMessage;
    if (container && anchorMessage) {
        const scroller = [container, container.parentElement].find(el => el && el.scrollHeight > el.clientHeight + 1) || container;
        scroller.scrollTop += anchorMessage.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 8;
    }
}

function buildResultHref(result) {
    const { entry, hits } = result;
    if (!entry.url) return "";
    if (entry.isFile || /^https?:\/\//i.test(entry.url)) return entry.url;
    const params = new URLSearchParams();
    params.set("find", hits.slice(0, 6).join("|"));
    if (entry.at) params.set("at", entry.at);
    return `${entry.url}#${params.toString()}`;
}

function createResultCard(result) {
    const { entry, hits, snippet } = result;
    const href = buildResultHref(result);
    const card = document.createElement(href ? "a" : "div");
    card.className = "ss-card";
    if (href) {
        card.setAttribute("href", href);
        if (entry.isFile || /^https?:\/\//i.test(entry.url)) {
            card.target = "_blank";
            card.rel = "noopener noreferrer";
        }
    }
    card.innerHTML = `
        <div class="ss-meta"><span class="ss-badge">${escapeHtml(entry.type)}</span>${entry.crumb ? `<span>${escapeHtml(entry.crumb)}</span>` : ""}</div>
        <div class="ss-title">${highlightHtml(entry.title, hits)}</div>
        ${snippet ? `<div class="ss-snippet">${highlightHtml(snippet, hits)}</div>` : ""}`;
    return card;
}

function renderSearchResults(query, results) {
    const body = document.createElement("div");
    if (results.length === 0) {
        body.innerHTML = `找不到與「${escapeHtml(query)}」相關的內容。<br>建議改用較短的關鍵字（例如「巴士」「申請」），或用空格分開多個關鍵字。`;
    } else {
        const summary = document.createElement("div");
        summary.className = "ss-summary";
        summary.innerHTML = `找到 <strong>${results.length}</strong> 筆與「${escapeHtml(query)}」相關的結果，點選即可前往：`;
        const list = document.createElement("div");
        list.className = "ss-list";
        const more = document.createElement("button");
        more.type = "button";
        more.className = "btn btn-sm btn-outline-secondary ss-more";
        let shown = 0;
        const showMore = () => {
            results.slice(shown, shown + SEARCH_PAGE_SIZE).forEach(r => list.appendChild(createResultCard(r)));
            shown = Math.min(results.length, shown + SEARCH_PAGE_SIZE);
            more.hidden = shown >= results.length;
            more.textContent = `顯示更多（還有 ${results.length - shown} 筆）`;
        };
        more.addEventListener("click", showMore);
        showMore();
        body.append(summary, list, more);
    }
    if (pageIndexFailed) {
        const note = document.createElement("div");
        note.className = "ss-meta mt-2";
        note.textContent = "※ 目前無法讀取各頁面內文，僅顯示資料表中的結果。";
        body.appendChild(note);
    }
    return addChatMessage(body, "bot", { wide: true });
}

/** 新增一則訊息。content 可以是純文字，或已建立好的 DOM 節點 */
function addChatMessage(content, type, options = {}) {
    const container = document.getElementById("chatMessages");
    if (!container) return null;
    const messageWrapper = document.createElement("div");
    messageWrapper.className = `message ${type}-message`;
    if (options.id) messageWrapper.id = options.id;
    const messageContent = document.createElement("div");
    messageContent.className = "message-content" + (options.wide ? " ss-results" : "");
    if (content instanceof Node) {
        messageContent.appendChild(content);
    } else {
        messageContent.innerHTML = escapeHtml(content).replace(/\n/g, "<br>");
    }
    messageWrapper.appendChild(messageContent);
    container.appendChild(messageWrapper);
    container.scrollTop = container.scrollHeight;
    return messageWrapper;
}

// --- 從搜尋結果進入頁面後：標示關鍵字並捲動到該段落 ---
function parseFindHash() {
    if (!window.location.hash.startsWith("#find=")) return null;
    const params = new URLSearchParams(window.location.hash.slice(1));
    return {
        terms: (params.get("find") || "").split("|").map(t => t.trim()).filter(Boolean),
        at: params.get("at") || ""
    };
}

function clearSearchHighlight() {
    document.querySelectorAll("mark.ss-hit").forEach(mark => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
    });
    document.querySelectorAll(".ss-target").forEach(el => el.classList.remove("ss-target"));
}

function markSearchTerms(root, terms) {
    const regex = buildHitRegExp(terms);
    if (!regex) return [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: node => (!node.nodeValue.trim() || node.parentElement.closest("script,style,textarea,nav,.modal"))
            ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const marks = [];
    nodes.forEach(node => {
        const parts = node.nodeValue.split(regex);
        if (parts.length < 2) return;
        const fragment = document.createDocumentFragment();
        parts.forEach((part, i) => {
            if (!part) return;
            if (i % 2) {
                const mark = document.createElement("mark");
                mark.className = "ss-hit";
                mark.textContent = part;
                marks.push(mark);
                fragment.appendChild(mark);
            } else {
                fragment.appendChild(document.createTextNode(part));
            }
        });
        node.parentNode.replaceChild(fragment, node);
    });
    return marks;
}

/** 目標若在未開啟的頁籤或收合區塊內，先把它打開 */
function revealElement(element) {
    if (!window.bootstrap) return;
    for (let el = element; el && el !== document.body; el = el.parentElement) {
        if (el.classList.contains("tab-pane") && !el.classList.contains("active") && el.id) {
            const id = CSS.escape(el.id);
            const trigger = document.querySelector(`[data-bs-toggle][data-bs-target="#${id}"], [data-bs-toggle][href="#${id}"]`);
            if (trigger) bootstrap.Tab.getOrCreateInstance(trigger).show();
        } else if (el.classList.contains("collapse") && !el.classList.contains("show") && !el.classList.contains("navbar-collapse")) {
            bootstrap.Collapse.getOrCreateInstance(el, { toggle: false }).show();
        }
    }
}

function applySearchHighlight() {
    const request = parseFindHash();
    if (!request) return;
    const root = document.querySelector("main") || document.body;
    clearSearchHighlight();

    let anchor = null, region = null;
    if (/^h\d+$/.test(request.at)) {
        anchor = root.querySelectorAll(HEADING_SELECTOR)[Number(request.at.slice(1))] || null;
    } else if (request.at.startsWith("q:")) {
        const question = request.at.slice(2);
        anchor = Array.from(root.querySelectorAll(".accordion-button")).find(btn => normalizeText(btn.textContent) === question) || null;
        const targetSelector = anchor?.getAttribute("data-bs-target");
        region = targetSelector ? document.querySelector(targetSelector) : null;
    }

    const marks = markSearchTerms(root, request.terms);
    let target;
    if (region) {
        target = anchor;
        revealElement(region.firstElementChild || region);
    } else if (anchor) {
        target = marks.find(mark => anchor.compareDocumentPosition(mark) & Node.DOCUMENT_POSITION_FOLLOWING) || anchor;
    } else {
        target = marks[0];
    }
    if (!target) return;
    revealElement(target);
    // 等頁籤／收合動畫結束後再捲動，位置才會正確
    const scrollToTarget = () => target.scrollIntoView({ behavior: "instant", block: "center" });
    const isInView = () => {
        const rect = target.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
    };
    setTimeout(() => {
        target.classList.add("ss-target");
        scrollToTarget();
        // 保險：若版面仍在變動（圖片、地圖載入）導致位置跑掉，再校正一次
        setTimeout(() => { if (!isInView()) scrollToTarget(); }, 600);
    }, 400);
}

// --- START: 修改後的回到頂部小白馬功能 ---
function setupBackToTopHorse() {
  const backToTopButton = document.getElementById('back-to-top-horse');

  // 如果頁面上沒有這個按鈕，就直接返回
  if (!backToTopButton) {
    return; 
  }

  // 讓按鈕立即顯示
  // 我們不再需要滾動監聽器來切換 .visible class
  backToTopButton.classList.add('visible');

  // 點擊後平滑滾動到頂部
  backToTopButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
// --- END: 修改後的回到頂部小白馬功能 ---
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

function openAIChat() {
    const modalEl = document.getElementById("aiChatModal");
    if (modalEl) new bootstrap.Modal(modalEl).show();
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
            searchCorpus.push({
                type: category,
                title: title.split("/")[0].trim(),
                content: Object.values(item).join(" ").toLowerCase(),
                summary: item[schema.summary] || ""
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
        if (title.includes(lowerCaseQuery)) score += 50;
        if (content.includes(lowerCaseQuery)) score += 20;
        query.split(/\s+/).filter(Boolean).forEach(term => {
            if (content.includes(term)) score += 1;
            if (title.includes(term)) score += 5;
        });
        return { ...item, score };
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
    if (!query) return;
    addChatMessage(query, "user");
    input.value = "";
    addChatMessage("搜尋中...", "bot", { id: "typing-indicator" });
    setTimeout(() => {
        document.getElementById("typing-indicator")?.remove();
        const results = localFullTextSearch(query);
        const message = results.length > 0 ?
            "根據您提供的資訊，我找到了以下相關內容：\n\n" + results.slice(0, 5).map((item, index) =>
                `${index + 1}. **${item.title} (${item.type})**: ${item.summary}`
            ).join("\n\n") :
            "抱歉，無法找到相關答案。請嘗試更換關鍵字。";
        addChatMessage(message, "bot", {
            source_type: results.length > 0 ? "本地資料庫" : "無結果",
            sources: results.slice(0, 3).map(r => r.title)
        });
    }, 500);
}

function addChatMessage(text, type, options = {}) {
    const container = document.getElementById("chatMessages");
    if (!container) return;
    const messageWrapper = document.createElement("div");
    messageWrapper.className = `message ${type}-message`;
    if (options.id) messageWrapper.id = options.id;
    let htmlText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (type === 'bot') htmlText = linkify(htmlText);
    htmlText = htmlText.replace(/\n/g, "<br>");
    const sourceTypeBadge = options.source_type ? `<span class="source-type-badge ${options.source_type === '本地資料庫' ? 'badge-local' : 'badge-default'}">${options.source_type}</span>` : "";
    let sourcesHtml = "";
    if (options.sources && options.sources.length > 0) {
        sourcesHtml = `<div class="source-container"><p class="source-title">參考資料來源：</p><ul>${options.sources.map(s => `<li>${s.substring(0, 20)}...</li>`).join('')}</ul></div>`;
    }
    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    messageContent.innerHTML = `${sourceTypeBadge}<div class="message-text">${htmlText}</div>${sourcesHtml}`;
    messageWrapper.appendChild(messageContent);
    container.appendChild(messageWrapper);
    container.scrollTop = container.scrollHeight;
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
// --- START: 設定區 ---
const GOOGLE_SHEET_CSV_URLS = {
    attractions: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZqeYWGl2A4-elzpMtIqHriHbHap3rttyFdwjeyi4Bs69w5TziEk_HR0AwxaLNOlGTWRCrfX4W5fzU/pub?gid=0&single=true&output=csv',
    transportation: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZqeYWGl2A4-elzpMtIqHriHbHap3rttyFdwjeyi4Bs69w5TziEk_HR0AwxaLNOlGTWRCrfX4W5fzU/pub?gid=965763203&single=true&output=csv',
    hotels: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZqeYWGl2A4-elzpMtIqHriHbHap3rttyFdwjeyi4Bs69w5TziEk_HR0AwxaLNOlGTWRCrfX4W5fzU/pub?gid=234560979&single=true&output=csv',
    restaurants: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZqeYWGl2A4-elzpMtIqHriHbHap3rttyFdwjeyi4Bs69w5TziEk_HR0AwxaLNOlGTWRCrfX4W5fzU/pub?gid=679464914&single=true&output=csv',
    worshipSteps: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZqeYWGl2A4-elzpMtIqHriHbHap3rttyFdwjeyi4Bs69w5TziEk_HR0AwxaLNOlGTWRCrfX4W5fzU/pub?gid=1513868775&single=true&output=csv',
    qa: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZqeYWGl2A4-elzpMtIqHriHbHap3rttyFdwjeyi4Bs69w5TziEk_HR0AwxaLNOlGTWRCrfX4W5fzU/pub?gid=1920070534&single=true&output=csv',
    docContent: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZqeYWGl2A4-elzpMtIqHriHbHap3rttyFdwjeyi4Bs69w5TziEk_HR0AwxaLNOlGTWRCrfX4W5fzU/pub?gid=1205883126&single=true&output=csv'
};
const SHINYUAN_COORDS = [35.6888, 139.4135]; // 親苑的精確座標
const FETCH_TIMEOUT = 8000; // 網路請求超時時間 (8秒)
// --- END: 設定區 ---

// 全域變數
let currentData = { attractions: [], restaurants: [], hotels: [], transportation: [], docContent: [] };
let worshipStepsData = [];
let allQaData = [];
let searchCorpus = [];
let heroMapInstance = null;

// 應用程式啟動點
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    console.log('app.js: DOMContentLoaded 事件觸發，開始初始化...');
    makeModalDraggable(document.getElementById('aiChatModal'));
    bindEventListeners();
    handleNavActiveState();
    displayExchangeRate();

    const loadingIndicator = document.createElement('div');
    loadingIndicator.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.95); z-index:2000; display:flex; flex-direction:column; justify-content:center; align-items:center;">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3 text-muted">載入核心資料中...</p>
        </div>`;
    document.body.prepend(loadingIndicator);

    try {
        await loadAllDataFromCsv();
        buildSearchCorpus();
        if (document.getElementById('heroMap') || document.getElementById('shinyuanMap')) initializePage('homeOrShinyuan');
        if (document.getElementById('qa-accordion-container')) initializePage('qa');
    } catch (error) {
        console.error('❌ app.js: 初始化過程中發生致命錯誤:', error);
        document.body.innerHTML = `
            <div class="container vh-100 d-flex justify-content-center align-items-center">
                <div class="alert alert-danger text-center">
                    <h2 class="alert-heading"><i class="fas fa-exclamation-triangle"></i> 無法載入網站資料</h2>
                    <p>很抱歉，載入所需資料時發生錯誤。這可能是由於網路連線不穩定或資料來源暫時無法使用。</p>
                    <hr>
                    <p class="mb-0 small">請嘗試重新整理頁面。若問題持續發生，請聯絡網站管理員。<br>錯誤訊息: ${error.message}</p>
                </div>
            </div>`;
    } finally {
        loadingIndicator.remove();
    }
}

// 帶有超時機制的 fetch 函式
async function fetchWithTimeout(resource, options = {}, timeout = FETCH_TIMEOUT) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        return response;
    } finally {
        clearTimeout(id);
    }
}


function makeMapClickableForDirections(mapInstance, destinationCoords) {
    if (!mapInstance || !destinationCoords) {
        console.error("地圖實例或目的地座標無效，無法啟用點擊功能。");
        return;
    }
    const [lat, lng] = destinationCoords;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    mapInstance.on('click', function() {
        console.log(`🗺️ 地圖被點擊！正在開啟 Google 地圖路徑規劃至 ${lat},${lng}`);
        window.open(googleMapsUrl, '_blank');
    });
    const mapContainer = mapInstance.getContainer();
    if (mapContainer) {
        mapContainer.style.cursor = 'pointer';
        mapContainer.setAttribute('title', '點擊開啟 Google 地圖路徑規劃');
    }
}

async function displayExchangeRate() {
    const displayElements = document.querySelectorAll('.exchange-rate-display');
    if (displayElements.length === 0) return;
    const PRIMARY_API_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/twd.json';
    const BACKUP_API_URL = 'https://api.frankfurter.app/latest?from=TWD&to=JPY';
    const TIMEOUT = 5000;
    const fetchWithTimeoutForRate = (url, timeout) => Promise.race([fetch(url), new Promise((_, reject) => setTimeout(() => reject(new Error('請求超時 (Timeout)')), timeout))]);
    const updateDisplay = (htmlContent, isError = false) => {
        displayElements.forEach(el => {
            el.innerHTML = htmlContent;
            el.classList.remove('placeholder');
            if (isError) el.style.color = '#ffc107';
        });
    };
    try {
        console.log(`🚀 [1/2] 嘗試從主要 API 獲取匯率: ${PRIMARY_API_URL}`);
        const response = await fetchWithTimeoutForRate(PRIMARY_API_URL, TIMEOUT);
        if (!response.ok) throw new Error(`主要 API 請求失敗，狀態: ${response.status}`);
        const data = await response.json();
        const rate = data?.twd?.jpy;
        if (typeof rate !== 'number') throw new Error('主要 API 回應格式不符');
        const formattedRate = rate.toFixed(2);
        const displayText = `<i class="fas fa-sync-alt fa-fw me-1" title="即時匯率"></i> 1 TWD ≈ ${formattedRate} JPY`;
        updateDisplay(displayText);
        console.log(`✅ 成功從主要 API 獲取匯率: 1 TWD = ${rate} JPY`);
    } catch (error) {
        console.warn(`⚠️ 主要 API 失敗: ${error.message}`);
        try {
            console.log(`🚀 [2/2] 嘗試從備援 API 獲取匯率: ${BACKUP_API_URL}`);
            const response = await fetchWithTimeoutForRate(BACKUP_API_URL, TIMEOUT);
            if (!response.ok) throw new Error(`備援 API 請求失敗，狀態: ${response.status}`);
            const data = await response.json();
            const rate = data?.rates?.JPY;
            if (typeof rate !== 'number') throw new Error('備援 API 回應格式不符');
            const formattedRate = rate.toFixed(2);
            const displayText = `<i class="fas fa-sync-alt fa-fw me-1" title="即時匯率 (來源: 備援)"></i> 1 TWD ≈ ${formattedRate} JPY`;
            updateDisplay(displayText);
            console.log(`✅ 成功從備援 API 獲取匯率: 1 TWD = ${rate} JPY`);
        } catch (backupError) {
            console.error(`❌ 主要與備援 API 皆失敗: ${backupError.message}`);
            const errorText = `<i class="fas fa-exclamation-triangle fa-fw me-1" title="錯誤"></i> 匯率載入失敗`;
            updateDisplay(errorText, true);
        }
    }
}

function initializePage(pageName) {
    const pageInitializers = {
        homeOrShinyuan: () => {
            if (document.getElementById('heroMap')) {
                console.log('初始化規劃頁...');
                heroMapInstance = initializeHeroMap();
                makeMapClickableForDirections(heroMapInstance, SHINYUAN_COORDS);
                renderPlanningSteps();
                renderAttractions();
                setTimeout(syncMapHeight, 100);
                window.addEventListener('resize', syncMapHeight);
            }
            if (document.getElementById('shinyuanMap')) {
                console.log('初始化首頁 (親苑)...');
                const shinyuanMapInstance = initializeShinyuanMap();
                makeMapClickableForDirections(shinyuanMapInstance, SHINYUAN_COORDS);
                renderWorshipSteps();
            }
        },
        qa: () => {
            console.log('初始化Q&A頁...');
            document.getElementById('qa-accordion-container').innerHTML = '';
            renderQACategories();
            renderQAItems('all');
        }
    };
    pageInitializers[pageName]();
}

function csvToJson(csvText) {
    const lines = csvText.replace(/\r/g, '').split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    const headers = lines.shift().split(',').map(h => h.trim());
    return lines.map(line => {
        const row = {};
        let currentPos = 0;
        headers.forEach(header => {
            if (currentPos >= line.length) { row[header] = ""; return; }
            let value = '';
            if (line[currentPos] === '"') {
                let endQuotePos = currentPos + 1;
                while (endQuotePos < line.length) {
                    if (line[endQuotePos] === '"' && (endQuotePos + 1 >= line.length || line[endQuotePos + 1] !== '"')) break;
                    if (line[endQuotePos] === '"' && line[endQuotePos + 1] === '"') endQuotePos++;
                    endQuotePos++;
                }
                value = line.substring(currentPos + 1, endQuotePos).replace(/""/g, '"');
                const nextComma = line.indexOf(',', endQuotePos);
                currentPos = (nextComma > -1) ? nextComma + 1 : line.length;
            } else {
                let commaPos = line.indexOf(',', currentPos);
                if (commaPos === -1) commaPos = line.length;
                value = line.substring(currentPos, commaPos);
                currentPos = commaPos + 1;
            }
            row[header] = value.trim();
        });
        return row;
    });
}

async function loadAllDataFromCsv() {
    console.log('正從 Google Sheet CSV 載入資料 (使用 allSettled)...');
    const fetchPromises = Object.entries(GOOGLE_SHEET_CSV_URLS).map(async ([key, url]) => {
        const response = await fetchWithTimeout(`${url}&_=${new Date().getTime()}`);
        if (!response.ok) {
            throw new Error(`獲取 ${key} 資料失敗。狀態: ${response.status}`);
        }
        const csvText = await response.text();
        return { key, data: csvToJson(csvText) };
    });

    const results = await Promise.allSettled(fetchPromises);
    let successfulLoads = 0;

    results.forEach((result, index) => {
        const key = Object.keys(GOOGLE_SHEET_CSV_URLS)[index];
        if (result.status === 'fulfilled') {
            const { key, data } = result.value;
            switch (key) {
                case 'attractions': currentData.attractions = data; break;
                case 'restaurants': currentData.restaurants = data; break;
                case 'hotels': currentData.hotels = data; break;
                case 'transportation': currentData.transportation = data; break;
                case 'qa': allQaData = data; break;
                case 'worshipSteps': worshipStepsData = data; break;
                case 'docContent': currentData.docContent = data; break;
            }
            console.log(`✅ ${key} 載入成功`);
            successfulLoads++;
        } else {
            console.warn(`⚠️ ${key} 載入失敗:`, result.reason.message);
        }
    });

    console.log(`核心資料載入完成: ${successfulLoads} / ${results.length} 個檔案成功。`);
    
    if (successfulLoads === 0) {
        throw new Error("所有核心資料均無法載入，網站無法繼續。");
    }

    console.log("當前可用資料:", { ...currentData, allQaData, worshipStepsData });
}


function getImageUrl(source) {
    if (!source) return '';
    if (source.startsWith('http')) return source;
    let cleanSource = source.replace(/^\/?images\//, '');
    return `images/${cleanSource}`;
}

function makeModalDraggable(modalEl) {
    if (!modalEl) return;
    const dialogEl = modalEl.querySelector('.modal-dialog');
    const headerEl = modalEl.querySelector('.modal-header');
    if (!dialogEl || !headerEl) return;
    let isDragging = false, initialMouseX, initialMouseY, initialDialogX, initialDialogY;
    headerEl.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        isDragging = true;
        const rect = dialogEl.getBoundingClientRect();
        initialMouseX = e.clientX; initialMouseY = e.clientY;
        initialDialogX = rect.left; initialDialogY = rect.top;
        dialogEl.classList.add('is-draggable'); 
        dialogEl.style.cssText = `transform: none; top: ${initialDialogY}px; left: ${initialDialogX}px;`;
        document.body.classList.add('is-dragging');
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        dialogEl.style.top = `${initialDialogY + e.clientY - initialMouseY}px`;
        dialogEl.style.left = `${initialDialogX + e.clientX - initialMouseX}px`;
    });
    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.classList.remove('is-dragging');
    });
}

function initializeHeroMap() {
    try {
        const mapElement = document.getElementById('heroMap');
        if (!mapElement || typeof L === 'undefined') return null;
        const taipeiCoords = [25.0330, 121.5654];
        const shinyoenCoords = SHINYUAN_COORDS;
        const centerLatLng = L.latLngBounds(taipeiCoords, shinyoenCoords).getCenter();
        const heroMap = L.map(mapElement, { scrollWheelZoom: false }).setView(centerLatLng, 5); 
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(heroMap);
        L.marker(taipeiCoords).addTo(heroMap).bindPopup('<b>台北</b><br>旅程起點');
        L.marker(shinyoenCoords).addTo(heroMap).bindPopup('<b>親苑 (東京立川)</b><br>感恩之旅目的地');
        L.polyline([taipeiCoords, shinyoenCoords], { color: '#04254E', weight: 3, opacity: 0.8, dashArray: '10, 10' }).addTo(heroMap);
        console.log('✅ 地圖已成功初始化！');
        return heroMap;
    } catch (error) {
        console.error('❌ 在地圖初始化過程中發生錯誤:', error);
        return null;
    }
}

function initializeShinyuanMap() {
    try {
        if (typeof L === 'undefined') return null;
        const shinyuanMap = L.map('shinyuanMap').setView(SHINYUAN_COORDS, 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(shinyuanMap);
        L.marker(SHINYUAN_COORDS).addTo(shinyuanMap).bindPopup('<b>親苑</b><br>東京都立川市柴崎町1-2-13').openPopup();
        return shinyuanMap; 
    } catch(e) { 
        console.error("無法初始化親苑地圖:", e); 
        return null;
    }
}

function renderWorshipSteps() {
    const container = document.getElementById('worship-steps-container');
    if (!container) return;
    container.innerHTML = '';
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
        const icon = icons[index] || icons[0]; // Fallback to the first icon
        return `
        <div class="col-md-6 col-lg-3">
            <a href="#" class="info-card h-100" data-step-id="${step.step_id}">
                <div class="info-card-icon">
                    <i id="${icon.id}" class="${icon.class}"></i>
                </div>
                <h5 class="info-card-title">${step.title}</h5>
                <p class="info-card-subtitle">${step.short_description}</p>
            </a>
        </div>`;
    }).join('');
}

function showStepDetails(stepId) {
    const step = worshipStepsData.find(s => String(s.step_id) === String(stepId));
    if (!step) return;
    const imageUrl = getImageUrl(step.image_url);
    const imageHtml = imageUrl ? `<img src="${imageUrl}" class="img-fluid rounded mb-3" alt="${step.title}">` : '';
    const formattedDescription = (step.long_description || '').replace(/\n/g, '<br>');
    
    const linkedRemark = linkify(step.備註 || '');
    let finalHtmlContent = `${imageHtml}<p>${formattedDescription}</p>`;
    if (step.備註) finalHtmlContent += `<div class="remark-section mt-3"><small><strong>備註：</strong> ${linkedRemark}</small></div>`;

    showInfoModal(`${step.step_id}. ${step.title}`, finalHtmlContent, true);
}


function syncMapHeight() {
    const content = document.querySelector(".hero-content");
    const mapContainer = document.querySelector(".hero-map-container");
    if (content && mapContainer) {
        mapContainer.style.height = `${Math.max(content.offsetHeight, 350)}px`;
        if (heroMapInstance) heroMapInstance.invalidateSize();
    }
}

function renderPlanningSteps() {
    const container = document.getElementById("planning-steps");
    if (!container) return;
    container.innerHTML = '';
    const steps = [
        { type: "transportation", icon: "fas fa-plane", title: "1. 交通安排", text: "從台北到親苑的完整交通指南", color: "primary" },
        { type: "hotels", icon: "fas fa-bed", title: "2. 住宿選擇", text: "精選親苑地區優質住宿", color: "success" },
        { type: "restaurants", icon: "fas fa-utensils", title: "3. 美食探索", text: "品嚐道地日式料理", color: "warning" },
        { type: "attractions", icon: "fas fa-camera", title: "4. 景點遊覽", text: "發現親苑精彩景點", color: "info" }
    ];
    container.innerHTML = steps.map(step => 
        `<div class="col-lg-3 col-md-6 d-flex">
            <div class="step-card">
                <div class="step-icon">
                    <i class="${step.icon} text-${step.color}"></i>
                </div>
                <h4>${step.title}</h4>
                <p>${step.text}</p>
                <button class="btn btn-outline-${step.color}" data-type="${step.type}">查看詳情</button>
            </div>
        </div>`
    ).join("");
}

function renderAttractions() {
    const container = document.getElementById("attractionsContainer");
    if (!container) return;
    container.innerHTML = '';
    if (!currentData.attractions || currentData.attractions.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">目前沒有景點資料。</p>';
        return;
    }
    container.innerHTML = currentData.attractions.map(attraction => {
        const imageUrl = getImageUrl(attraction.photos);
        return `<div class="col-lg-4 col-md-6 d-flex"><div class="attraction-card" data-id="${attraction.id}"><div class="attraction-image" style="background-image: url('${imageUrl}')"></div><div class="p-4"><h5>${attraction.name_zh || attraction.name_jp}</h5><p class="text-muted">${truncateText(attraction.description, 80)}</p></div></div></div>`;
    }).join("");
}

function renderQACategories() {
    const container = document.getElementById('qa-category-filter');
    if (!container) return;
    if (!allQaData || allQaData.length === 0) {
        container.innerHTML = '<p class="text-muted p-2">無分類資料</p>';
        return;
    }
    const categories = ['all', ...new Set(allQaData.map(item => item.category).filter(Boolean))];
    container.innerHTML = categories.map(category => `<button type="button" class="list-group-item list-group-item-action ${category === 'all' ? 'active' : ''}" data-category="${category}">${category === 'all' ? '全部問題' : category}</button>`).join('');
}

function renderQAItems(category) {
    const container = document.getElementById('qa-accordion-container');
    if (!container) return;
    const filteredData = category === 'all' ? allQaData : allQaData.filter(item => item.category === category);
    if (!filteredData || filteredData.length === 0) {
        container.innerHTML = '<p class="text-muted text-center p-5">此分類下沒有問題。</p>';
        return;
    }
    container.innerHTML = filteredData.map((item, index) => {
        const uniqueId = `qa-${category.replace(/\s+/g, '-')}-${index}`;
        
        const linkedAnswer = linkify(item.answer || '');
        const answerHtml = linkedAnswer.replace(/\n/g, '<br>');
        
        const imageUrl = getImageUrl(item.image_url);
        const imageHtml = imageUrl ? `<img src="${imageUrl}" class="img-fluid mt-3" alt="問題附圖">` : '';

        const linkedRemark = linkify(item.備註 || '');
        const remarkHtml = item.備註 ? `<div class="remark-section mt-3"><small><strong>備註：</strong> ${linkedRemark}</small></div>` : '';

        return `<div class="accordion-item"><h2 class="accordion-header" id="heading-${uniqueId}"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${uniqueId}">${item.question || '無標題問題'}</button></h2><div id="collapse-${uniqueId}" class="accordion-collapse collapse" data-bs-parent="#qa-accordion-container"><div class="accordion-body">${answerHtml}${imageHtml}${remarkHtml}</div></div></div>`;
    }).join('');
}

function bindEventListeners() {
    document.getElementById('main-search-form')?.addEventListener('submit', handleMainSearch);
    document.querySelectorAll("#btn-ai-chat").forEach(btn => btn.addEventListener("click", openAIChat));
    document.getElementById("planning-steps")?.addEventListener("click", e => { if (e.target.matches('button[data-type]')) onPlanningStepClick(e.target.dataset.type); });
    document.getElementById('attractionsContainer')?.addEventListener("click", e => { const card = e.target.closest(".attraction-card"); if (card) showAttractionDetail(card.dataset.id); });
    document.getElementById('qa-category-filter')?.addEventListener('click', e => { if (e.target.matches('button')) { document.querySelectorAll('#qa-category-filter button').forEach(b => b.classList.remove('active')); e.target.classList.add('active'); renderQAItems(e.target.dataset.category); } });
    
    document.getElementById("worship-steps-container")?.addEventListener("click", e => {
        const card = e.target.closest('a.info-card[data-step-id]');
        if (card) {
            e.preventDefault();
            showStepDetails(card.dataset.stepId);
        }
    });

    document.getElementById("btn-send-ai-message")?.addEventListener("click", sendSearchMessage);
    document.getElementById("chatInput")?.addEventListener("keypress", handleChatKeyPress);
}

function onPlanningStepClick(type) {
    const actions = {
        transportation: showTransportation, restaurants: showRestaurants,
        hotels: showHotels, attractions: showAttractions,
    };
    actions[type]?.();
}

function handleMainSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById('main-search-input');
    const query = searchInput.value.trim();
    if (query) {
        openAIChat();
        document.getElementById('chatInput').value = query;
        sendSearchMessage();
        searchInput.value = '';
    }
}

function handleNavActiveState() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
        const linkPath = link.getAttribute("href").split('/').pop() || 'index.html';
        if(currentPath === 'planning.html' && linkPath === 'planning.html') {
             link.classList.add("active");
        } else if (currentPath === 'index.html' && linkPath === 'index.html') {
             link.classList.add("active");
        } else if (currentPath === 'qa.html' && linkPath === 'qa.html') {
             link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}


function showTransportation() { showInfoModal("交通資訊", currentData.transportation); }
function showRestaurants() { showInfoModal("餐廳推薦", currentData.restaurants); }
function showHotels() { showInfoModal("住宿推薦", currentData.hotels); }
function showAttractions() { document.getElementById("attractions")?.scrollIntoView({ behavior: "smooth" }); }
function showAttractionDetail(id) { 
    const attraction = currentData.attractions.find(a => String(a.id) === String(id)); 
    if (attraction) showInfoModal(attraction.name_zh || attraction.name_jp, [attraction]); 
}

function showInfoModal(title, data, isHtml = false) {
    const modalEl = document.getElementById('infoModal');
    if (!modalEl) return;
    document.getElementById("infoModalTitle").textContent = title;
    const modalBody = document.getElementById("infoModalBody");
    if (isHtml) {
        modalBody.innerHTML = data;
    } else if (!data || data.length === 0) {
        modalBody.innerHTML = '<div class="alert alert-warning">此類別的資料目前無法載入，請稍後再試。</div>';
    } else {
        modalBody.innerHTML = data.map(item => {
            let details = "", itemName = item.name_zh || item.name_jp || item.name || "詳細資訊";
            let itemDesc = (item.description || '') + (item.tips ? `<br><span class="text-muted small">${item.tips}</span>` : '');

            if (item.transport_type) itemName = `${item.from_location} → ${item.to_location}`;
            details += item.transport_type ? `<p><strong>交通工具：</strong>${item.transport_type}</p><p><strong>時間：</strong>${item.duration}分鐘 | <strong>費用：</strong>¥${item.cost}</p>` : '';
            details += item.price_per_night ? `<p><strong>地址：</strong>${item.address || "N/A"}</p><p><strong>房價：</strong>¥${item.price_per_night}/晚</p>` : '';
            details += item.opening_hours ? `<p><strong>地址：</strong>${item.address || "N/A"}</p><p><strong>營業時間：</strong>${item.opening_hours}</p><p><strong>價位：</strong>${item.price_range || "N/A"}</p>`: '';
            if (item.rating) details += `<p><strong>評分：</strong>${item.rating}/5</p>`;
            
            let bookingButtonHtml = '';
            if (item.booking_url) {
                bookingButtonHtml = `<div class="mt-3"><a href="${item.booking_url}" class="btn btn-primary" target="_blank" rel="noopener noreferrer"><i class="fas fa-calendar-check me-2"></i> 前往訂房</a></div>`;
            }
            
            // 新增：處理 coordinates 產生 Google 地圖按鈕
            let mapButtonHtml = '';
            if (item.coordinates && item.opening_hours) { // 透過 opening_hours 判斷是否為餐廳
                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.coordinates)}`;
                mapButtonHtml = `<div class="mt-3"><a href="${googleMapsUrl}" class="btn btn-outline-success" target="_blank" rel="noopener noreferrer"><i class="fas fa-map-marker-alt me-2"></i> 在地圖上查看</a></div>`;
            }

            const linkedRemark = linkify(item.備註 || '');
            let remarkHtml = item.備註 ? `<div class="remark-section mt-3"><small><strong>備註：</strong> ${linkedRemark}</small></div>` : '';
            
            return `<div class="card mb-3"><div class="card-body"><h5>${itemName}</h5><hr>${details}<p class="mt-2">${itemDesc}</p>${mapButtonHtml}${bookingButtonHtml}${remarkHtml}</div></div>`;
        }).join("");
    }
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function openAIChat() { 
    const modalEl = document.getElementById('aiChatModal');
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function truncateText(text, length = 80) {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
}

function buildSearchCorpus() {
    searchCorpus = [];
    const processSheet = (data, type, mapping) => {
        (data || []).forEach(item => {
            if (!item || Object.values(item).every(val => !val)) return;
            const title = item[mapping.title] || (type === '交通' ? `${item.from_location}到${item.to_location}` : '無標題');
            let displayTitle = title.includes('/') ? title.split('/')[0].trim() : title;
            const summary = item[mapping.summary] || '';
            const content = Object.values(item).join(' ').toLowerCase();
            searchCorpus.push({ 
                type: type, 
                title: displayTitle,
                content: content, 
                summary: truncateText(summary, 100),
                full_summary: summary
            });
        });
    };
    const fieldMapping = {
        '景點': { title: 'name_zh', summary: 'description' },
        '餐廳': { title: 'name_zh', summary: 'description' },
        '住宿': { title: 'name', summary: 'amenities' },
        '交通': { title: 'from_location', summary: 'description' },
        'Q&A': { title: 'question', summary: 'answer' },
        '參拜步驟': { title: 'title', summary: 'long_description' },
        '文件': { title: 'type', summary: 'content' }
    };
    processSheet(currentData.attractions, '景點', fieldMapping['景點']);
    processSheet(currentData.restaurants, '餐廳', fieldMapping['餐廳']);
    processSheet(currentData.hotels, '住宿', fieldMapping['住宿']);
    processSheet(currentData.transportation, '交通', fieldMapping['交通']);
    processSheet(allQaData, 'Q&A', fieldMapping['Q&A']);
    processSheet(worshipStepsData, '參拜步驟', fieldMapping['參拜步驟']);
    processSheet(currentData.docContent, '文件', fieldMapping['文件']);
    
    console.log(`全文檢索資料庫建立完成，共 ${searchCorpus.length} 筆資料。`);
}

function localFullTextSearch(query) {
    if (!query) return [];
    const lowerCaseQuery = query.toLowerCase();
    const results = searchCorpus.map((doc, index) => {
        let score = 0;
        const title = (doc.title || '').toLowerCase();
        const content = (doc.content || '').toLowerCase();
        if (title === lowerCaseQuery) { score += 100; } else if (title.includes(lowerCaseQuery)) { score += 50; }
        if (content.includes(lowerCaseQuery)) { score += 20; }
        const keywords = lowerCaseQuery.split(/\s+/).filter(Boolean);
        if (keywords.length > 1) {
            keywords.forEach(keyword => {
                if (content.includes(keyword)) {
                    score += 1;
                    if (title.includes(keyword)) { score += 5; }
                }
            });
        }
        return { ...doc, score };
    }).filter(doc => doc.score > 0);
    return results.sort((a, b) => b.score - a.score);
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendSearchMessage();
    }
}

function sendSearchMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;
    addChatMessage(message, 'user');
    input.value = '';
    addChatMessage('搜尋中...', 'bot', { id: 'typing-indicator' });
    setTimeout(() => {
        document.getElementById('typing-indicator')?.remove();
        const searchResults = localFullTextSearch(message);
        if (searchResults.length > 0) {
            let responseText = searchResults.map((res, index) => {
                const fullSummary = res.full_summary || res.summary;
                let summaryText = '';
                if (fullSummary && fullSummary.startsWith('http')) {
                    summaryText = `: <a href="${fullSummary}" target="_blank" rel="noopener noreferrer">${fullSummary}</a>`;
                } else {
                    summaryText = fullSummary ? `: ${fullSummary}` : '';
                }
                return `${index + 1}. **${res.title} (${res.type})**${summaryText}`;
            }).join('\n\n');
            addChatMessage(responseText, 'bot', { source_type: '本地資料庫', sources: searchResults.map(r => r.title) });
        } else {
            addChatMessage('抱歉，無法找到相關答案。請嘗試更換關鍵字，或瀏覽網站上的 Q&A 頁面。', 'bot', { source_type: '無結果' });
        }
    }, 500);
}

function linkify(text) {
    if (!text) return '';
    const urlRegex = /(https?:\/\/[a-zA-Z0-9.\/~_#@?&=%-]+)/g;
    if (text.includes('<a href')) return text;
    return text.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
}

function addChatMessage(content, sender, data = {}) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    if (data.id) messageDiv.id = data.id;
    let processedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (sender === 'bot') { processedContent = linkify(processedContent); }
    processedContent = processedContent.replace(/\n/g, '<br>');
    let sourceTypeBadge = '';
    if (sender === 'bot' && data.source_type) {
        const typeInfo = { '本地資料庫': 'badge-local', '無結果': 'badge-default' }[data.source_type] || 'badge-error';
        sourceTypeBadge = `<span class="source-type-badge ${typeInfo}">${data.source_type}</span>`;
    }
    let sourcesListHtml = '';
    if (sender === 'bot' && data.sources && data.sources.length > 0) {
        sourcesListHtml = `<div class="source-container"><p class="source-title">參考資料來源：</p><ul>${data.sources.map(s => `<li>${truncateText(s, 20)}</li>`).join('')}</ul></div>`;
    }
    const messageContentDiv = document.createElement('div');
    messageContentDiv.className = 'message-content';
    const messageTextDiv = document.createElement('div');
    messageTextDiv.className = 'message-text';
    messageTextDiv.innerHTML = processedContent;
    messageContentDiv.innerHTML = sourceTypeBadge;
    messageContentDiv.appendChild(messageTextDiv);
    if(sourcesListHtml) messageContentDiv.innerHTML += sourcesListHtml;
    messageDiv.appendChild(messageContentDiv);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
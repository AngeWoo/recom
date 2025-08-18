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
    try {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.innerHTML = '<div class="vh-100 d-flex justify-content-center align-items-center flex-column" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.9); z-index:2000;"><div class="spinner-border text-primary" role="status"></div><p class="mt-3">載入資料中...</p></div>';
        document.body.prepend(loadingIndicator);
        await loadAllDataFromCsv();
        loadingIndicator.remove();
        buildSearchCorpus();
        if (document.getElementById('heroMap')) initializePage('home');
        if (document.getElementById('shinyuanMap')) initializePage('shinyuan');
        if (document.getElementById('qa-accordion-container')) initializePage('qa');
        console.log('✅ app.js: 應用程式初始化完成');
    } catch (error) {
        console.error('❌ app.js: 初始化過程中發生致命錯誤:', error);
        document.body.innerHTML = `<div class="alert alert-danger m-5"><h2>無法載入資料</h2><p>請確認您的 CSV 發布連結是否正確且可公開存取。</p><hr><p class="small">錯誤訊息: ${error.message}</p></div>`;
    }
}

function initializePage(pageName) {
    const pageInitializers = {
        home: () => {
            console.log('初始化首頁...');
            heroMapInstance = initializeHeroMap();
            renderPlanningSteps();
            renderAttractions();
            setTimeout(syncMapHeight, 100);
            window.addEventListener('resize', syncMapHeight);
        },
        shinyuan: () => {
            console.log('初始化親苑頁...');
            initializeShinyuanMap();
            renderWorshipSteps();
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
    console.log('正從 Google Sheet CSV 載入資料...');
    const fetchPromises = Object.entries(GOOGLE_SHEET_CSV_URLS).map(async ([key, url]) => {
        try {
            const response = await fetch(`${url}&_=${new Date().getTime()}`);
            if (!response.ok) throw new Error(`獲取 ${key} 資料失敗。狀態: ${response.status}`);
            const csvText = await response.text();
            return { key, data: csvToJson(csvText) };
        } catch (e) {
            console.error(`載入 ${key} 時出錯:`, e);
            throw e;
        }
    });
    const results = await Promise.all(fetchPromises);
    results.forEach(result => {
        switch (result.key) {
            case 'attractions': currentData.attractions = result.data; break;
            case 'restaurants': currentData.restaurants = result.data; break;
            case 'hotels': currentData.hotels = result.data; break;
            case 'transportation': currentData.transportation = result.data; break;
            case 'qa': allQaData = result.data; break;
            case 'worshipSteps': worshipStepsData = result.data; break;
            case 'docContent': currentData.docContent = result.data; break;
        }
    });
    console.log("✅ 全站核心資料從 CSV 載入完成:", { ...currentData, allQaData, worshipStepsData });
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
        const shinyoenCoords = [35.6940, 139.4139];
        const centerLatLng = L.latLngBounds(taipeiCoords, shinyoenCoords).getCenter();
        const heroMap = L.map(mapElement, { scrollWheelZoom: false }).setView(centerLatLng, 5); 
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO' }).addTo(heroMap);
        L.marker(taipeiCoords).addTo(heroMap).bindPopup('<b>台北</b><br>旅程起點');
        L.marker(shinyoenCoords).addTo(heroMap).bindPopup('<b>親苑 (東京立川)</b><br>感恩之旅目的地');
        L.polyline([taipeiCoords, shinyoenCoords], { color: '#ffc107', weight: 3, opacity: 0.8, dashArray: '10, 10' }).addTo(heroMap);
        console.log('✅ 地圖已成功初始化！');
        return heroMap;
    } catch (error) {
        console.error('❌ 在地圖初始化過程中發生錯誤:', error);
        return null;
    }
}

function initializeShinyuanMap() {
    try {
        if (typeof L === 'undefined') return;
        const shinyuanMap = L.map('shinyuanMap').setView([35.6888, 139.4135], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(shinyuanMap);
        L.marker([35.6888, 139.4135]).addTo(shinyuanMap).bindPopup('<b>親苑</b><br>東京都立川市柴崎町1-2-13').openPopup();
    } catch(e) { console.error("無法初始化親苑地圖:", e); }
}

function renderWorshipSteps() {
    const container = document.getElementById('worship-steps-container');
    if (!container) return;
    container.innerHTML = '';
    if (!worshipStepsData || worshipStepsData.length === 0) {
        container.innerHTML = '<p class="text-muted text-center col-12">目前沒有參拜步驟資料。</p>';
        return;
    }
    const colors = ['primary', 'success', 'warning', 'info'];
    container.innerHTML = worshipStepsData.map((step, index) => `<div class="col-md-6 col-lg-3"><div class="step-card h-100 d-flex flex-column"><div class="step-icon"><i class="${step.icon_class || 'fas fa-shoe-prints'} fa-3x text-${colors[index % 4]}"></i></div><h4>${step.step_id}. ${step.title}</h4><p class="flex-grow-1">${step.short_description}</p><button class="btn btn-outline-secondary mt-auto" data-step-id="${step.step_id}">查看詳情</button></div></div>`).join('');
}

function showStepDetails(stepId) {
    const step = worshipStepsData.find(s => String(s.step_id) === String(stepId));
    if (!step) return;
    const imageUrl = getImageUrl(step.image_url);
    const imageHtml = imageUrl ? `<img src="${imageUrl}" class="img-fluid rounded mb-3" alt="${step.title}">` : '';
    const formattedDescription = (step.long_description || '').replace(/\n/g, '<br>');
    let finalHtmlContent = `${imageHtml}<p>${formattedDescription}</p>`;
    if (step.備註) finalHtmlContent += `<div class="remark-section mt-3"><small><strong>備註：</strong> ${step.備註}</small></div>`;
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
        { type: "transportation", icon: "fa-plane", title: "1. 交通安排", text: "從台北到親苑的完整交通指南", color: "primary" },
        { type: "hotels", icon: "fa-bed", title: "2. 住宿選擇", text: "精選親苑地區優質住宿", color: "success" },
        { type: "restaurants", icon: "fa-utensils", title: "3. 美食探索", text: "品嚐道地日式料理", color: "warning" },
        { type: "attractions", icon: "fa-camera", title: "4. 景點遊覽", text: "發現親苑精彩景點", color: "info" }
    ];
    container.innerHTML = steps.map(step => `<div class="col-md-3"><div class="step-card"><div class="step-icon"><i class="fas ${step.icon} fa-3x text-${step.color}"></i></div><h4>${step.title}</h4><p>${step.text}</p><button class="btn btn-outline-${step.color}" data-type="${step.type}">查看詳情</button></div></div>`).join("");
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
        return `<div class="col-lg-4 col-md-6"><div class="attraction-card" data-id="${attraction.id}"><div class="attraction-image" style="background-image: url('${imageUrl}')"></div><div class="p-4"><h5>${attraction.name_zh || attraction.name_jp}</h5><p class="text-muted">${truncateText(attraction.description, 80)}</p></div></div></div>`;
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
        const answerHtml = (item.answer || '').replace(/\n/g, '<br>');
        const imageUrl = getImageUrl(item.image_url);
        const imageHtml = imageUrl ? `<img src="${imageUrl}" class="img-fluid mt-3" alt="問題附圖">` : '';
        const remarkHtml = item.備註 ? `<div class="remark-section mt-3"><small><strong>備註：</strong> ${item.備註}</small></div>` : '';
        return `<div class="accordion-item"><h2 class="accordion-header" id="heading-${uniqueId}"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${uniqueId}">${item.question || '無標題問題'}</button></h2><div id="collapse-${uniqueId}" class="accordion-collapse collapse" data-bs-parent="#qa-accordion-container"><div class="accordion-body">${answerHtml}${imageHtml}${remarkHtml}</div></div></div>`;
    }).join('');
}

function bindEventListeners() {
    document.getElementById('main-search-form')?.addEventListener('submit', handleMainSearch);
    document.querySelectorAll("#btn-ai-chat").forEach(btn => btn.addEventListener("click", openAIChat));
    document.getElementById("planning-steps")?.addEventListener("click", e => { if (e.target.matches('button[data-type]')) onPlanningStepClick(e.target.dataset.type); });
    document.getElementById('attractionsContainer')?.addEventListener("click", e => { const card = e.target.closest(".attraction-card"); if (card) showAttractionDetail(card.dataset.id); });
    document.getElementById('qa-category-filter')?.addEventListener('click', e => { if (e.target.matches('button')) { document.querySelectorAll('#qa-category-filter button').forEach(b => b.classList.remove('active')); e.target.classList.add('active'); renderQAItems(e.target.dataset.category); } });
    document.getElementById("worship-steps-container")?.addEventListener("click", e => { if (e.target.matches('button[data-step-id]')) showStepDetails(e.target.getAttribute("data-step-id")); });
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
        link.classList.toggle("active", linkPath === currentPath);
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
        modalBody.innerHTML = '<div class="alert alert-info">暫無資料</div>';
    } else {
        modalBody.innerHTML = data.map(item => {
            let details = "", itemName = item.name_zh || item.name_jp || item.name || "詳細資訊", itemDesc = item.description || item.tips || "";
            if (item.transport_type) itemName = `${item.from_location} → ${item.to_location}`;
            details += item.transport_type ? `<p><strong>交通工具：</strong>${item.transport_type}</p><p><strong>時間：</strong>${item.duration}分鐘 | <strong>費用：</strong>¥${item.cost}</p>` : '';
            details += item.price_per_night ? `<p><strong>地址：</strong>${item.address || "N/A"}</p><p><strong>房價：</strong>¥${item.price_per_night}/晚</p>` : '';
            details += item.opening_hours ? `<p><strong>地址：</strong>${item.address || "N/A"}</p><p><strong>營業時間：</strong>${item.opening_hours}</p><p><strong>價位：</strong>${item.price_range || "N/A"}</p>`: '';
            if (item.rating) details += `<p><strong>評分：</strong>${item.rating}/5</p>`;
            let remarkHtml = item.備註 ? `<div class="remark-section mt-3"><small><strong>備註：</strong> ${item.備註}</small></div>` : '';
            return `<div class="card mb-3"><div class="card-body"><h5>${itemName}</h5><hr>${details}<p class="mt-2 text-muted">${itemDesc}</p>${remarkHtml}</div></div>`;
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
    // 偵錯日誌：顯示完整的搜尋資料庫
    console.log("DEBUG: Final Search Corpus:", JSON.parse(JSON.stringify(searchCorpus)));
}

/**
 * --- START: 關鍵修正 ---
 * 採用更智能的計分系統，並移除結果數量限制
 */
function localFullTextSearch(query) {
    if (!query) return [];
    const lowerCaseQuery = query.toLowerCase();

    console.group(`--- DEBUG: Search Process for query: "${lowerCaseQuery}" ---`);

    const results = searchCorpus.map((doc, index) => {
        let score = 0;
        const title = (doc.title || '').toLowerCase();
        const content = (doc.content || '').toLowerCase();
        
        if (title === lowerCaseQuery) {
            score += 100;
        } else if (title.includes(lowerCaseQuery)) {
            score += 50;
        }
        
        if (content.includes(lowerCaseQuery)) {
            score += 20;
        }
        
        const keywords = lowerCaseQuery.split(/\s+/).filter(Boolean);
        if (keywords.length > 1) {
            keywords.forEach(keyword => {
                if (content.includes(keyword)) {
                    score += 1;
                    if (title.includes(keyword)) {
                        score += 5;
                    }
                }
            });
        }
        
        if (score > 0) {
            console.log(`[Item #${index}] MATCH FOUND: "${doc.title}" (Score: ${score}). Content: "${content.substring(0, 100)}..."`);
        }

        return { ...doc, score };
    }).filter(doc => doc.score > 0);

    console.log(`Found ${results.length} total matches.`);
    // 移除 slice(0, 3) 的限制
    const finalResults = results.sort((a, b) => b.score - a.score);
    console.log("Final sorted results to be displayed:", finalResults);
    console.groupEnd();

    return finalResults;
}
/**
 * --- END: 關鍵修正 ---
 */


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
    if (sender === 'bot') {
        processedContent = linkify(processedContent);
    }
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
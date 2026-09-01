/**
 * 應變事件情資 (Disaster Intelligence GIS) 專屬互動腳本
 * 支援 Leaflet 多圖層切換、颱風動態路徑、雨量/海水/土石流警戒、圖層清單開關、AI 智慧助理
 */

let intelMapInstance = null;
let currentBaseLayer = null;
let googleSatLayer = null;
let googleRoadLayer = null;

// 圖層群組物件
const intelLayers = {
  typhoon: null,
  rain: null,
  sea: null,
  forecast: null,
  debris: null,
  facilities: null
};

// 情資模式定義
const INTEL_MODES = {
  typhoon: {
    title: '颱風路徑動態圖',
    tag: '強烈颱風 (第 03 號 凱米)',
    icon: 'fa-hurricane',
    center: [23.8, 122.5],
    zoom: 7,
    legendTitle: '颱風暴風半徑圖例',
    legendItems: [
      { color: '#ef4444', label: '10 級風暴風半徑 (80km)' },
      { color: '#f59e0b', label: '7 級風暴風半徑 (250km)' },
      { color: '#38bdf8', label: '未來 24hr 預測路徑' },
      { color: '#94a3b8', label: '過去 12hr 歷史路徑' }
    ]
  },
  rain: {
    title: '全台即時雨量資訊',
    tag: '24hr 累積雨量監測',
    icon: 'fa-cloud-showers-heavy',
    center: [23.75, 120.95],
    zoom: 8,
    legendTitle: '降雨量分級圖例',
    legendItems: [
      { color: '#7c3aed', label: '超大豪雨 (>= 500mm)' },
      { color: '#dc2626', label: '大豪雨 (350 - 500mm)' },
      { color: '#f97316', label: '豪雨 (200 - 350mm)' },
      { color: '#eab308', label: '大雨 (80 - 200mm)' },
      { color: '#10b981', label: '一般降雨 (< 80mm)' }
    ]
  },
  sea: {
    title: '海水與沿海潮位警戒',
    tag: '暴潮與海水倒灌預警',
    icon: 'fa-house-flood-water',
    center: [23.6, 120.2],
    zoom: 8,
    legendTitle: '潮位警戒圖例',
    legendItems: [
      { color: '#ef4444', label: '一級暴潮警戒 (倒灌風險)' },
      { color: '#f59e0b', label: '二級暴潮警戒 (高潮位)' },
      { color: '#10b981', label: '正常潮位 (< 警戒值)' }
    ]
  },
  forecast: {
    title: '定量降水預報 (QPF)',
    tag: '未來 12hr 預測降雨',
    icon: 'fa-cloud-bolt',
    center: [23.75, 120.95],
    zoom: 8,
    legendTitle: '預測降雨強度圖例',
    legendItems: [
      { color: '#db2777', label: '極強降雨 (> 100mm/3hr)' },
      { color: '#ea580c', label: '強降雨 (50 - 100mm/3hr)' },
      { color: '#0284c7', label: '中度降雨 (15 - 50mm/3hr)' },
      { color: '#10b981', label: '局部陣雨 (< 15mm/3hr)' }
    ]
  },
  debris: {
    title: '土石流與大規模崩塌警戒',
    tag: '農業部農村水保署即時發布',
    icon: 'fa-hill-rockslide',
    center: [24.2, 121.2],
    zoom: 8,
    legendTitle: '土石流警戒圖例',
    legendItems: [
      { color: '#ef4444', label: '土石流紅色警戒 (強制撤離)' },
      { color: '#eab308', label: '土石流黃色警戒 (預防撤離)' },
      { color: '#38bdf8', label: '土石流潛勢溪流' }
    ]
  }
};

let currentMode = 'typhoon';

/**
 * 1. 初始化 Leaflet GIS 空間圖台
 */
function initIntelMap() {
  const mapEl = document.getElementById('gisIntelMap');
  if (!mapEl || typeof L === 'undefined') return;

  intelMapInstance = L.map('gisIntelMap', {
    center: [23.75, 120.95],
    zoom: 8,
    zoomControl: false,
    attributionControl: false
  });

  // Google 衛星混合底圖
  googleSatLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 19,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  }).addTo(intelMapInstance);

  // Google 標準道路底圖
  googleRoadLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 19,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  });

  currentBaseLayer = 'satellite';

  // 建立各圖層群組
  intelLayers.typhoon = L.layerGroup().addTo(intelMapInstance);
  intelLayers.rain = L.layerGroup().addTo(intelMapInstance);
  intelLayers.sea = L.layerGroup().addTo(intelMapInstance);
  intelLayers.forecast = L.layerGroup().addTo(intelMapInstance);
  intelLayers.debris = L.layerGroup().addTo(intelMapInstance);
  intelLayers.facilities = L.layerGroup().addTo(intelMapInstance);

  // 繪製各圖層圖資
  drawTyphoonLayer();
  drawRainLayer();
  drawSeaLayer();
  drawForecastLayer();
  drawDebrisLayer();
  drawFacilitiesLayer();

  // 依 URL Hash 或預設載入模式
  const hash = window.location.hash.replace('#', '') || 'typhoon';
  const urlParams = new URLSearchParams(window.location.search);
  const layerParam = urlParams.get('layer') || hash;
  
  if (INTEL_MODES[layerParam]) {
    switchIntelMode(layerParam);
  } else {
    switchIntelMode('typhoon');
  }

  setTimeout(() => {
    if (intelMapInstance) intelMapInstance.invalidateSize();
  }, 250);
}

/**
 * 2. 繪製颱風路徑與暴風半徑圖層
 */
function drawTyphoonLayer() {
  const g = intelLayers.typhoon;
  g.clearLayers();

  // 歷史與預測路徑座標點
  const pathPoints = [
    { lat: 21.2, lng: 125.8, time: '07/23 08:00', type: 'past', p: 965, v: 38 },
    { lat: 22.0, lng: 124.5, time: '07/23 14:00', type: 'past', p: 955, v: 43 },
    { lat: 22.8, lng: 123.4, time: '07/23 20:00', type: 'past', p: 940, v: 48 },
    { lat: 23.6, lng: 122.3, time: '07/24 02:00 (現正位置)', type: 'current', p: 930, v: 53 },
    { lat: 24.4, lng: 121.3, time: '07/24 08:00 (預測登陸)', type: 'forecast', p: 935, v: 51 },
    { lat: 25.1, lng: 120.2, time: '07/24 14:00 (預測出海)', type: 'forecast', p: 950, v: 45 },
    { lat: 26.0, lng: 119.0, time: '07/24 20:00 (預測西進)', type: 'forecast', p: 965, v: 38 }
  ];

  // 繪製歷史軌跡 (實線)
  const pastCoords = pathPoints.slice(0, 4).map(p => [p.lat, p.lng]);
  L.polyline(pastCoords, { color: '#94a3b8', weight: 3, opacity: 0.85 }).addTo(g);

  // 繪製預測軌跡 (虛線)
  const forecastCoords = pathPoints.slice(3).map(p => [p.lat, p.lng]);
  L.polyline(forecastCoords, { color: '#38bdf8', weight: 3.5, dashArray: '6, 6', opacity: 0.95 }).addTo(g);

  // 繪製颱風中心暴風半徑 (7級風 250km, 10級風 80km)
  const currentPos = pathPoints[3];
  
  // 7 級風暴風圈 (黃橙色透明圓形)
  L.circle([currentPos.lat, currentPos.lng], {
    radius: 250000,
    color: '#f59e0b',
    fillColor: '#f59e0b',
    fillOpacity: 0.22,
    weight: 2,
    dashArray: '4, 4'
  }).addTo(g);

  // 10 級風暴風圈 (紅色透明圓形)
  L.circle([currentPos.lat, currentPos.lng], {
    radius: 80000,
    color: '#ef4444',
    fillColor: '#ef4444',
    fillOpacity: 0.45,
    weight: 2.5
  }).addTo(g);

  // 繪製路徑點 Marker
  pathPoints.forEach(p => {
    const isCurrent = p.type === 'current';
    const isPast = p.type === 'past';

    const iconHtml = isCurrent 
      ? `<div style="background:#ef4444; width:22px; height:22px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 0 14px #ef4444; display:flex; align-items:center; justify-content:center; color:#ffffff; font-size:11px;"><i class="fa-solid fa-hurricane fa-spin"></i></div>`
      : `<div style="background:${isPast ? '#64748b' : '#0284c7'}; width:14px; height:14px; border-radius:50%; border:2px solid #ffffff; box-shadow:0 0 6px rgba(0,0,0,0.5);"></div>`;

    const markerIcon = L.divIcon({
      className: 'typhoon-point-marker',
      html: iconHtml,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    const m = L.marker([p.lat, p.lng], { icon: markerIcon }).addTo(g);
    m.bindPopup(`
      <div style="font-family:'Noto Sans TC',sans-serif; padding:4px; font-size:12.5px; line-height:1.5;">
        <strong style="color:#0284c7;">🌀 凱米颱風動態情資</strong><br>
        <strong>時間：</strong>${p.time}<br>
        <strong>中心氣壓：</strong>${p.p} hPa<br>
        <strong>近中心最大風速：</strong>${p.v} m/s (16 級風)<br>
        <strong>7級風暴風半徑：</strong>250 公里
      </div>
    `);
  });
}

/**
 * 3. 繪製全台雨量測站圖層
 */
function drawRainLayer() {
  const g = intelLayers.rain;
  g.clearLayers();

  const stations = [
    { name: '新北三峽大板根', lat: 24.87, lng: 121.41, rain: 420, level: 'extreme' },
    { name: '宜蘭太平山', lat: 24.58, lng: 121.52, rain: 560, level: 'super' },
    { name: '新竹尖石鳥嘴山', lat: 24.65, lng: 121.25, rain: 380, level: 'extreme' },
    { name: '苗栗泰安洗水坑', lat: 24.45, lng: 120.95, rain: 260, level: 'heavy' },
    { name: '台中和平桃山', lat: 24.36, lng: 121.28, rain: 310, level: 'heavy' },
    { name: '南投仁愛合歡山', lat: 24.14, lng: 121.28, rain: 290, level: 'heavy' },
    { name: '嘉義阿里山', lat: 23.51, lng: 120.80, rain: 480, level: 'extreme' },
    { name: '高雄桃源藤枝', lat: 23.08, lng: 120.75, rain: 390, level: 'extreme' },
    { name: '屏東三地門德文', lat: 22.75, lng: 120.65, rain: 210, level: 'heavy' },
    { name: '花蓮秀林合歡金馬', lat: 24.18, lng: 121.38, rain: 340, level: 'heavy' }
  ];

  stations.forEach(st => {
    let color = '#10b981';
    if (st.level === 'super') color = '#7c3aed';
    else if (st.level === 'extreme') color = '#dc2626';
    else if (st.level === 'heavy') color = '#f97316';

    const iconHtml = `
      <div style="background:${color}; color:#ffffff; font-weight:800; font-size:11px; padding:2px 6px; border-radius:12px; border:1.5px solid #ffffff; box-shadow:0 2px 8px rgba(0,0,0,0.5); display:inline-flex; align-items:center; gap:3px; white-space:nowrap;">
        <i class="fa-solid fa-droplet" style="font-size:9px;"></i> ${st.rain}mm
      </div>
    `;

    const marker = L.marker([st.lat, st.lng], {
      icon: L.divIcon({ className: 'rain-station-badge', html: iconHtml, iconSize: [60, 20], iconAnchor: [30, 10] })
    }).addTo(g);

    marker.bindPopup(`
      <div style="font-family:'Noto Sans TC',sans-serif; font-size:12.5px;">
        <strong style="color:#0284c7;">🌧 雨量測站：${st.name}</strong><br>
        <strong>24hr 累積降雨：</strong><span style="color:${color}; font-weight:800;">${st.rain} mm</span><br>
        <strong>降雨等級：</strong>${st.level === 'super' ? '超大豪雨' : st.level === 'extreme' ? '大豪雨' : '豪雨'}
      </div>
    `);
  });
}

/**
 * 4. 繪製海水潮位警戒圖層
 */
function drawSeaLayer() {
  const g = intelLayers.sea;
  g.clearLayers();

  const ports = [
    { name: '基隆港潮位站', lat: 25.15, lng: 121.75, tide: '+1.82M', status: 'normal' },
    { name: '淡水潮位站', lat: 25.17, lng: 121.43, tide: '+2.45M (二級警戒)', status: 'warning' },
    { name: '台中港潮位站', lat: 24.28, lng: 120.52, tide: '+3.98M (一級警戒)', status: 'danger' },
    { name: '布袋港潮位站', lat: 23.38, lng: 120.15, tide: '+2.10M', status: 'normal' },
    { name: '安平港潮位站', lat: 22.99, lng: 120.16, tide: '+2.65M (二級警戒)', status: 'warning' },
    { name: '高雄港潮位站', lat: 22.61, lng: 120.27, tide: '+1.75M', status: 'normal' }
  ];

  ports.forEach(p => {
    const isDanger = p.status === 'danger';
    const isWarning = p.status === 'warning';
    const color = isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

    const iconHtml = `
      <div style="background:${color}; color:#ffffff; width:28px; height:28px; border-radius:50%; border:2px solid #ffffff; box-shadow:0 0 10px ${color}; display:flex; align-items:center; justify-content:center; font-size:13px;">
        <i class="fa-solid fa-water"></i>
      </div>
    `;

    const marker = L.marker([p.lat, p.lng], {
      icon: L.divIcon({ className: 'sea-tide-marker', html: iconHtml, iconSize: [28, 28], iconAnchor: [14, 14] })
    }).addTo(g);

    marker.bindPopup(`
      <div style="font-family:'Noto Sans TC',sans-serif; font-size:12.5px;">
        <strong style="color:#0284c7;">🌊 ${p.name}</strong><br>
        <strong>即時天文潮位：</strong>${p.tide}<br>
        <strong>警戒狀態：</strong><span style="color:${color}; font-weight:800;">${isDanger ? '一級暴潮 (慎防海水倒灌)' : isWarning ? '二級警戒 (沿海低窪警戒)' : '正常潮位'}</span>
      </div>
    `);
  });
}

/**
 * 5. 繪製定量降水預報 (QPF) 圖層
 */
function drawForecastLayer() {
  const g = intelLayers.forecast;
  g.clearLayers();

  // 模擬降水預報色塊 (多邊形)
  L.polygon([
    [24.8, 121.3], [24.9, 121.7], [24.4, 121.8], [24.3, 121.2]
  ], { color: '#db2777', fillColor: '#db2777', fillOpacity: 0.45, weight: 1.5 }).addTo(g)
    .bindPopup('<strong>QPF 降雨預報：北部/宜蘭山區</strong><br>未來 3hr 預估時雨量 > 100mm (極強降水)');

  L.polygon([
    [23.8, 120.6], [23.9, 121.1], [23.1, 120.9], [23.0, 120.5]
  ], { color: '#ea580c', fillColor: '#ea580c', fillOpacity: 0.4, weight: 1.5 }).addTo(g)
    .bindPopup('<strong>QPF 降雨預報：中南部山區</strong><br>未來 3hr 預估降雨 50 - 100mm (強降水)');
}

/**
 * 6. 繪製土石流警戒溪流圖層
 */
function drawDebrisLayer() {
  const g = intelLayers.debris;
  g.clearLayers();

  const debrisStreams = [
    { name: '新竹縣五峰鄉 茅圃溪', lat: 24.62, lng: 121.10, status: 'red', count: '紅色警戒 (2 條)' },
    { name: '苗栗縣南庄鄉 東河溪', lat: 24.58, lng: 121.02, status: 'red', count: '紅色警戒 (3 條)' },
    { name: '台中市和平區 大甲溪支流', lat: 24.22, lng: 121.05, status: 'yellow', count: '黃色警戒 (5 條)' },
    { name: '南投縣信義鄉 陳有蘭溪', lat: 23.68, lng: 120.88, status: 'yellow', count: '黃色警戒 (4 條)' }
  ];

  debrisStreams.forEach(d => {
    const isRed = d.status === 'red';
    const color = isRed ? '#ef4444' : '#eab308';

    const iconHtml = `
      <div style="background:${color}; color:#ffffff; padding:2px 8px; border-radius:10px; font-weight:800; font-size:11px; border:1.5px solid #ffffff; box-shadow:0 0 8px ${color}; white-space:nowrap;">
        ⚠️ ${d.name} (${isRed ? '紅警戒' : '黃警戒'})
      </div>
    `;

    const marker = L.marker([d.lat, d.lng], {
      icon: L.divIcon({ className: 'debris-marker', html: iconHtml, iconSize: [120, 20], iconAnchor: [60, 10] })
    }).addTo(g);

    marker.bindPopup(`
      <div style="font-family:'Noto Sans TC',sans-serif; font-size:12.5px;">
        <strong style="color:#ef4444;">⛰️ 土石流警戒溪流：${d.name}</strong><br>
        <strong>警戒層級：</strong><span style="color:${color}; font-weight:800;">${d.count}</span><br>
        <strong>應變作為：</strong>${isRed ? '地方政府應勸告或強制撤離保全戶' : '地方政府應進行疏散避難勸告'}
      </div>
    `);
  });
}

/**
 * 7. 繪製自來水重要設施圖層 (淨水場 / 取水口)
 */
function drawFacilitiesLayer() {
  const g = intelLayers.facilities;
  g.clearLayers();

  const facilities = [
    { name: '北埔淨水場', lat: 24.700, lng: 121.058, type: '淨水場', status: 'normal' },
    { name: '隆恩堰取水口', lat: 24.720, lng: 121.035, type: '取水設施', status: 'turbid_warning' },
    { name: '板新給水廠', lat: 24.950, lng: 121.390, type: '大型淨水場', status: 'normal' },
    { name: '大湳淨水場', lat: 24.960, lng: 121.290, type: '淨水場', status: 'normal' }
  ];

  facilities.forEach(f => {
    const isWarning = f.status === 'turbid_warning';
    const iconHtml = `
      <div style="background:${isWarning ? '#f59e0b' : '#0284c7'}; color:#ffffff; width:26px; height:26px; border-radius:6px; border:2px solid #ffffff; box-shadow:0 2px 6px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; font-size:12px;">
        <i class="fa-solid fa-faucet-drip"></i>
      </div>
    `;

    const marker = L.marker([f.lat, f.lng], {
      icon: L.divIcon({ className: 'facility-marker', html: iconHtml, iconSize: [26, 26], iconAnchor: [13, 13] })
    }).addTo(g);

    marker.bindPopup(`
      <div style="font-family:'Noto Sans TC',sans-serif; font-size:12.5px;">
        <strong style="color:#0284c7;">🏢 ${f.name} (${f.type})</strong><br>
        <strong>原水濁度：</strong>${isWarning ? '<span style="color:#f59e0b; font-weight:800;">450 NTU (濁度飆升預警)</span>' : '15 NTU (正常)'}<br>
        <strong>出水量：</strong>正常運轉中
      </div>
    `);
  });
}

/**
 * 8. 切換情資模式與圖台視野
 */
function switchIntelMode(modeKey) {
  const config = INTEL_MODES[modeKey];
  if (!config) return;

  currentMode = modeKey;

  // 1. 更新左上角狀態徽章
  const statusIcon = document.getElementById('intelStatusIcon');
  const statusTitle = document.getElementById('intelStatusTitle');
  const statusTag = document.getElementById('intelStatusTag');
  
  if (statusIcon) statusIcon.className = `fa-solid ${config.icon} status-icon`;
  if (statusTitle) statusTitle.textContent = config.title;
  if (statusTag) statusTag.textContent = config.tag;

  // 2. 更新右上角圖例
  const legendTitle = document.getElementById('intelLegendTitle');
  const legendContent = document.getElementById('intelLegendContent');

  if (legendTitle) {
    legendTitle.innerHTML = `<i class="fa-solid fa-layer-group"></i> ${config.legendTitle}`;
  }

  if (legendContent) {
    legendContent.innerHTML = config.legendItems.map(item => `
      <div class="intel-legend-row">
        <span class="intel-legend-dot" style="background-color: ${item.color}; box-shadow: 0 0 6px ${item.color};"></span>
        <span>${item.label}</span>
      </div>
    `).join('');
  }

  // 3. 切換地圖中心與 Zoom
  if (intelMapInstance) {
    intelMapInstance.flyTo(config.center, config.zoom, { duration: 1.2 });
  }

  // 4. 同步更新側邊欄選單 active 狀態
  document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
    item.classList.toggle('active', item.dataset.mode === modeKey);
  });

  // 5. 更新 AI 小助手情資摘要
  updateAiAssistantContent(modeKey);
}

/**
 * 9. 更新 AI 助理情資摘要內容
 */
function updateAiAssistantContent(modeKey) {
  const aiBody = document.getElementById('aiAssistantBody');
  if (!aiBody) return;

  const contentMap = {
    typhoon: `
      <div class="ai-msg-box">
        <p><strong>【凱米颱風應變情報摘要】</strong></p>
        <p>中心目前位於花蓮東南方約 180 公里海面，暴風圈已接觸東半部陸地，預計今日深夜至明晨自宜花一帶登陸。</p>
        <div class="ai-highlight-card">
          <div class="ai-highlight-title">⚠️ 台水受衝擊重點預警：</div>
          <div>・ 第三區處（新竹/苗栗）隆恩堰原水濁度預警。<br>・ 第九區處（花蓮）山區自流取水口預防性減壓。</div>
        </div>
        <div class="ai-actions-row">
          <button class="btn-ai-action" onclick="intelMapInstance.flyTo([24.7, 121.0], 10);">定位三區取水點</button>
          <button class="btn-ai-action" onclick="switchIntelMode('rain');">查看山區雨量</button>
        </div>
      </div>
    `,
    rain: `
      <div class="ai-msg-box">
        <p><strong>【全台雨量監測情資】</strong></p>
        <p>宜蘭太平山（560mm）與嘉義阿里山（480mm）已達超大豪雨等級。北部與中南部山區累積降雨快速攀升。</p>
        <div class="ai-highlight-card">
          <div class="ai-highlight-title">⚠️ 水質與供水建議：</div>
          <div>各淨水場沉澱池已加藥調度，石門與翡翠水庫持續調節性放水。</div>
        </div>
      </div>
    `,
    sea: `
      <div class="ai-msg-box">
        <p><strong>【沿海潮位與海水倒灌預警】</strong></p>
        <p>台中港與安平港潮位達二級暴潮警戒，適逢年度大潮，西部沿海低窪地區需慎防海水倒灌。</p>
      </div>
    `,
    forecast: `
      <div class="ai-msg-box">
        <p><strong>【QPF 未來降雨預測】</strong></p>
        <p>未來 6 小時強降雨核心將轉移至桃竹苗與中部山區，時雨量恐達 80-100mm。</p>
      </div>
    `,
    debris: `
      <div class="ai-msg-box">
        <p><strong>【土石流與崩塌警戒】</strong></p>
        <p>農村水保署已針對新竹五峰、苗栗南庄發布紅色警戒 5 條溪流，保全戶已啟動疏散避難作業。</p>
      </div>
    `
  };

  aiBody.innerHTML = contentMap[modeKey] || contentMap.typhoon;
}

/**
 * 10. 初始化側邊欄抽屜開合與情資功能切換
 */
function initSidebarDrawer() {
  const sidebarDrawer = document.getElementById('sidebarDrawer');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const openSidebarBtn = document.getElementById('openSidebarBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');

  function openSidebar() {
    if (sidebarDrawer) sidebarDrawer.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('show');
  }

  function closeSidebar() {
    if (sidebarDrawer) sidebarDrawer.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('show');
  }

  if (openSidebarBtn) openSidebarBtn.addEventListener('click', openSidebar);
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  // 點擊側邊欄情資功能連結 -> 關閉側邊欄並切換對應空間圖台視圖！
  document.querySelectorAll('.sidebar-menu .menu-item[data-mode]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modeKey = btn.dataset.mode;
      closeSidebar();
      if (modeKey) {
        switchIntelMode(modeKey);
      }
    });
  });

  // 外部情資下拉選單點擊展開/收合
  const externalToggle = document.getElementById('sidebarExternalToggle');
  const externalSubmenu = document.getElementById('sidebarExternalSubmenu');
  if (externalToggle && externalSubmenu) {
    externalToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isExpanded = externalSubmenu.classList.toggle('show');
      externalToggle.classList.toggle('active', isExpanded);
    });
  }
}

/**
 * 11. 初始化右下方浮動按鈕 (FAB) 與浮動面板互動
 */
function initFabInteractions() {
  const fabLayerBtn = document.getElementById('fabLayerBtn');
  const fabAiBtn = document.getElementById('fabAiBtn');
  const layerControlPanel = document.getElementById('layerControlPanel');
  const aiAssistantPanel = document.getElementById('aiAssistantPanel');
  const closeLayerPanelBtn = document.getElementById('closeLayerPanelBtn');
  const closeAiPanelBtn = document.getElementById('closeAiPanelBtn');

  // 圖層按鈕點擊 -> 開闔圖層面板
  if (fabLayerBtn && layerControlPanel) {
    fabLayerBtn.addEventListener('click', () => {
      const isHide = layerControlPanel.classList.toggle('hide');
      fabLayerBtn.classList.toggle('active', !isHide);
      if (!isHide && aiAssistantPanel) {
        aiAssistantPanel.classList.add('hide');
        if (fabAiBtn) fabAiBtn.classList.remove('active');
      }
    });
  }

  if (closeLayerPanelBtn && layerControlPanel) {
    closeLayerPanelBtn.addEventListener('click', () => {
      layerControlPanel.classList.add('hide');
      if (fabLayerBtn) fabLayerBtn.classList.remove('active');
    });
  }

  // AI 機器人按鈕點擊 -> 開闔 AI 面板
  if (fabAiBtn && aiAssistantPanel) {
    fabAiBtn.addEventListener('click', () => {
      const isHide = aiAssistantPanel.classList.toggle('hide');
      fabAiBtn.classList.toggle('active', !isHide);
      if (!isHide && layerControlPanel) {
        layerControlPanel.classList.add('hide');
        if (fabLayerBtn) fabLayerBtn.classList.remove('active');
      }
    });
  }

  if (closeAiPanelBtn && aiAssistantPanel) {
    closeAiPanelBtn.addEventListener('click', () => {
      aiAssistantPanel.classList.add('hide');
      if (fabAiBtn) fabAiBtn.classList.remove('active');
    });
  }

  // Checkbox 圖層即時勾選連動
  document.querySelectorAll('.layer-checkbox[data-layer]').forEach(cb => {
    cb.addEventListener('change', () => {
      const layerName = cb.dataset.layer;
      const targetGroup = intelLayers[layerName];
      if (targetGroup && intelMapInstance) {
        if (cb.checked) {
          intelMapInstance.addLayer(targetGroup);
        } else {
          intelMapInstance.removeLayer(targetGroup);
        }
      }
    });
  });

  // 底圖切換 (衛星 / 道路)
  const baseMapSelect = document.getElementById('baseMapSelect');
  if (baseMapSelect) {
    baseMapSelect.addEventListener('change', (e) => {
      const mode = e.target.value;
      if (mode === 'roadmap') {
        if (intelMapInstance.hasLayer(googleSatLayer)) intelMapInstance.removeLayer(googleSatLayer);
        googleRoadLayer.addTo(intelMapInstance);
      } else {
        if (intelMapInstance.hasLayer(googleRoadLayer)) intelMapInstance.removeLayer(googleRoadLayer);
        googleSatLayer.addTo(intelMapInstance);
      }
    });
  }

  // 右上角圖例折疊展開
  const toggleIntelLegendBtn = document.getElementById('toggleIntelLegendBtn');
  const intelLegendCard = document.getElementById('intelLegendCard');
  if (toggleIntelLegendBtn && intelLegendCard) {
    if (window.innerWidth <= 992) {
      intelLegendCard.classList.add('collapsed');
    }
    toggleIntelLegendBtn.addEventListener('click', () => {
      intelLegendCard.classList.toggle('collapsed');
    });
  }
}

/**
 * 12. 初始化左上方情資狀態徽章之手動拖曳移動 (Draggable Floating Status Badge)
 * 支援滑鼠與觸控手勢、邊界防溢出限制、並防止地圖連帶平移
 */
function initDraggableStatusBadge() {
  const badge = document.getElementById('intelStatusBadge');
  const container = document.querySelector('.intel-workspace');
  if (!badge || !container) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  // 阻止 Leaflet 地圖在徽章上捕獲滑鼠/觸控事件（避免拖曳徽章時地圖一起滑動）
  if (typeof L !== 'undefined' && L.DomEvent) {
    L.DomEvent.disableClickPropagation(badge);
    L.DomEvent.disableScrollPropagation(badge);
  }

  function onDragStart(clientX, clientY) {
    isDragging = true;
    badge.classList.add('is-dragging');

    const badgeRect = badge.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // 取得相對於 container 的目前 left 與 top
    initialLeft = badgeRect.left - containerRect.left;
    initialTop = badgeRect.top - containerRect.top;

    startX = clientX;
    startY = clientY;
  }

  function onDragMove(clientX, clientY) {
    if (!isDragging) return;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    const containerRect = container.getBoundingClientRect();
    const badgeRect = badge.getBoundingClientRect();

    let newLeft = initialLeft + deltaX;
    let newTop = initialTop + deltaY;

    // 邊界防溢出計算 (保持在容器內部 8px 安全間距)
    const minLeft = 8;
    const maxLeft = Math.max(minLeft, containerRect.width - badgeRect.width - 8);
    const minTop = 8;
    const maxTop = Math.max(minTop, containerRect.height - badgeRect.height - 8);

    if (newLeft < minLeft) newLeft = minLeft;
    if (newLeft > maxLeft) newLeft = maxLeft;
    if (newTop < minTop) newTop = minTop;
    if (newTop > maxTop) newTop = maxTop;

    badge.style.left = `${newLeft}px`;
    badge.style.top = `${newTop}px`;
    badge.style.right = 'auto';
    badge.style.bottom = 'auto';
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    badge.classList.remove('is-dragging');
  }

  // 滑鼠事件監聽
  badge.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStart(e.clientX, e.clientY);

    const onMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      onDragMove(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      onDragEnd();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  // 觸控手勢監聽 (行動端/平板)
  badge.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      e.stopPropagation();
      const touch = e.touches[0];
      onDragStart(touch.clientX, touch.clientY);
    }
  }, { passive: false });

  badge.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      onDragMove(touch.clientX, touch.clientY);
    }
  }, { passive: false });

  badge.addEventListener('touchend', () => {
    onDragEnd();
  });

  badge.addEventListener('touchcancel', () => {
    onDragEnd();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initIntelMap();
  initSidebarDrawer();
  initFabInteractions();
  initDraggableStatusBadge();
});

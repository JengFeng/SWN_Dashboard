/**
 * ==========================================================================
 * 全台供水狀態總覽 (GIS 圖台) - 專屬邏輯與雙向聯動 (js/supply-overview.js)
 * 供工程師後續接手串接 API 參考
 * ==========================================================================
 */

// 1. 各區處詳細假資料 (Mock Data)
const DISTRICT_DATA = {
  1: { name: '第一區管理處 (基隆/新北東)', status: '正常', supply: 396000, lastYear: 382000, stateType: 'normal' },
  2: { name: '第二區管理處 (桃園)', status: '正常', supply: 1393000, lastYear: 1285000, stateType: 'normal' },
  3: { name: '第三區管理處 (新竹/苗栗/台中北)', status: '異常', supply: 939000, lastYear: 988000, stateType: 'danger', reason: '主力幹管壓力驟降，檢修調配中' },
  4: { name: '第四區管理處 (台中/南投)', status: '正常', supply: 1402000, lastYear: 1388000, stateType: 'normal' },
  5: { name: '第五區管理處 (雲林/嘉義)', status: '正常', supply: 594000, lastYear: 582000, stateType: 'normal' },
  6: { name: '第六區管理處 (台南)', status: '正常', supply: 933000, lastYear: 920000, stateType: 'normal' },
  7: { name: '第七區管理處 (高雄)', status: '正常', supply: 1713000, lastYear: 1675000, stateType: 'normal' },
  8: { name: '第八區管理處 (宜蘭)', status: '正常', supply: 181000, lastYear: 176000, stateType: 'normal' },
  9: { name: '第九區管理處 (花蓮)', status: '正常', supply: 129000, lastYear: 118000, stateType: 'normal' },
  10: { name: '第十區管理處 (台東)', status: '正常', supply: 75000, lastYear: 72000, stateType: 'normal' },
  11: { name: '第十一區管理處 (彰化)', status: '正常', supply: 596000, lastYear: 583000, stateType: 'normal' },
  12: { name: '第十二區管理處 (新北新莊/板橋)', status: '正常', supply: 879000, lastYear: 836000, stateType: 'normal' },
  13: { name: '屏東區管理處 (屏東)', status: '正常', supply: 216000, lastYear: 198000, stateType: 'normal' }
};

// 2. 跨區水源調度模擬資料庫 (包含日結量與瞬間量)
const DISPATCH_DATABASE = {
  daily: {
    totalSupport: 993083,
    totalReceived: 993083,
    supportCount: 8,
    receivedCount: 9,
    biCount: 5,
    noSupportCount: 5,
    maxSupport: { city: '臺北市', val: 386757 },
    maxReceived: { city: '新北市', val: 368612 },
    beishui: 386757,
    nanhua: 38,
    cities: {
      keelung: { support: null, received: 18145 },
      taipei: { support: 386757, received: null },
      newtaipei: { support: 281035, received: 368612 },
      taoyuan: { support: 87577, received: 281035 },
      hsinchu: { support: null, received: 159150 },
      miaoli: { support: 71573, received: 75628 },
      taichung: { support: 87495, received: null },
      changhua: { support: null, received: 74077 },
      nantou: { support: null, received: null },
      yunlin: { support: 69320, received: null },
      chiayi: { support: null, received: 7110 },
      tainan: { support: 7524, received: 1802 },
      kaohsiung: { support: 1802, received: 7524 },
      pingtung: { support: null, received: null },
      yilan: { support: null, received: null },
      hualien: { support: null, received: null },
      taitung: { support: null, received: null }
    }
  },
  instant: {
    totalSupport: 41378,
    totalReceived: 41378,
    supportCount: 8,
    receivedCount: 9,
    biCount: 5,
    noSupportCount: 5,
    maxSupport: { city: '臺北市', val: 16115 },
    maxReceived: { city: '新北市', val: 15358 },
    beishui: 16115,
    nanhua: 2,
    cities: {
      keelung: { support: null, received: 756 },
      taipei: { support: 16115, received: null },
      newtaipei: { support: 11709, received: 15358 },
      taoyuan: { support: 3649, received: 11709 },
      hsinchu: { support: null, received: 6631 },
      miaoli: { support: 2982, received: 3151 },
      taichung: { support: 3645, received: null },
      changhua: { support: null, received: 3086 },
      nantou: { support: null, received: null },
      yunlin: { support: 2888, received: null },
      chiayi: { support: null, received: 296 },
      tainan: { support: 313, received: 75 },
      kaohsiung: { support: 75, received: 313 },
      pingtung: { support: null, received: null },
      yilan: { support: null, received: null },
      hualien: { support: null, received: null },
      taitung: { support: null, received: null }
    }
  }
};

let currentDispatchMode = 'daily';
let gisMapInstance = null;
let districtLayersMap = {};
let telemetryMarkersGroup = null;

// 3. 台灣 13 區處經緯度多邊形座標與中心點定義
const DISTRICT_POLYGONS = {
  1: { name: '第一區管理處 (基隆/新北東)', coords: [[25.12, 121.55], [25.30, 121.58], [25.15, 121.95], [24.98, 121.80]], center: [25.15, 121.72], status: 'normal' },
  12: { name: '第十二區管理處 (新北新莊/板橋)', coords: [[25.08, 121.36], [25.12, 121.52], [24.93, 121.50], [24.95, 121.34]], center: [25.02, 121.44], status: 'normal' },
  2: { name: '第二區管理處 (桃園)', coords: [[25.12, 121.05], [25.06, 121.34], [24.78, 121.36], [24.85, 121.00]], center: [24.95, 121.20], status: 'normal' },
  3: { name: '第三區管理處 (新竹/苗栗)', coords: [[24.88, 120.90], [24.82, 121.28], [24.32, 121.15], [24.45, 120.65]], center: [24.62, 120.95], status: 'danger' },
  4: { name: '第四區管理處 (台中/南投)', coords: [[24.42, 120.45], [24.35, 121.35], [23.55, 121.20], [23.75, 120.50]], center: [24.08, 120.85], status: 'normal' },
  11: { name: '第十一區管理處 (彰化)', coords: [[24.16, 120.35], [24.15, 120.65], [23.82, 120.62], [23.82, 120.25]], center: [23.98, 120.48], status: 'normal' },
  5: { name: '第五區管理處 (雲林/嘉義)', coords: [[23.82, 120.15], [23.78, 120.72], [23.28, 120.68], [23.35, 120.10]], center: [23.55, 120.40], status: 'normal' },
  6: { name: '第六區管理處 (台南)', coords: [[23.40, 120.02], [23.36, 120.58], [22.88, 120.52], [22.95, 120.05]], center: [23.15, 120.30], status: 'normal' },
  7: { name: '第七區管理處 (高雄/澎湖)', coords: [[23.30, 120.50], [23.25, 120.98], [22.45, 120.72], [22.55, 120.25]], center: [22.85, 120.58], status: 'normal' },
  8: { name: '第八區管理處 (宜蘭)', coords: [[24.96, 121.62], [24.95, 121.98], [24.35, 121.82], [24.45, 121.48]], center: [24.68, 121.72], status: 'normal' },
  9: { name: '第九區管理處 (花蓮)', coords: [[24.38, 121.45], [24.30, 121.78], [23.18, 121.48], [23.25, 121.15]], center: [23.78, 121.45], status: 'normal' },
  10: { name: '第十區管理處 (台東)', coords: [[23.22, 121.10], [23.18, 121.48], [22.25, 120.98], [22.30, 120.68]], center: [22.75, 121.05], status: 'normal' },
  13: { name: '屏東區管理處 (屏東)', coords: [[22.75, 120.42], [22.68, 120.85], [21.88, 120.90], [21.92, 120.65]], center: [22.35, 120.65], status: 'normal' }
};

// 4. 北埔傳訊點分布站點 (供水系統傳訊點)
const BEIPU_TELEMETRY_SPOTS = [
  { name: '北埔淨水場清水池傳訊站', lat: 24.700, lng: 121.058, type: '水位計', val: 'HWL 219.2M (正常)' },
  { name: '隆恩堰取水流量傳訊站', lat: 24.720, lng: 121.035, type: '流量計', val: '2.16 cms/日' },
  { name: '大湖科幹管壓力監測站', lat: 24.685, lng: 121.082, type: '壓力計', val: '3.8 kg/cm² (正常)' },
  { name: '員興出水監控點', lat: 24.670, lng: 121.045, type: '壓力計', val: '4.1 kg/cm² (正常)' }
];

// 5. 供水系統清單模擬資料庫 (各區處細部 20 個供水系統)
const DISTRICT_SYSTEMS_MAP = {
  3: [
    { id: 'shimen', name: '石門供水系統', state: 'normal' },
    { id: 'fuxing', name: '復興供水系統', state: 'normal' },
    { id: 'longtan', name: '龍潭供水系統', state: 'normal' },
    { id: 'danan', name: '大湳給水系統', state: 'normal' },
    { id: 'wushantou', name: '烏山頭供水系統', state: 'normal' },
    { id: 'hsinchu', name: '新竹供水系統', state: 'normal' },
    { id: 'zhudong', name: '竹東供水系統', state: 'normal' },
    { id: 'jianshi', name: '尖石供水系統', state: 'normal' },
    { id: 'meihua', name: '梅花供水系統', state: 'normal' },
    { id: 'beipu', name: '北埔供水系統', state: 'danger' }, // 異常 (淺紅色系)
    { id: 'wufeng', name: '五峰供水系統', state: 'normal' },
    { id: 'neiwan', name: '內灣供水系統', state: 'normal' },
    { id: 'xinpu', name: '新埔供水系統', state: 'normal' },
    { id: 'miaoli', name: '苗栗供水系統', state: 'normal' },
    { id: 'dahu', name: '大湖供水系統', state: 'normal' },
    { id: 'zhunan', name: '竹南頭份供水系統', state: 'danger' }, // 異常 (淺紅色系)
    { id: 'shuangyutan', name: '雙魚潭供水系統', state: 'normal' },
    { id: 'nanzhuang', name: '南庄供水系統', state: 'normal' },
    { id: 'jinglin', name: '鏡林供水系統', state: 'normal' },
    { id: 'guanxi', name: '關西供水系統', state: 'normal' }
  ]
};

let dispatchGisMapInstance = null;
let reservoirGisMapInstance = null;

/**
 * 統一刷新並重算所有 Google Map 圖台之尺寸與視野 (防止出現灰色未載入瓦片區塊)
 */
function refreshAllMaps() {
  if (gisMapInstance) {
    gisMapInstance.invalidateSize();
  }
  if (dispatchGisMapInstance) {
    dispatchGisMapInstance.invalidateSize();
    dispatchGisMapInstance.setView([23.75, 120.95], 8, { animate: false });
  }
  if (reservoirGisMapInstance) {
    reservoirGisMapInstance.invalidateSize();
    reservoirGisMapInstance.setView([23.75, 120.95], 8, { animate: false });
  }
}

function initDispatchGisMap() {
  const mapEl = document.getElementById('dispatchGoogleMap');
  if (!mapEl || dispatchGisMapInstance) return;

  dispatchGisMapInstance = L.map('dispatchGoogleMap', {
    center: [23.75, 120.95],
    zoom: 8,
    zoomControl: false,
    attributionControl: false,
    dragging: true,
    touchZoom: true,
    doubleClickZoom: true,
    scrollWheelZoom: false,
    boxZoom: false,
    keyboard: false
  });

  // 載入 Google Maps 衛星混合地圖
  L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 19,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  }).addTo(dispatchGisMapInstance);
}

function initReservoirGisMap() {
  const mapEl = document.getElementById('reservoirGoogleMap');
  if (!mapEl || reservoirGisMapInstance) return;

  reservoirGisMapInstance = L.map('reservoirGoogleMap', {
    center: [23.75, 120.95],
    zoom: 8,
    zoomControl: false,
    attributionControl: false,
    dragging: true,
    touchZoom: true,
    doubleClickZoom: true,
    scrollWheelZoom: false,
    boxZoom: false,
    keyboard: false
  });

  // 載入 Google Maps 衛星混合地圖
  L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 19,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  }).addTo(reservoirGisMapInstance);
}

document.addEventListener('DOMContentLoaded', () => {
  initGoogleGisMap();
  initDispatchGisMap();
  initReservoirGisMap();
  initPanelTabs();
  initPanelCollapse();
  initSystemDetailLayer();
  initDispatchTopology();
  initReservoirPanelEvents();
  initFabButtons();
  initCollapsibleLegends();
});

/**
 * 6. 左側 Tab 頁籤切換 (連動右側 Google Map vs 跨區拓撲靜態圖 vs 水庫蓄水視圖 vs 水位關係圖)
 */
function initPanelTabs() {
  const tabs = document.querySelectorAll('.panel-tabs .tab-item');
  const contents = document.querySelectorAll('.tab-content');
  const gisMapView = document.getElementById('satelliteMapContainer');
  const dispatchMapView = document.getElementById('dispatchStaticMapView');
  const waterLevelView = document.getElementById('waterLevelSvgView');
  const reservoirMapView = document.getElementById('reservoirMapView');

  function switchTab(targetId) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === targetId));
    contents.forEach(c => c.classList.toggle('active', c.id === targetId));

    // 右側工作區視圖切換
    if (targetId === 'tab-dispatch') {
      if (gisMapView) gisMapView.classList.add('hide');
      if (dispatchMapView) dispatchMapView.classList.remove('hide');
      if (waterLevelView) waterLevelView.classList.add('hide');
      if (reservoirMapView) reservoirMapView.classList.add('hide');

      if (!dispatchGisMapInstance) {
        initDispatchGisMap();
      }
      setTimeout(refreshAllMaps, 100);
      setTimeout(refreshAllMaps, 350);
      setTimeout(refreshAllMaps, 700);
    } else if (targetId === 'tab-reservoir') {
      if (gisMapView) gisMapView.classList.add('hide');
      if (dispatchMapView) dispatchMapView.classList.add('hide');
      if (waterLevelView) waterLevelView.classList.add('hide');
      if (reservoirMapView) reservoirMapView.classList.remove('hide');

      if (!reservoirGisMapInstance) {
        initReservoirGisMap();
      }
      setTimeout(refreshAllMaps, 100);
      setTimeout(refreshAllMaps, 350);
      setTimeout(refreshAllMaps, 700);
    } else {
      if (gisMapView) gisMapView.classList.remove('hide');
      if (dispatchMapView) dispatchMapView.classList.add('hide');
      if (waterLevelView) waterLevelView.classList.add('hide');
      if (reservoirMapView) reservoirMapView.classList.add('hide');
      setTimeout(refreshAllMaps, 100);
      setTimeout(refreshAllMaps, 350);
    }

    // 同步頂部子選單 radio 圖示與文字
    document.querySelectorAll('.cascading-menu-level2 .menu-sub-item').forEach(subItem => {
      const match = subItem.dataset.tabTarget === targetId;
      subItem.classList.toggle('active', match);
      const icon = subItem.querySelector('.radio-icon');
      if (icon) {
        icon.className = match ? 'fa-solid fa-circle-dot radio-icon' : 'fa-regular fa-circle radio-icon';
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;
      switchTab(targetId);
    });
  });

  // 頂部子選單點擊連動
  document.querySelectorAll('.cascading-menu-level2 .menu-sub-item[data-tab-target]').forEach(subItem => {
    subItem.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetTab = subItem.dataset.tabTarget;
      if (targetTab) {
        switchTab(targetTab);
        const currentViewText = document.getElementById('currentViewText');
        const subName = subItem.querySelector('.sub-text')?.textContent;
        if (currentViewText && subName) {
          currentViewText.textContent = subName;
        }
        const viewDropdownMenu = document.getElementById('viewDropdownMenu');
        if (viewDropdownMenu) viewDropdownMenu.classList.remove('show');
      }
    });
  });

  // URL Hash 支援 (#tab-dispatch 或 #tab-reservoir)
  const hash = window.location.hash.replace('#', '');
  if (hash === 'tab-dispatch' || hash === 'dispatch') {
    switchTab('tab-dispatch');
  } else if (hash === 'tab-reservoir' || hash === 'reservoir') {
    switchTab('tab-reservoir');
  }

  // 窄寬度專屬：【資訊卡片】與【空間圖台】二級切換按鈕事件
  const rwdSwitchBtns = document.querySelectorAll('.rwd-switch-btn');
  const splitContainer = document.querySelector('.split-view-container');

  rwdSwitchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      rwdSwitchBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetView = btn.dataset.rwdTarget; // 'card' or 'map'
      if (splitContainer) {
        splitContainer.setAttribute('data-rwd-view', targetView);
      }

      if (targetView === 'map') {
        setTimeout(refreshAllMaps, 50);
        setTimeout(refreshAllMaps, 200);
      }
    });
  });
}

/**
 * 6.1 水庫蓄水量面板篩選與卡片連動互動
 */
function initReservoirPanelEvents() {
  const regionBtns = document.querySelectorAll('#reservoirRegionFilter .btn-res-filter');
  const cards = document.querySelectorAll('.res-card-box');

  // 區域快速篩選 (全部 / 北部 / 中部 / 南部)
  regionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      regionBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const region = btn.dataset.region;
      cards.forEach(card => {
        if (region === 'all' || card.dataset.region === region) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 點擊左側水庫卡片連動右側地圖浮動卡片高亮
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const resId = card.dataset.id;
      document.querySelectorAll('.res-float-card').forEach(fc => {
        fc.style.filter = '';
        fc.style.transform = '';
      });
      const targetFloat = document.querySelector(`.pos-${resId}-map, .pos-${resId}`);
      if (targetFloat) {
        targetFloat.style.filter = 'drop-shadow(0 0 16px #38bdf8) brightness(1.3)';
        targetFloat.style.transform = 'scale(1.1)';
        setTimeout(() => {
          targetFloat.style.filter = '';
          targetFloat.style.transform = '';
        }, 2200);
      }
    });
  });
}

/**
 * 7. 細部供水系統清單層互動 (第一層表格點擊 -> 第二層系統清單 -> 水位關係 SVG / 傳訊點圖台)
 */
function initSystemDetailLayer() {
  const districtOverviewLayer = document.getElementById('districtOverviewLayer');
  const systemDetailLayer = document.getElementById('systemDetailLayer');
  const crumbDistrictName = document.getElementById('crumbDistrictName');
  const btnBack = document.getElementById('btnBackToDistrictOverview');
  const systemsCardsGrid = document.getElementById('systemsCardsGrid');
  const gisMapView = document.getElementById('satelliteMapContainer');
  const waterLevelView = document.getElementById('waterLevelSvgView');
  const dispatchMapView = document.getElementById('dispatchStaticMapView');
  const currentLevelSystemName = document.getElementById('currentLevelSystemName');
  const btnSwitchToTelemetry = document.getElementById('btnSwitchToTelemetry');

  let currentSelectedSystem = 'beipu';
  let currentActionType = 'level'; // 'level' (水位關係) 或 'telemetry' (傳訊點分布)

  // 渲染供水系統清單 (直接呈現全部 20 個供水系統，自然滾動)
  function renderSystemsList(districtId) {
    const allSystems = DISTRICT_SYSTEMS_MAP[districtId] || DISTRICT_SYSTEMS_MAP[3];
    if (!systemsCardsGrid) return;

    systemsCardsGrid.innerHTML = allSystems.map(sys => {
      const isSelected = sys.id === currentSelectedSystem;
      const isDanger = sys.state === 'danger';
      const isLevelActive = isSelected && currentActionType === 'level';
      const isTelemetryActive = isSelected && currentActionType === 'telemetry';

      return `
        <div class="system-card-box ${isDanger ? 'state-danger' : ''} ${isSelected ? 'active-selected' : ''}" data-sysid="${sys.id}">
          <div class="sys-card-header">
            <div class="sys-title-left">
              <i class="fa-solid fa-circle-dot sys-dot-icon"></i>
              <span class="sys-name-text" title="${sys.name}">${sys.name}</span>
            </div>
            <span class="sys-status-badge ${isDanger ? 'badge-danger' : 'badge-normal'}">
              ${isDanger ? '異常' : '正常'}
            </span>
          </div>
          <div class="sys-actions-row">
            <button type="button" class="btn-sys-action btn-water-level ${isLevelActive ? 'active' : ''}" data-sysid="${sys.id}" data-sysname="${sys.name}">
              <i class="fa-solid fa-droplet"></i> 水位關係
            </button>
            <button type="button" class="btn-sys-action btn-telemetry-spots ${isTelemetryActive ? 'active' : ''}" data-sysid="${sys.id}" data-sysname="${sys.name}">
              <i class="fa-solid fa-location-dot"></i> 傳訊點分布
            </button>
          </div>
        </div>
      `;
    }).join('');

    bindSystemCardEvents();
  }

  // 綁定卡片按鈕事件
  function bindSystemCardEvents() {
    const levelBtns = document.querySelectorAll('.btn-water-level');
    const telemetryBtns = document.querySelectorAll('.btn-telemetry-spots');

    // 點擊【水位關係】-> 切換右側為 SVG 格式水位關係圖 (正常: 藍底白字 / 異常: 紅底白字)
    levelBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sysId = btn.dataset.sysid;
        const sysName = btn.dataset.sysname;
        currentSelectedSystem = sysId;
        currentActionType = 'level';

        document.querySelectorAll('.system-card-box').forEach(c => c.classList.remove('active-selected'));
        document.querySelectorAll('.btn-sys-action').forEach(b => b.classList.remove('active'));

        btn.closest('.system-card-box')?.classList.add('active-selected');
        btn.classList.add('active');

        if (currentLevelSystemName) {
          currentLevelSystemName.textContent = `${sysName} - 供水水位高程關係圖`;
        }

        // 切換右側工作區至 SVG 水位關係視圖
        if (waterLevelView) waterLevelView.classList.remove('hide');
        if (gisMapView) gisMapView.classList.add('hide');
        if (dispatchMapView) dispatchMapView.classList.add('hide');
      });
    });

    // 點擊【傳訊點分布】-> 切換右側回 GIS Google Map 圖台並定位 (正常: 藍底白字 / 異常: 紅底白字)
    telemetryBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sysId = btn.dataset.sysid;
        const sysName = btn.dataset.sysname;
        currentSelectedSystem = sysId;
        currentActionType = 'telemetry';

        document.querySelectorAll('.system-card-box').forEach(c => c.classList.remove('active-selected'));
        document.querySelectorAll('.btn-sys-action').forEach(b => b.classList.remove('active'));

        btn.closest('.system-card-box')?.classList.add('active-selected');
        btn.classList.add('active');

        // 切換右側工作區回 GIS Google Map 圖台
        if (waterLevelView) waterLevelView.classList.add('hide');
        if (gisMapView) gisMapView.classList.remove('hide');
        if (dispatchMapView) dispatchMapView.classList.add('hide');

        if (gisMapInstance) {
          gisMapInstance.invalidateSize();
          showSystemTelemetryOnMap(sysName);
        }
      });
    });
  }

  // 第一層清單列點擊 -> 進入第二層供水系統總覽
  const tableRows = document.querySelectorAll('#districtTableBody tr');
  tableRows.forEach(row => {
    row.addEventListener('click', () => {
      const dId = row.dataset.district || '3';
      const districtName = DISTRICT_DATA[dId]?.name.split(' ')[0] || `${dId}區`;

      if (crumbDistrictName) crumbDistrictName.textContent = districtName;
      if (districtOverviewLayer) districtOverviewLayer.classList.add('hide');
      if (systemDetailLayer) systemDetailLayer.classList.remove('hide');

      renderSystemsList(dId);

      // 預設為北埔供水系統的水位關係圖
      if (waterLevelView) waterLevelView.classList.remove('hide');
      if (gisMapView) gisMapView.classList.add('hide');
    });
  });

  // 點擊「← 返回上一頁」或麵包屑 -> 回到第一層清單
  const backAction = () => {
    if (systemDetailLayer) systemDetailLayer.classList.add('hide');
    if (districtOverviewLayer) districtOverviewLayer.classList.remove('hide');
    if (waterLevelView) waterLevelView.classList.add('hide');
    if (gisMapView) gisMapView.classList.remove('hide');
    if (telemetryMarkersGroup) telemetryMarkersGroup.clearLayers();
    if (gisMapInstance) {
      gisMapInstance.invalidateSize();
      gisMapInstance.flyTo([23.75, 120.95], 8, { duration: 1.2 });
    }
  };

  if (btnBack) btnBack.addEventListener('click', backAction);
  if (crumbDistrictName) crumbDistrictName.addEventListener('click', backAction);

  // SVG 標頭上的「切換至傳訊點分布圖台」按鈕
  if (btnSwitchToTelemetry) {
    btnSwitchToTelemetry.addEventListener('click', () => {
      if (waterLevelView) waterLevelView.classList.add('hide');
      if (gisMapView) gisMapView.classList.remove('hide');
      if (gisMapInstance) {
        gisMapInstance.invalidateSize();
        showSystemTelemetryOnMap('北埔供水系統');
      }
    });
  }
}

/**
 * 8. 初始化 Google Map 圖台並套疊全台 13 區處向量與資訊統計
 */
function initGoogleGisMap() {
  const mapEl = document.getElementById('gisGoogleMap');
  if (!mapEl || typeof L === 'undefined') return;

  // 定位在台灣中心 [23.75, 120.95]，Zoom 8
  gisMapInstance = L.map('gisGoogleMap', {
    center: [23.75, 120.95],
    zoom: 8,
    zoomControl: false,
    attributionControl: false
  });

  // 載入 Google Maps 衛星混合底圖 (含地形/地名標註)
  const googleSatHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 19,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  }).addTo(gisMapInstance);

  // 建立傳訊點圖層群組
  telemetryMarkersGroup = L.layerGroup().addTo(gisMapInstance);

  // 確保初始載入時圖台完整渲染
  setTimeout(refreshAllMaps, 250);
  window.addEventListener('resize', refreshAllMaps);

  const tooltip = document.getElementById('districtTooltip');
  const ttTitle = document.getElementById('ttTitle');
  const ttStatus = document.getElementById('ttStatus');
  const ttSupply = document.getElementById('ttSupply');
  const ttLastYear = document.getElementById('ttLastYear');
  const mapContainer = document.getElementById('satelliteMapContainer');

  // 繪製 13 個區處向量多邊形並套疊於 Google Map 上
  Object.keys(DISTRICT_POLYGONS).forEach(dId => {
    const dInfo = DISTRICT_POLYGONS[dId];
    const data = DISTRICT_DATA[dId];
    const isDanger = dInfo.status === 'danger';

    // 多邊形樣式 (第3區異常紅色發光，其餘正常水綠半透明)
    const poly = L.polygon(dInfo.coords, {
      color: isDanger ? '#ef4444' : '#34d399',
      weight: isDanger ? 3 : 2,
      fillColor: isDanger ? '#dc2626' : '#10b981',
      fillOpacity: isDanger ? 0.65 : 0.38,
      dashArray: isDanger ? '4, 4' : null
    }).addTo(gisMapInstance);

    // 區處文字標籤 Marker
    const labelIcon = L.divIcon({
      className: `leaflet-district-label ${isDanger ? 'danger-label' : ''}`,
      html: isDanger ? `⚠ ${data.name.split(' ')[0]}` : data.name.split(' ')[0],
      iconSize: [60, 22],
      iconAnchor: [30, 11]
    });
    const labelMarker = L.marker(dInfo.center, { icon: labelIcon, interactive: false }).addTo(gisMapInstance);

    districtLayersMap[dId] = { poly, labelMarker };

    // 多邊形 Hover / Click 互動
    poly.on('mouseover', (e) => {
      highlightDistrictOnMap(dId, true);
      showDistrictTooltip(dId, e.originalEvent);
    });

    poly.on('mousemove', (e) => {
      positionDistrictTooltip(e.originalEvent);
    });

    poly.on('mouseout', () => {
      highlightDistrictOnMap(dId, false);
      hideDistrictTooltip();
    });

    poly.on('click', () => {
      const row = document.querySelector(`#districtTableBody tr[data-district="${dId}"]`);
      if (row) row.click();
    });
  });

  // 左側表格行 Hover / Click 連動地圖多邊形
  const tableRows = document.querySelectorAll('#districtTableBody tr');
  tableRows.forEach(row => {
    const dId = row.dataset.district;
    row.addEventListener('mouseenter', () => {
      highlightDistrictOnMap(dId, true);
    });
    row.addEventListener('mouseleave', () => {
      highlightDistrictOnMap(dId, false);
    });
  });

  function highlightDistrictOnMap(dId, isHighlight) {
    const layer = districtLayersMap[dId];
    const row = document.querySelector(`#districtTableBody tr[data-district="${dId}"]`);
    const isDanger = DISTRICT_POLYGONS[dId]?.status === 'danger';

    if (row) row.classList.toggle('highlighted', isHighlight);

    if (layer && layer.poly) {
      if (isHighlight) {
        layer.poly.setStyle({
          weight: 4,
          color: '#ffffff',
          fillOpacity: 0.85
        });
      } else {
        layer.poly.setStyle({
          weight: isDanger ? 3 : 2,
          color: isDanger ? '#ef4444' : '#34d399',
          fillOpacity: isDanger ? 0.65 : 0.38
        });
      }
    }
  }

  function showDistrictTooltip(dId, e) {
    const data = DISTRICT_DATA[dId];
    if (!data || !tooltip) return;

    ttTitle.textContent = data.name;
    ttStatus.textContent = data.status;
    ttStatus.className = data.stateType === 'danger' ? 'font-bold text-danger' : 'font-bold text-success';
    ttSupply.textContent = `${data.supply.toLocaleString()} CMD`;
    ttLastYear.textContent = `${data.lastYear.toLocaleString()} CMD`;

    tooltip.classList.remove('hide');
    positionDistrictTooltip(e);
  }

  function positionDistrictTooltip(e) {
    if (!tooltip || !mapContainer) return;
    const rect = mapContainer.getBoundingClientRect();
    const x = e.clientX - rect.left + 16;
    const y = e.clientY - rect.top + 16;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }

  function hideDistrictTooltip() {
    if (tooltip) tooltip.classList.add('hide');
  }
}

/**
 * 7. 切換至傳訊點分布時，Google Map 平滑縮放定位並標記傳訊點
 */
function showSystemTelemetryOnMap(sysName) {
  if (!gisMapInstance) return;

  if (telemetryMarkersGroup) {
    telemetryMarkersGroup.clearLayers();
  }

  // 平滑縮放到新竹北埔區域 [24.70, 121.05]，Zoom 13
  gisMapInstance.flyTo([24.70, 121.05], 13, { duration: 1.5 });

  // 繪製北埔傳訊點 Marker
  BEIPU_TELEMETRY_SPOTS.forEach(spot => {
    const spotIcon = L.divIcon({
      className: 'telemetry-spot-marker',
      html: '<i class="fa-solid fa-tower-broadcast"></i>',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([spot.lat, spot.lng], { icon: spotIcon }).addTo(telemetryMarkersGroup);
    marker.bindPopup(`
      <div style="font-family: 'Noto Sans TC', sans-serif; padding: 4px;">
        <h4 style="margin: 0 0 4px 0; color: #0284c7; font-size: 13px;">${spot.name}</h4>
        <div style="font-size: 12px; color: #334155;"><b>監測類型：</b>${spot.type}</div>
        <div style="font-size: 12px; color: #16a34a; font-weight: bold;"><b>即時數據：</b>${spot.val}</div>
      </div>
    `).openPopup();
  });
}

/**
 * 6. 跨區水源調度靜態圖動態資料渲染與切換 (日結量 vs 瞬間量)
 */
function initDispatchTopology() {
  const modeBtn = document.getElementById('dispatchModeBtn');
  const modeMenu = document.getElementById('dispatchModeMenu');
  const currentModeText = document.getElementById('currentDispatchModeText');
  const menuItems = document.querySelectorAll('.mode-menu-item');

  if (modeBtn && modeMenu) {
    // 下拉選單開合
    modeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      modeMenu.classList.toggle('hide');
    });

    document.addEventListener('click', () => {
      modeMenu.classList.add('hide');
    });

    // 模式選項點擊切換
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        menuItems.forEach(i => {
          i.classList.remove('active');
          const checkIcon = i.querySelector('.mode-check-icon');
          if (checkIcon) checkIcon.className = 'fa-regular fa-circle mode-check-icon';
        });

        item.classList.add('active');
        const activeCheck = item.querySelector('.mode-check-icon');
        if (activeCheck) activeCheck.className = 'fa-solid fa-circle-check mode-check-icon';

        const mode = item.dataset.mode || 'daily';
        currentDispatchMode = mode;
        if (currentModeText) {
          currentModeText.textContent = mode === 'daily' ? '日結量' : '瞬間量';
        }
        modeMenu.classList.add('hide');

        renderDispatchData(mode);
      });
    });
  }

  // 渲染數值至左側面板與右側 17 個縣市卡片
  function renderDispatchData(mode) {
    const data = DISPATCH_DATABASE[mode] || DISPATCH_DATABASE.daily;

    // 左側面板統計數據
    const elTotalSupport = document.getElementById('totalSupportVal');
    const elTotalReceived = document.getElementById('totalReceivedVal');
    const elSupportCount = document.getElementById('supportAreaCount');
    const elReceivedCount = document.getElementById('receivedAreaCount');
    const elBiCount = document.getElementById('biSupportAreaCount');
    const elNoSupportCount = document.getElementById('noSupportAreaCount');
    const elMaxSupportArea = document.getElementById('maxSupportArea');
    const elMaxSupportVal = document.getElementById('maxSupportVal');
    const elMaxReceivedArea = document.getElementById('maxReceivedArea');
    const elMaxReceivedVal = document.getElementById('maxReceivedVal');
    const elBeishui = document.getElementById('beishuiSupportVal');
    const elNanhua = document.getElementById('nanhuaSupplyVal');

    if (elTotalSupport) elTotalSupport.textContent = data.totalSupport.toLocaleString();
    if (elTotalReceived) elTotalReceived.textContent = data.totalReceived.toLocaleString();
    if (elSupportCount) elSupportCount.textContent = data.supportCount;
    if (elReceivedCount) elReceivedCount.textContent = data.receivedCount;
    if (elBiCount) elBiCount.textContent = data.biCount;
    if (elNoSupportCount) elNoSupportCount.textContent = data.noSupportCount;
    if (elMaxSupportArea) elMaxSupportArea.textContent = data.maxSupport.city;
    if (elMaxSupportVal) elMaxSupportVal.textContent = data.maxSupport.val.toLocaleString();
    if (elMaxReceivedArea) elMaxReceivedArea.textContent = data.maxReceived.city;
    if (elMaxReceivedVal) elMaxReceivedVal.textContent = data.maxReceived.val.toLocaleString();
    if (elBeishui) elBeishui.textContent = data.beishui.toLocaleString();
    if (elNanhua) elNanhua.textContent = data.nanhua.toLocaleString();

    // 右側 17 個縣市卡片數值更新
    Object.keys(data.cities).forEach(cityKey => {
      const cityData = data.cities[cityKey];
      const supportValEl = document.querySelector(`.county-stat-card [data-city="${cityKey}"][data-field="support"]`);
      const receivedValEl = document.querySelector(`.county-stat-card [data-city="${cityKey}"][data-field="received"]`);

      if (supportValEl) {
        supportValEl.textContent = cityData.support !== null ? cityData.support.toLocaleString() : '-';
        supportValEl.classList.add('flash');
        setTimeout(() => supportValEl.classList.remove('flash'), 500);
      }
      if (receivedValEl) {
        receivedValEl.textContent = cityData.received !== null ? cityData.received.toLocaleString() : '-';
        receivedValEl.classList.add('flash');
        setTimeout(() => receivedValEl.classList.remove('flash'), 500);
      }
    });
  }

  // 點擊縣市卡片時發光反饋
  const countyCards = document.querySelectorAll('.county-stat-card');
  countyCards.forEach(card => {
    card.addEventListener('click', () => {
      const cityTag = card.querySelector('.card-header-tag')?.textContent || '該縣市';
      const supVal = card.querySelector('[data-field="support"]')?.textContent || '-';
      const recVal = card.querySelector('[data-field="received"]')?.textContent || '-';
      alert(`【${cityTag} 跨區支援水情報表】\n當前模式：${currentDispatchMode === 'daily' ? '日結量' : '瞬間量'}\n支援量：${supVal} CMD\n受支援量：${recVal} CMD`);
    });
  });

  // 每 8 秒模擬一次細微流量數據動態浮動（滿足「統計表數字為變動」戰情需求）
  setInterval(() => {
    if (document.getElementById('tab-dispatch')?.classList.contains('active')) {
      const activeData = DISPATCH_DATABASE[currentDispatchMode];
      if (activeData) {
        // 微調新北與桃園之即時數值
        const jitter = Math.floor((Math.random() - 0.5) * 60);
        if (activeData.cities.newtaipei.received) {
          activeData.cities.newtaipei.received += jitter;
        }
        renderDispatchData(currentDispatchMode);
      }
    }
  }, 8000);

  // 初始載入時立即渲染一次跨區調度數值與卡片
  renderDispatchData(currentDispatchMode);
}

/**
 * 8. 滑鼠拖曳改變左側面板寬度 (Resizable Splitter) 與收合按鈕整合
 */
function initPanelCollapse() {
  const splitContainer = document.querySelector('.split-view-container');
  const leftPanel = document.getElementById('leftTablePanel');
  const panelResizer = document.getElementById('panelResizer');
  const toggleBtn = document.getElementById('toggleCollapseBtn');

  if (!leftPanel || !panelResizer) return;

  let isDragging = false;
  let startX = 0;
  let startWidth = 0;
  let hasMoved = false;
  let savedWidth = null;

  // 滑鼠在分隔條上按下 -> 開始拖曳
  panelResizer.addEventListener('mousedown', (e) => {
    // 若點擊的是收合按鈕本體，允許按鈕點擊事件正常傳遞
    if (e.target.closest('#toggleCollapseBtn')) {
      return;
    }

    startDrag(e);
  });

  // 收合把手按鈕周圍邊界亦支援拖曳
  function startDrag(e) {
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startWidth = leftPanel.getBoundingClientRect().width;

    if (splitContainer) splitContainer.classList.add('is-resizing');
    panelResizer.classList.add('is-dragging');

    // 拖曳過程關閉過渡動畫，確保極致跟手與零延遲
    leftPanel.style.transition = 'none';

    e.preventDefault();
  }

  // 全域滑鼠移動 -> 動態計算並套用寬度
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    if (Math.abs(deltaX) > 3) {
      hasMoved = true;
    }

    const containerWidth = splitContainer ? splitContainer.getBoundingClientRect().width : window.innerWidth;
    const minWidth = 280; // 最小限制寬度
    const maxWidth = Math.max(minWidth, containerWidth * 0.75); // 最大限制寬度 75%

    let newWidth = startWidth + deltaX;
    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;

    leftPanel.style.width = `${newWidth}px`;
    savedWidth = `${newWidth}px`;

    // 若原本處於收合狀態，拖曳時自動解除收合
    if (leftPanel.classList.contains('collapsed')) {
      leftPanel.classList.remove('collapsed');
      if (toggleBtn) toggleBtn.classList.remove('collapsed');
    }

    // Google Map 圖台即時自適應延伸
    refreshAllMaps();
  });

  // 全域滑鼠放開 -> 結束拖曳
  document.addEventListener('mouseup', () => {
    if (!isDragging) return;

    isDragging = false;
    if (splitContainer) splitContainer.classList.remove('is-resizing');
    panelResizer.classList.remove('is-dragging');

    // 恢復 CSS transition 屬性
    leftPanel.style.transition = '';

    setTimeout(refreshAllMaps, 100);
  });

  // 點擊收合按鈕 (收合 / 展開)
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      const isNowCollapsed = leftPanel.classList.toggle('collapsed');
      toggleBtn.classList.toggle('collapsed', isNowCollapsed);

      if (!isNowCollapsed) {
        // 展開時恢復先前使用者拖曳設定的寬度或預設 30%
        if (savedWidth) {
          leftPanel.style.width = savedWidth;
        } else {
          leftPanel.style.width = '30%';
        }
      }

      // 多階段無延遲刷新重繪 (配合 CSS transition 動畫過程)
      refreshAllMaps();
      setTimeout(refreshAllMaps, 120);
      setTimeout(refreshAllMaps, 320);
    });
  }
}

/**
 * 9. 浮動 FAB 按鈕互動 (支援切換 Google 衛星地圖與 Google 道路地圖)
 */
function initFabButtons() {
  const fabBtns = document.querySelectorAll('.map-fab-group .fab-btn');
  const fabLayerBtn = fabBtns[0];
  const fabAiBtn = fabBtns[1];

  let currentTileMode = 'satellite';

  if (fabLayerBtn) {
    fabLayerBtn.addEventListener('click', () => {
      if (!gisMapInstance) return;

      gisMapInstance.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
          gisMapInstance.removeLayer(layer);
        }
      });

      if (currentTileMode === 'satellite') {
        // 切換至 Google 標準道路地圖
        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 19,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(gisMapInstance);
        currentTileMode = 'roadmap';
        alert('已切換圖層：Google Maps 標準道路地圖');
      } else {
        // 切換回 Google 衛星混合地圖
        L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
          maxZoom: 19,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(gisMapInstance);
        currentTileMode = 'satellite';
        alert('已切換圖層：Google Maps 衛星混合地圖');
      }
    });
  }

  if (fabAiBtn) {
    fabAiBtn.addEventListener('click', () => {
      alert('【智慧水網 AI 助理】已就緒：\n當前檢測到「第三區管理處」總供水量（939,000 CMD）較去年同日短少 49,000 CMD，已自動為您調出北水南送應變排程。');
    });
  }
}

/**
 * 12. 圖例面板開合切換事件 (三大頁籤圖例全面支援一鍵收合與展開)
 */
function initCollapsibleLegends() {
  // 1. 全台供水狀態圖例 (Tab 1)
  const toggleOverviewLegendBtn = document.getElementById('toggleOverviewLegendBtn');
  const overviewLegendCard = document.getElementById('overviewLegendCard');
  if (toggleOverviewLegendBtn && overviewLegendCard) {
    toggleOverviewLegendBtn.addEventListener('click', () => {
      overviewLegendCard.classList.toggle('collapsed');
    });
  }

  // 2. 跨區水源調度圖例 (Tab 2)
  const toggleDispatchLegendBtn = document.getElementById('toggleDispatchLegendBtn');
  const dispatchLegendPanel = document.getElementById('dispatchLegendPanel');
  if (toggleDispatchLegendBtn && dispatchLegendPanel) {
    toggleDispatchLegendBtn.addEventListener('click', () => {
      dispatchLegendPanel.classList.toggle('collapsed');
    });
  }

  // 3. 水庫蓄水量百分比圖例 (Tab 3)
  const toggleReservoirLegendBtn = document.getElementById('toggleReservoirLegendBtn');
  const reservoirLegendCard = document.getElementById('reservoirLegendCard');
  if (toggleReservoirLegendBtn && reservoirLegendCard) {
    toggleReservoirLegendBtn.addEventListener('click', () => {
      reservoirLegendCard.classList.toggle('collapsed');
    });
  }
}

/**
 * ==========================================================================
 * 客服進線狀況 (客服進線分析) - 專屬行為腳本 (js/customer-service.js)
 * ==========================================================================
 */

let csMapInstance = null;
let trendChartInstance = null;
let currentTileLayer = null;
let isSatelliteMode = true;

/**
 * 假資料集中管理 (Mock Data)
 */
const CS_MOCK_DATA = {
  // 趨勢圖數據 (不同刻度)
  trends: {
    '10': {
      labels: ['06/12 12:00', '12:10', '12:20', '12:30', '12:40', '12:50'],
      values: [13, 12, 9, 10, 10, 17, 11, 13, 4, 6, 5, 5]
    },
    '15': {
      labels: ['06/12 11:30', '11:45', '12:00', '12:15', '12:30', '12:45'],
      values: [18, 15, 22, 27, 24, 11]
    },
    '30': {
      labels: ['06/12 10:00', '10:30', '11:00', '11:30', '12:00', '12:30'],
      values: [35, 42, 38, 45, 51, 38]
    }
  },

  // 輿情熱區多邊形定義 (台中都會區)
  sentimentPolygons: [
    {
      name: '北屯/潭子輿情熱區',
      level: 'high', // > 20件 (紅色)
      coords: [
        [24.18, 120.67],
        [24.21, 120.71],
        [24.19, 120.73],
        [24.16, 120.70]
      ],
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.45
    },
    {
      name: '大肚/龍井輿情熱區',
      level: 'high', // > 20件 (紅色)
      coords: [
        [24.13, 120.52],
        [24.17, 120.56],
        [24.14, 120.59],
        [24.10, 120.54]
      ],
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.45
    },
    {
      name: '西屯/南屯輿情分析區',
      level: 'mid', // 10~20件 (黃色)
      coords: [
        [24.14, 120.60],
        [24.18, 120.64],
        [24.15, 120.66],
        [24.12, 120.62]
      ],
      color: '#eab308',
      fillColor: '#eab308',
      fillOpacity: 0.35
    },
    {
      name: '清水/沙鹿輿情區',
      level: 'low', // < 10件 (藍色)
      coords: [
        [24.24, 120.54],
        [24.28, 120.58],
        [24.25, 120.60],
        [24.22, 120.56]
      ],
      color: '#0284c7',
      fillColor: '#0284c7',
      fillOpacity: 0.35
    }
  ],

  // 客服案件 Pin 點
  casesPins: [
    { id: '20260259955', town: '東區', type: 'emergency', lat: 24.136, lng: 120.695, time: '12日 12:42', desc: '大智路周邊水壓驟降，管線疑似破裂' },
    { id: '20260259945', town: '未填鄉鎮市區', type: 'normal', lat: 24.155, lng: 120.668, time: '12日 12:37', desc: '詢問停水復水時間' },
    { id: '20260259934', town: '西屯區', type: 'normal', lat: 24.162, lng: 120.642, time: '12日 12:34', desc: '台灣大道四段水表後漏水通報' },
    { id: '20260259929', town: '北屯區', type: 'emergency', lat: 24.182, lng: 120.702, time: '12日 12:31', desc: '文心路四段管線漏水溢流路面' },
    { id: '20260259919', town: '北屯區', type: 'normal', lat: 24.175, lng: 120.690, time: '12日 12:29', desc: '水質略有混濁詢問' },
    { id: '20260259921', town: '外埔區', type: 'normal', lat: 24.332, lng: 120.655, time: '12日 12:29', desc: '水壓不足' },
    { id: '20260259916', town: '南屯區', type: 'normal', lat: 24.138, lng: 120.640, time: '12日 12:28', desc: '五權西路二段水表箱損壞' },
    { id: '20260259910', town: '西區', type: 'normal', lat: 24.148, lng: 120.665, time: '12日 12:27', desc: '公益路水質檢驗詢問' },
    { id: '20260259899', town: '北屯區', type: 'emergency', lat: 24.195, lng: 120.718, time: '12日 12:21', desc: '崇德路三段大量自來水湧出' },
    { id: '20260259897', town: '大里區', type: 'normal', lat: 24.098, lng: 120.678, time: '12日 12:21', desc: '中興路水費帳單問題' },
    { id: '20260259889', town: '豐原區', type: 'normal', lat: 24.252, lng: 120.718, time: '12日 12:16', desc: '圓環東路水壓偏低' },
    { id: '20260259878', town: '南區', type: 'normal', lat: 24.118, lng: 120.660, time: '12日 12:16', desc: '復興路三段路面滲水' },
    { id: '20260259876', town: '北屯區', type: 'normal', lat: 24.170, lng: 120.680, time: '12日 12:10', desc: '北屯路水壓穩定度詢問' },
    { id: '20260259874', town: '北屯區', type: 'emergency', lat: 24.188, lng: 120.698, time: '12日 12:09', desc: '松竹路二段消防栓被撞斷噴水' },
    
    // 大肚區周邊密集案件 (對應截圖紅區)
    { id: '20260259860', town: '大肚區', type: 'emergency', lat: 24.145, lng: 120.545, time: '12日 12:05', desc: '沙田路二段主管線破裂' },
    { id: '20260259858', town: '大肚區', type: 'emergency', lat: 24.135, lng: 120.538, time: '12日 12:02', desc: '遊園路一段全線無水' },
    { id: '20260259850', town: '大肚區', type: 'normal', lat: 24.150, lng: 120.555, time: '12日 11:58', desc: '自由路水壓偏低反映' },
    { id: '20260259845', town: '大肚區', type: 'normal', lat: 24.128, lng: 120.530, time: '12日 11:50', desc: '詢問大肚區停水範圍' }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  initCsGoogleMap();
  initCsTrendChart();
  bindCsEvents();
});

/**
 * 1. 初始化 Google Map GIS 輿情圖台
 */
function initCsGoogleMap() {
  const mapEl = document.getElementById('csGoogleMap');
  if (!mapEl) return;

  // 定位在台中都會區 [24.16, 120.64]，Zoom 11，關閉預設滾輪攔截以允許滑鼠正常捲動整頁
  csMapInstance = L.map('csGoogleMap', {
    center: [24.16, 120.64],
    zoom: 11,
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: false // 釋放滾輪事件，讓滑鼠能順暢上下滾動瀏覽網頁各區塊
  });

  // 支援按住 Ctrl 鍵時可用滾輪縮放地圖
  csMapInstance.on('focus', () => { csMapInstance.scrollWheelZoom.enable(); });
  csMapInstance.on('blur', () => { csMapInstance.scrollWheelZoom.disable(); });
  
  // 監聽鍵盤 Ctrl 鍵動態啟用/停用滾輪縮放
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (csMapInstance) csMapInstance.scrollWheelZoom.enable();
    }
  });
  window.addEventListener('keyup', (e) => {
    if (!e.ctrlKey && !e.metaKey) {
      if (csMapInstance) csMapInstance.scrollWheelZoom.disable();
    }
  });

  // 載入 Google Maps 衛星混合地圖
  currentTileLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 19,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  }).addTo(csMapInstance);

  // 繪製輿情熱區多邊形
  CS_MOCK_DATA.sentimentPolygons.forEach(poly => {
    const polygonLayer = L.polygon(poly.coords, {
      color: poly.color,
      weight: 2,
      fillColor: poly.fillColor,
      fillOpacity: poly.fillOpacity,
      dashArray: poly.level === 'high' ? '4 2' : null
    }).addTo(csMapInstance);

    polygonLayer.on('click', () => {
      showDistrictPopup(poly.name);
    });
  });

  // 繪製客製化驚嘆號案件 Pin 點
  CS_MOCK_DATA.casesPins.forEach(item => {
    const isEmergency = item.type === 'emergency';
    const pinHtml = `
      <div class="case-map-marker ${isEmergency ? 'marker-emergency' : 'marker-normal'}" title="${item.town} - ${item.id}">
        <i class="fa-solid fa-exclamation"></i>
      </div>
    `;

    const customIcon = L.divIcon({
      html: pinHtml,
      className: 'cs-custom-pin-wrap',
      iconSize: [26, 32],
      iconAnchor: [13, 32]
    });

    const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(csMapInstance);
    
    marker.on('click', () => {
      marker.bindPopup(`
        <div style="font-size: 12px; font-family: 'Noto Sans TC', sans-serif;">
          <div style="font-weight: 700; color: #0284c7; margin-bottom: 4px;">案件編號：${item.id}</div>
          <div><strong>鄉鎮市區：</strong>${item.town}</div>
          <div><strong>進線時間：</strong>${item.time}</div>
          <div><strong>反映內容：</strong>${item.desc}</div>
          <div style="margin-top: 4px;"><strong>層級：</strong><span style="color: ${isEmergency ? '#ef4444' : '#f97316'}; font-weight: bold;">${isEmergency ? '🚨 緊急案件' : '一般案件'}</span></div>
        </div>
      `).openPopup();
    });
  });

  // 多階延遲刷新地圖以確保各螢幕尺寸下 100% 填滿與瓦片載入
  const refreshMap = () => {
    if (csMapInstance) csMapInstance.invalidateSize();
  };
  setTimeout(refreshMap, 100);
  setTimeout(refreshMap, 300);
  setTimeout(refreshMap, 600);

  window.addEventListener('load', refreshMap);
  window.addEventListener('resize', () => {
    refreshMap();
    if (trendChartInstance) trendChartInstance.resize();
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      refreshMap();
      if (trendChartInstance) trendChartInstance.resize();
    }, 300);
  });
}

/**
 * 2. 初始化客服進線趨勢圖 (Chart.js 長條圖)
 */
function initCsTrendChart() {
  const canvas = document.getElementById('csTrendChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const initData = CS_MOCK_DATA.trends['10'];

  trendChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['06/12 12:00', '', '12:10', '', '12:20', '', '12:30', '', '12:40', '', '12:50', ''],
      datasets: [{
        label: '進線件數',
        data: initData.values,
        backgroundColor: '#86efac', // 淺綠色長條
        hoverBackgroundColor: '#4ade80',
        borderRadius: 2,
        barPercentage: 0.65,
        categoryPercentage: 0.8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { size: 12 },
          bodyFont: { size: 12 },
          callbacks: {
            label: (ctx) => ` 進線件數：${ctx.raw} 件`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 10 },
            color: '#64748b',
            maxRotation: 0
          }
        },
        y: {
          min: 0,
          max: 18,
          ticks: {
            stepSize: 3,
            font: { size: 10 },
            color: '#64748b'
          },
          grid: {
            color: '#f1f5f9'
          }
        }
      }
    },
    plugins: [{
      id: 'barTopLabels',
      afterDatasetsDraw(chart) {
        const { ctx, data } = chart;
        ctx.save();
        ctx.font = '10px Roboto, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'center';

        chart.getDatasetMeta(0).data.forEach((bar, index) => {
          const val = data.datasets[0].data[index];
          if (val !== undefined) {
            ctx.fillText(val, bar.x, bar.y - 4);
          }
        });
        ctx.restore();
      }
    }]
  });
}

/**
 * 3. 綁定事件監聽
 */
function bindCsEvents() {
  // 時間刻度切換
  const timeScaleSelect = document.getElementById('timeScaleSelect');
  if (timeScaleSelect) {
    timeScaleSelect.addEventListener('change', (e) => {
      const scale = e.target.value;
      const trendData = CS_MOCK_DATA.trends[scale] || CS_MOCK_DATA.trends['10'];
      
      if (trendChartInstance) {
        if (scale === '10') {
          trendChartInstance.data.labels = ['06/12 12:00', '', '12:10', '', '12:20', '', '12:30', '', '12:40', '', '12:50', ''];
          trendChartInstance.options.scales.y.max = 18;
          trendChartInstance.options.scales.y.ticks.stepSize = 3;
        } else if (scale === '15') {
          trendChartInstance.data.labels = trendData.labels;
          trendChartInstance.options.scales.y.max = 30;
          trendChartInstance.options.scales.y.ticks.stepSize = 5;
        } else {
          trendChartInstance.data.labels = trendData.labels;
          trendChartInstance.options.scales.y.max = 60;
          trendChartInstance.options.scales.y.ticks.stepSize = 10;
        }
        trendChartInstance.data.datasets[0].data = trendData.values;
        trendChartInstance.update();
      }
    });
  }

  // 案件清單點擊聚焦地圖 Marker
  const caseRows = document.querySelectorAll('.case-row');
  caseRows.forEach(row => {
    row.addEventListener('click', () => {
      const caseId = row.dataset.id;
      const caseItem = CS_MOCK_DATA.casesPins.find(c => c.id === caseId);
      if (caseItem && csMapInstance) {
        csMapInstance.setView([caseItem.lat, caseItem.lng], 14, { animate: true });
      }
    });
  });

  // 圖層切換 FAB 按鈕 (衛星 / 道路)
  const fabLayerToggle = document.getElementById('fabLayerToggle');
  if (fabLayerToggle) {
    fabLayerToggle.addEventListener('click', () => {
      if (!csMapInstance) return;
      
      if (currentTileLayer) {
        csMapInstance.removeLayer(currentTileLayer);
      }

      if (isSatelliteMode) {
        // 切換為 Google 道路地圖
        currentTileLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 19,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(csMapInstance);
        isSatelliteMode = false;
      } else {
        // 切換回 Google 衛星混合地圖
        currentTileLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
          maxZoom: 19,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(csMapInstance);
        isSatelliteMode = true;
      }
    });
  }

  // AI 智慧助理按鈕
  const fabAiRobot = document.getElementById('fabAiRobot');
  if (fabAiRobot) {
    fabAiRobot.addEventListener('click', () => {
      alert('【智慧水網 AI 助理】\n目前第四區管理處（台中都會區）共有 14 件客服通報，其中大肚區與北屯區出現輿情集中熱區，建議啟動線上巡修調度！');
    });
  }

  // 關閉行政區彈窗
  const closePopupBtn = document.getElementById('closePopupBtn');
  const districtPopup = document.getElementById('districtPopup');
  if (closePopupBtn && districtPopup) {
    closePopupBtn.addEventListener('click', () => {
      districtPopup.style.display = 'none';
    });
  }

  // 成立案件 Modal 彈窗開關
  const btnCreateCase = document.getElementById('btnCreateCase');
  const createCaseModal = document.getElementById('createCaseModal');
  const closeCreateCaseBtn = document.getElementById('closeCreateCaseBtn');
  const cancelCaseBtn = document.getElementById('cancelCaseBtn');
  const submitCaseBtn = document.getElementById('submitCaseBtn');

  if (btnCreateCase && createCaseModal) {
    btnCreateCase.addEventListener('click', () => {
      // 動態生成隨機案件編號
      const randomCode = '202602' + Math.floor(10000 + Math.random() * 90000);
      const codeInput = document.getElementById('newCaseCode');
      if (codeInput) codeInput.value = randomCode;
      
      createCaseModal.classList.add('show');
    });
  }

  function hideCaseModal() {
    if (createCaseModal) createCaseModal.classList.remove('show');
  }

  if (closeCreateCaseBtn) closeCreateCaseBtn.addEventListener('click', hideCaseModal);
  if (cancelCaseBtn) cancelCaseBtn.addEventListener('click', hideCaseModal);

  // 表單送出新增案件
  if (submitCaseBtn) {
    submitCaseBtn.addEventListener('click', () => {
      const code = document.getElementById('newCaseCode')?.value || '20260259999';
      const town = document.getElementById('newCaseTown')?.value || '西屯區';
      const content = document.getElementById('newCaseContent')?.value || '民眾進線反映';
      const isEmergency = document.querySelector('input[name="caseLevel"]:checked')?.value === 'emergency';

      // 插入表格第一行
      const tbody = document.getElementById('csCasesTableBody');
      if (tbody) {
        const tr = document.createElement('tr');
        tr.className = 'case-row';
        tr.dataset.id = code;
        tr.innerHTML = `
          <td class="td-town">${town}</td>
          <td class="td-time">12日<br>即時</td>
          <td class="td-code">${code}</td>
          <td class="td-status"><span class="status-badge ${isEmergency ? 'st-unforward' : 'st-processing'}">${isEmergency ? '未後送' : '待確認處理中'}</span></td>
        `;
        tbody.prepend(tr);

        // 綁定點擊事件
        tr.addEventListener('click', () => {
          if (csMapInstance) csMapInstance.setView([24.16, 120.64], 13);
        });
      }

      alert(`案件 [${code}] 已成功成立並登錄至戰情清單！`);
      hideCaseModal();
    });
  }

  // 更多按鈕
  const btnMoreCases = document.getElementById('btnMoreCases');
  if (btnMoreCases) {
    btnMoreCases.addEventListener('click', () => {
      alert('已加載全部歷史客服進線紀錄（共 142 筆）。');
    });
  }
}

/**
 * 顯示行政區彈窗資訊
 */
function showDistrictPopup(name) {
  const districtPopup = document.getElementById('districtPopup');
  if (districtPopup) {
    districtPopup.style.display = 'block';
  }
}

// Marker 專屬 CSS 樣式動態注入
const style = document.createElement('style');
style.textContent = `
  .cs-custom-pin-wrap {
    background: transparent;
    border: none;
  }
  .case-map-marker {
    width: 26px;
    height: 32px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: 14px;
    font-weight: 900;
    box-shadow: 0 3px 8px rgba(0,0,0,0.5);
    position: relative;
    cursor: pointer;
    transition: transform 0.2s;
  }
  .case-map-marker:hover {
    transform: scale(1.15);
    z-index: 1000 !important;
  }
  .case-map-marker::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px 5px 0 5px;
    border-style: solid;
  }
  .marker-emergency {
    background: #ef4444;
  }
  .marker-emergency::after {
    border-color: #ef4444 transparent transparent transparent;
  }
  .marker-normal {
    background: #f97316;
  }
  .marker-normal::after {
    border-color: #f97316 transparent transparent transparent;
  }
`;
document.head.appendChild(style);

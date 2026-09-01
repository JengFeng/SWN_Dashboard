/**
 * ==========================================================================
 * 智慧水網營運資訊儀表板 - 前端互動與資料邏輯 (js/main.js)
 * 供工程師後續接手串接 API 參考
 * ==========================================================================
 */

// 1. 模擬資料 (Mock Data) 定義
const MOCK_DATA = {
  // 水壓點位統計區域假資料 (支援全區、重要供水點位與各行政區)
  pressureStats: {
    all: { normal: 19428, warning: 2449, danger: 2018, label: '全部點位' },
    'key-spots': { normal: 8520, warning: 1120, danger: 430, label: '重要供水點位' },
    north: { normal: 6200, warning: 850, danger: 620, label: '北部區域' },
    central: { normal: 5400, warning: 720, danger: 510, label: '中部區域' },
    south: { normal: 5800, warning: 680, danger: 710, label: '南部區域' },
    east: { normal: 2028, warning: 199, danger: 178, label: '東部區域' }
  },
  // 水質點位統計區域假資料
  qualityStats: {
    all: { normal: 3708, warning: 530, danger: 585, label: '全部點位' },
    'key-spots': { normal: 1820, warning: 210, danger: 130, label: '重要供水點位' },
    north: { normal: 1200, warning: 180, danger: 190, label: '北部區域' },
    central: { normal: 1050, warning: 150, danger: 145, label: '中部區域' },
    south: { normal: 1100, warning: 160, danger: 210, label: '南部區域' },
    east: { normal: 358, warning: 40, danger: 40, label: '東部區域' }
  },
  // 客服案件資料
  customerCases: {
    pending: 228,
    processing: 208,
    closed: 258
  },
  // 輿情分析資料
  sentiments: {
    positive: 18,
    neutral: 52,
    negative: 16
  }
};

// 儲存全域 Chart 實例
let chartInstances = {};

// 2. 初始化流程
document.addEventListener('DOMContentLoaded', () => {
  initCharts();
  bindEventListeners();
  startSystemClock();
});

/**
 * 3. 初始化所有圖表 (Chart.js) - 具備頁面元素存在性安全守衛
 */
function initCharts() {
  const gaugeEl = document.getElementById('reservoirGaugeChart');
  if (!gaugeEl) return; // 若當前頁面無圖表容器（如 supply-overview.html），安全略過

  // 3.1 水庫蓄水平均半環錶 (Gauge Chart)
  const gaugeCtx = gaugeEl.getContext('2d');
  chartInstances.gauge = new Chart(gaugeCtx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [58.3, 41.7],
        backgroundColor: ['#0d9488', '#e2e8f0'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  });

  // 3.2 水壓點位統計 (Donut Chart)
  const pressureEl = document.getElementById('pressureDonutChart');
  if (pressureEl) {
    const pressureCtx = pressureEl.getContext('2d');
    chartInstances.pressure = new Chart(pressureCtx, {
      type: 'doughnut',
      data: {
        labels: ['正常', '警戒', '異常'],
        datasets: [{
          data: [
            MOCK_DATA.pressureStats.all.normal,
            MOCK_DATA.pressureStats.all.warning,
            MOCK_DATA.pressureStats.all.danger
          ],
          backgroundColor: ['#0284c7', '#f97316', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: ${context.raw.toLocaleString()} 處`
            }
          }
        }
      }
    });
  }

  // 3.3 水質點位統計 (Donut Chart)
  const qualityEl = document.getElementById('waterQualityDonutChart');
  if (qualityEl) {
    const qualityCtx = qualityEl.getContext('2d');
    chartInstances.quality = new Chart(qualityCtx, {
      type: 'doughnut',
      data: {
        labels: ['正常', '警戒', '異常'],
        datasets: [{
          data: [
            MOCK_DATA.qualityStats.all.normal,
            MOCK_DATA.qualityStats.all.warning,
            MOCK_DATA.qualityStats.all.danger
          ],
          backgroundColor: ['#0284c7', '#f97316', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: ${context.raw.toLocaleString()} 處`
            }
          }
        }
      }
    });
  }

  // 3.4 客服案件統計 (Mini Donut)
  const caseEl = document.getElementById('customerCaseDonutChart');
  if (caseEl) {
    const caseCtx = caseEl.getContext('2d');
    chartInstances.customerCase = new Chart(caseCtx, {
      type: 'doughnut',
      data: {
        labels: ['未處理', '處理中', '已結案'],
        datasets: [{
          data: [
            MOCK_DATA.customerCases.pending,
            MOCK_DATA.customerCases.processing,
            MOCK_DATA.customerCases.closed
          ],
          backgroundColor: ['#ef4444', '#f97316', '#0284c7'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: ${context.raw} 件`
            }
          }
        }
      }
    });
  }

  // 3.5 輿情分析 (Mini Donut)
  const sentimentEl = document.getElementById('sentimentDonutChart');
  if (sentimentEl) {
    const sentimentCtx = sentimentEl.getContext('2d');
    chartInstances.sentiment = new Chart(sentimentCtx, {
      type: 'doughnut',
      data: {
        labels: ['正面', '中立', '負面'],
        datasets: [{
          data: [
            MOCK_DATA.sentiments.positive,
            MOCK_DATA.sentiments.neutral,
            MOCK_DATA.sentiments.negative
          ],
          backgroundColor: ['#10b981', '#0284c7', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: ${context.raw} 件`
            }
          }
        }
      }
    });
  }
}

/**
 * 4. DOM 事件綁定與互動處理
 */
function bindEventListeners() {
  // 4.1 側邊欄展開 / 關閉
  const openSidebarBtn = document.getElementById('openSidebarBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const sidebarDrawer = document.getElementById('sidebarDrawer');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (openSidebarBtn && sidebarDrawer && sidebarOverlay) {
    const toggleSidebar = (isOpen) => {
      sidebarDrawer.classList.toggle('open', isOpen);
      sidebarOverlay.classList.toggle('show', isOpen);
    };

    openSidebarBtn.addEventListener('click', () => toggleSidebar(true));
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
    sidebarOverlay.addEventListener('click', () => toggleSidebar(false));
  }

  // 4.1.1 側邊欄「外部情資」下拉選單切換
  const sidebarExternalToggle = document.getElementById('sidebarExternalToggle');
  if (sidebarExternalToggle) {
    sidebarExternalToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const parentDropdown = sidebarExternalToggle.closest('.sidebar-dropdown');
      if (parentDropdown) {
        parentDropdown.classList.toggle('open');
        const isOpen = parentDropdown.classList.contains('open');
        sidebarExternalToggle.setAttribute('aria-expanded', isOpen);
      }
    });
  }

  // =========================================================================
  // 4.2 頂部主模組選單互動
  // =========================================================================
  const viewDropdownBtn = document.getElementById('viewDropdownBtn');
  const viewDropdownMenu = document.getElementById('viewDropdownMenu');
  const currentViewText = document.getElementById('currentViewText');

  if (viewDropdownBtn && viewDropdownMenu) {
    viewDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      viewDropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      viewDropdownMenu.classList.remove('show');
    });

    // 供水營運概況 (具備子選單) 的 hover 與 click 支援 (桌機與行動端手風琴切換)
    document.querySelectorAll('.menu-parent-item').forEach(parentItem => {
      parentItem.addEventListener('mouseenter', () => {
        document.querySelectorAll('.menu-parent-item, .menu-direct-item').forEach(i => i.classList.remove('active'));
        parentItem.classList.add('active');
      });

      parentItem.addEventListener('click', (e) => {
        // 若點擊的是子選項自身，由子選項事件處理
        if (e.target.closest('.menu-sub-item')) return;
        e.stopPropagation();
        parentItem.classList.toggle('open');
      });
    });

    // 供水營運概況子項目點擊
    document.querySelectorAll('.menu-sub-item').forEach(subItem => {
      subItem.addEventListener('click', (e) => {
        // 若有自訂跳轉連結則執行跳轉，否則更新標題文字
        if (subItem.getAttribute('onclick')) return;

        e.stopPropagation();
        const parentLi = subItem.closest('.menu-parent-item');
        const parentName = parentLi.querySelector('span').textContent;
        const subName = subItem.querySelector('.sub-text').textContent;

        if (currentViewText) {
          currentViewText.textContent = `${parentName} - ${subName}`;
        }

        document.querySelectorAll('.menu-sub-item').forEach(item => {
          item.classList.remove('active');
          const icon = item.querySelector('.radio-icon');
          if (icon) {
            icon.className = 'fa-regular fa-circle radio-icon';
          }
        });
        subItem.classList.add('active');
        const activeIcon = subItem.querySelector('.radio-icon');
        if (activeIcon) {
          activeIcon.className = 'fa-solid fa-circle-dot radio-icon';
        }

        viewDropdownMenu.classList.remove('show');
      });
    });

    // 客服進線、事件應變、綜合案件分析 (單一功能直接點擊切換)
    document.querySelectorAll('.menu-direct-item').forEach(directItem => {
      directItem.addEventListener('mouseenter', () => {
        document.querySelectorAll('.menu-parent-item, .menu-direct-item').forEach(i => i.classList.remove('active'));
        directItem.classList.add('active');
      });

      directItem.addEventListener('click', (e) => {
        e.stopPropagation();
        const title = directItem.dataset.title;
        if (currentViewText) {
          currentViewText.textContent = title;
        }

        document.querySelectorAll('.menu-parent-item, .menu-direct-item').forEach(i => i.classList.remove('active'));
        directItem.classList.add('active');

        viewDropdownMenu.classList.remove('show');
      });
    });
  }

  // =========================================================================
  // 4.3 字級大小切換控制器 (小 / 中 / 大 - 支援按鈕與下拉選單雙向聯動)
  // =========================================================================
  const fsButtons = document.querySelectorAll('.fs-btn');
  const fontSizeSelect = document.getElementById('fontSizeSelect');

  function setFontSize(size) {
    document.body.classList.remove('font-sm', 'font-md', 'font-lg');
    if (size === 'md') {
      document.body.classList.add('font-md');
    } else if (size === 'lg') {
      document.body.classList.add('font-lg');
    } else {
      document.body.classList.add('font-sm');
    }

    // 同步按鈕狀態
    fsButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.size === size);
    });

    // 同步下拉選單狀態
    if (fontSizeSelect && fontSizeSelect.value !== size) {
      fontSizeSelect.value = size;
    }

    // 本地持久化儲存使用者字級偏好
    try {
      localStorage.setItem('user-font-size', size);
    } catch (e) {}
  }

  // 讀取持久化字級設定或預設為 md
  const initialFontSize = localStorage.getItem('user-font-size') || 'md';
  setFontSize(initialFontSize);

  fsButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const size = btn.dataset.size;
      setFontSize(size);
    });
  });

  if (fontSizeSelect) {
    fontSizeSelect.addEventListener('change', (e) => {
      setFontSize(e.target.value);
    });
  }

  // 4.4 視圖快速切換 (Dashboard vs GIS Map)
  const toggleDashboardView = document.getElementById('toggleDashboardView');
  const toggleMapView = document.getElementById('toggleMapView');
  const returnDashboardBtn = document.getElementById('returnDashboardBtn');

  if (toggleDashboardView) toggleDashboardView.addEventListener('click', () => switchView('dashboard'));
  if (toggleMapView) toggleMapView.addEventListener('click', () => switchView('map'));
  if (returnDashboardBtn) returnDashboardBtn.addEventListener('click', () => switchView('dashboard'));

  // 4.5 水壓點位統計篩選器互動
  const pressureFilter = document.getElementById('pressureFilterSelect');
  const pressureChip = document.getElementById('pressureChipLabel');

  if (pressureFilter && pressureChip && chartInstances.pressure) {
    pressureFilter.addEventListener('change', (e) => {
      const region = e.target.value;
      const data = MOCK_DATA.pressureStats[region];
      const total = data.normal + data.warning + data.danger;
      
      document.getElementById('pressureTotalVal').textContent = total.toLocaleString();
      pressureChip.textContent = data.label;
      chartInstances.pressure.data.datasets[0].data = [data.normal, data.warning, data.danger];
      chartInstances.pressure.update();
    });
  }

  // 4.6 水質點位統計篩選器互動
  const qualityFilter = document.getElementById('waterQualityFilterSelect');
  const qualityChip = document.getElementById('qualityChipLabel');

  if (qualityFilter && qualityChip && chartInstances.quality) {
    qualityFilter.addEventListener('change', (e) => {
      const region = e.target.value;
      const data = MOCK_DATA.qualityStats[region];
      const total = data.normal + data.warning + data.danger;
      
      document.getElementById('qualityTotalVal').textContent = total.toLocaleString();
      qualityChip.textContent = data.label;
      chartInstances.quality.data.datasets[0].data = [data.normal, data.warning, data.danger];
      chartInstances.quality.update();
    });
  }

  // 4.7 停水清冊 Modal 彈窗
  const viewMoreOutageBtn = document.getElementById('viewMoreOutageBtn');
  const outageModal = document.getElementById('outageModal');
  const closeOutageModalBtn = document.getElementById('closeOutageModalBtn');
  const closeOutageModalBtn2 = document.getElementById('closeOutageModalBtn2');
  const exportCsvBtn = document.getElementById('exportCsvBtn');

  if (viewMoreOutageBtn && outageModal) {
    const toggleOutageModal = (show) => {
      outageModal.classList.toggle('show', show);
    };

    viewMoreOutageBtn.addEventListener('click', () => toggleOutageModal(true));
    if (closeOutageModalBtn) closeOutageModalBtn.addEventListener('click', () => toggleOutageModal(false));
    if (closeOutageModalBtn2) closeOutageModalBtn2.addEventListener('click', () => toggleOutageModal(false));
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        alert('已成功觸發匯出停水事件報表 CSV');
      });
    }
  }

  // 4.8 左上角放大鏡圖示觸發「選擇應變事件」浮動視窗
  const globalSearchBtn = document.getElementById('globalSearchBtn');
  const eventSelectModal = document.getElementById('eventSelectModal');
  const closeEventModalBtn = document.getElementById('closeEventModalBtn');
  const eventStatusFilter = document.getElementById('eventStatusFilter');
  const incidentSelectDropdown = document.getElementById('incidentSelectDropdown');
  const refreshEventListBtn = document.getElementById('refreshEventListBtn');
  const confirmEventSwitchBtn = document.getElementById('confirmEventSwitchBtn');
  const headerTitleText = document.getElementById('headerTitleText');

  // 應變事件模擬資料庫 (開設中 / 已撤除)
  const INCIDENT_DATABASE = {
    active: [
      '農業部萬里溪堰塞湖-災害緊急應變小組',
      '0831豪雨',
      '山陀兒颱風應變專案',
      '南部地區水情乾旱專案應變小組'
    ],
    closed: [
      '0724凱米颱風應變小組 (已撤除)',
      '0403花蓮強震應變小組 (已撤除)',
      '0820西南氣流豪雨專案 (已撤除)',
      '112年杜蘇芮颱風應變專案 (已撤除)'
    ]
  };

  if (globalSearchBtn && eventSelectModal) {
    const toggleEventModal = (show) => {
      eventSelectModal.classList.toggle('show', show);
      eventSelectModal.setAttribute('aria-hidden', !show);
      if (show && incidentSelectDropdown) {
        setTimeout(() => incidentSelectDropdown.focus(), 120);
      }
    };

    // 點擊放大鏡展開事件選擇視窗
    globalSearchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleEventModal(true);
    });

    if (closeEventModalBtn) {
      closeEventModalBtn.addEventListener('click', () => toggleEventModal(false));
    }

    // 點擊遮罩背景關閉
    eventSelectModal.addEventListener('click', (e) => {
      if (e.target === eventSelectModal) {
        toggleEventModal(false);
      }
    });

    // ESC 鍵關閉
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && eventSelectModal.classList.contains('show')) {
        toggleEventModal(false);
      }
    });

    // 根據狀態篩選 (開設中 / 已撤除) 重新渲染事件下拉選單
    const eventTabs = document.querySelectorAll('.event-tab-btn');
    const renderIncidentOptions = (statusKey) => {
      if (!incidentSelectDropdown) return;
      const list = INCIDENT_DATABASE[statusKey] || [];
      incidentSelectDropdown.innerHTML = list.map(item => `<option value="${item}">${item}</option>`).join('');
    };

    // 頁籤點擊切換
    eventTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        eventTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const status = tab.dataset.status || 'active';
        renderIncidentOptions(status);
      });
    });

    // 更新按鈕微動態與重整
    if (refreshEventListBtn) {
      refreshEventListBtn.addEventListener('click', () => {
        const originalHtml = refreshEventListBtn.innerHTML;
        refreshEventListBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin"></i> 更新中...';
        setTimeout(() => {
          const currentStatus = document.querySelector('.event-tab-btn.active')?.dataset.status || 'active';
          renderIncidentOptions(currentStatus);
          refreshEventListBtn.innerHTML = originalHtml;
          alert('應變事件清單已完成即時同步更新。');
        }, 350);
      });
    }

    // 確定切換應變事件
    if (confirmEventSwitchBtn) {
      confirmEventSwitchBtn.addEventListener('click', () => {
        const selectedIncident = incidentSelectDropdown ? incidentSelectDropdown.value : '';
        if (selectedIncident && headerTitleText) {
          headerTitleText.textContent = `總管理處-${selectedIncident}`;
        }
        toggleEventModal(false);
      });
    }
  }

  // 4.9 右上角使用者圖示觸發「緊急應變戰情儀表板」登入浮動視窗
  const userProfileBtn = document.getElementById('userProfileBtn');
  const userAvatarBtn = document.getElementById('userAvatarBtn');
  const headerUserRole = document.getElementById('headerUserRole');
  const loginModal = document.getElementById('loginModal');
  const closeLoginModalBtn = document.getElementById('closeLoginModalBtn');
  const refreshCaptchaBtn = document.getElementById('refreshCaptchaBtn');
  const captchaDisplayBox = document.getElementById('captchaDisplayBox');
  const captchaCodeText = document.getElementById('captchaCodeText');
  const loginForm = document.getElementById('loginForm');
  const loginTabs = document.querySelectorAll('.login-tab-btn');

  if (loginModal && (userProfileBtn || userAvatarBtn)) {
    const toggleLoginModal = (show) => {
      loginModal.classList.toggle('show', show);
      loginModal.setAttribute('aria-hidden', !show);
      if (show) {
        generateNewCaptcha();
        const usernameInput = document.getElementById('loginUsername');
        if (usernameInput) setTimeout(() => usernameInput.focus(), 150);
      }
    };

    const triggerBtn = userProfileBtn || userAvatarBtn;
    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLoginModal(true);
    });

    // 鍵盤無障礙支援
    triggerBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleLoginModal(true);
      }
    });

    if (closeLoginModalBtn) {
      closeLoginModalBtn.addEventListener('click', () => toggleLoginModal(false));
    }

    // 點擊背景遮罩關閉
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        toggleLoginModal(false);
      }
    });

    // ESC 鍵關閉
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && loginModal.classList.contains('show')) {
        toggleLoginModal(false);
      }
    });

    // 頁籤切換（總管理處 / 區管理處）動態控制表單欄位
    const branchFields = document.querySelectorAll('.branch-only-field');
    const branchUnitSelect = document.getElementById('loginBranchUnitSelect');
    const branchRegionSelect = document.getElementById('loginBranchRegionSelect');

    loginTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        loginTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const unitType = tab.dataset.unit;
        
        if (unitType === 'branch') {
          branchFields.forEach(el => el.style.display = 'flex');
        } else {
          branchFields.forEach(el => el.style.display = 'none');
          if (branchUnitSelect) branchUnitSelect.selectedIndex = 0;
          if (branchRegionSelect) branchRegionSelect.selectedIndex = 0;
        }
      });
    });

    // 隨機產生 5 位數驗證碼
    function generateNewCaptcha() {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      if (captchaCodeText) {
        captchaCodeText.textContent = randomNum.toString();
      }
    }

    if (refreshCaptchaBtn) {
      refreshCaptchaBtn.addEventListener('click', generateNewCaptcha);
    }
    if (captchaDisplayBox) {
      captchaDisplayBox.addEventListener('click', generateNewCaptcha);
    }

    // 登入提交處理
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername')?.value.trim() || '未填寫';
        const activeTab = document.querySelector('.login-tab-btn.active')?.textContent || '總管理處';
        const isBranch = document.querySelector('.login-tab-btn.active')?.dataset.unit === 'branch';
        
        let extraInfo = '';
        let roleDisplay = activeTab;
        if (isBranch) {
          const unitText = branchUnitSelect?.options[branchUnitSelect.selectedIndex]?.text || '未指定區處';
          const regText = branchRegionSelect?.options[branchRegionSelect.selectedIndex]?.text || '全部轄區';
          extraInfo = `\n管理單位：${unitText}\n地區：${regText}`;
          roleDisplay = unitText.split(' ')[0] || activeTab;
        }

        if (headerUserRole) {
          headerUserRole.textContent = roleDisplay;
        }

        alert(`【登入成功】\n角色：${activeTab}${extraInfo}\n帳號：${username}\n已切換至緊急應變戰情身分。`);
        toggleLoginModal(false);
      });
    }
  }
}

/**
 * 5. 視圖切換函式 (Dashboard / GIS Map)
 */
function switchView(viewName) {
  const mainDashboard = document.getElementById('mainDashboardView');
  const gisMapView = document.getElementById('gisMapView');
  const btnDashboard = document.getElementById('toggleDashboardView');
  const btnMap = document.getElementById('toggleMapView');

  if (!mainDashboard) return;

  if (viewName === 'map') {
    mainDashboard.style.display = 'none';
    if (gisMapView) gisMapView.classList.remove('hide');
    if (btnDashboard) btnDashboard.classList.remove('active');
    if (btnMap) btnMap.classList.add('active');
  } else {
    mainDashboard.style.display = 'flex';
    if (gisMapView) gisMapView.classList.add('hide');
    if (btnDashboard) btnDashboard.classList.add('active');
    if (btnMap) btnMap.classList.remove('active');
  }
}

/**
 * 6. 系統即時時鐘更新
 */
function startSystemClock() {
  const clockEl = document.getElementById('systemClock');
  const updateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    if (clockEl) {
      clockEl.textContent = `${year}/${month}/${date} ${hours}:${minutes}`;
    }
  };
  updateTime();
  setInterval(updateTime, 60000);
}

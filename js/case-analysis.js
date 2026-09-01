/**
 * ==========================================================================
 * 綜合案件分析 (case-analysis.html) - 專屬行為腳本 (js/case-analysis.js)
 * 嚴格遵循 Prototype Skill SOP，具備 Mock Data、圖表渲染與完整互動
 * ==========================================================================
 */

// 1. Mock Data 集中管理
const CASE_ANALYSIS_MOCK = {
  // 縣市與鄉鎮市區對應字典
  townsMap: {
    all: ['請先選擇縣市'],
    taipei: ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'],
    newtaipei: ['板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '樹林區', '鶯歌區', '三峽區', '淡水區', '汐止區', '瑞芳區'],
    keelung: ['仁愛區', '信義區', '中正區', '中山區', '安樂區', '暖暖區', '七堵區'],
    taoyuan: ['桃園區', '中壢區', '平鎮區', '八德區', '楊梅區', '蘆竹區', '大溪區', '龜山區', '大園區', '觀音區', '新屋區', '龍潭區'],
    hsinchu_county: ['竹北市', '竹東鎮', '新埔鎮', '關西鎮', '湖口鄉', '新豐鄉', '芎林鄉', '橫山鄉', '北埔鄉', '寶山鄉'],
    hsinchu_city: ['東區', '北區', '香山區'],
    miaoli: ['苗栗市', '頭份市', '竹南鎮', '後龍鎮', '通霄鎮', '苑裡鎮', '卓蘭鎮', '造橋鄉', '西湖鄉', '頭屋鄉', '公館鄉', '銅鑼鄉'],
    taichung: ['西屯區', '北屯區', '南屯區', '西區', '北區', '中區', '東區', '南區', '豐原區', '大里區', '太平區', '清水區', '沙鹿區', '大肚區', '龍井區', '外埔區', '大甲區'],
    changhua: ['彰化市', '員林市', '和美鎮', '鹿港鎮', '溪湖鎮', '二林鎮', '田中鎮', '北斗鎮', '花壇鄉', '芬園鄉', '大村鄉'],
    nantou: ['南投市', '埔里鎮', '草屯鎮', '竹山鎮', '集集鎮', '名間鄉', '鹿谷鄉', '中寮鄉', '魚池鄉', '國姓鄉', '水里鄉', '信義鄉', '仁愛鄉'],
    yunlin: ['斗六市', '斗南鎮', '虎尾鎮', '西螺鎮', '土庫鎮', '北港鎮', '古坑鄉', '大埤鄉', '莿桐鄉', '林內鄉', '二崙鄉', '崙背鄉', '麥寮鄉'],
    chiayi_county: ['太保市', '朴子市', '布袋鎮', '大林鎮', '民雄鄉', '溪口鄉', '新港鄉', '六腳鄉', '東石鄉', '義竹鄉', '鹿草鄉', '水上鄉', '中埔鄉', '竹崎鄉', '梅山鄉', '番路鄉', '大埔鄉', '阿里山鄉'],
    chiayi_city: ['東區', '西區'],
    tainan: ['東區', '南區', '北區', '安南區', '安平區', '中西區', '新營區', '鹽水區', '白河區', '柳營區', '後壁區', '東山區', '麻豆區', '下營區', '六甲區', '官田區', '大內區', '佳里區', '學甲區', '西港區', '七股區', '將軍區', '北門區', '新化區', '善化區', '新市區', '安定區', '山上區', '玉井區', '楠西區', '南化區', '左鎮區', '仁德區', '歸仁區', '關廟區', '龍崎區', '永康區'],
    kaohsiung: ['新興區', '前金區', '苓雅區', '鹽埕區', '鼓山區', '旗津區', '前鎮區', '三民區', '楠梓區', '小港區', '左營區', '仁武區', '大社區', '岡山區', '路竹區', '阿蓮區', '田寮區', '燕巢區', '橋頭區', '梓官區', '彌陀區', '永安區', '湖內區', '鳳山區', '大寮區', '林園區', '鳥松區', '大樹區', '旗山區', '美濃區', '六龜區', '內門區', '杉林區', '甲仙區', '桃源區', '那瑪夏區', '茂林區', '茄萣區'],
    pingtung: ['屏東市', '潮州鎮', '東港鎮', '恆春鎮', '萬丹鄉', '長治鄉', '麟洛鄉', '九如鄉', '里港鄉', '鹽埔鄉', '高樹鄉', '萬巒鄉', '內埔鄉', '竹田鄉', '新埤鄉', '枋寮鄉', '新園鄉', '崁頂鄉', '林邊鄉', '南州鄉', '佳冬鄉', '琉球鄉', '車城鄉', '滿州鄉', '枋山鄉', '三地門鄉', '霧臺鄉', '瑪家鄉', '泰武鄉', '來義鄉', '春日鄉', '獅子鄉', '牡丹鄉'],
    yilan: ['宜蘭市', '羅東鎮', '蘇澳鎮', '頭城鎮', '礁溪鄉', '壯圍鄉', '員山鄉', '冬山鄉', '五結鄉', '三星鄉', '大同鄉', '南澳鄉'],
    hualien: ['花蓮市', '鳳林鎮', '玉里鎮', '新城鄉', '吉安鄉', '壽豐鄉', '光復鄉', '豐濱鄉', '瑞穗鄉', '富里鄉', '秀林鄉', '萬榮鄉', '卓溪鄉'],
    taitung: ['臺東市', '成功鎮', '關山鎮', '卑南鄉', '大武鄉', '太麻里鄉', '東河鄉', '長濱鄉', '鹿野鄉', '池上鄉', '綠島鄉', '延平鄉', '海端鄉', '達仁鄉', '金峰鄉', '蘭嶼鄉'],
    penghu: ['馬公市', '湖西鄉', '白沙鄉', '西嶼鄉', '望安鄉', '七美鄉']
  },

  // 服務類別細項字典
  subCategoriesMap: {
    all: ['請選擇服務類別細項'],
    water_quality: ['水質混濁', '水中異味/異色', '餘氯偏高/偏低', '水質送驗諮詢', '其他水質異常'],
    water_pressure: ['高地/末端水壓偏低', '水壓驟降', '管網無水', '水壓偏高震盪'],
    pipe_leak: ['路面漏水/冒水', '水表前後漏水', '制水閥/排氣閥漏水', '消防栓損壞漏水', '主管破裂'],
    billing: ['水費計費疑義', '過戶/分攤手續', '電子帳單申請', '水表指針異常校驗', '繳費證明申請'],
    outage_query: ['計畫性停水進度', '突發性停水範圍', '復水時間查詢', '臨時供水站據點'],
    other: ['營業項目諮詢', '工程施作通報', '系統反映建議', '其他業務諮詢']
  },

  // 案件分布詳細數據 (對應截圖 18 個縣市圓餅圖)
  distribution: [
    { city: '高雄市', percent: 22.17, count: 767, color: '#00bcd4' },
    { city: '台中市', percent: 20.55, count: 711, color: '#3b82f6' },
    { city: '新北市', percent: 13.38, count: 463, color: '#8b5cf6' },
    { city: '台北市', percent: 10.61, count: 367, color: '#ec4899' },
    { city: '新竹縣', percent: 9.68, count: 335, color: '#10b981' },
    { city: '台南市', percent: 3.18, count: 110, color: '#f59e0b' },
    { city: '桃園市', percent: 2.86, count: 99, color: '#ef4444' },
    { city: '新竹市', percent: 2.81, count: 97, color: '#6366f1' },
    { city: '宜蘭縣', percent: 2.17, count: 75, color: '#14b8a6' },
    { city: '苗栗縣', percent: 1.59, count: 55, color: '#84cc16' },
    { city: '基隆市', percent: 1.59, count: 55, color: '#0284c7' },
    { city: '嘉義縣', percent: 1.48, count: 51, color: '#f97316' },
    { city: '屏東縣', percent: 1.33, count: 46, color: '#a855f7' },









































































































































































            boxWidth: 20,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { family: "'Noto Sans TC', sans-serif", size: 11, weight: '700' },
            color: '#334155'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          padding: 8,
          titleFont: { size: 11 },
          bodyFont: { size: 12, weight: 'bold' }
        }
      },
      scales: {
        x: {
          grid: { display: true, color: '#f1f5f9' },
          ticks: {
            font: { size: 10 },
            color: '#64748b',
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 5
          }
        },
        y: {
          min: 0,
          max: 210,
          ticks: {
            stepSize: 30,
            font: { size: 10 },

































































































































    tbody.appendChild(tr);
  });
}

/**
 * 6. DOM 事件綁定與互動處理
 */
function bindCaseAnalysisEvents() {
  // 6.1 查詢模式切換 (事件查詢 vs 時間區間查詢)
  const btnModeEvent = document.getElementById('btnModeEvent');
  const btnModeRange = document.getElementById('btnModeRange');
  const eventSelectGroup = document.getElementById('eventSelectGroup');
  const timeRangeGroup = document.getElementById('timeRangeGroup');

  if (btnModeEvent && btnModeRange) {
    btnModeEvent.addEventListener('click', () => {
      btnModeEvent.classList.add('active');
      btnModeRange.classList.remove('active');
      eventSelectGroup.classList.remove('hide');
      timeRangeGroup.classList.add('hide');
    });

    btnModeRange.addEventListener('click', () => {
      btnModeRange.classList.add('active');
      btnModeEvent.classList.remove('active');
      timeRangeGroup.classList.remove('hide');
      eventSelectGroup.classList.add('hide');
    });
  }

  // 6.2 行政維度切換 (縣市 vs 區處)
  const btnDimCity = document.getElementById('btnDimCity');
  const btnDimDistrict = document.getElementById('btnDimDistrict');
  if (btnDimCity && btnDimDistrict) {
    btnDimCity.addEventListener('click', () => {
      btnDimCity.classList.add('active');
      btnDimDistrict.classList.remove('active');
    });
    btnDimDistrict.addEventListener('click', () => {
      btnDimDistrict.classList.add('active');
      btnDimCity.classList.remove('active');
    });
  }

  // 6.3 縣市動態聯動鄉鎮市區
  const citySelect = document.getElementById('citySelect');
  const townSelect = document.getElementById('townSelect');
  if (citySelect && townSelect) {
    citySelect.addEventListener('change', (e) => {
      const cityKey = e.target.value;
      const towns = CASE_ANALYSIS_MOCK.townsMap[cityKey] || ['全區'];



















        const opt = document.createElement('option');
        opt.value = sc;
        opt.textContent = sc;
        serviceSubCategorySelect.appendChild(opt);
      });
    });
  }

  // 6.5 左側篩選面板折疊/展開 (桌面端側欄滑動收合 / 手機RWD視圖切換)
  const toggleFilterSidebarBtn = document.getElementById('toggleFilterSidebarBtn');
  const filterSidebar = document.getElementById('filterSidebar');
  const mainContainer = document.querySelector('.analysis-main-container');

  function toggleSidebarView() {
    if (!filterSidebar) return;
    const isCollapsed = filterSidebar.classList.toggle('collapsed');
    if (toggleFilterSidebarBtn) {
      toggleFilterSidebarBtn.classList.toggle('collapsed', isCollapsed);
    }
    if (mainContainer) {
      mainContainer.classList.toggle('sidebar-collapsed', isCollapsed);
    }
  }

  if (toggleFilterSidebarBtn) {
    toggleFilterSidebarBtn.addEventListener('click', toggleSidebarView);
  }

  // 6.6 「查詢」按鈕點擊觸發動態重算 (手機 RWD 下查詢後自動切換至統計圖表視圖)
  const btnQuerySubmit = document.getElementById('btnQuerySubmit');
  if (btnQuerySubmit) {
    btnQuerySubmit.addEventListener('click', () => {
      // 隨機微調 KPI 模擬查詢結果
      const totalEl = document.getElementById('kpiTotalCases');
      if (totalEl) {
        const cur = parseInt(totalEl.textContent) || 3460;
        totalEl.textContent = (cur + Math.floor(Math.random() * 10 - 5)).toLocaleString();
      }

      // 手機 RWD 寬度下自動切換至統計圖表視圖
  const btnQuerySubmit = document.getElementById('btnQuerySubmit');
  if (btnQuerySubmit) {
    btnQuerySubmit.addEventListener('click', () => {
      // 隨機微調 KPI 模擬查詢結果
      const totalEl = document.getElementById('kpiTotalCases');
      if (totalEl) {
        const cur = parseInt(totalEl.textContent) || 3460;
        totalEl.textContent = (cur + Math.floor(Math.random() * 10 - 5)).toLocaleString();
      }

      // 手機 RWD 寬度下自動切換至統計圖表視圖
      if (window.innerWidth <= 900) {
        filterSidebar.classList.add('collapsed');
        if (toggleFilterSidebarBtn) toggleFilterSidebarBtn.classList.add('collapsed');
        if (mainContainer) mainContainer.classList.add('sidebar-collapsed');
      } else {
        alert('已依據所選條件重新檢索綜合案件統計數據與 GIS 熱點！');
      }
    });
  }

  // 6.7 檢視案件明細彈窗
  const btnViewCaseDetail = document.getElementById('btnViewCaseDetail');
  const caseDetailModal = document.getElementById('caseDetailModal');
  const closeCaseDetailBtn = document.getElementById('closeCaseDetailBtn');

  if (btnViewCaseDetail && caseDetailModal) {
    btnViewCaseDetail.addEventListener('click', () => {
      caseDetailModal.classList.add('show');
    });
  }
  if (closeCaseDetailBtn && caseDetailModal) {
    closeCaseDetailBtn.addEventListener('click', () => {
      caseDetailModal.classList.remove('show');
    });
  }

  // 案件明細表格搜尋過濾
  const modalCaseSearchInput = document.getElementById('modalCaseSearchInput');
  if (modalCaseSearchInput) {
    modalCaseSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      const filtered = CASE_ANALYSIS_MOCK.cases.filter(c => 
        c.code.includes(q) || c.location.toLowerCase().includes(q) || c.cat.includes(q) || c.subCat.includes(q)
      );
      renderCaseDetailTable(filtered);
    });
  }

  // 6.8 報表匯出彈窗
  const btnExportReport = document.getElementById('btnExportReport');
  const exportReportModal = document.getElementById('exportReportModal');
  const closeExportModalBtn = document.getElementById('closeExportModalBtn');
  const btnCancelExport = document.getElementById('btnCancelExport');
  const btnConfirmExport = document.getElementById('btnConfirmExport');

  if (btnExportReport && exportReportModal) {
    btnExportReport.addEventListener('click', () => {
      exportReportModal.classList.add('show');
    });
  }
  const hideExportModal = () => exportReportModal?.classList.remove('show');
  if (closeExportModalBtn) closeExportModalBtn.addEventListener('click', hideExportModal);
  if (btnCancelExport) btnCancelExport.addEventListener('click', hideExportModal);
  if (btnConfirmExport) {
    btnConfirmExport.addEventListener('click', () => {
      const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'excel';
      alert(`已成功產製並匯出 [綜合案件分析報表.${format}]！`);
      hideExportModal();
    });
  }

  // 6.9 連線趨勢分析時間顆粒度切換 (分 / 時 / 日)
  const connPills = document.querySelectorAll('#connScalePills .btn-ctrl-pill');
  connPills.forEach(pill => {
    pill.addEventListener('click', () => {
      connPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  // 6.10 案件熱點地圖經緯度即時提示
  const heatCanvas = document.getElementById('heatMapCanvasWrap');
  const coordTxt = document.getElementById('mapCoordTxt');
  if (heatCanvas && coordTxt) {
    heatCanvas.addEventListener('mousemove', (e) => {
      const rect = heatCanvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width).toFixed(4);
      const y = ((e.clientY - rect.top) / rect.height).toFixed(4);
      const lng = (119.2 + x * 2.8).toFixed(6);
      const lat = (25.3 - y * 3.4).toFixed(6);
      coordTxt.textContent = `${lng} ${lat}`;
    });
  }
}


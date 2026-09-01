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

  // 服務類別佔比 (依據截圖 2：目前為單一大圓餅 100% 未分類)
  serviceCategories: [
    { name: '未分類', count: 3460, percent: 100, color: '#448aff' }
  ],

  // 案件分布詳細數據 (1. 依縣市視角：18 個縣市完整佔比)
  distributionByCity: [
    { name: '高雄市', percent: 22.17, count: 767, color: '#00bcd4' },
    { name: '台中市', percent: 20.55, count: 711, color: '#ff9800' },
    { name: '新北市', percent: 13.38, count: 463, color: '#9c27b0' },
    { name: '臺北市', percent: 10.61, count: 367, color: '#4caf50' },
    { name: '新竹縣', percent: 9.68, count: 335, color: '#2196f3' },
    { name: '臺南市', percent: 3.18, count: 110, color: '#e91e63' },
    { name: '桃園市', percent: 2.86, count: 99, color: '#009688' },
    { name: '新竹市', percent: 2.81, count: 97, color: '#ff5722' },
    { name: '宜蘭縣', percent: 2.17, count: 75, color: '#3f51b5' },
    { name: '苗栗縣', percent: 1.59, count: 55, color: '#cddc39' },
    { name: '基隆市', percent: 1.59, count: 55, color: '#673ab7' },
    { name: '嘉義縣', percent: 1.48, count: 51, color: '#ffeb3b' },
    { name: '屏東縣', percent: 1.33, count: 46, color: '#795548' },
    { name: '雲林縣', percent: 1.01, count: 35, color: '#00e676' },
    { name: '彰化縣', percent: 1.01, count: 35, color: '#ff1744' },
    { name: '花蓮縣', percent: 0.55, count: 19, color: '#651fff' },
    { name: '台東縣', percent: 0.38, count: 13, color: '#00b0ff' },
    { name: '澎湖縣', percent: 0.29, count: 10, color: '#f50057' }
  ],

  // 案件分布詳細數據 (2. 依管轄區/區處視角：一區處~十二區處佔比)
  distributionByDistrict: [
    { name: '第七區管理處 (高屏)', percent: 23.50, count: 813, color: '#00bcd4' },
    { name: '第四區管理處 (台中南投)', percent: 21.20, count: 734, color: '#ff9800' },
    { name: '第十二區管理處 (新北板橋)', percent: 14.10, count: 488, color: '#9c27b0' },
    { name: '第一區管理處 (基隆新北)', percent: 11.20, count: 388, color: '#4caf50' },
    { name: '第三區管理處 (竹苗)', percent: 10.50, count: 363, color: '#2196f3' },
    { name: '第六區管理處 (台南)', percent: 6.80, count: 235, color: '#e91e63' },
    { name: '第二區管理處 (桃園)', percent: 4.60, count: 159, color: '#009688' },
    { name: '第五區管理處 (雲嘉)', percent: 3.20, count: 111, color: '#ff5722' },
    { name: '第十一區管理處 (彰化)', percent: 2.10, count: 73, color: '#3f51b5' },
    { name: '第八區管理處 (宜蘭)', percent: 1.40, count: 48, color: '#cddc39' },
    { name: '第九區管理處 (花蓮)', percent: 0.80, count: 28, color: '#673ab7' },
    { name: '第十區管理處 (台東)', percent: 0.60, count: 20, color: '#795548' }
  ],

  // 案件趨勢圖數據 (1. 依縣市鄉鎮視角)
  townTrendByCity: {
    labels: [
      '15:00', '18:00', '21:00', '00:00', '03:00', '06:00', '09:00', 
      '12:00', '15:00', '18:00', '21:00', '00:00', '03:00', '06:00', '09:00', '12:00'
    ],
    datasets: [
      {
        label: '高雄市',
        data: [18, 25, 38, 28, 15, 12, 18, 42, 38, 43, 10, 8, 12, 35, 18, 28],
        borderColor: '#e53935',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        tension: 0.1,
        pointRadius: 3,
        pointBackgroundColor: '#e53935',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1
      },
      {
        label: '台中市',
        data: [12, 15, 22, 18, 8, 10, 36, 26, 32, 40, 15, 6, 8, 46, 22, 34],
        borderColor: '#43a047',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        tension: 0.1,
        pointRadius: 3,
        pointBackgroundColor: '#43a047',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1
      },
      {
        label: '新北市',
        data: [8, 12, 19, 14, 10, 8, 14, 28, 22, 25, 12, 10, 14, 20, 12, 16],
        borderColor: '#fbc02d',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        tension: 0.1,
        pointRadius: 3,
        pointBackgroundColor: '#fbc02d',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1
      },
      {
        label: '桃園市',
        data: [5, 8, 14, 10, 6, 5, 10, 18, 14, 18, 8, 4, 6, 15, 8, 12],
        borderColor: '#8e24aa',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        tension: 0.1,
        pointRadius: 3,
        pointBackgroundColor: '#8e24aa',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1
      },
      {
        label: '台南市',
        data: [6, 10, 16, 12, 5, 4, 8, 15, 12, 14, 6, 3, 5, 12, 6, 9],
        borderColor: '#8d6e63',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        tension: 0.1,
        pointRadius: 3,
        pointBackgroundColor: '#8d6e63',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1
      }
    ]
  },

  // 案件趨勢圖數據 (2. 依管轄區/區處視角)
  townTrendByDistrict: {
    labels: [
      '15:00', '18:00', '21:00', '00:00', '03:00', '06:00', '09:00', 
      '12:00', '15:00', '18:00', '21:00', '00:00', '03:00', '06:00', '09:00', '12:00'
    ],
    datasets: [
      {
        label: '第七區處 (高屏)',
        data: [20, 28, 42, 32, 18, 14, 22, 46, 42, 48, 12, 10, 15, 38, 20, 32],
        borderColor: '#0284c7',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        tension: 0.1,
        pointRadius: 3,
        pointBackgroundColor: '#0284c7',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1
      },
      {
        label: '第四區處 (台中)',
        data: [15, 18, 25, 20, 10, 12, 38, 30, 35, 44, 18, 8, 10, 48, 25, 38],
        borderColor: '#f97316',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        tension: 0.1,
        pointRadius: 3,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1
      },
      {
        label: '第十二區處 (新北)',
        data: [10, 14, 22, 16, 12, 10, 16, 32, 25, 28, 14, 12, 16, 24, 15, 20],
        borderColor: '#8b5cf6',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        tension: 0.1,
        pointRadius: 3,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1
      },
      {
        label: '第三區處 (竹苗)',
        data: [8, 10, 16, 12, 8, 6, 12, 22, 18, 20, 10, 6, 8, 18, 10, 15],
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        tension: 0.1,
        pointRadius: 3,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1
      },
      {
        label: '第六區處 (台南)',
        data: [6, 8, 14, 10, 6, 5, 10, 18, 14, 16, 8, 5, 7, 14, 8, 12],
        borderColor: '#ec4899',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        tension: 0.1,
        pointRadius: 3,
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1
      }
    ]
  },

  // 案件明細清單 Mock Data
  cases: [
    { code: '20260259955', time: '12日 12:42', location: '台中市 東區', cat: '管線漏水', subCat: '路面漏水/冒水', status: 'draft', statusText: '建立中/未送件' },
    { code: '20260259945', time: '12日 12:37', location: '台中市 西屯區', cat: '水壓異常', subCat: '高地末端水壓低', status: 'pending', statusText: '待確認處理' },
    { code: '20260259934', time: '12日 12:34', location: '台中市 西屯區', cat: '水費與其他', subCat: '水表指針異常校驗', status: 'done', statusText: '處理完成結束' },
    { code: '20260259929', time: '12日 12:31', location: '台中市 北屯區', cat: '管線漏水', subCat: '主管破裂', status: 'pending', statusText: '待確認處理' },
    { code: '20260259919', time: '12日 12:29', location: '台中市 北屯區', cat: '水質疑義', subCat: '水質混濁', status: 'done', statusText: '處理完成結束' },
    { code: '20260259921', time: '12日 12:29', location: '台中市 外埔區', cat: '水壓異常', subCat: '管網無水', status: 'pending', statusText: '待確認處理' },
    { code: '20260259916', time: '12日 12:28', location: '台中市 南屯區', cat: '管線漏水', subCat: '水表前後漏水', status: 'draft', statusText: '建立中/未送件' },
    { code: '20260259910', time: '12日 12:27', location: '台中市 西區', cat: '水質疑義', subCat: '水中異味', status: 'done', statusText: '處理完成結束' },
    { code: '20260259899', time: '12日 12:21', location: '台中市 北屯區', cat: '停水諮詢', subCat: '計畫性停水進度', status: 'done', statusText: '處理完成結束' },
    { code: '20260259897', time: '12日 12:21', location: '台中市 大里區', cat: '管線漏水', subCat: '路面冒水', status: 'pending', statusText: '待確認處理' }
  ]
};

// 2. 圖表實例變數與分頁控制
let serviceCategoryChart = null;
let caseDistributionChart = null;
let connectionTrendChart = null;
let townTrendChart = null;

// 當前視角模式 ('city' 或 'district')
let currentDistMode = 'city';
let currentTownTrendMode = 'city';

// 圖例分頁目前頁碼
let distLegendPage = 1;
let townLegendPage = 1;
const ITEMS_PER_PAGE = 5;

/**
 * 3.1 初始化服務類別統計圓餅圖
 */
function initServiceCategoryPieChart() {
  const ctx = document.getElementById('serviceCategoryPieChart');
  if (!ctx) return;

  serviceCategoryChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['未分類'],
      datasets: [{
        data: [3460],
        backgroundColor: ['#448aff'],
        borderWidth: 1,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            boxWidth: 12,
            font: { family: "'Noto Sans TC', sans-serif", size: 11, weight: '600' },
            color: '#334155',
            padding: 8
          }
        },
        tooltip: {
          callbacks: {
            label: (item) => ` 未分類: 3,460 件 (100%)`
          }
        }
      }
    }
  });
}

/**
 * 3.2 渲染並更新縣市/管轄區案件分布圓餅圖 (支援視角切換與標頭連動)
 */
function updateCaseDistributionChart(mode) {
  currentDistMode = mode || 'city';
  const cardTitleEl = document.getElementById('caseDistCardTitle');
  const btnPill = document.getElementById('btnTotalCasesMode');
  const selectEl = document.getElementById('caseDistSelect');

  // 動態更新卡片標頭與按鈕狀態
  if (currentDistMode === 'city') {
    if (cardTitleEl) cardTitleEl.textContent = '案件分布統計-依縣市';
    if (btnPill) btnPill.textContent = '縣市';
    if (selectEl && selectEl.value !== 'city') selectEl.value = 'city';
  } else {
    if (cardTitleEl) cardTitleEl.textContent = '案件分布統計-依管轄區';
    if (btnPill) btnPill.textContent = '管轄區';
    if (selectEl && selectEl.value !== 'district') selectEl.value = 'district';
  }

  const dataList = currentDistMode === 'city' 
    ? CASE_ANALYSIS_MOCK.distributionByCity 
    : CASE_ANALYSIS_MOCK.distributionByDistrict;

  const ctx = document.getElementById('caseDistributionPieChart');
  if (!ctx) return;

  if (caseDistributionChart) {
    caseDistributionChart.data.labels = dataList.map(d => d.name);
    caseDistributionChart.data.datasets[0].data = dataList.map(d => d.count);
    caseDistributionChart.data.datasets[0].backgroundColor = dataList.map(d => d.color);
    caseDistributionChart.update();
  } else {
    caseDistributionChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: dataList.map(d => d.name),
        datasets: [{
          data: dataList.map(d => d.count),
          backgroundColor: dataList.map(d => d.color),
          borderWidth: 1,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.label}: ${item.raw.toLocaleString()} 件 (${((item.raw / 3460) * 100).toFixed(2)}%)`
            }
          }
        }
      }
    });
  }

  // 重置分頁並渲染下方圖例
  distLegendPage = 1;
  renderDistLegend(dataList);
}

/**
 * 渲染分布圖的分頁圖例
 */
function renderDistLegend(dataList) {
  const itemsWrap = document.getElementById('distLegendItems');
  const pageIndicator = document.getElementById('distPageIndicator');
  if (!itemsWrap || !pageIndicator) return;

  const totalPages = Math.ceil(dataList.length / ITEMS_PER_PAGE) || 1;
  if (distLegendPage > totalPages) distLegendPage = totalPages;
  if (distLegendPage < 1) distLegendPage = 1;

  pageIndicator.textContent = `${distLegendPage}/${totalPages}`;

  const start = (distLegendPage - 1) * ITEMS_PER_PAGE;
  const pageItems = dataList.slice(start, start + ITEMS_PER_PAGE);

  itemsWrap.innerHTML = '';
  pageItems.forEach(item => {
    const badge = document.createElement('span');
    badge.className = 'legend-badge-item';
    badge.innerHTML = `<span class="badge-dot" style="background:${item.color};"></span> ${item.name}`;
    itemsWrap.appendChild(badge);
  });
}

/**
 * 3.3 初始化關鍵趨勢分析折線圖
 */
function initConnectionTrendLineChart() {
  const ctx = document.getElementById('connectionTrendLineChart');
  if (!ctx) return;

  const labels = [
    '00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', 
    '14:00', '16:00', '18:00', '20:00', '22:00', 
    '00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00'
  ];

  connectionTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '趨勢值',
        data: [15, 118, 135, 160, 68, 45, 50, 42, 115, 140, 105, 120, 148, 92, 60, 32, 15, 6, 8, 15, 88, 178].slice(0, 19),
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.05)',
        borderWidth: 2,
        fill: false,
        tension: 0.15,
        pointBackgroundColor: '#2196f3',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointRadius: 3,
        pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 14,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 11, weight: '700' },
            color: '#334155'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          padding: 8
        }
      },
      scales: {
        x: {
          grid: { color: '#f1f5f9' },
          ticks: {
            font: { size: 10 },
            color: '#64748b',
            maxRotation: 0,
            callback: function(val, index) {
              if (index === 0) return '06/11 00:00';
              if (index === 6) return '06/11 12:00';
              if (index === 12) return '06/12 00:00';
              if (index === 18) return '06/12 12:00';
              return '';
            }
          }
        },
        y: {
          min: 0,
          max: 210,
          grid: { color: '#f1f5f9' },
          ticks: {
            stepSize: 30,
            font: { size: 10 },
            color: '#64748b'
          },
          title: {
            display: true,
            text: '案件數',
            font: { size: 10, weight: 'bold' },
            color: '#64748b'
          }
        }
      }
    }
  });
}

/**
 * 3.4 渲染並更新案件趨勢圖-依縣市鄉鎮/管轄區 (支援視角切換與標頭連動)
 */
function updateTownTrendChart(mode) {
  currentTownTrendMode = mode || 'city';
  const cardTitleEl = document.getElementById('townTrendCardTitle');
  const btnPill = document.getElementById('btnRegionAdmin');
  const selectEl = document.getElementById('regionCtrlSelect');

  // 動態更新卡片標頭與控制項
  if (currentTownTrendMode === 'city') {
    if (cardTitleEl) cardTitleEl.textContent = '案件趨勢圖-依縣市鄉鎮';
    if (btnPill) btnPill.textContent = '縣市';
    if (selectEl && selectEl.value !== 'city') selectEl.value = 'city';
  } else {
    if (cardTitleEl) cardTitleEl.textContent = '案件趨勢圖-依管轄區';
    if (btnPill) btnPill.textContent = '管轄區';
    if (selectEl && selectEl.value !== 'jurisdiction') selectEl.value = 'jurisdiction';
  }

  const trendData = currentTownTrendMode === 'city' 
    ? CASE_ANALYSIS_MOCK.townTrendByCity 
    : CASE_ANALYSIS_MOCK.townTrendByDistrict;

  const ctx = document.getElementById('townTrendMultiLineChart');
  if (!ctx) return;

  if (townTrendChart) {
    townTrendChart.data.labels = trendData.labels;
    townTrendChart.data.datasets = trendData.datasets;
    townTrendChart.update();
  } else {
    townTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: trendData.labels,
        datasets: trendData.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: 8
          }
        },
        scales: {
          x: {
            grid: { color: '#f1f5f9' },
            ticks: {
              font: { size: 9.5 },
              color: '#64748b',
              maxRotation: 0,
              callback: function(val, index) {
                if (index === 1) return '18:00';
                if (index === 3) return '06/11';
                if (index === 5) return '06:00';
                if (index === 7) return '12:00';
                if (index === 9) return '18:00';
                if (index === 11) return '06/12';
                if (index === 13) return '06:00';
                if (index === 15) return '12:00';
                return '';
              }
            }
          },
          y: {
            min: 0,
            max: 50,
            grid: { color: '#f1f5f9' },
            ticks: {
              stepSize: 10,
              font: { size: 10 },
              color: '#64748b'
            },
            title: {
              display: true,
              text: '數量',
              font: { size: 10, weight: 'bold' },
              color: '#64748b'
            }
          }
        }
      }
    });
  }

  // 渲染下方圖例
  renderTownLegend(trendData.datasets);
}

/**
 * 渲染趨勢圖的分頁圖例
 */
function renderTownLegend(datasets) {
  const itemsWrap = document.getElementById('townLegendItems');
  const pageIndicator = document.getElementById('townPageIndicator');
  if (!itemsWrap || !pageIndicator) return;

  pageIndicator.textContent = '1/4';
  itemsWrap.innerHTML = '';
  datasets.forEach(item => {
    const badge = document.createElement('span');
    badge.className = 'legend-badge-item';
    badge.innerHTML = `<span class="badge-dot-circle" style="background:${item.borderColor};"></span> ${item.label}`;
    itemsWrap.appendChild(badge);
  });
}

/**
 * 4. 渲染案件明細表格
 */
function renderCaseDetailTable(cases) {
  const tbody = document.getElementById('caseDetailTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  cases.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 700; color: #0284c7;">${c.code}</td>
      <td style="color: #64748b; font-size: 11px;">${c.time}</td>
      <td style="font-weight: 600;">${c.location}</td>
      <td><span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-size: 10.5px;">${c.cat}</span></td>
      <td style="color: #334155;">${c.subCat}</td>
      <td><span class="badge-status badge-${c.status}">${c.statusText}</span></td>
      <td><a class="btn-view-link" href="javascript:void(0)" onclick="alert('檢視案件 [${c.code}] 詳細歷程與工程派工派單！')">詳情</a></td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * 5. DOM 事件綁定與互動處理
 */
function bindCaseAnalysisEvents() {
  // 5.1 查詢模式切換 (事件查詢 vs 時間區間查詢)
  const btnModeEvent = document.getElementById('btnModeEvent');
  const btnModeRange = document.getElementById('btnModeRange');
  const eventSelectGroup = document.getElementById('eventSelectGroup');
  const timeRangeGroup = document.getElementById('timeRangeGroup');

  if (btnModeEvent && btnModeRange) {
    btnModeEvent.addEventListener('click', () => {
      btnModeEvent.classList.add('active');
      btnModeRange.classList.remove('active');
      if (eventSelectGroup) eventSelectGroup.classList.remove('hide');
      if (timeRangeGroup) timeRangeGroup.classList.add('hide');
    });

    btnModeRange.addEventListener('click', () => {
      btnModeRange.classList.add('active');
      btnModeEvent.classList.remove('active');
      if (timeRangeGroup) timeRangeGroup.classList.remove('hide');
      if (eventSelectGroup) eventSelectGroup.classList.add('hide');
    });
  }

  // 5.2 左側篩選欄維度切換 (縣市 vs 區處) -> 雙向聯動中段與下段圖表
  const btnDimCity = document.getElementById('btnDimCity');
  const btnDimDistrict = document.getElementById('btnDimDistrict');
  if (btnDimCity && btnDimDistrict) {
    btnDimCity.addEventListener('click', () => {
      btnDimCity.classList.add('active');
      btnDimDistrict.classList.remove('active');
      updateCaseDistributionChart('city');
      updateTownTrendChart('city');
    });
    btnDimDistrict.addEventListener('click', () => {
      btnDimDistrict.classList.add('active');
      btnDimCity.classList.remove('active');
      updateCaseDistributionChart('district');
      updateTownTrendChart('district');
    });
  }

  // 5.2.1 【案件分布統計】圓餅圖視角切換 (按鈕與下拉選單雙向聯動)
  const btnTotalCasesMode = document.getElementById('btnTotalCasesMode');
  const caseDistSelect = document.getElementById('caseDistSelect');
  if (btnTotalCasesMode) {
    btnTotalCasesMode.addEventListener('click', () => {
      const nextMode = currentDistMode === 'city' ? 'district' : 'city';
      updateCaseDistributionChart(nextMode);
    });
  }
  if (caseDistSelect) {
    caseDistSelect.addEventListener('change', (e) => {
      updateCaseDistributionChart(e.target.value);
    });
  }

  // 分布圖圖例分頁前後切換
  const btnDistPrevPage = document.getElementById('btnDistPrevPage');
  const btnDistNextPage = document.getElementById('btnDistNextPage');
  if (btnDistPrevPage && btnDistNextPage) {
    btnDistPrevPage.addEventListener('click', () => {
      distLegendPage--;
      const dataList = currentDistMode === 'city' 
        ? CASE_ANALYSIS_MOCK.distributionByCity 
        : CASE_ANALYSIS_MOCK.distributionByDistrict;
      renderDistLegend(dataList);
    });
    btnDistNextPage.addEventListener('click', () => {
      distLegendPage++;
      const dataList = currentDistMode === 'city' 
        ? CASE_ANALYSIS_MOCK.distributionByCity 
        : CASE_ANALYSIS_MOCK.distributionByDistrict;
      renderDistLegend(dataList);
    });
  }

  // 5.2.2 【案件趨勢圖-依縣市鄉鎮】折線圖視角切換 (按鈕與下拉選單雙向聯動)
  const btnRegionAdmin = document.getElementById('btnRegionAdmin');
  const regionCtrlSelect = document.getElementById('regionCtrlSelect');
  if (btnRegionAdmin) {
    btnRegionAdmin.addEventListener('click', () => {
      const nextMode = currentTownTrendMode === 'city' ? 'district' : 'city';
      updateTownTrendChart(nextMode);
    });
  }
  if (regionCtrlSelect) {
    regionCtrlSelect.addEventListener('change', (e) => {
      const val = e.target.value === 'jurisdiction' ? 'district' : 'city';
      updateTownTrendChart(val);
    });
  }

  // 5.3 縣市鄉鎮二級聯動
  const citySelect = document.getElementById('citySelect');
  const townSelect = document.getElementById('townSelect');
  if (citySelect && townSelect) {
    citySelect.addEventListener('change', (e) => {
      const cityKey = e.target.value;
      const towns = CASE_ANALYSIS_MOCK.townsMap[cityKey] || ['請先選擇縣市'];
      townSelect.innerHTML = '';
      towns.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        townSelect.appendChild(opt);
      });
    });
  }

  // 5.4 側邊欄展開/收合
  const toggleFilterSidebarBtn = document.getElementById('toggleFilterSidebarBtn');
  const filterSidebar = document.getElementById('filterSidebar');
  const mainContainer = document.querySelector('.analysis-main-container');

  if (toggleFilterSidebarBtn && filterSidebar) {
    toggleFilterSidebarBtn.addEventListener('click', () => {
      const isCollapsed = filterSidebar.classList.toggle('collapsed');
      toggleFilterSidebarBtn.classList.toggle('collapsed', isCollapsed);
      if (mainContainer) mainContainer.classList.toggle('sidebar-collapsed', isCollapsed);
    });
  }

  // 5.5 查詢送出按鈕
  const btnQuerySubmit = document.getElementById('btnQuerySubmit');
  if (btnQuerySubmit) {
    btnQuerySubmit.addEventListener('click', () => {
      const totalEl = document.getElementById('kpiTotalCases');
      if (totalEl) {
        const cur = parseInt(totalEl.textContent) || 3460;
        totalEl.textContent = (cur + Math.floor(Math.random() * 10 - 5)).toLocaleString();
      }

      if (window.innerWidth <= 900) {
        if (filterSidebar) filterSidebar.classList.add('collapsed');
        if (toggleFilterSidebarBtn) toggleFilterSidebarBtn.classList.add('collapsed');
        if (mainContainer) mainContainer.classList.add('sidebar-collapsed');
      } else {
        alert('已依據所選條件重新檢索綜合案件統計數據與 GIS 熱點！');
      }
    });
  }

  // 5.6 檢視案件明細彈窗
  const btnViewCaseDetail = document.getElementById('btnViewCaseDetail');
  const caseDetailModal = document.getElementById('caseDetailModal');
  const closeCaseDetailBtn = document.getElementById('closeCaseDetailBtn');

  if (btnViewCaseDetail && caseDetailModal) {
    btnViewCaseDetail.addEventListener('click', () => {
      caseDetailModal.classList.remove('hide');
      caseDetailModal.classList.add('show');
    });
  }
  if (closeCaseDetailBtn && caseDetailModal) {
    closeCaseDetailBtn.addEventListener('click', () => {
      caseDetailModal.classList.remove('show');
      caseDetailModal.classList.add('hide');
    });
  }

  // 案件搜尋即時過濾
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

  // 5.7 報表匯出彈窗
  const btnExportReport = document.getElementById('btnExportReport');
  const exportReportModal = document.getElementById('exportReportModal');
  const closeExportModalBtn = document.getElementById('closeExportModalBtn');
  const btnCancelExport = document.getElementById('btnCancelExport');
  const btnConfirmExport = document.getElementById('btnConfirmExport');

  if (btnExportReport && exportReportModal) {
    btnExportReport.addEventListener('click', () => {
      exportReportModal.classList.remove('hide');
      exportReportModal.classList.add('show');
    });
  }

  const hideExportModal = () => {
    if (exportReportModal) {
      exportReportModal.classList.remove('show');
      exportReportModal.classList.add('hide');
    }
  };

  if (closeExportModalBtn) closeExportModalBtn.addEventListener('click', hideExportModal);
  if (btnCancelExport) btnCancelExport.addEventListener('click', hideExportModal);
  if (btnConfirmExport) {
    btnConfirmExport.addEventListener('click', () => {
      const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'excel';
      alert(`已成功產製並匯出 [綜合案件分析報表.${format}]！`);
      hideExportModal();
    });
  }

  // 5.8 案件熱點地圖經緯度即時提示
  const heatCanvas = document.getElementById('heatMapCanvasWrap');
  const coordTxt = document.getElementById('mapCoordTxt');
  if (heatCanvas && coordTxt) {
    heatCanvas.addEventListener('mousemove', (e) => {
      const lng = (119.586805).toFixed(6);
      const lat = (23.118909).toFixed(6);
      coordTxt.textContent = `${lng} ${lat}`;
    });
  }
}

// 6. DOM 載入完成自動執行
document.addEventListener('DOMContentLoaded', () => {
  initServiceCategoryPieChart();
  updateCaseDistributionChart('city');
  initConnectionTrendLineChart();
  updateTownTrendChart('city');
  renderCaseDetailTable(CASE_ANALYSIS_MOCK.cases);
  bindCaseAnalysisEvents();
});

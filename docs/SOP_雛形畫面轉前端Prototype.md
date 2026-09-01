---
name: prototype-skill
description: 當使用者提供設計雛形（Wireframe、UI 截圖、手繪草圖或規格描述）時觸發。自動執行 11 大維度畫面結構分析，並生成符合工程交付標準的 HTML5/CSS/JS 分離式高保真 Prototype 前端雛形，包含 RWD 響應式佈局、Mock Data、圖表渲染與完整互動元件。
---

# Prototype Skill (雛形畫面轉前端工程 Prototype SOP)

本 Skill 定義「設計雛形（UI Wireframe / 截圖 / 草圖）」至「高保真前端靜態原型（HTML5 Prototype）」的標準化作業流程與工程交付規範。

---

## 一、 核心目標與觸發時機

### 1. 觸發情境
* 使用者上傳 UI 截圖、線框圖、草圖或提供版面文字需求。
* 使用者輸入 `@prototype-skill` 或提及「分析畫面」、「生成 HTML 雛形」、「切版 Prototype」、「產出前端靜態頁面」。

### 2. 核心產出目標
* **零依賴可直接預覽**：產出之 HTML 檔案在本地雙擊即可透過任一現代瀏覽器（Chrome/Edge/Firefox）完整檢視。
* **三層架構分離**：嚴格落實 `index.html`（結構）、`css/style.css`（表現）、`js/main.js`（行為）三層檔案分離。
* **高工程保真度**：包含假資料（Mock Data）、圖表元件、按鈕互動、彈窗（Modal）、下拉選單與 RWD 響應式適配。

---

## 二、 使用者引導與輸入規範 (Input Guide)

當使用者發起需求但資訊不足時，AI 應主動引導使用者提供以下關鍵資訊（可提供預設值以降低溝通成本）：

```markdown
1. 【雛形輸入】：提供 UI 截圖、手繪草圖或排版描述。
2. 【專案/頁面名稱】：例如「智慧水網-總管理處營運儀表板」。
3. 【CSS 框架偏好】：純 CSS3 (預設) / Tailwind CSS / Bootstrap 5。
4. 【特殊模組需求】：如 GIS 地圖、複雜圖表 (Chart.js / ECharts)、分頁、Modal 彈窗。
```

---

## 三、 畫面結構分析 11 大維度 SOP (Analysis Framework)

在撰寫代碼前，**必須先向使用者輸出結構化的畫面分析報告**，涵蓋以下 11 項維度：

1. **Header（頂部導航列）**：識別 Logo、標題、使用者身分/權限、系統時間、公告跑馬燈與全域工具。
2. **Sidebar（側邊欄）**：判斷側欄是常駐、收合（Collapsed）或抽屜式（Drawer），並標註切換觸發器。
3. **Menu（選單元件）**：識別全域主選單、區域篩選下拉選單（Dropdown）與次級選單。
4. **Dashboard（儀表板總覽佈局）**：分析 Grid/Flex 網格配置（如 8:4、12 欄制、卡片流向）。
5. **卡片（Card 元件）**：定義卡片層級、圓角半徑、陰影深淺與內間距標準。
6. **表格（Table 元件）**：拆解欄位定義、資料型別、狀態標籤（Badges）、操作按鈕與分頁。
7. **地圖區域（Map 區域）**：若包含 GIS/空間地圖，規劃模擬畫布、圖層開關與 Pin 點互動；若無，確認是否需預留。
8. **Chart（圖表元件分類與規格）**：
   * 甜甜圈圖（Donut Chart）
   * 儀表盤 / 半環錶（Gauge Chart）
   * 長條圖 / 柱狀圖（Bar Chart）
   * 折線圖 / 趨勢圖（Line Chart）
   * 圓環進度條（Radial Progress Bar）
9. **Popup（彈窗 / 浮動層）**：定義 Modal 彈窗、Tooltip 懸浮提示、Dropdown 展開選單。
10. **Footer（頁尾）**：確認是否有獨立版權宣告列，或採用無 Footer 的全螢幕視窗（App Layout）。
11. **RWD（響應式斷點與排版調適策略）**：
    * 桌面端（Desktop $\ge$ 1280px）
    * 平板端（Tablet 768px ~ 1279px）
    * 手機端（Mobile $<$ 768px）

---

## 四、 代碼生成規範與架構 (Generation Standard)

### 1. 目錄結構
```text
project-root/
├── index.html        # HTML5 語意結構
├── css/
│   └── style.css     # CSS3 樣式與 RWD 斷點
└── js/
    └── main.js       # Chart.js 初始化、Mock Data、事件監聽
```

### 2. HTML 規範 (`index.html`)
* 採用 HTML5 語意標籤（`<header>`, `<nav>`, `<aside>`, `<main>`, `<section>`, `<article>`, `<footer>`）。
* 圖示一律採用 Font Awesome CDN 或原生 SVG。
* 避免 Inline Style，所有外觀由 Class 控制。
* 關鍵資料區塊加入工程註解：`<!-- TODO: API Binding: [欄位名稱] -->`。

### 3. CSS 規範 (`css/style.css`)
* 在 `:root` 中定義調色盤與全域變數（`--primary-color`, `--border-color`, `--radius-md`, `--shadow-sm` 等）。
* 使用 CSS Flexbox 與 CSS Grid 進行佈局。
* 具備完整 RWD Media Queries 斷點：
  * `@media (max-width: 1440px)`
  * `@media (max-width: 1200px)`
  * `@media (max-width: 900px)`
  * `@media (max-width: 600px)`

### 4. JavaScript 規範 (`js/main.js`)
* **假資料集中管理**：在檔案最上方建立 `MOCK_DATA` 物件，結構需貼近真實 API JSON 格式。
* **模組化函式劃分**：
  * `initCharts()`：初始化 Chart.js / SVG 動態進度圖。
  * `bindEventListeners()`：綁定下拉選單、按鈕、Modal、側欄抽屜等互動事件。
  * `switchView()`：處理多視圖/地圖切換。
* **零死按鈕原則**：畫面中出現的按鈕、篩選下拉、Icon 均需具備實際點擊反應（如切換視圖、打開彈窗、切換過濾數據或給予 Alert/Toast 提示）。

---

## 五、 工程交付驗收清單 (Handoff Checklist)

交付給後端/前端工程師接手前，進行以下項目自我檢驗：

- [ ] **獨立可用性**：雙擊 `index.html` 能否在無伺服器環境下正常開啟並渲染所有樣式？
- [ ] **元件完整性**：原設計圖中的所有 KPI、表格、圖表、文字與標籤是否 100% 還原，無自作主張省略？
- [ ] **互動完整性**：所有 Dropdown、Modal、搜尋框、側欄切換是否均能正常開關？
- [ ] **圖表動態性**：圖表是否具備 Hover Tooltip 數值提示？篩選器切換時圖表數值是否同步更新？
- [ ] **RWD 適配性**：縮小視窗至手機寬度（< 600px）時，版面是否無溢出破版（No horizontal scrollbar）且表格具備 `overflow-x: auto`？
- [ ] **代碼註解**：是否標註了後續工程師需要串接 API 的資料錨點？

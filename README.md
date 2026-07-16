# Graph Editor

使用 `Vite + React + TypeScript + Tailwind CSS` 製作的互動式 SVG Graph Editor 練習專案。

目前已完成：

- 節點新增
- 節點選取
- 節點拖曳
- 節點刪除
- 模式切換
- 節點連線
- 預覽線顯示
- Unit Test
- Playwright E2E Test

## 功能說明

### 1. 節點操作

- 點擊畫布空白處可新增節點
- 點擊節點可選取節點
- 在 `SELECT` 模式下可拖曳節點
- 按 `Delete` 或 `Backspace` 可刪除目前選取的節點

### 2. 連線操作

- 切換到 `ADD_EDGE` 模式後可建立節點連線
- 點第一個節點作為起點
- 移動滑鼠時會顯示預覽線
- 點第二個節點作為終點，正式建立 edge
- 不允許 self-loop
- 不允許重複的 `source -> target` edge

### 3. 側邊狀態面板

- 顯示總節點數
- 顯示總連線數
- 顯示目前模式
- 顯示目前選取節點 ID
- 顯示目前連線起點

## 技術棧

- `React 19`
- `TypeScript`
- `Vite`
- `Tailwind CSS 4`
- `Vitest`
- `Playwright`

## 安裝與啟動

```bash
npm install
npm run dev
```

開發伺服器啟動後，打開瀏覽器進入 Vite 顯示的網址即可。

## 可用指令

```bash
npm run dev
```

啟動開發環境。

```bash
npm run build
```

執行 TypeScript 檢查並輸出生產版本。

```bash
npm run preview
```

預覽 build 後的結果。

```bash
npm run test:unit
```

執行 Vitest 單元測試。

```bash
npm run test:e2e
```

執行 Playwright E2E 測試。

```bash
npm run test:e2e:demo
```

以慢速、有畫面的方式播放 Playwright 測試流程。

## 測試策略

### Unit Test

單元測試放在 [src/lib/graph.test.ts](/Users/peihsin.chang/Documents/graph-editor/src/lib/graph.test.ts:1)，目前涵蓋：

- 建立節點資料
- 移動指定節點
- 刪除節點與相關 edge
- 建立合法 edge
- 阻擋重複 edge 與 self-loop

### E2E Test

端對端測試放在 [tests/graph-editor.spec.ts](/Users/peihsin.chang/Documents/graph-editor/tests/graph-editor.spec.ts:1)，目前驗證：

- 新增兩個節點
- 拖曳節點
- 切換到 `ADD_EDGE`
- 建立一條 edge
- 驗證預覽線與最終連線渲染

## 專案結構

```text
src/
  App.tsx
  components/
    StatusPanel.tsx
    SvgCanvas.tsx
  hooks/
    useGraphEditor.ts
  lib/
    graph.ts
    graph.test.ts
  types/
    graph.ts
tests/
  graph-editor.spec.ts
```

### 主要檔案職責

- [src/App.tsx](/Users/peihsin.chang/Documents/graph-editor/src/App.tsx:1)
  負責頁面組裝與元件串接。

- [src/hooks/useGraphEditor.ts](/Users/peihsin.chang/Documents/graph-editor/src/hooks/useGraphEditor.ts:1)
  集中管理 editor state 與互動邏輯。

- [src/components/SvgCanvas.tsx](/Users/peihsin.chang/Documents/graph-editor/src/components/SvgCanvas.tsx:1)
  負責 SVG 畫布渲染、拖曳事件與連線互動。

- [src/components/StatusPanel.tsx](/Users/peihsin.chang/Documents/graph-editor/src/components/StatusPanel.tsx:1)
  顯示目前編輯器狀態。

- [src/lib/graph.ts](/Users/peihsin.chang/Documents/graph-editor/src/lib/graph.ts:1)
  放置可測試的純函式資料邏輯。

- [src/types/graph.ts](/Users/peihsin.chang/Documents/graph-editor/src/types/graph.ts:1)
  定義 `Node`、`Edge`、`EditorMode`、`Point` 型別。

## 目前開發進度

### Day 1

- 完成專案初始化
- 完成 SVG 畫布渲染
- 完成點擊新增節點
- 完成節點選取

### Day 2

- 完成節點拖曳
- 完成鍵盤刪除節點
- 完成節點編號遞增邏輯

### Day 3

- 完成 `SELECT` / `ADD_EDGE` 模式切換
- 完成連線預覽線
- 完成 edge 建立
- 完成拖曳節點時 edge 即時更新
- 完成 Unit Test 與 E2E Test

## 後續可擴充方向

- 支援刪除 edge
- 支援雙向 edge 或無向圖模式
- 支援節點名稱編輯
- 支援資料匯出 / 匯入
- 支援更完整的狀態機與 undo / redo


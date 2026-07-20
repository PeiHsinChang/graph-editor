# GraphQL Server 規劃

這份文件是給未來的 `server/` 使用的入門說明與架構藍圖。

你可以把它想成兩件事的組合：

- 用最簡單的方式理解 GraphQL 是什麼
- 先規劃這個 `graph-editor` 專案未來的 server 要怎麼切

這份文件先不追求一次把 GraphQL 所有觀念講完，而是專注在：

- 你現在這個專案需要什麼
- 第一版 server 應該怎麼開始
- 每一層要負責什麼

## 1. 這份文件是做什麼的

目前這個 repo 只有前端，使用者可以直接在瀏覽器中操作 graph。

如果未來你想做到下面這些事情，就需要一個 server：

- 把 graph 資料存起來
- 讓不同裝置都能讀同一份 graph
- 讓前端不是自己硬寫資料，而是跟 API 溝通
- 後續接資料庫、登入、權限控制

這份 `server/README.md` 的目標，就是先把未來的後端架構定清楚，讓你之後開始實作時不會亂掉。

## 2. GraphQL 是什麼

你可以先把 GraphQL 想成：

「前端向後端要資料時，一種更精準的問法。」

REST 常見的做法是：

- `GET /nodes`
- `GET /edges`
- `POST /nodes`
- `DELETE /nodes/:id`

GraphQL 的做法是：

- 所有請求通常都進同一個入口，例如 `/graphql`
- 前端自己描述「我想拿哪些欄位」
- 後端按照 schema 規則回傳資料

### REST 和 GraphQL 的差別

REST 比較像是：

- 後端先準備很多不同網址
- 前端去挑要打哪一個 endpoint

GraphQL 比較像是：

- 後端先定義一份資料規格書
- 前端照規格書詢問自己需要的資料

例如，如果前端只想拿 node 的 `id` 和 `label`：

```graphql
query {
  graph {
    nodes {
      id
      label
    }
  }
}
```

GraphQL 的好處是，前端可以拿到剛剛好需要的資料，不多也不少。

對初學者來說，先記一件事就好：

GraphQL 不是取代資料庫，也不是取代 Express。
它是「API 的溝通方式」。

## 3. 為什麼這個專案適合用 GraphQL

你的 `graph-editor` 很適合拿來練 GraphQL，因為資料模型很清楚。

目前核心資料其實就三個概念：

- `Node`
- `Edge`
- `Graph`

而且前端常見的需求也很直覺：

- 取得整張 graph
- 取得單一 node
- 新增 node
- 移動 node
- 刪除 node
- 新增 edge
- 刪除 edge

這種資料關係明確、操作種類固定的情境，很適合用 GraphQL 練習：

- schema 怎麼定義
- query 怎麼查資料
- mutation 怎麼改資料
- resolver 怎麼把請求導到真正的商業邏輯

## 4. 我們要處理的核心資料

這個專案目前已經有前端型別：

- [src/types/graph.ts](/Users/peihsin.chang/Documents/graph-editor/src/types/graph.ts:1)

第一版 server 會直接沿用同樣的概念。

### Node

```ts
interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}
```

### Edge

```ts
interface Edge {
  id: string;
  source: string;
  target: string;
}
```

### Graph

Graph 可以理解成：

- 一組 `nodes`
- 一組 `edges`

也就是：

```ts
interface Graph {
  nodes: Node[];
  edges: Edge[];
}
```

## 5. `server/` 建議資料夾架構

未來建議把 server 當成一個獨立小專案。

原因很簡單：

- 前端和後端責任不同
- 比較容易學習與維護
- 之後接資料庫時不會和 Vite 前端混在一起

建議架構如下：

```text
server/
  README.md
  package.json
  tsconfig.json
  src/
    app.ts
    server.ts
    graphql/
      schema.ts
      context.ts
      typeDefs/
        graph.ts
      resolvers/
        index.ts
        graph.ts
    modules/
      graph/
        graph.service.ts
        graph.repository.ts
        graph.types.ts
    db/
      memory.ts
```

### 主要檔案職責

- `src/app.ts`
  建立 Express app，掛上 middleware 與 GraphQL endpoint。

- `src/server.ts`
  啟動 HTTP server，例如監聽 `http://localhost:4000`。

- `src/graphql/schema.ts`
  把所有 typeDefs 與 resolvers 組合成 GraphQL schema。

- `src/graphql/typeDefs/graph.ts`
  定義 GraphQL 看得到的資料形狀。

- `src/graphql/resolvers/graph.ts`
  接住 query / mutation，然後呼叫 service。

- `src/modules/graph/graph.service.ts`
  放 graph 的真正規則。

- `src/modules/graph/graph.repository.ts`
  負責存取資料。第一版先用記憶體，未來可以換成資料庫。

- `src/db/memory.ts`
  暫時放 in-memory 的 `nodes`、`edges`。

## 6. 每一層職責說明

這一段很重要，因為很多初學者一開始會把所有東西都塞進 resolver。

建議你從第一天就把責任分開。

### 1. `typeDefs`

負責定義 GraphQL 世界中的資料長相。

例如：

```graphql
type Node {
  id: ID!
  x: Float!
  y: Float!
  label: String!
}

type Edge {
  id: ID!
  source: ID!
  target: ID!
}

type Graph {
  nodes: [Node!]!
  edges: [Edge!]!
}
```

重點是：

- 前端能查什麼
- 每個欄位叫什麼名字
- 哪些欄位一定存在

### 2. `resolvers`

負責接 GraphQL 請求。

例如：

- `Query.graph`
- `Query.node`
- `Mutation.addNode`

resolver 的工作要盡量單純：

- 收參數
- 呼叫 service
- 回傳結果

### 3. `service`

這裡放真正的商業邏輯。

以這個專案來說，商業規則包含：

- 不允許 self-loop
- 不允許重複的 `source -> target`
- 刪除 node 時要一起刪掉相關 edge

這些規則不應該散落在 resolver。

### 4. `repository`

repository 專門處理資料來源。

第一版可以很簡單，只是讀寫記憶體中的陣列。

以後如果換成 Prisma、PostgreSQL、MongoDB，理想上只需要改 repository，不需要大改 GraphQL 介面。

## 7. 一次請求的資料流

未來一次 GraphQL 請求的資料流，建議長這樣：

```text
Client
  -> Express
  -> /graphql
  -> Resolver
  -> Service
  -> Repository
  -> Memory DB / Real DB
```

用一句白話來說：

- Express 負責接住 HTTP 請求
- GraphQL 負責理解 query / mutation
- Resolver 負責轉接
- Service 負責判斷規則
- Repository 負責拿資料

## 8. 第一版 GraphQL API 規劃

第一版不要做太多，先把最核心的操作做好就夠了。

### Query

```graphql
type Query {
  graph: Graph!
  node(id: ID!): Node
}
```

說明：

- `graph`
  取得整張 graph，也就是 `nodes` 和 `edges`

- `node(id: ID!)`
  依照 `id` 查單一 node

### Mutation

```graphql
type Mutation {
  addNode(x: Float!, y: Float!, label: String!): Node!
  moveNode(id: ID!, x: Float!, y: Float!): Node!
  deleteNode(id: ID!): Boolean!
  addEdge(source: ID!, target: ID!): Edge!
  deleteEdge(id: ID!): Boolean!
}
```

說明：

- `addNode`
  新增一個 node

- `moveNode`
  更新 node 的座標

- `deleteNode`
  刪除指定 node，並一起刪掉相關 edge

- `addEdge`
  建立一條 edge，但要遵守規則

- `deleteEdge`
  刪除一條 edge

### 第一版資料規則

這些規則要明確寫進 service：

- 不允許 self-loop
- 不允許重複的 `source -> target`
- 刪除 node 時要一起刪除相關 edge

## 9. 為什麼 resolver 不該塞商業邏輯

這是一個很常見的初學者問題。

如果你把「禁止 self-loop」直接寫在 resolver 裡，短期看起來會很快，但很快就會出現問題：

- resolver 越寫越胖
- 規則難測試
- 未來 REST API 或別的入口想共用邏輯時很難重用

比較好的做法是：

- resolver 只負責接請求
- service 才負責規則

你可以把 resolver 想成櫃檯，
把 service 想成真正處理業務的人。

櫃檯不用知道所有細節，它只要把正確資料交給正確的人處理就好。

## 10. 第一階段開發步驟

如果之後真的要開始做，我會建議照這個順序：

### Step 1

建立 `server/` 小專案：

- `package.json`
- `tsconfig.json`
- `src/app.ts`
- `src/server.ts`

先讓 Express server 可以正常啟動。

### Step 2

接上 GraphQL：

- 安裝 `express`
- 安裝 `graphql`
- 安裝 `@apollo/server`
- 安裝 Express 的 Apollo integration

先讓 `/graphql` endpoint 可以打通。

### Step 3

建立最小 schema：

- `Node`
- `Edge`
- `Graph`
- `Query.graph`

先能查整張 graph。

### Step 4

加入 graph module：

- repository
- service
- resolvers

先把資料暫存在記憶體。

### Step 5

補上 mutation：

- `addNode`
- `moveNode`
- `deleteNode`
- `addEdge`
- `deleteEdge`

### Step 6

補測試，確認規則真的有被保護：

- self-loop 會失敗
- duplicate edge 會失敗
- 刪除 node 會一起清掉相關 edge

## 11. 測試時要驗證哪些情境

未來 server 開始實作後，至少要驗證下面這些情境。

### Query

- 可以查到整張 graph
- 可以用 `id` 查到單一 node

### Mutation

- 可以新增 node
- 可以移動 node
- 可以刪除 node
- 刪除 node 時，相關 edge 也會一起刪掉
- 可以新增合法 edge
- self-loop 會被阻擋
- 重複 edge 會被阻擋
- 可以刪除 edge

### 架構層次

- graph 規則集中在 service
- repository 可以替換而不影響 GraphQL 介面

## 12. 後續可擴充方向

第一版完成之後，未來可以再往下加：

- input validation
- 錯誤格式統一
- 資料庫整合
- 認證與授權
- 前後端共用型別
- GraphQL codegen
- subscription

但這些都不應該卡住第一版。

第一版最重要的目標只有一個：

先把一個「分層清楚、容易理解、能操作 graph 資料」的 GraphQL server 建起來。

## 13. 目前先採用的假設

這份文件先建立在以下假設上：

- `server/` 目前尚未建立
- 讀者是 GraphQL 初學者
- 第一版使用 `TypeScript + Node.js + Express + GraphQL`
- 第一版資料儲存先用記憶體，不先接資料庫
- 先不處理登入、部署、subscription、ORM、codegen 等進階主題

如果之後真的開始實作，可以再把這份文件逐步轉成：

- 開發指南
- 實作進度文件
- API 說明文件

## Day 1 目前進度

目前 Day 1 已先完成最小 server 骨架規劃對應的檔案：

- `server/package.json`
- `server/tsconfig.json`
- `server/src/app.ts`
- `server/src/server.ts`
- `server/src/graphql/schema.ts`
- `server/src/graphql/typeDefs/graph.ts`
- `server/src/graphql/resolvers/graph.ts`

這一版的目標不是把所有 graph 邏輯做完，而是先把幾件事情固定下來：

- `server/` 是獨立小專案
- Express 是 HTTP 入口
- GraphQL endpoint 固定掛在 `/graphql`
- 第一版 schema 已經有 `Node`、`Edge`、`Graph`
- `Query.graph` 目前先回傳空資料，之後再接 service / repository

等到 Day 2、Day 3，再繼續把真正的資料存取與 mutation 補上。



Day 1
先理解 GraphQL 基本概念，建立 server/、跑起 Express + GraphQL 最小 server。

Day 2
做 Query.graph、Query.node，先用記憶體資料把查詢打通。

Day 3
做 addNode、moveNode、deleteNode、addEdge、deleteEdge，把核心 CRUD 完成。

Day 4
整理 resolver / service / repository 分層，補錯誤處理與規則驗證。

Day 5
補測試、檢查文件、確認前端未來怎麼串接。

如果你是：
只求做出第一版可跑 demo：大約 2 到 3 天
要真的學懂並寫得乾淨：大約 4 到 5 天
還要順便接前端串 GraphQL：建議抓 5 到 7 天

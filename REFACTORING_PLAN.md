# ITI-WEBUI-2.0 复刻计划(2026-07-11 起以本仓库为准)

> 目标:与 <https://www.trendnet.com/emulators/TPE-2840WS_v2.5R/index.html> **1:1 完整复刻**
> (样式/布局/交互/轮询周期),数据接口按我方 CGI 规则(见 `API_REDESIGN.md`)。
> 本仓库是 roy 手写的 Vue2 + Element UI 半成品(样式已 1:1),在此基础上补全,
> **替代原 `vue_web`(Vue3 重写方案,已废弃)**。

## 技术底座

- Vue 2.6 + Element UI 2.15 + ECharts 4 + axios(vue-element-admin 骨架)
- Node 17+ 需 `NODE_OPTIONS=--openssl-legacy-provider`(已写入 package.json scripts,
  否则 webpack 4 报 `ERR_OSSL_EVP_UNSUPPORTED`)
- 开发:`npm run dev`(VUE_APP_MOCK=true 时挂 mock 适配器);构建:`npm run build:prod`

## 请求层规则(R1 已重构)

- 页面只用 `cgiGet(cmd, params)` / `cgiSet(cmd, payload, opts)`(`src/api/cgi.js`)
- GET `/cgi/get.cgi?cmd=xxx` → `{"data":{...}}`;SET `/cgi/set.cgi?cmd=xxx`
  载荷 `{"_ds=1&k=v&_de=1":{}}`,成功 `{"status":"ok","msgType":"save_success","msg":""}`
- dev 模式 mock(`src/mock/index.js`):get 默认读 `public/data/<cmd>.json`,
  set 默认返回 ok;表格页用 `crud()` 工厂注册内存增删改;dev/prod 同一套页面代码路径
- 机型能力全部由 `sys_devinfo` 数据驱动(store `modelConst`),兼容最多 48 Copper +
  6 Fiber、10G、可选 PoE;新旧接口差异登记 `API_REDESIGN.md`
- 原版基准:`vue_web` 时期已抓 System 34 页 DOM+截图+数据请求
  (scratchpad `e2e/baseline/system/`),每页实现前先对照基准

## 阶段

- **R1(完成)工程复活 + 基座重构**
  - Node22 OpenSSL 修复;请求层 cgi 化(废弃 request-url-mapping 注册表);
    mock 适配器 + cmd 命名 json;login/logout/wizard/modelConst 迁移;
    Dashboard 三 tab 迁到 panel_info / sys_cpumem / port_rtstat 契约;
    Save 页按原版实现;common-table 去 hardcode(doubleRows);
    移动端 <768px 适配层(客户要求移动设备可用)
- **R2 System 全部页面**(对照 emulator System 菜单 34 页)
  - 已有 stub 接线:SSL/SSH/Telnet/Timeout/DHCP(R1 已接)、Cloud、IP Access List、
    Administration、System Log、System Time、DNS、L3 Feature 全部
  - 缺页新建:SNMP Settings/View/Group/Community/User/Trap、
    RMON Settings/Statistics/History/Event/Alarm、Statistics Traffic/Error、EEE
  - 参考 `vue_web/src/views/system/`(Vue3 版已按基准 1:1 实现,字段/交互直接照搬)
- **R3 Network / QoS / PoE / Security / Tools 全部页面**
  - 对照 emulator 全菜单补缺(VLAN/MAC/LLDP/IGMP/Storm Control/ACL/RADIUS/…)
- **R4 全站验收**
  - headless 截图对比 baseline;<992px/<768px 移动端检查;体积;push

## 风格铁律(用户多次强调)

- **每个样式先从 emulator 抓 computed 值再照抄**,禁止凭组件库默认值近似
- 功能页标准结构:`.main_body > #basetitle + .table_title + .from_table(原生控件)
  + .note + .margin1015 > .btnOutTable`;数据表格 el-table `.tableBox` 白底表头
  `#585f69` bold 居中,空表 `< < Table is empty > >`
- 原版用什么库就用什么库,不局限于 Element UI

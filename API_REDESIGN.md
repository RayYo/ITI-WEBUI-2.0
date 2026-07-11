# CGI 接口重设计清单(新 web ↔ web server 对照)

> 约定不变:GET `/cgi/get.cgi?cmd=<cmd>` 返回 `{"data":{...}}`;
> SET `/cgi/set.cgi?cmd=<cmd>` 载荷 `{"_ds=1&k=v&_de=1":{}}`,
> 成功返回 `{"status":"ok","msgType":"save_success","msg":""}`,失败 `status` 非 ok + `msg`。
> 通用设计原则:**数据与展示分离** —— 禁止返回 `lang('xx','yy',[..])` 展示字符串,一律原始值/枚举;
> 端口列表每行必须带 `"port": <n>`;布尔用 true/false。

## 状态标记
- 🆕 新增接口 | ♻️ 沿用 cmd 但 JSON 重设计 | ✅ 完全沿用

---

## 登录 / 全局

| cmd | 方向 | 状态 | 说明 |
|---|---|---|---|
| `home_login` | get | ♻️ | 登录前信息,返回 `{FIRSTBOOT:bool}`(旧字段大写沿用) |
| `home_loginAuth` | set | ✅ | 载荷 `username`/`password`(明文,沿用旧机制) |
| `home_loginStatus` | get | ✅ | `{status:'ok'|'fail', failReason:'error_passwd'|'error_lock'|'error_full'}` |
| `home_logout` | set | ✅ | 空载荷 |
| `home_save` | set | ♻️ | 保存 running-config 到 flash。载荷 `config:(1|2), startup:(0|1)`(对应 Save 页 Config File 下拉 + Startup-Config 勾选;navbar 快捷保存传默认 `config=1,startup=1`) |
| `sys_wizard` | set | ♻️ | 向导一次性提交:`username,password,mgmt(local/cloud),timeSource(manual/sntp),date,time,sntpServer,tz,ipMode(static/dhcp),ip,mask,gateway,dns` |

## 设备能力(机型适配核心)

| cmd | 方向 | 状态 | 说明 |
|---|---|---|---|
| `sys_devinfo` | get | 🆕 | 登录后立即调用。`{model,fwVer,macAddr,portCount,ports:[{port,type:'copper'/'fiber',maxSpeed(Mbps),poe:bool}],lagCount,capability:{poe,poeBudget(W),l3,cloud},cloudEnabled}`。**换机型只改此接口返回。** |

## Dashboard

| cmd | 方向 | 状态 | 说明 |
|---|---|---|---|
| `sys_sysinfo` | get | ♻️ | 原始值化:`{hostname,location,contact,sysObjId,serialNum,hwVer,fwVer,fwDate,loaderVer,loaderDate,uptimeSec(数字),sysTime,tz,ipv4:{mode,ip,mask,gateway},ipv6:[..],dns:[..],methods:{telnet,ssh,http,https,snmp}}`。替代旧 `sysUpTime:"lang(...)"`、`methods:[{txt:"lang(...)"}]` |
| `panel_info` | get | ♻️ | `{ports:[{port,link:bool,speed(Mbps),duplex:'full'/'half',throughputMbps,loopback:'normal'/'loop',distance,poe:{on,powering,powerMw,standard}|null}]}`,轮询 30s(emulator 实测)。旧版图片文件名/坐标方案(`panel_layout`)**废弃** |
| `sys_cpumem` | get | ♻️ | `{cpu:<0-100>, memTotalKB, memFreeKB}` 数字;轮询周期随页面下拉 5s/60s/300s |
| `port_rtstat` | get | 🆕 | Real-time Statistics 单端口计数。query 带 `port=<n>`,返回 `{totalRx,totalTx,ucRx,mcRx,bcRx,ucTx,mcTx,bcTx}` 累计数;轮询 3s |
| `poe_portEdit` | set | ♻️ | Switch View PoE 开关:载荷 `port,enable:(0|1)` |
| `port_bwutilz` | get | ♻️ | `{ports:[{port,txUtil,rxUtil}]}` 百分比数字 |
| `sys_connectdevice` | get | ❌废弃 | emulator Dashboard 无 Connected Devices tab |
| `panel_layout` | get | ❌废弃 | 面板由 sys_devinfo 驱动,不再需要 |

## System 基础页(Phase 2 第一批,2026-07-11)

| cmd | 方向 | 状态 | 说明 |
|---|---|---|---|
| `sys_sysinfoEdit` | set | ✅ | System Management 提交:`hostname,location,contact`(get 复用 `sys_sysinfo`,其中新增 `description`,`sysObjId`) |
| `sys_ssl` | get/set | 🆕 | `{enabled:bool}` |
| `sys_ssh` | get/set | 🆕 | `{enabled:bool, port:1-65535}` |
| `sys_telnet` | get/set | 🆕 | `{enabled:bool, port:1-65535}` |
| `sys_timeout` | get/set | 🆕 | `{webIdleMin:3-60}` |
| `sys_dhcpAutoConfig` | get/set | 🆕 | `{enabled:bool}` |
| `port_eee` | get/set | ♻️ | 全局 EEE:`{enabled:bool}`(原版页面为全局开关,旧按端口的 JSON 废弃) |
| `sys_dns` | get/set | ♻️ | `{ipv4:'', ipv6:''}` |
| `sys_cloud` | get/set | 🆕 | Cloud Settings:get `{enabled,connected,registered}`;set `{enabled}` |
| `snmp_engine` | get | ♻️ | `{agentEnabled, engineId, defaultEngineId}` |
| `snmp_agent` | set | 🆕 | `{enabled}`(SNMP Agent Status) |
| `snmp_engineID` | set | ♻️ | `{engineId}`(10-64 hex) |
| `aaa_login` | get | ♻️ | Administration 用户表 `{entries:[{idx,username}]}` |
| `aaa_loginAdd` / `aaa_loginEdit` / `aaa_loginDel` | set | ✅ | `{username,password}` / `{idx,username,password}` / `{idx}` |
| `sys_ipAccess` | get/set | 🆕 | get `{enabled, entries:[{idx,ip}]}`;set `{enabled}` |
| `sys_ipAccessAdd` / `sys_ipAccessDel` | set | 🆕 | `{ip}` / `{idx}` 或 `{all:1}` |
| `log_global` | get/set | ♻️ | `{timeStamp,bufferSize(1-512),syslogEnabled,serverIpVer,serverIpv4,serverIpv6,facility,level}` |
| `log_syslog` | get | ♻️ | `{entries:[{idx,severity,time,msg,raw}]}`,最新在前;`raw` 为原版格式整行("1 local0/Info  01/01/2018 ...") |
| `log_clear` | set | ✅ | 空载荷 |
| `rmon_global` | get/set | 🆕 | `{enabled}`(RMON Status) |
| `l3_arpAging` | get | 🆕 | `{entries:[{interface,timeout}]}` |
| `l3_arpAgingEdit` | set | 🆕 | `{interface,timeout:1-65535}` |

## Vue2 工程(ITI-WEBUI-2.0)R1 迁移新增(2026-07-11)

| cmd | 方向 | 状态 | 说明 |
|---|---|---|---|
| `home_wizard` | get/set | 🆕 | Wizard 数据:get `{account:{username,password},time,ipConfig:{ip,mask,gw,dns}}`;set `{time,username,password,ip,mask,gw,dns}`(替代旧 `sys_wizard` 命名,沿用旧 web 的 home_ 前缀惯例) |
| `l3_arpTable` | get | 🆕 | Static/Dynamic ARP 表:`{max,entries:[{intfName,ip,mac,agingTime,ipType:'Static'/'Dynamic'}]}` |
| `l3_arpAdd` / `l3_arpDel` | set | 🆕 | `{ip,mac}` / `{ip}` 或 `{all:1}` |
| `l3_ipv4Intf`(+Add/Del/Edit) | get/set | 🆕 | R2 接线时定稿字段 |
| `l3_ipv4Route`(+Add/Del) | get/set | 🆕 | R2 接线时定稿字段 |
| `l3_ipv6Intf`(+Add/Del/Edit) | get/set | 🆕 | R2 接线时定稿字段 |
| `l3_ipv6Neighbor`(+Add/Del) | get/set | 🆕 | `{entries:[{ipv6,mac,type:'Static'/'Dynamic'}]}` |
| `l3_ipv6Route`(+Add/Del) | get/set | 🆕 | R2 接线时定稿字段 |

## R2 第一批:SNMP/RMON/Statistics/EEE(2026-07-11)

| cmd | 方向 | 状态 | 说明 |
|---|---|---|---|
| `snmp_view`(+Add/Del) | get/set | 🆕 | `{max,entries:[{name,oid,mask,type:'included'/'excluded'}]}`;Del `{name}` 或 `{all:1}` |
| `snmp_community`(+Add/Del) | get/set | 🆕 | `{max,entries:[{name,policy}]}` |
| `snmp_group`(+Add/Del) | get/set | 🆕 | `{max,entries:[{name,readView,writeView,notifyView,model:'v1'/'v2c'/'v3',level}]}` |
| `snmp_user`(+Add/Del) | get/set | 🆕 | `{max,entries:[{name,group,version,auth:'None'/'MD5'/'SHA',priv:'None'/'DES'}]}`;Add 另带 encrypted/authPwd/privPwd |
| `snmp_trapEvent` | get/set | 🆕 | `{enabled}`(Trap Status) |
| `snmp_notify`(+Add/Del) | get/set | 🆕 | Trap 主机表 `{max,entries:[{idx,host,version,name}]}`;Del `{idx}` 或 `{all:1}` |
| `rmon_global` | get/set | 🆕 | `{enabled}` |
| `rmon_statistics`(+Add/Del) | get/set | 🆕 | `{entries:[{idx,port,dropEvents,octets,packets,broadcast,multicast,owner}]}` |
| `rmon_history`(+Add/Del) | get/set | 🆕 | `{entries:[{idx,port,bucketsReq,bucketsGranted,interval,owner}]}` |
| `rmon_event`(+Add/Del) | get/set | 🆕 | `{entries:[{idx,desc,type,community,owner,lastSent}]}` |
| `rmon_alarm`(+Add/Del) | get/set | 🆕 | `{entries:[{idx,interval,variable,sample,rising,falling,risingEvent,fallingEvent,owner}]}` |
| `port_statistics` | get | ♻️ | Statistics Traffic/Error 共用:`{ports:[{port,inOctets,inUcast,inNUcast,inDiscards,outOctets,outUcast,outNUcast,outDiscards,inErrors,outErrors,dropEvents,crcAlign,undersize,oversize,fragments,collisions}]}` |
| `port_cntClear` | set | 🆕 | 清端口计数:`{port:<n>}` 或 `{all:1}` |

## 待登记(随 R2/R3 实现逐步补充)

<!-- 每实现一批页面,在此追加对应 cmd 行 -->

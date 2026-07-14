# CGI 接口重设计清单(新 web ↔ web server 对照)

> **请求架构(2026-07-13 定稿,方案 A / 静态可部署)**:请求区分全部收敛在 `src/api/cgi.js`。
> - **mock**(`VUE_APP_MOCK=true`):GET → `${BASE}data/<cmd>.json`(静态文件);SET → `${BASE}data/_ok.json`(GET 一个固定 ok)。都是真实可见的 HTTP,`npm run build` 出的包可当静态 emulator 部署到任意网站。
> - **real**(`VUE_APP_MOCK=false`):GET → `/cgi/get.cgi?cmd=<cmd>[&k=v]`;SET → `POST /cgi/set.cgi?cmd=<cmd>` 载荷 `{"_ds=1&k=v&_de=1":{}}`。上机只需 web server 把 `/cgi/*.cgi` 接后端,前端零改动。
> - **静态方案的固有限制(mock 下)**:增删改不持久(GET 恒返回 json 原值)、SET 只回 ok、图表无动画、登录一律成功——与参考的原版 emulator 行为一致。带参 GET(如 `net_vlanDynamic`/`net_stpMstPort`)在页面内客户端过滤,保证 mock/real 响应形状一致。
> - **loading**:封装层统一。普通页盖 `.app-main`(`Loading.service` target),Dashboard 用 fullscreen($loading);spinner `el-icon-loading`、文字 "Loading"、背景 `rgba(0,0,0,0.7)`;轮询请求传 `{loading:false}` 跳过;mock 下加 300ms 延时让 loading 可见。
>
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

## R2 第二/三批:System 页接线 + L3 + System Time(2026-07-11)

| cmd | 方向 | 状态 | 说明 |
|---|---|---|---|
| `l3_arpAging`(+Edit) | get/set | 🆕 | `{entries:[{interface,timeout}]}`;Edit `{interface,timeout:1-65535}` |
| `l3_ipv4Intf`(+Add/Del/Edit) | get/set | 🆕 | `{max,entries:[{intf,state,ipType,ipAddr,ipMask,linkStatus}]}` |
| `l3_ipv4Route`(+Add/Del) | get/set | 🆕 | `{entries:[{idx,ip,mask,nextHop,backup:'P'/'B',intfName}]}` |
| `l3_ipv6Intf`(+Add/Del) | get/set | 🆕 | `{entries:[{intf,state,linkStatus}]}` |
| `l3_ipv6Neighbor`(+Add/Del) | get/set | 🆕 | `{entries:[{ipv6,mac,type:'Static'/'Dynamic'}]}` |
| `l3_ipv6Route`(+Add/Del) | get/set | 🆕 | `{entries:[{idx,ipv6,nextHop,backup,intfName}]}` |
| `sys_time` | get/set | 🆕 | System Time:get `{sntpStatus:'1'/'2'/'3',time(epoch),timezone(min),srv1Type,srv1Host,srv2Type,srv2Host,dlsStatus,sntpPollInterval,dlsRecMonth/Day/Hour/Min S/E,dlsOffset}`;set 按 clockMode(1 SNTP / 2 Local / 3 Cloud)分别提交,DST 单独 Apply |

## R3 第一批:Network 基础三页(2026-07-13)

> 说明:emulator 原始接口走 `/iss/specific/rpc.asp`,字段为 Realtek 原始数字码
> (如 `phyInfSpeed:"3"`、`lbdStatus:"2"`、PortList hex 位掩码)。本项目沿用
> 既定「数据与展示分离」规则,一律转为**语义枚举/布尔/端口数组**,不透传原始码。

| cmd | 方向 | 状态 | 说明 |
|---|---|---|---|
| `net_phyInterface` | get | 🆕 | Physical Interface 每端口配置:`{ports:[{port,trunk,type,linkStatus:'up'/'down',adminEnabled:bool,mode:'auto'/'1000full'/'100full'/'10full'/'100half'/'10half',jumbo:bool,flowCtrl:bool,eapPassThrough:bool,bpduPassThrough:bool,description}]}` |
| `net_phyInterfaceEdit` | set | 🆕 | 单端口 `{port,...}` 或批量 `{all:1,...}`;All 行 Ignore 的字段不提交;bool 用 1/0 |
| `net_mirror` | get | 🆕 | Mirroring:`{status:bool,targetPort:int(0=none),ingress:[port..],egress:[port..]}` |
| `net_mirrorEdit` | set | 🆕 | `{status:(1/0),targetPort,ingress:'1,2,3',egress:'7,9'}`(端口列表逗号串) |
| `net_loopback` | get | 🆕 | Loopback Detection:`{status:bool,interval:1-32767,recoverTime:(0或60-1000000),ports:[{port,state:bool,loopStatus:'normal'/'loop'}]}` |
| `net_loopbackGlobal` | set | 🆕 | `{status:(1/0),interval,recoverTime}` |
| `net_loopbackPort` | set | 🆕 | 单端口 `{port,state:(1/0)}` 或批量 `{all:1,state}` |

## R3 第二批:VLAN(Tagged/Port/Forwarding/Dynamic/Private/Current)(2026-07-13)

> 端口集合一律语义化:成员归属用 1=Static Tagged / 2=Static Untagged / 3=Not Member;
> Member/Untagged/Port Map 显示用 `"1-28"` 之类区间串。原设备用位掩码(`ff:ff:ff:f0:...`),转换在 cgi 层完成。

| cmd | 方向 | 状态 | 说明 |
|---|---|---|---|
| `net_vlanPort` | get | 🆕 | VLAN Port Settings:`{ports:[{port,pvid:int,acceptFrame:'all'/'tagged'/'untagged',ingressFilter:bool}]}` |
| `net_vlanPortEdit` | set | 🆕 | 单端口 `{port,pvid,acceptFrame,ingressFilter:(1/0)}` 或批量 `{all:1,...}` |
| `net_vlanFwdMode` | get/set | 🆕 | Forwarding Table Mode:`{mode:'IVL'/'SVL'}` |
| `net_vlanCurrent` | get | 🆕 | Current VLAN DB(只读):`{list:[{id,name,fdbId,memberPorts:'1-28',untaggedPorts,status:'Permanent'/'Dynamic'}]}` |
| `net_vlanDynamic` | get | 🆕 | Dynamic FDB:`{list:[{index,vid,port,mac,type}]}`,可传 `?port=(0=All/1..N)` 过滤 |
| `net_vlanTagged` | get | 🆕 | Tagged VLAN 表:`{list:[{id,name,type:'Static',members:[28 项,每项 1/2/3]}]}` |
| `net_vlanTaggedEdit` | set | 🆕 | 新增/修改:`{id,name,members:'2,2,3,...'}`(members 为逗号串,长度=端口数;id 已存在则改名+成员,否则新增) |
| `net_vlanTaggedDel` | set | 🆕 | `{id}` 删除该 VLAN(默认 VLAN 1 不可删) |
| `net_vlanPrivate` | get | 🆕 | Private VLAN:`{status:bool,sourcePort:int,forwardingPorts:[port..],portList:[{port,portMap:'1-28'}]}` |
| `net_vlanPrivateGlobal` | set | 🆕 | `{status:(1/0)}` |
| `net_vlanPrivatePort` | set | 🆕 | `{sourcePort,forwardingPorts:'1,2,3'}`(设定该源端口的转发端口集) |

## R3 第三批:MAC Address(Static Unicast / Static Multicast)(2026-07-13)

> 端口语义化:Unicast 单端口 `port:int`;Multicast 端口数组 `ports:[..]`,表内 Group Members 列用 portsToRange 显示区间串。max=256。

| cmd | 方向 | 状态 | 说明 |
|---|---|---|---|
| `mac_staticUnicast` | get | 🆕 | `{max:256,list:[{vlan,mac,port}]}` |
| `mac_staticUnicastAdd` | set | 🆕 | `{vlan,mac,port}`(vlan+mac 为主键,存在则覆盖) |
| `mac_staticUnicastDel` | set | 🆕 | `{vlan,mac}` 删单条,或 `{all:1}` 全删 |
| `mac_staticMulticast` | get | 🆕 | `{max:256,list:[{vlan,mac,ports:[..]}]}` |
| `mac_staticMulticastAdd` | set | 🆕 | `{vlan,mac,ports:'1,2,3'}` |
| `mac_staticMulticastDel` | set | 🆕 | `{vlan,mac}` 或 `{all:1}` |

## R3 第四批:Spanning Tree(Protocol/Port/TC Protect/MST/Instance/MST Port)(2026-07-13)

> 全局 STP 关时,Protocol/TC/Port 页所有配置控件禁用(#e3e3e3 / btnDisabled)。version:stp/rstp/mstp。
> Bridge/MST priority 0-61440 步 4096;Port priority 0-240 步 16;edge/p2p:auto/forcetrue/forcefalse;restricted:bool。

| cmd | 方向 | 状态 | 说明 |
|---|---|---|---|
| `net_stpProtocol` | get/set | 🆕 | 全局:`{status:bool,version,bridgePriority,maxAge,helloTime,forwardDelay,txHoldCount,maxHopCount,root:{bridge,cost,maxAge,forwardDelay,port}}`(get 返回全量含 root + tc 字段) |
| `net_stpTcProtect` | get/set | 🆕 | get 同上;set `{tcProtectStatus:(1/0),tcProtectThreshold,tcProtectCycle}` |
| `net_stpPort` | get | 🆕 | `{ports:[{port,stpStatus:bool,priority,adminCost,externalCost,state,edge,p2p,restrictedRole:bool,restrictedTCN:bool}]}` |
| `net_stpPortEdit` | set | 🆕 | 单端口/`{all:1}`:stpStatus/priority/adminCost/edge/p2p/restrictedRole/restrictedTCN |
| `net_stpPortMigrate` | set | 🆕 | `{port}`或`{all:1}` 重启迁移(mock 无副作用) |
| `net_stpMst` | get | 🆕 | `{configName,revisionLevel,table:[{mstiId('CIST'/int),vidList,priority}]}` |
| `net_stpMstConfig` | set | 🆕 | `{configName,revisionLevel}` |
| `net_stpMstAdd` | set | 🆕 | `{mstiId,vidList,priority}` 新增/修改(CIST 不可改) |
| `net_stpMstDel` | set | 🆕 | `{mstiId}`(CIST 不可删) |
| `net_stpInstance` | get | 🆕 | 只读 `{list:[{mstiId,internalRootCost,rootPort,regionalRootBridge,designatedBridge,priority}]}` |
| `net_stpMstPort` | get | 🆕 | `?port=` 返回 `{list:[{mstiId,designatedBridge,internalPathCost,adminPathCost,priority,status,role}]}` |
| `net_stpMstPortEdit` | set | 🆕 | `{port,mstiId,adminPathCost,priority}` |

## R3 第五批:Trunk(Settings / Status / Port Priority)(2026-07-13)

| cmd | 方向 | 状态 | 说明 |
| --- | --- | --- | --- |
| `net_trunkSettings` | get | 🆕 | `{trunks:[{id,ports:[成员口数组],mode}]}`,8 组 trunk(id 1-8);mode 枚举 `active/passive/manual/disabled`(原始 laPortChannelMode 1/2/3/4);ports 由 laPortChannelMemberList 位掩码转端口数组 |
| `net_trunkSettingsEdit` | set | 🆕 | 单组:`{id,ports:[...],mode}` |
| `net_trunkStatus` | get | 🆕 | LACP 只读:`{system:{priority,id},groups:[{id,exists,memberPorts,activePorts,standbyPorts}]}`;`exists=false` 时前端显示 "This group does not exist" |
| `net_trunkPortPriority` | get/set | 🆕 | get:`{system:{priority,id},ports:[{port,priority}]}`(28 口,priority 0-65535);set:`{ports:[{port,priority}]}`(全表整体 Apply,前端校验 0-65535) |

## R3 第六批:IGMP Snooping(Settings / Router Port)(2026-07-14)

| cmd | 方向 | 状态 | 说明 |
| --- | --- | --- | --- |
| `net_igmpSettings` | get/set | 🆕 | get:`{status,querierStatus,fastLeaveStatus:bool, agingTimeout,queryInterval,maxResponseTime,robustness,lastMemberQueryInterval,routerTimeout, free,total, groups:[{vlan,groupAddr,memberPorts}]}`;set 同名(前端校验各区间:Aging 130-153025/Query 60-600/MaxResp 10-25/Robust 2-255/LastMember 1-25/RouterTimeout 120-1200)。原始字段 igsStatus/igsCfgQuerierStatus/igsCfgFastLeaveStatus/igsHostPortPurgeInterval(=Aging)/igsQuerierQueryInterval/igsQueryMaxResponseTime/igsRobustnessValue/igsGrpQueryInterval(=LastMember)/igsRouterTimeout |
| `net_igmpRouterPort` | get | 🆕 | `{status:bool, rows:[{vlan,staticPorts:[],dynamicPorts:[]}]}`;端口空显示 "N/A";行 Modify 按钮在 IGMP 全局关时禁用(btnDisabled) |
| `net_igmpRouterPortEdit` | set | 🆕 | `{vlan,staticPorts:[...]}`。Modify 跳转到**独立编辑页**"Modify IGS Static Router Port"(hidden 路由 router-port-modify?vlan=,已按原版 DOM 确证:common-table "Router Port Settings"→802.1Q VLAN + PortCheckboxGrid(title "Static Router Port"+All)+ Apply/Restore) |

## R3 第七批:MLD Snooping(Settings / Router Port)(2026-07-14)

与 IGMP Snooping 完全对称(IPv6 组播)。字段/区间/Note/禁用规则/翻页/Modify 独立页全同 IGMP,仅 cmd 与个别文案不同。

| cmd | 方向 | 状态 | 说明 |
| --- | --- | --- | --- |
| `net_mldSettings` | get/set | 🆕 | 同 net_igmpSettings 结构(原始字段 mldStatus/mldCfgQuerierStatus/mldCfgFastLeaveStatus/mldHostPortPurgeInterval/mldQuerierQueryInterval/mldQueryMaxResponseTime/mldRobustnessValue/mldGrpQueryInterval/mldRouterTimeout);MGE 列头 "VLAN Index"(带空格) |
| `net_mldRouterPort` | get | 🆕 | 同 net_igmpRouterPort;Router Port 首列表头 "802.1Q VLAN"(IGMP 是 "VLAN ID") |
| `net_mldRouterPortEdit` | set | 🆕 | `{vlan,staticPorts:[...]}`;Modify 跳 hidden 页 "Modify MLD Static Router Port"(+ Back) |

## R3 第八批:Multicast VLAN(Global Settings / VLAN Table / Group Setup / Associate Group Setup)(2026-07-14)

| cmd | 方向 | 状态 | 说明 |
| --- | --- | --- | --- |
| `net_mcvlanGlobal` | get | 🆕 | `{ipv4State,ipv6State:bool, vlans:[{id,name,state:bool, receiver:{tagged:[],untagged:[]}, source:{tagged:[],untagged:[]}}]}`;Port Setting 表:VLAN ID/Name/State(行内 select 默认 Enabled)/Receiver Ports(Edit→跳页)/Source Ports(Edit→跳页)/Action(Apply=提交 State) |
| `net_mcvlanGlobalState` | set | 🆕 | `{ipv4State,ipv6State}`(全局 Apply) |
| `net_mcvlanVlanAdd/Del/State` | set | 🆕 | Add:`{id,name}`;Del:`{id}`;State:`{id,state}`(行 Action) |
| `net_mcvlanPorts` | set | 🆕 | `{vlan,type:'receiver'|'source',tagged:[],untagged:[]}`;Edit 跳 hidden 页 ports-settings?vlan=&type=(basetitle "Receiver/Source Ports Settings",VLAN ID/Name 只读 + 三格 PortMemberRadioGrid[Tagged/Untagged X Ports/Not Member Ports] + Previous Page/Clear/Apply) |
| `net_mcvlanTable` | get | 🆕 | 只读:`{list:[{id,name,state,taggedReceiver,untaggedReceiver,taggedSource,untaggedSource}]}`(端口区间串) |
| `net_mcvlanGroup` | get | 🆕 | `{profiles:[{name,ranges:[range 串]}]}`;Multicast Profile Table:Profile Name/Multicast Group Profiles/Action(Delete) |
| `net_mcvlanProfileAdd/Del` | set | 🆕 | Profile Create:`{name}`;Del:`{name}` |
| `net_mcvlanRangeAdd/Del` | set | 🆕 | Group Profile Settings:`{name,ipType:'ipv4'|'ipv6',from,to}`(IPv4/IPv6 单选切换两组 IP 输入) |
| `net_mcvlanAssoc` | get | 🆕 | `{list:[{vlan,profileName}]}` |
| `net_mcvlanAssocAdd/Del` | set | 🆕 | `{vlan,profileName}` |

## 待登记(随 R3 实现逐步补充)

<!-- 每实现一批页面,在此追加对应 cmd 行 -->
<!-- Network 剩余组:Trunk(Settings/Status/Port Priority)、IGMP/MLD Snooping、
     Multicast VLAN、Multicast Filtering、Bandwidth Control(Storm/Ingress/Egress)、
     GVRP、Voice VLAN、LLDP(8 页)、MAC VLAN、Protocol VLAN -->

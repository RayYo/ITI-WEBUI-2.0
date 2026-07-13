/**
 * Mock 适配层(仅 VUE_APP_MOCK=true 时由 main.js 引入)
 *
 * - get.cgi?cmd=xxx → 默认读取 /data/xxx.json
 * - set.cgi?cmd=xxx → 默认返回 save_success
 * - 特殊流程(登录、面板状态、CPU 曲线等)注册专用 handler
 *
 * 与生产环境完全同一套页面代码路径(页面只认识 cgiGet/cgiSet)。
 */
import request from '@/utils/request'
import { parseDs } from '@/utils/payload'

const delay = ms => new Promise(r => setTimeout(r, ms))

const SESSION_KEY = 'mock_logged_in'
const state = {
  get loggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  },
  set loggedIn(v) {
    v ? sessionStorage.setItem(SESSION_KEY, '1') : sessionStorage.removeItem(SESSION_KEY)
  },
  lastLoginFail: '', // ''=ok, 其他为 failReason
  firstBoot: localStorage.getItem('mock_firstboot') === '1',
  poeOn: {}, // port → bool,poe_portEdit 写入,panel_info 读取(避免轮询覆盖开关)
  users: null, // Administration 用户表(懒加载自 aaa_login.json)
  ipAccess: null // IP Access List(懒加载自 sys_ipAccess.json)
}

async function loadJson(name) {
  const resp = await fetch(`${process.env.BASE_URL}data/${name}.json`)
  if (!resp.ok) throw new Error(`mock json not found: ${name}.json`)
  return resp.json()
}

const ok = { status: 'ok', msgType: 'save_success', msg: '' }
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

/* 轮询/动态页说明:这些 cmd 的 JSON 格式契约同样存在于 public/data/<cmd>.json,
 * 真机由 web server 按该格式返回。为了让 mock 里 JSON 真正被加载(格式被验证)
 * 又保留 emulator 般的实时动画,统一做法是:
 *   先 loadJson 拿到「结构 + 基值」(唯一数据源),再仅对数值字段叠加时间动态。
 * 这样 dev 渲染的就是 JSON 派生结构,真机按同格式返回必然显示正确。 */
const timeTick = () => Math.floor(Date.now() / 1000) % 100000 // 0..99999 的时间基
const growthFactor = () => 1 + timeTick() / 100000 // 1.0..2.0 的累积增长

/* ---------- get handlers(默认走 /data/<cmd>.json,这里只放动态数据) ---------- */
const getHandlers = {
  home_login: async() => {
    const base = (await loadJson('home_login')).data
    return { data: { ...base, FIRSTBOOT: state.firstBoot }}
  },

  home_loginStatus: async() => ({
    data: state.lastLoginFail
      ? { status: 'fail', failReason: state.lastLoginFail }
      : { status: 'ok', failReason: '' }
  }),

  /* CPU / 内存:结构/总内存取自 json,cpu 与空闲内存每次轮询波动 */
  sys_cpumem: async() => {
    const base = (await loadJson('sys_cpumem')).data
    const used = rand(140000, 170000)
    return { data: { ...base, cpu: rand(6, 38), memFreeKB: base.memTotalKB - used }}
  },

  /* Real-time Statistics:字段集与基值取自 json,按端口系数 + 时间累积生成计数 */
  port_rtstat: async query => {
    const base = (await loadJson('port_rtstat')).data
    const port = Number(query && query.port) || 1
    const seed = 0.3 + ((port * 37) % 17) / 10 // 每端口固定系数
    const g = growthFactor()
    const out = {}
    Object.keys(base).forEach(k => { out[k] = Math.floor(base[k] * seed * g) + rand(0, 50) })
    return { data: out }
  },

  /* 端口带宽利用率:结构取自 json,link up 的口叠加抖动 */
  port_bwutilz: async() => {
    const base = (await loadJson('port_bwutilz')).data
    const ports = base.ports.map(p => ({
      port: p.port,
      txUtil: p.txUtil ? Math.min(100, p.txUtil + rand(-3, 3)) : 0,
      rxUtil: p.rxUtil ? Math.min(100, p.rxUtil + rand(-3, 3)) : 0
    }))
    return { data: { ports }}
  },

  /* 前面板实时状态(Switch View / Real-time Statistics 共用):
   * link/speed/duplex/poe 结构全部取自 panel_info.json(丰富的多端口 link up);
   * 仅 throughput、PoE 功率叠加小抖动;PoE 开关叠加 poe_portEdit 的内存态。 */
  panel_info: async() => {
    const base = (await loadJson('panel_info')).data
    const ports = base.ports.map(p => {
      let poe = p.poe
      if (poe) {
        const on = state.poeOn[p.port] !== undefined ? state.poeOn[p.port] : poe.on
        const powering = p.link && on
        poe = { ...poe, on, powering, powerMw: powering ? Math.max(0, poe.powerMw + rand(-200, 200)) : 0 }
      }
      return {
        ...p,
        throughputMbps: p.link ? rand(0, Math.max(12, Math.floor(p.speed / 100) || 12)) : 0,
        poe
      }
    })
    return { data: { ports }}
  }
}

/* Statistics Traffic/Error:每端口计数基值取自 port_statistics.json,按时间累积增长;
 * port_cntClear 记录清零时的快照后续做差。 */
const CNT_FIELDS = [
  'inOctets', 'inUcast', 'inNUcast', 'inDiscards', 'outOctets', 'outUcast', 'outNUcast', 'outDiscards',
  'inErrors', 'outErrors', 'dropEvents', 'crcAlign', 'undersize', 'oversize', 'fragments', 'collisions'
]
const cntCleared = {} // port -> {field: 清零时的累计值}
/* 当前各端口累计值(json 基值 × 时间增长因子) */
async function statCurrent() {
  const base = (await loadJson('port_statistics')).data
  const g = growthFactor()
  const map = {}
  base.ports.forEach(p => {
    map[p.port] = {}
    CNT_FIELDS.forEach(f => { map[p.port][f] = Math.floor((p[f] || 0) * g) })
  })
  return map
}
getHandlers.port_statistics = async() => {
  const cur = await statCurrent()
  const ports = Object.keys(cur).map(port => {
    const row = { port: Number(port) }
    CNT_FIELDS.forEach(f => {
      const cleared = (cntCleared[port] && cntCleared[port][f]) || 0
      row[f] = Math.max(0, cur[port][f] - cleared)
    })
    return row
  })
  return { data: { ports }}
}

/* ---------- set handlers ---------- */
const setHandlers = {
  port_cntClear: async params => {
    const cur = await statCurrent()
    const targets = params.all ? Object.keys(cur).map(Number) : [Number(params.port)]
    targets.forEach(port => {
      cntCleared[port] = Object.assign({}, cur[port])
    })
    return ok
  },
  home_loginAuth: async params => {
    if (params.username === 'admin' && params.password === 'admin') {
      state.loggedIn = true
      state.lastLoginFail = ''
    } else {
      state.lastLoginFail = 'error_passwd'
    }
    return ok
  },
  home_logout: async() => {
    state.loggedIn = false
    return ok
  },
  home_save: async() => {
    await delay(600) // 模拟写 flash
    return ok
  },
  home_wizard: async() => {
    localStorage.removeItem('mock_firstboot')
    state.firstBoot = false
    return ok
  },
  poe_portEdit: async params => {
    state.poeOn[params.port] = params.enable === '1' || params.enable === 1
    return ok
  },
  aaa_loginAdd: async params => {
    const users = await ensureUsers()
    if (users.some(u => u.username === params.username)) {
      return { status: 'fail', msgType: 'dup', msg: 'User already exists.' }
    }
    const idx = Math.max.apply(null, [0].concat(users.map(u => u.idx))) + 1
    users.push({ idx, username: params.username })
    return ok
  },
  aaa_loginDel: async params => {
    const users = await ensureUsers()
    state.users = users.filter(u => u.idx !== Number(params.idx))
    return ok
  },
  aaa_loginEdit: async() => ok,
  sys_ipAccess: async params => {
    const ip = await ensureIpAccess()
    ip.enabled = params.enabled === '1' || params.enabled === 1
    return ok
  },
  sys_ipAccessAdd: async params => {
    const ip = await ensureIpAccess()
    const idx = Math.max.apply(null, [0].concat(ip.entries.map(e => e.idx))) + 1
    ip.entries.push({ idx, ip: params.ip })
    return ok
  },
  sys_ipAccessDel: async params => {
    const ip = await ensureIpAccess()
    if (params.all) ip.entries = []
    else ip.entries = ip.entries.filter(e => e.idx !== Number(params.idx))
    return ok
  }
}

/* Administration / IP Access List:初始数据来自 json,增删改在内存生效 */
async function ensureUsers() {
  // eslint-disable-next-line require-atomic-updates
  if (!state.users) state.users = (await loadJson('aaa_login')).data.entries.slice()
  return state.users
}
async function ensureIpAccess() {
  // eslint-disable-next-line require-atomic-updates
  if (!state.ipAccess) state.ipAccess = (await loadJson('sys_ipAccess')).data
  return state.ipAccess
}
getHandlers.aaa_login = async() => ({ data: { entries: await ensureUsers() }})
getHandlers.sys_ipAccess = async() => {
  const ip = await ensureIpAccess()
  return { data: { enabled: ip.enabled, entries: ip.entries }}
}

/**
 * 通用表格 CRUD:初始数据来自 /data/<cmd>.json,增删改在内存生效(刷新丢失)。
 * add 载荷字段名 = entry 字段名;del 传 {<key>:v} 或 {all:1}。
 */
const crudCache = {}
function crud(cmd, opts = {}) {
  const { addCmd, delCmd, editCmd, key = 'idx', defaults = {}} = opts
  const ensure = async() => {
    // eslint-disable-next-line require-atomic-updates
    if (!crudCache[cmd]) crudCache[cmd] = (await loadJson(cmd)).data
    return crudCache[cmd]
  }
  getHandlers[cmd] = async() => ({ data: await ensure() })
  if (addCmd) {
    setHandlers[addCmd] = async params => {
      const d = await ensure()
      if (d.max && d.entries.length >= d.max) {
        return { status: 'fail', msgType: 'full', msg: 'Table is full.' }
      }
      if (key !== 'idx' && d.entries.some(e => String(e[key]) === String(params[key]))) {
        return { status: 'fail', msgType: 'dup', msg: 'Entry already exists.' }
      }
      const entry = Object.assign({}, defaults, params)
      if (key === 'idx' && entry.idx === undefined) {
        entry.idx = Math.max.apply(null, [0].concat(d.entries.map(e => Number(e.idx) || 0))) + 1
      }
      d.entries.push(entry)
      return ok
    }
  }
  if (delCmd) {
    setHandlers[delCmd] = async params => {
      const d = await ensure()
      if (params.all) d.entries = []
      else d.entries = d.entries.filter(e => String(e[key]) !== String(params[key]))
      return ok
    }
  }
  if (editCmd) {
    setHandlers[editCmd] = async params => {
      const d = await ensure()
      const row = d.entries.find(e => String(e[key]) === String(params[key]))
      if (row) Object.assign(row, params)
      return ok
    }
  }
}

/* SNMP 五张表 */
crud('snmp_view', { addCmd: 'snmp_viewAdd', delCmd: 'snmp_viewDel', key: 'name' })
crud('snmp_community', { addCmd: 'snmp_communityAdd', delCmd: 'snmp_communityDel', key: 'name' })
crud('snmp_group', { addCmd: 'snmp_groupAdd', delCmd: 'snmp_groupDel', key: 'name' })
crud('snmp_user', { addCmd: 'snmp_userAdd', delCmd: 'snmp_userDel', key: 'name' })
crud('snmp_notify', { addCmd: 'snmp_notifyAdd', delCmd: 'snmp_notifyDel', key: 'idx' })

/* RMON 四张表 */
crud('rmon_statistics', {
  addCmd: 'rmon_statisticsAdd',
  delCmd: 'rmon_statisticsDel',
  defaults: { dropEvents: 0, octets: 0, packets: 0, broadcast: 0, multicast: 0 }
})
crud('rmon_history', {
  addCmd: 'rmon_historyAdd',
  delCmd: 'rmon_historyDel',
  defaults: { bucketsGranted: 50 }
})
crud('rmon_event', {
  addCmd: 'rmon_eventAdd',
  delCmd: 'rmon_eventDel',
  defaults: { lastSent: '0day 0h:0m:0s' }
})
crud('rmon_alarm', { addCmd: 'rmon_alarmAdd', delCmd: 'rmon_alarmDel' })

/* System Log:日志表走 crud 缓存,log_clear 清空 */
crud('log_syslog')
setHandlers.log_clear = async() => {
  if (crudCache.log_syslog) crudCache.log_syslog.entries = []
  return ok
}

/* L3 Feature 表 */
crud('l3_arpAging', { editCmd: 'l3_arpAgingEdit', key: 'interface' })
crud('l3_arpTable', {
  addCmd: 'l3_arpAdd',
  delCmd: 'l3_arpDel',
  key: 'ip',
  defaults: { intfName: 'vlan1', agingTime: '-', ipType: 'Static' }
})
crud('l3_ipv4Intf', { addCmd: 'l3_ipv4IntfAdd', delCmd: 'l3_ipv4IntfDel', editCmd: 'l3_ipv4IntfEdit', key: 'intf' })
crud('l3_ipv4Route', { addCmd: 'l3_ipv4RouteAdd', delCmd: 'l3_ipv4RouteDel', key: 'idx' })
crud('l3_ipv6Intf', { addCmd: 'l3_ipv6IntfAdd', delCmd: 'l3_ipv6IntfDel', editCmd: 'l3_ipv6IntfEdit', key: 'intf' })
crud('l3_ipv6Neighbor', { addCmd: 'l3_ipv6NeighborAdd', delCmd: 'l3_ipv6NeighborDel', key: 'ipv6' })
crud('l3_ipv6Route', { addCmd: 'l3_ipv6RouteAdd', delCmd: 'l3_ipv6RouteDel', key: 'idx' })

/* ---------- Network R3 第一批:Physical Interface / Mirroring / Loopback Detection ---------- */
const netCache = {}
async function netData(cmd) {
  // eslint-disable-next-line require-atomic-updates
  if (!netCache[cmd]) netCache[cmd] = (await loadJson(cmd)).data
  return netCache[cmd]
}
const toBool = v => v === '1' || v === 1 || v === true || v === 'true'
const parseList = s => (s ? String(s).split(',').filter(Boolean).map(Number) : [])

getHandlers.net_phyInterface = async() => ({ data: await netData('net_phyInterface') })
setHandlers.net_phyInterfaceEdit = async params => {
  const d = await netData('net_phyInterface')
  const boolFields = ['adminEnabled', 'jumbo', 'flowCtrl', 'eapPassThrough', 'bpduPassThrough']
  const apply = row => {
    boolFields.forEach(f => { if (params[f] !== undefined) row[f] = toBool(params[f]) })
    if (params.mode !== undefined) row.mode = params.mode
    if (params.description !== undefined) row.description = params.description
  }
  if (params.all) d.ports.forEach(apply)
  else { const row = d.ports.find(p => String(p.port) === String(params.port)); if (row) apply(row) }
  return ok
}

getHandlers.net_mirror = async() => ({ data: await netData('net_mirror') })
setHandlers.net_mirrorEdit = async params => {
  const d = await netData('net_mirror')
  d.status = toBool(params.status)
  d.targetPort = Number(params.targetPort) || 0
  d.ingress = parseList(params.ingress)
  d.egress = parseList(params.egress)
  return ok
}

getHandlers.net_loopback = async() => ({ data: await netData('net_loopback') })
setHandlers.net_loopbackGlobal = async params => {
  const d = await netData('net_loopback')
  d.status = toBool(params.status)
  if (params.interval !== undefined) d.interval = Number(params.interval)
  if (params.recoverTime !== undefined) d.recoverTime = Number(params.recoverTime)
  return ok
}
setHandlers.net_loopbackPort = async params => {
  const d = await netData('net_loopback')
  const apply = row => { if (params.state !== undefined) row.state = toBool(params.state) }
  if (params.all) d.ports.forEach(apply)
  else { const row = d.ports.find(p => String(p.port) === String(params.port)); if (row) apply(row) }
  return ok
}

/* ---------- Network R3 第二批:VLAN(Forwarding/Current/Dynamic/Tagged/Private) ---------- */
// Forwarding Table Mode
getHandlers.net_vlanFwdMode = async() => ({ data: await netData('net_vlanFwdMode') })
setHandlers.net_vlanFwdMode = async params => {
  const d = await netData('net_vlanFwdMode')
  if (params.mode !== undefined) d.mode = params.mode
  return ok
}

// Current VLAN Database(只读)
getHandlers.net_vlanCurrent = async() => ({ data: await netData('net_vlanCurrent') })

// Dynamic Forwarding Table(可按 port 过滤,0=All)
getHandlers.net_vlanDynamic = async query => {
  const d = await netData('net_vlanDynamic')
  const port = Number(query.port) || 0
  const list = port ? d.list.filter(r => r.port === port) : d.list
  return { data: { list } }
}

// Tagged VLAN(表 + 每 VLAN 端口成员归属:1=Tagged 2=Untagged 3=NotMember)
getHandlers.net_vlanTagged = async() => ({ data: await netData('net_vlanTagged') })
setHandlers.net_vlanTaggedEdit = async params => {
  const d = await netData('net_vlanTagged')
  const id = Number(params.id)
  const members = parseList(params.members) // 逗号分隔的每端口状态
  const row = d.list.find(v => v.id === id)
  if (row) { // Modify
    if (params.name !== undefined) row.name = params.name
    if (members.length) row.members = members
  } else { // Add
    d.list.push({ id, name: params.name || '', type: 'Static', members: members.length ? members : new Array(28).fill(3) })
    d.list.sort((a, b) => a.id - b.id)
  }
  return ok
}
setHandlers.net_vlanTaggedDel = async params => {
  const d = await netData('net_vlanTagged')
  const id = Number(params.id)
  const i = d.list.findIndex(v => v.id === id)
  if (i !== -1) d.list.splice(i, 1)
  return ok
}

// VLAN Port Settings(PVID / Acceptable Frame Types / Ingress Filtering)
getHandlers.net_vlanPort = async() => ({ data: await netData('net_vlanPort') })
setHandlers.net_vlanPortEdit = async params => {
  const d = await netData('net_vlanPort')
  const apply = row => {
    if (params.pvid !== undefined && params.pvid !== '') row.pvid = Number(params.pvid)
    if (params.acceptFrame !== undefined) row.acceptFrame = params.acceptFrame
    if (params.ingressFilter !== undefined) row.ingressFilter = toBool(params.ingressFilter)
  }
  if (params.all) d.ports.forEach(apply)
  else { const row = d.ports.find(p => String(p.port) === String(params.port)); if (row) apply(row) }
  return ok
}

// Private VLAN
getHandlers.net_vlanPrivate = async() => ({ data: await netData('net_vlanPrivate') })
setHandlers.net_vlanPrivateGlobal = async params => {
  const d = await netData('net_vlanPrivate')
  d.status = toBool(params.status)
  return ok
}
setHandlers.net_vlanPrivatePort = async params => {
  const d = await netData('net_vlanPrivate')
  const src = Number(params.sourcePort)
  const fwd = parseList(params.forwardingPorts)
  d.sourcePort = src
  d.forwardingPorts = fwd
  const rangeStr = fwd.length ? fwd.join(',') : '-'
  const row = d.portList.find(r => r.port === src)
  if (row) row.portMap = rangeStr
  return ok
}

/* ---------- Network R3 第三批:MAC Address(Static Unicast / Static Multicast) ---------- */
// Static Unicast(单端口成员)
getHandlers.mac_staticUnicast = async() => ({ data: await netData('mac_staticUnicast') })
setHandlers.mac_staticUnicastAdd = async params => {
  const d = await netData('mac_staticUnicast')
  const vlan = Number(params.vlan)
  const mac = String(params.mac || '').toUpperCase()
  const i = d.list.findIndex(e => e.vlan === vlan && e.mac.toUpperCase() === mac)
  const entry = { vlan, mac, port: Number(params.port) || 0 }
  if (i !== -1) d.list.splice(i, 1, entry)
  else d.list.push(entry)
  return ok
}
setHandlers.mac_staticUnicastDel = async params => {
  const d = await netData('mac_staticUnicast')
  if (params.all) d.list = []
  else d.list = d.list.filter(e => !(e.vlan === Number(params.vlan) && e.mac.toUpperCase() === String(params.mac).toUpperCase()))
  return ok
}

// Static Multicast(多端口组成员)
getHandlers.mac_staticMulticast = async() => ({ data: await netData('mac_staticMulticast') })
setHandlers.mac_staticMulticastAdd = async params => {
  const d = await netData('mac_staticMulticast')
  const vlan = Number(params.vlan)
  const mac = String(params.mac || '').toUpperCase()
  const i = d.list.findIndex(e => e.vlan === vlan && e.mac.toUpperCase() === mac)
  const entry = { vlan, mac, ports: parseList(params.ports) }
  if (i !== -1) d.list.splice(i, 1, entry)
  else d.list.push(entry)
  return ok
}
setHandlers.mac_staticMulticastDel = async params => {
  const d = await netData('mac_staticMulticast')
  if (params.all) d.list = []
  else d.list = d.list.filter(e => !(e.vlan === Number(params.vlan) && e.mac.toUpperCase() === String(params.mac).toUpperCase()))
  return ok
}

function respond(config, data) {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config
  }
}

export function setupMock() {
  request.defaults.adapter = async config => {
    const parts = (config.url || '').split('?')
    const path = parts[0]
    const query = {}
    new URLSearchParams(parts[1] || '').forEach((v, k) => { query[k] = v })
    const cmd = query.cmd

    await delay(rand(80, 260))

    if (path.indexOf('get.cgi') !== -1) {
      if (getHandlers[cmd]) return respond(config, await getHandlers[cmd](query, config))
      try {
        return respond(config, await loadJson(cmd))
      } catch (e) {
        console.warn(`[mock] missing data/${cmd}.json`)
        return respond(config, { data: {}})
      }
    }

    if (path.indexOf('set.cgi') !== -1) {
      const params = parseDs(config.data)
      console.debug(`[mock] set ${cmd}`, params)
      if (setHandlers[cmd]) return respond(config, await setHandlers[cmd](params, config))
      return respond(config, ok)
    }

    throw new Error(`[mock] unhandled request: ${config.url}`)
  }
  console.info('[mock] cgi mock adapter enabled (admin/admin)')
}

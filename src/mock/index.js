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
  users: [{ idx: 1, username: 'admin' }], // Administration 用户表
  ipAccess: { enabled: false, entries: [] } // IP Access List
}

let devinfoCache = null
async function loadJson(name) {
  const resp = await fetch(`${process.env.BASE_URL}data/${name}.json`)
  if (!resp.ok) throw new Error(`mock json not found: ${name}.json`)
  return resp.json()
}
async function getDevinfo() {
  // eslint-disable-next-line require-atomic-updates
  if (!devinfoCache) devinfoCache = (await loadJson('sys_devinfo')).data
  return devinfoCache
}

const ok = { status: 'ok', msgType: 'save_success', msg: '' }
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

/* ---------- get handlers(默认走 /data/<cmd>.json,这里只放动态数据) ---------- */
const getHandlers = {
  home_login: async() => {
    const dev = await getDevinfo()
    return { data: { FIRSTBOOT: state.firstBoot, model: dev.model }}
  },

  home_loginStatus: async() => ({
    data: state.lastLoginFail
      ? { status: 'fail', failReason: state.lastLoginFail }
      : { status: 'ok', failReason: '' }
  }),

  /* CPU / 内存:每次轮询返回随机波动值 */
  sys_cpumem: async() => {
    const total = 255572
    const used = rand(140000, 170000)
    return { data: { cpu: rand(6, 38), memTotalKB: total, memFreeKB: total - used }}
  },

  /* Real-time Statistics:单端口包计数(随时间累积的随机增量,不同端口数据不同) */
  port_rtstat: async query => {
    const port = Number(query && query.port) || 1
    const seed = 0.3 + ((port * 37) % 17) / 10 // 每端口固定系数
    const base = Math.floor(Date.now() / 1000) % 100000
    const mk = f => Math.floor(base * f * seed) + rand(0, 50)
    return {
      data: {
        totalRx: mk(3), totalTx: mk(2.2),
        ucRx: mk(2), mcRx: mk(0.5), bcRx: mk(0.3),
        ucTx: mk(1.6), mcTx: mk(0.4), bcTx: mk(0.2)
      }
    }
  },

  /* 端口带宽利用率:link up 的口返回随机利用率 */
  port_bwutilz: async() => {
    const dev = await getDevinfo()
    const ports = dev.ports.map(p => {
      const linked = (p.port % 3 !== 0 && p.port <= 10) || p.port === dev.ports.length
      return {
        port: p.port,
        txUtil: linked ? rand(2, 65) : 0,
        rxUtil: linked ? rand(2, 80) : 0
      }
    })
    return { data: { ports }}
  },

  /* 前面板实时状态:按 devinfo 端口表生成(Switch View / Real-time Statistics 共用) */
  panel_info: async() => {
    const dev = await getDevinfo()
    const ports = dev.ports.map(p => {
      const linked = p.port === 1
      const speed = linked ? 1000 : 0
      const on = state.poeOn[p.port] !== undefined ? state.poeOn[p.port] : true
      const powering = p.poe && linked && on
      return {
        port: p.port,
        link: linked,
        speed,
        duplex: linked ? 'full' : '',
        throughputMbps: linked ? rand(0, 12) : 0,
        loopback: 'normal',
        distance: null,
        poe: p.poe
          ? { on, powering, powerMw: powering ? 4500 : 0, standard: 'PoE' }
          : null
      }
    })
    return { data: { ports }}
  }
}

/* ---------- set handlers ---------- */
const setHandlers = {
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
    if (state.users.some(u => u.username === params.username)) {
      return { status: 'fail', msgType: 'dup', msg: 'User already exists.' }
    }
    const idx = Math.max.apply(null, [0].concat(state.users.map(u => u.idx))) + 1
    state.users.push({ idx, username: params.username })
    return ok
  },
  aaa_loginDel: async params => {
    state.users = state.users.filter(u => u.idx !== Number(params.idx))
    return ok
  },
  aaa_loginEdit: async() => ok,
  sys_ipAccess: async params => {
    state.ipAccess.enabled = params.enabled === '1' || params.enabled === 1
    return ok
  },
  sys_ipAccessAdd: async params => {
    const idx = Math.max.apply(null, [0].concat(state.ipAccess.entries.map(e => e.idx))) + 1
    state.ipAccess.entries.push({ idx, ip: params.ip })
    return ok
  },
  sys_ipAccessDel: async params => {
    if (params.all) state.ipAccess.entries = []
    else state.ipAccess.entries = state.ipAccess.entries.filter(e => e.idx !== Number(params.idx))
    return ok
  }
}

/* Administration / IP Access List:内存状态,支持增删演示 */
getHandlers.aaa_login = async() => ({ data: { entries: state.users }})
getHandlers.sys_ipAccess = async() => ({
  data: { enabled: state.ipAccess.enabled, entries: state.ipAccess.entries }
})

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

/* L3 Feature 表 */
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

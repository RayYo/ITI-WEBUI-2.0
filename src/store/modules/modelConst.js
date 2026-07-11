import { cgiGet } from '@/api/cgi'

/**
 * 机型能力信息:全部由 sys_devinfo 数据驱动(兼容不同机型:
 * 最多 48 Copper + 6 Fiber、10G、可选 PoE)。
 */
const state = {
  modelName: '',
  portNum: 0,
  copperPortNum: 0,
  lagNum: 0,
  fiberNum: 0,
  poeNum: 0,
  comboNum: 0,
  poeBudget: 0,
  hasL3: false,
  hasCloud: false,
  ports: [] // 原始端口表 [{port,type,maxSpeed,poe,combo}]
}

const mutations = {
  MODEL_NAME_SETTING: (state, dev) => {
    const ports = dev.ports || []
    state.modelName = dev.model || ''
    state.portNum = ports.length
    state.copperPortNum = ports.filter(p => p.type === 'copper').length
    state.fiberNum = ports.filter(p => p.type === 'fiber').length
    state.poeNum = ports.filter(p => p.poe).length
    state.comboNum = ports.filter(p => p.combo).length
    state.lagNum = dev.lagCount || 0
    state.poeBudget = (dev.capability && dev.capability.poeBudget) || 0
    state.hasL3 = !!(dev.capability && dev.capability.l3)
    state.hasCloud = !!(dev.capability && dev.capability.cloud)
    state.ports = ports
  }
}

const actions = {
  async modelInfoSet({ commit, state }) {
    const dev = await cgiGet('sys_devinfo')
    commit('MODEL_NAME_SETTING', dev)
    return state
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}


const state = {
  account: {
    username: '',
    password: ''
  },
  time: '',
  ipConfig: {
    ip: '',
    mask: '',
    gw: '',
    dns: ''
  }
}

const mutations = {
  ACCOUNT: (state, accountObj) => {
    state.account.username = accountObj.username
    state.account.password = accountObj.password
  },
  TIME: (state, timeStr) => {
    state.time = timeStr
  },
  IPCONFIG: (state, ipConfigObj) => {
    state.ipConfig.ip = ipConfigObj.ip
    state.ipConfig.mask = ipConfigObj.mask
    state.ipConfig.gw = ipConfigObj.gw
    state.ipConfig.dns = ipConfigObj.dns
  }
}

const actions = {
  userAccount({ commit }, accountObj) {
    commit('ACCOUNT', accountObj)
  },
  timeSetting({ commit }, timeStr) {
    commit('TIME', timeStr)
  },
  toggleDevice({ commit }, ipConfigObj) {
    commit('IPCONFIG', ipConfigObj)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

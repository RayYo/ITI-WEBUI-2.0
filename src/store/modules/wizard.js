import request from '@/utils/request'

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
  UPDATE: (state, dataObj) => {
    Object.assign(state.account, dataObj.account)
    state.time = dataObj.time
    Object.assign(state.ipConfig, dataObj.ipConfig)
  },
  ACCOUNT: (state, accountObj) => {
    // state.account.username = accountObj.username
    // state.account.password = accountObj.password
    Object.assign(state.account, accountObj)
  },
  TIME: (state, timeStr) => {
    state.time = timeStr
  },
  IPCONFIG: (state, ipConfigObj) => {
    // state.ipConfig.ip = ipConfigObj.ip
    // state.ipConfig.mask = ipConfigObj.mask
    // state.ipConfig.gw = ipConfigObj.gw
    // state.ipConfig.dns = ipConfigObj.dns
    Object.assign(state.ipConfig, ipConfigObj)
  }
}

const actions = {
  updateState({ commit }) {
    return new Promise((resolve, reject) => {
      request.get('url_get_wizard').then(resp => {
        commit('UPDATE', resp.data)
        resolve(resp.data)
      }).catch(err => {
        console.log('actions request err ', err)
        reject(err)
      })
    })
  },
  userAccount({ commit }, accountObj) {
    commit('ACCOUNT', accountObj)
  },
  timeSetting({ commit }, timeStr) {
    commit('TIME', timeStr)
  },
  ipConfig({ commit }, ipConfigObj) {
    commit('IPCONFIG', ipConfigObj)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

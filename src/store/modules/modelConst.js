import request from '@/utils/request'

const state = {
  modelName: '',
  portNum: 0,
  lagNum: 0,
  fiberNum: 0,
  poeNum: 0,
  comboNum: 0
}

const mutations = {
  MODEL_NAME_SETTING: (state, modelObj) => {
    Object.keys(state).forEach(key => { state[key] = modelObj[key] })
  }
}

const actions = {
  modelInfoSet({ commit }) {
    return new Promise((resolve, reject) => {
      request.get('url_get_loginInfo').then(resp => {
        commit('MODEL_NAME_SETTING', resp.data)
        resolve(resp.data)
      }).catch(err => {
        console.log('actions request err ', err)
        reject(err)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

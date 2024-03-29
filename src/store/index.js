import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import modelConst from './modules/modelConst'
import wizard from './modules/wizard'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    modelConst,
    wizard
  },
  getters
})

export default store

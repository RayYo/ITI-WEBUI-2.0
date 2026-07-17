import Vue from 'vue'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n
import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

// mock 模式不再拦截 axios:cgiGet/cgiSet 直接把 URL 指向静态 /data/*.json(见 @/api/cgi)。
// 这样每次都是真实可见的 HTTP 请求,且可打包成静态 emulator 部署。

// set ElementUI lang to EN
Vue.use(ElementUI, { locale })

// 全站统一翻页组件(以 IPv4 ARP Table 的设计为准),全局注册免逐页 import
import EmuPagination from '@/components/Emu/EmuPagination.vue'
Vue.component('EmuPagination', EmuPagination)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

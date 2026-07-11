import axios from 'axios'
import { Message } from 'element-ui'

/**
 * 纯 axios 实例:业务语义(cmd 拼接 / _ds 载荷 / 成败提示)全部在 @/api/cgi.js。
 * 开发模式(VUE_APP_MOCK)由 @/mock 挂 adapter 拦截 get.cgi/set.cgi。
 */
const request = axios.create({
  timeout: 15000
})

// response interceptor:只处理会话失效与网络层错误
request.interceptors.response.use(
  response => {
    const res = response.data
    if (res && res.logout === true) {
      Message({
        message: res.reason || 'Session expired, please login again.',
        type: 'error',
        duration: 5 * 1000
      })
      // 懒加载避免循环依赖
      const store = require('@/store').default
      const router = require('@/router').default
      store.dispatch('user/resetToken').then(() => {
        if (router.currentRoute.path !== '/login') router.push('/login')
      })
      return Promise.reject(new Error(res.reason || 'Session expired'))
    }
    return response
  },
  error => {
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default request

import request from '@/utils/request'
import { buildDs } from '@/utils/payload'
import { Message, Loading } from 'element-ui'

/**
 * cgi 请求封装 —— 唯一区分 mock / real 的地方。
 *
 * - mock(VUE_APP_MOCK=true):URL 直接指向静态 JSON(可打包成静态 emulator 部署)
 *     GET → `${BASE}data/<cmd>.json`
 *     SET → `${BASE}data/_ok.json`(真实可见的 GET,固定返回 ok;静态站无法收 POST)
 * - real:走真实 cgi
 *     GET → `/cgi/get.cgi?cmd=<cmd>[&k=v...]`
 *     SET → `POST /cgi/set.cgi?cmd=<cmd>`,载荷 `{"_ds=1&k=v&_de=1":{}}`
 *
 * 两种模式都发真实 HTTP(Network 可见、loading 生效、数据到达才渲染)。
 * 上机时把 /cgi/*.cgi 接到后端即可,前端零改动(real 构建)。
 *
 * loading(封装层统一):
 *  - 默认在内容区 `.app-main` 盖遮罩(与原版普通页一致)
 *  - opts.fullscreen=true 整页遮罩(Dashboard 用)
 *  - opts.loading=false 跳过(轮询/后台请求用)
 */
const MOCK = process.env.VUE_APP_MOCK === 'true'
const BASE = process.env.BASE_URL || '/'
const delay = ms => new Promise(r => setTimeout(r, ms))

let pending = 0
let loadingInstance = null
function openLoading(fullscreen) {
  if (pending === 0) {
    const el = fullscreen ? null : document.querySelector('.app-main')
    loadingInstance = Loading.service({
      target: el || undefined,
      fullscreen: fullscreen || !el,
      lock: true,
      text: 'Loading',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    })
  }
  pending++
}
function closeLoading() {
  pending = Math.max(0, pending - 1)
  if (pending === 0 && loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}

/**
 * GET
 * @param {string} cmd
 * @param {object} params real 模式拼进 query;mock 忽略(静态文件),需过滤请在页面内做
 * @param {object} opts { loading?:boolean=true, fullscreen?:boolean=false }
 * 返回 response.data.data
 */
export async function cgiGet(cmd, params = {}, opts = {}) {
  const { loading = true, fullscreen = false } = opts
  if (loading) openLoading(fullscreen)
  try {
    if (MOCK) await delay(300) // 让 loading 可见
    let url
    if (MOCK) {
      url = `${BASE}data/${cmd}.json`
    } else {
      const qs = new URLSearchParams(Object.assign({ cmd }, params))
      url = `/cgi/get.cgi?${qs}`
    }
    const resp = await request.get(url)
    return (resp.data && resp.data.data) || {}
  } catch (e) {
    if (MOCK) { console.warn(`[mock] GET ${cmd} failed:`, e.message); return {} }
    throw e
  } finally {
    if (loading) closeLoading()
  }
}

/**
 * SET
 * options:
 *  - successMsg: false 关闭成功提示 | string 自定义文案
 *  - loading: boolean=true
 *  - fullscreen: boolean=false
 */
export async function cgiSet(cmd, payload = {}, options = {}) {
  const { successMsg = true, loading = true, fullscreen = false } = options
  if (loading) openLoading(fullscreen)
  try {
    if (MOCK) await delay(300)
    let resp
    if (MOCK) {
      resp = await request.get(`${BASE}data/_ok.json`)
    } else {
      resp = await request.post(`/cgi/set.cgi?cmd=${cmd}`, buildDs(payload))
    }
    const data = resp.data || {}
    if (data.status !== 'ok') {
      Message({
        showClose: true,
        message: data.msg || 'Save failed.',
        type: 'error',
        duration: 5 * 1000
      })
      const err = new Error(data.msg || 'cgi set failed')
      err.cgi = data
      throw err
    }
    if (successMsg) {
      Message.success({
        showClose: true,
        message: typeof successMsg === 'string' ? successMsg : 'Success.'
      })
    }
    return data
  } finally {
    if (loading) closeLoading()
  }
}

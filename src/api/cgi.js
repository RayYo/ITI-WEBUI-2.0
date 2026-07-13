import request from '@/utils/request'
import { buildDs } from '@/utils/payload'
import { Message } from 'element-ui'

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
 * 两种模式都发真实 HTTP(Network 可见、数据到达才渲染)。
 * 上机时把 /cgi/*.cgi 接到后端即可,前端零改动(real 构建)。
 *
 * loading(与原版一致):由页面自己在数据表格上用 `v-loading` 表现
 *  —— 只有含数据表格(el-table)的页才有 loading,遮罩仅盖表格、无文字。
 *  纯表单页(仅 from_table 设置项)不显示 loading。
 *  Dashboard 为整屏 loading,自行用 $loading 管理。
 *  cgi 封装层不再统一盖遮罩;旧的 opts.loading / fullscreen 参数保留但已无副作用。
 */
const MOCK = process.env.VUE_APP_MOCK === 'true'
const BASE = process.env.BASE_URL || '/'
const delay = ms => new Promise(r => setTimeout(r, ms))

/**
 * GET
 * @param {string} cmd
 * @param {object} params real 模式拼进 query;mock 忽略(静态文件),需过滤请在页面内做
 * @param {object} opts 兼容旧签名,当前无副作用
 * 返回 response.data.data
 */
export async function cgiGet(cmd, params = {}, opts = {}) {
  try {
    if (MOCK) await delay(300) // 让表格 loading 可见
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
  }
}

/**
 * SET
 * options:
 *  - successMsg: false 关闭成功提示 | string 自定义文案
 *  (loading 由调用页在表格上用 v-loading 管理,这里不盖遮罩)
 */
export async function cgiSet(cmd, payload = {}, options = {}) {
  const { successMsg = true } = options
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
}

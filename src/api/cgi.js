import request from '@/utils/request'
import { buildDs } from '@/utils/payload'
import { Message } from 'element-ui'

/**
 * GET /cgi/get.cgi?cmd=<cmd>[&k=v...]
 * 返回 response.data.data
 */
export async function cgiGet(cmd, params = {}) {
  const qs = new URLSearchParams(Object.assign({ cmd }, params))
  const resp = await request.get(`/cgi/get.cgi?${qs}`)
  return (resp.data && resp.data.data) || {}
}

/**
 * POST /cgi/set.cgi?cmd=<cmd>,载荷 {"_ds=1&k=v&_de=1":{}}
 * 成功({status:'ok'})默认弹出成功提示;失败(status 非 ok)弹出 msg 并 reject。
 *
 * options:
 *  - successMsg: false 关闭成功提示 | string 自定义提示文案
 */
export async function cgiSet(cmd, payload = {}, options = {}) {
  const { successMsg = true } = options
  const resp = await request.post(`/cgi/set.cgi?cmd=${cmd}`, buildDs(payload))
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

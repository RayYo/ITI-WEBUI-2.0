/**
 * web server 的 set.cgi 载荷固定格式:
 *   {"_ds=1&key1=val1&key2=val2&_de=1":{}}
 * 空对象时为 {"_ds=1&empty=1&_de=1":{}}
 */
export function buildDs(obj = {}) {
  const pairs = Object.entries(obj).map(
    ([k, v]) => `${k}=${encodeURIComponent(v)}`
  )
  const body = pairs.length ? pairs.join('&') : 'empty=1'
  return { [`_ds=1&${body}&_de=1`]: {}}
}

/** 从 mock adapter 收到的请求体中解析出 _ds 参数(仅 mock 用) */
export function parseDs(data) {
  if (!data) return {}
  const obj = typeof data === 'string' ? JSON.parse(data) : data
  const key = Object.keys(obj).find(k => k.startsWith('_ds=1'))
  if (!key) return {}
  const params = {}
  new URLSearchParams(key).forEach((v, k) => {
    if (k !== '_ds' && k !== '_de') params[k] = v
  })
  return params
}

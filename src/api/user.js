import { cgiGet, cgiSet } from '@/api/cgi'
import { Message } from 'element-ui'

/**
 * 登录流程(与设备端一致):
 * set home_loginAuth → get home_loginStatus 查验证结果
 */
export async function login(data) {
  await cgiSet('home_loginAuth', data, { successMsg: false })
  const status = await cgiGet('home_loginStatus')
  if (status.status !== 'ok') {
    Message({
      showClose: true,
      message: 'Invalid username or password.',
      type: 'error',
      duration: 5 * 1000
    })
    throw new Error(status.failReason || 'Invalid username or password.')
  }
  return status
}

export function logout() {
  return cgiSet('home_logout', {}, { successMsg: false })
}

/** 登录页初始化信息(机型名 / 是否首次开机进 Wizard) */
export function loginInfo() {
  return cgiGet('home_login')
}

const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  modelInfo: state => key => state.modelConst[key],
  userAccount: state => state.wizard.account,
  currentTime: state => state.wizard.time,
  ipInfo: state => state.wizard.ipConfig
}
export default getters

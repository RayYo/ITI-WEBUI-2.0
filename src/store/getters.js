const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  modelInfo: state => key => state.modelConst[key]
}
export default getters

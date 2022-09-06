import { Message } from 'element-ui'
import { MessageBox } from 'element-ui'

const message = {
  success: function() {
    Message.success({
      showClose: true,
      message: 'Success.'
    })
  },
  warnBox: function(msg) {
    MessageBox({
      type: 'warning',
      title: 'Warning',
      message: msg
    })
  },
  confirmWarnBox: function(msg, title) {
    return MessageBox.confirm(msg, title, {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
  }
}

export default message

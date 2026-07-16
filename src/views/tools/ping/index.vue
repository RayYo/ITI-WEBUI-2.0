<template>
  <div class="main_body">
    <div id="basetitle">Ping Test Settings</div>
    <div>
      <div class="table_title">Ping Test Settings</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td rowspan="2">Destination IP Address</td>
            <td>
              <base-input v-model="ipv4" max-len="15" :disabled="ipVer !== '1'" />
              <input id="IPv4" v-model="ipVer" value="1" type="radio" name="racal" class="tipAfterInputBox">
              <label for="IPv4">IPv4</label>
            </td>
          </tr>
          <tr>
            <td>
              <base-input v-model="ipv6" max-len="43" :disabled="ipVer !== '2'" />
              <input id="IPv6" v-model="ipVer" value="2" type="radio" name="racal" class="tipAfterInputBox">
              <label for="IPv6">IPv6</label>
            </td>
          </tr>
          <tr>
            <td>Timeout Value</td>
            <td>
              <base-input v-model="timeout" max-len="1" @check="onlyNum('timeout')" />
              <span class="tipAfterInputBox">(1-5) sec</span>
            </td>
          </tr>
          <tr>
            <td>Number of Ping Requests</td>
            <td>
              <base-input v-model="requests" max-len="2" @check="onlyNum('requests')" />
              <span class="tipAfterInputBox">(1-10) times</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="margin1015">
      <input type="button" :class="['btnOutTable', { btnDisabled: pinging }]" :disabled="pinging" value="Start" @click="onStart">
      <input type="button" :class="['btnOutTable', { btnDisabled: pinging }]" :disabled="pinging" value="Show Ping Result" @click="onShow">
    </div>
  </div>
</template>

<script>
import { cgiSet } from '@/api/cgi'
import message from '@/utils/message'
import baseInput from '@/components/CustomInput/base-input.vue'

export default {
  components: { baseInput },
  data() {
    return {
      ipVer: '1',
      ipv4: '',
      ipv6: '',
      timeout: '3',
      requests: '10',
      pinging: false,
      lastIp: ''
    }
  },
  methods: {
    onlyNum(key) { this[key] = this[key].replace(/[^0-9]/g, '') },
    onStart() {
      const ip = this.ipVer === '1' ? this.ipv4 : this.ipv6
      if (this.ipVer === '1') {
        if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) { message.warnBox('Invalid IP Address(IPv4).'); return }
      } else {
        if (!/^[0-9a-f:]+$/i.test(ip) || !ip.includes(':')) { message.warnBox('Invalid IP Address(IPv6).'); return }
      }
      const timeout = Number(this.timeout)
      if (!this.timeout || timeout < 1 || timeout > 5) { message.warnBox('Timeout Value must be within 1 ~ 5.'); return }
      const times = Number(this.requests)
      if (!this.requests || times < 1 || times > 10) { message.warnBox('Number of Ping Requests must be within 1 ~ 10.'); return }
      // ping 过程中两个按钮均不可点击,结束后恢复
      this.pinging = true
      cgiSet('tools_pingStart', { ip, timeout: this.timeout, times: this.requests }, { successMsg: false })
      setTimeout(() => {
        this.pinging = false
        this.lastIp = ip
      }, times * 300)
    },
    onShow() {
      this.$router.push({ path: '/tools/ping/result', query: { ip: this.lastIp || undefined }})
    }
  }
}
</script>

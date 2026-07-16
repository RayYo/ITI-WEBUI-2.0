<template>
  <div class="main_body">
    <div id="basetitle">Ping Watchdog</div>
    <div>
      <div class="table_title">Ping Watchdog Host</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Host IP Address</td>
            <td>
              <base-input v-model="ip" max-len="15" />
            </td>
          </tr>
          <tr>
            <td>Query Interval</td>
            <td>
              <base-input v-model="queryInterval" max-len="4" @check="onlyNum('queryInterval')" />
              <span class="tipAfterInputBox">(30-3600){{ NBSP }}Sec</span>
            </td>
          </tr>
          <tr>
            <td>Retry Counts</td>
            <td>
              <base-input v-model="retryCounts" max-len="3" @check="onlyNum('retryCounts')" />
              <span class="tipAfterInputBox">(1-100)</span>
            </td>
          </tr>
          <tr>
            <td>Reboot Counts</td>
            <td>
              <base-input v-model="rebootCounts" max-len="5" @check="onlyNum('rebootCounts')" />
              <span class="tipAfterInputBox">(1-65535)</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Previous Page" @click="$router.back()">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import message from '@/utils/message'
import baseInput from '@/components/CustomInput/base-input.vue'

const NBSP = '\u00A0'

export default {
  components: { baseInput },
  data() {
    return {
      NBSP,
      ip: '',
      queryInterval: '',
      retryCounts: '',
      rebootCounts: ''
    }
  },
  watch: {
    // 同页不同 query 导航时组件被复用,需重新加载
    $route: 'init'
  },
  created() {
    this.init()
  },
  methods: {
    onlyNum(key) { this[key] = this[key].replace(/[^0-9]/g, '') },
    init() {
      this.ip = ''
      this.queryInterval = ''
      this.retryCounts = ''
      this.rebootCounts = ''
      const { ip } = this.$route.query
      cgiGet('tools_pingWatchdog').then(d => {
        const host = (d.hosts || []).find(h => h.ip === ip)
        if (!host) return
        this.ip = host.ip
        this.queryInterval = String(host.queryInterval)
        this.retryCounts = String(host.retryCounts)
        this.rebootCounts = String(host.rebootCounts)
      })
    },
    onApply() {
      if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(this.ip)) { message.warnBox('Invalid IP Address(IPv4).'); return }
      const q = Number(this.queryInterval)
      if (!this.queryInterval || q < 30 || q > 3600) { message.warnBox('Query Interval must be within 30 ~ 3600.'); return }
      const r = Number(this.retryCounts)
      if (!this.retryCounts || r < 1 || r > 100) { message.warnBox('Retry Counts must be within 1 ~ 100.'); return }
      const b = Number(this.rebootCounts)
      if (!this.rebootCounts || b < 1 || b > 65535) { message.warnBox('Reboot Counts must be within 1 ~ 65535.'); return }
      cgiSet('tools_pingWatchdogEdit', {
        oldIp: this.$route.query.ip,
        ip: this.ip,
        queryInterval: this.queryInterval,
        retryCounts: this.retryCounts,
        rebootCounts: this.rebootCounts
      }, { successMsg: false }).then(() => {
        this.$router.back()
      })
    }
  }
}
</script>

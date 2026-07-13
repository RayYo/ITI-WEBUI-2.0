<template>
  <div class="main_body">
    <div id="basetitle">System log Settings</div>
    <div>
      <common-table
        header-title="System log Settings"
        :first-column="['Time Stamp','Messages Buffered Size', 'Syslog Status', 'Syslog Server IP','Facility','Logging Level']"
        :double-rows="[3]"
      >
        <template #0>
          <select v-model="timeStampEnabled">
            <option value="1"><span>Enabled</span></option>
            <option value="2"><span>Disabled</span></option>
          </select>
        </template>
        <template #1>
          <base-input v-model="bufSize" max-len="3" @check="inputCheck('bufSize')" />
          <span class="tipAfterInputBox">(1-512)</span>
        </template>
        <template #2>
          <select v-model="syslogStatus">
            <option value="1"><span>Enabled</span></option>
            <option value="2"><span>Disabled</span></option>
          </select>
        </template>
        <template #3>
          <base-input v-model="logServerIpv4" :css="ipv4Css" :disabled="ipv4Disabled" max-len="15" @check="inputCheck('logServerIpv4')" />
          <input v-model="selIp" :disabled="syslogStatus==='2'" type="radio" value="1" class="tipAfterInputBox">
          <label for="IPv4"> IPv4</label>
        </template>
        <template #3-2>
          <base-input v-model="logServerIpv6" :css="ipv6Css" :disabled="ipv6Disabled" max-len="43" @check="inputCheck('logServerIpv6')" />
          <input v-model="selIp" :disabled="syslogStatus==='2'" type="radio" value="2" class="tipAfterInputBox">
          <label for="IPv6"> IPv6</label>
        </template>
        <template #4>
          <select v-model="facility" :disabled="syslogStatus==='2'" :class="syslogStatus==='2'?'disabledStyle':''">
            <option v-for="idx in 8" :key="idx" :value="idx-1"><span>{{ 'local'+(idx-1) }}</span></option>
          </select>
        </template>
        <template #5>
          <select v-model="logLevel" :disabled="syslogStatus==='2'" :class="syslogStatus==='2'?'disabledStyle':''">
            <option value="0"><span>Alert</span></option>
            <option value="1"><span>Critical</span></option>
            <option value="2"><span>Warning</span></option>
            <option value="3"><span>Info</span></option>
          </select>
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" :class="btnClass" value="Apply" @click="apply">
    </div>
    <div style="overflow: hidden;">
      <textarea :value="log" type="textarea" rows="20" readonly="readonly" class="SystemlogSettingsTextarea" />
    </div>
    <div class="margin1015">
      <input type="button" :class="btnClass" value="Clear" @click="clear">
      <input type="button" :class="btnClass" value="Refresh" @click="refresh">
    </div>
  </div>
</template>

<script>
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'
import message from '@/utils/message'
import { applyCheck } from '@/utils'
import { cgiGet, cgiSet } from '@/api/cgi'
export default {
  components: {
    commonTable,
    baseInput
  },
  data() {
    return {
      btnClass: 'btnOutTable',
      timeStampEnabled: '2',
      bufSize: '',
      syslogStatus: '',
      logServerIpv4: '',
      logServerIpv6: '',
      facility: '',
      logLevel: '',
      selIp: '',
      log: ''
    }
  },
  computed: {
    ipv4Css() {
      return (this.syslogStatus === '1' && this.selIp === '1') ? 'baseInput' : 'baseInput disabledStyle'
    },
    ipv4Disabled() {
      return !((this.syslogStatus === '1' && this.selIp === '1'))
    },
    ipv6Css() {
      return (this.syslogStatus === '1' && this.selIp === '2') ? 'baseInput' : 'baseInput disabledStyle'
    },
    ipv6Disabled() {
      return !((this.syslogStatus === '1' && this.selIp === '2'))
    }
  },
  created() {
    cgiGet('log_global').then(d => {
      this.timeStampEnabled = d.timeStamp ? '1' : '2'
      this.bufSize = String(d.bufferSize)
      this.syslogStatus = d.syslogEnabled ? '1' : '2'
      this.selIp = d.serverIpVer === 6 ? '2' : '1'
      this.logServerIpv4 = d.serverIpv4 || '0.0.0.0'
      this.logServerIpv6 = d.serverIpv6 || ''
      this.facility = d.facility
      this.logLevel = String(d.level)
    })
    this.refresh()
  },
  methods: {
    apply() {
      // check
      if (this.syslogStatus === '1') {
        if (this.selIp === '1') { // ipv4
          if (applyCheck('ipv4', this.logServerIpv4) === false) {
            message.warnBox('Invalid IPv4 address.')
            return
          }
        } else {
          if (applyCheck('ipv6', this.logServerIpv6) === false) {
            message.warnBox('Invalid IPv6 address.')
            return
          }
        }
      }
      const b = Number(this.bufSize)
      if (!Number.isInteger(b) || b < 1 || b > 512) {
        message.warnBox('Messages Buffered Size must be 1-512.')
        return
      }
      cgiSet('log_global', {
        timeStamp: this.timeStampEnabled === '1' ? 1 : 0,
        bufferSize: b,
        syslogEnabled: this.syslogStatus === '1' ? 1 : 0,
        serverIpVer: this.selIp === '2' ? 6 : 4,
        serverIpv4: this.logServerIpv4,
        serverIpv6: this.logServerIpv6,
        facility: this.facility,
        level: this.logLevel
      })
    },
    async clear() {
      await cgiSet('log_clear', {}, { successMsg: false })
      this.refresh()
    },
    refresh() {
      // raw 为原版格式整行("1 local0/Info  01/01/2018 ..."),最新在前
      cgiGet('log_syslog').then(d => {
        this.log = (d.entries || []).map(e => e.raw).join('\n')
      })
    },
    inputCheck(k) {
      if (k === 'bufSize') {
        this[k] = this[k].replace(/[^0-9]/g, '')
      } else if (k === 'logServerIpv4') {
        this[k] = this[k].replace(/[^0-9.]/g, '')
      } else if (k === 'logServerIpv6') {
        this[k] = this[k].replace(/[^a-fA-F0-9:]/g, '')
      }
    }
  }
}
</script>

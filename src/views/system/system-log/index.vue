<template>
  <div class="main_body">
    <div id="basetitle">System log Settings</div>
    <div>
      <common-table
        header-title="System log Settings"
        :first-column="['Time Stamp','Messages Buffered Size', 'Syslog Status', 'Syslog Server IP','Facility','Logging Level']"
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
    const mockData = {
      timeStampEnabled: true,
      syslogEnabled: true,
      bufSize: '50',
      logServerType: '1', // 1: ipv4 2: ipv6
      logServerIP: '10.10.10.9', // 2022::3
      facility: 1, // 0-7
      level: '2', // 0: Alert 1: Critical 2: Warning 3: Info
      logMsg: '1 local0/Info      01/01/2018 00:32:40 Successful login through web (User: admin)\n2 local0/Info      01/01/2018 00:32:39 Logout through Web(IP: )'
    }
    // get data
    if (mockData.timeStampEnabled) {
      this.timeStampEnabled = '1'
    }
    if (mockData.syslogEnabled) {
      this.syslogStatus = '1'
      // server ip init
      if (mockData.logServerType === '1') {
        this.selIp = '1'
        this.logServerIpv4 = mockData.logServerIP
      } else {
        this.selIp = '2'
        this.logServerIpv6 = mockData.logServerIP
      }
      this.facility = mockData.facility
      this.logLevel = mockData.level
    } else {
      this.syslogStatus = '2'
      this.selIp = '1'
      this.logServerIpv4 = '0.0.0.0'
      this.facility = '0'
      this.logLevel = '2'
    }
    this.bufSize = mockData.bufSize
    this.log = mockData.logMsg
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
      // info set
      message.success()
    },
    clear() {
      this.log = ''
    },
    refresh() {
      console.log('Refresh...')
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

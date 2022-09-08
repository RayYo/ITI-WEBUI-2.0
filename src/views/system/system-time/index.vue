<template>
  <div class="main_body">
    <div id="basetitle">System Time</div>
    <div>
      <common-table header-title="Current Time Settings" :first-column="['Clock Mode', 'Current Time', 'Time Zone']">
        <template #0> {{ clockMode }} </template>
        <template #1>{{ currentTime }}</template>
        <template #2>{{ timezone }}</template>
      </common-table>
    </div>
    <br>
    <div>
      <common-table v-if="selClockMode==='2'" header-title="Date/Time Settings" :first-column="['Clock Mode','Date Settings','Time Settings']">
        <template #0>
          <select v-model="selClockMode">
            <option title="SNTP" value="1"><span>SNTP</span></option>
            <option title="Local Time" value="2"><span>Local Time</span></option>
            <option title="Cloud Sync Time" value="3"><span>Cloud Sync Time</span></option>
          </select>
        </template>
        <template #1>
          <base-input v-model="dateY" max-len="4" div-class="InputOutTable150" @check="inputCheck('dateY')" />
          <span> / </span>
          <base-input v-model="dateM" max-len="2" div-class="InputOutTable150" @check="inputCheck('dateM')" />
          <span> / </span>
          <base-input v-model="dateD" max-len="2" div-class="InputOutTable150" @check="inputCheck('dateD')" />
          <span class="tipAfterInputBox"> (YYYY:MM:DD)</span>
        </template>
        <template #2>
          <base-input v-model="dateH" max-len="2" div-class="InputOutTable150" @check="inputCheck('dateH')" />
          <span> : </span>
          <base-input v-model="dateMin" max-len="2" div-class="InputOutTable150" @check="inputCheck('dateMin')" />
          <span> : </span>
          <base-input v-model="dateS" max-len="2" div-class="InputOutTable150" @check="inputCheck('dateS')" />
          <span class="tipAfterInputBox"> (HH:MM:SS)</span>
        </template>
      </common-table>
      <common-table
        v-else-if="selClockMode==='1'"
        header-title="Date/Time Settings"
        :first-column="['Clock Mode','SNTP Primary Server','SNTP Secondary Server','SNTP Poll Interval']"
      >
        <template #0>
          <select v-model="selClockMode">
            <option title="SNTP" value="1"><span>SNTP</span></option>
            <option title="Local Time" value="2"><span>Local Time</span></option>
            <option title="Cloud Sync Time" value="3"><span>Cloud Sync Time</span></option>
          </select>
        </template>
        <template #1>
          <base-input v-model="sntpServer1" max-len="64" div-class="InputOutTable150" @check="inputCheck('sntpServer1')" />&nbsp;
          <select v-model="selSntpServer1" style="width: 130px;">
            <option title="IPv4" value="1"><span>IPv4</span></option>
            <option title="IPv6" value="2"><span>IPv6</span></option>
            <option title="Domain Name" value="3"><span>Domain Name</span></option>
          </select>
        </template>
        <template #2>
          <base-input v-model="sntpServer2" max-len="64" div-class="InputOutTable150" @check="inputCheck('sntpServer2')" />&nbsp;
          <select v-model="selSntpServer2" style="width: 130px;">
            <option title="IPv4" value="1"><span>IPv4</span></option>
            <option title="IPv6" value="2"><span>IPv6</span></option>
            <option title="Domain Name" value="3"><span>Domain Name</span></option>
          </select>
        </template>
        <template #3>
          <base-input v-model="sntpPollInterval" max-len="2" div-class="InputOutTable150" @check="inputCheck('sntpPollInterval')" />
          <span class="tipAfterInputBox"> Min (1-60)</span>
        </template>
      </common-table>
      <common-table v-else header-title="Date/Time Settings" :first-column="['Clock Mode']">
        <template #0>
          <select v-model="selClockMode">
            <option title="SNTP" value="1"><span>SNTP</span></option>
            <option title="Local Time" value="2"><span>Local Time</span></option>
            <option title="Cloud Sync Time" value="3"><span>Cloud Sync Time</span></option>
          </select>
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" :class="btnClass" value="Apply" @click="timeSetting">
    </div>
    <br>
    <div>
      <common-table
        header-title="Additional Time Parameters"
        :first-column="['Time Zone','Daylight Saving Time Status','From','To','DST Offset']"
      >
        <template #0>
          <select v-model="selTimezone" :class="selClockMode==='2'?'disabledStyle':''" :disabled="selClockMode==='2'" style="min-width: 480px;">
            <option v-for="(item, index) in timezoneStrArr" :key="index" :value="item.value">
              <span>{{ item.str }}</span>
            </option>
          </select>
        </template>
        <template #1>
          <select v-model="dlsStatus">
            <option title="Enabled" value="1"><span>Enabled</span></option>
            <option title="Disabled" value="2"><span>Disabled</span></option>
          </select>
        </template>
        <template #2>
          <select v-model="selFromM" :class="dlsStatus==='2'?'disabledStyle':''" :disabled="dlsStatus==='2'" style="min-width: 100px; width: 17% !important;">
            <option v-for="(item, index) in selMMArr" :key="index" :value="item.value">
              <span>{{ item.str }}</span>
            </option>
          </select>
          &nbsp;
          <select v-model="selFromD" :class="dlsStatus==='2'?'disabledStyle':''" :disabled="dlsStatus==='2'" style="min-width: 100px; width: 17% !important;">
            <option v-for="n in 31" :key="n" :value="n">
              <span>{{ n.toString().padStart(2, '0') }}</span>
            </option>
          </select>
          &nbsp;
          <select v-model="selFromH" :class="dlsStatus==='2'?'disabledStyle':''" :disabled="dlsStatus==='2'" style="min-width: 100px; width: 17% !important;">
            <option v-for="n in 24" :key="n" :value="n-1">
              <span>{{ (n-1).toString().padStart(2, '0') }}</span>
            </option>
          </select>
          &nbsp;
          <select v-model="selFromMin" :class="dlsStatus==='2'?'disabledStyle':''" :disabled="dlsStatus==='2'" style="min-width: 100px; width: 17% !important;">
            <option v-for="n in 60" :key="n" :value="n-1">
              <span>{{ (n-1).toString().padStart(2, '0') }}</span>
            </option>
          </select>
          <span> (Month:Day:HH:MM)</span>
        </template>
        <template #3>
          <select v-model="selToM" :class="dlsStatus==='2'?'disabledStyle':''" :disabled="dlsStatus==='2'" style="min-width: 100px; width: 17% !important;">
            <option v-for="(item, index) in selMMArr" :key="index" :value="item.value">
              <span>{{ item.str }}</span>
            </option>
          </select>
          &nbsp;
          <select v-model="selToD" :class="dlsStatus==='2'?'disabledStyle':''" :disabled="dlsStatus==='2'" style="min-width: 100px; width: 17% !important;">
            <option v-for="n in 31" :key="n" :value="n">
              <span>{{ n.toString().padStart(2, '0') }}</span>
            </option>
          </select>
          &nbsp;
          <select v-model="selToH" :class="dlsStatus==='2'?'disabledStyle':''" :disabled="dlsStatus==='2'" style="min-width: 100px; width: 17% !important;">
            <option v-for="n in 24" :key="n" :value="n-1">
              <span>{{ (n-1).toString().padStart(2, '0') }}</span>
            </option>
          </select>
          &nbsp;
          <select v-model="selToMin" :class="dlsStatus==='2'?'disabledStyle':''" :disabled="dlsStatus==='2'" style="min-width: 100px; width: 17% !important;">
            <option v-for="n in 60" :key="n" :value="n-1">
              <span>{{ (n-1).toString().padStart(2, '0') }}</span>
            </option>
          </select>
          <span> (Month:Day:HH:MM)</span>
        </template>
        <template #4>
          <select v-model="dstOffset">
            <option value="60"><span>1hr</span></option>
            <option value="30"><span>30minutes</span></option>
          </select>
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" :class="btnClass" value="Apply" @click="daylightSavingTimeSet">
    </div>
  </div>
</template>

<script>
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'
import message from '@/utils/message'
import { parseTime, applyCheck } from '@/utils'

export default {
  components: {
    commonTable,
    baseInput
  },
  data() {
    return {
      btnClass: 'btnOutTable',
      clockMode: '',
      currentTime: '',
      selClockMode: '',
      timezoneStr: '',
      dateY: '',
      dateM: '',
      dateD: '',
      dateH: '',
      dateMin: '',
      dateS: '',
      sntpServer1: '',
      sntpServer2: '',
      selSntpServer1: '',
      selSntpServer2: '',
      sntpPollInterval: '',
      timezoneStrArr: [],
      selTimezone: '',
      dlsStatus: '',
      selFromM: '',
      selFromD: '',
      selFromH: '',
      selFromMin: '',
      selToM: '',
      selToD: '',
      selToH: '',
      selToMin: '',
      dstOffset: ''
    }
  },
  computed: {
    timezone() {
      return (this.selClockMode !== '2') ? this.timezoneStr : ''
    }
  },
  created() {
    const mockData = {
      sntpStatus: '2', // 1: sntp 2: local 3: cloud
      time: 1662497886,
      timezone: -60,
      srv1Type: '3', // 1: ipv4 2: ipv6 3: domain / ''
      srv1Host: 'ntp.aliyun.com', // 'ipv4'/'ipv6'/'domain'/'' string
      srv2Type: '1', // 1: ipv4 2: ipv6 3: domain / ''
      srv2Host: '210.72.145.44', // 'ipv4'/'ipv6'/'domain'/'' string
      dlsStatus: true, // dls enable, false: disable
      sntpPollInterval: '3', // 1~60 / ''
      dlsRecMonthS: '', // start
      dlsRecDayS: '',
      dlsRecHourS: '',
      dlsRecMinS: '',
      dlsRecMonthE: 4, // end
      dlsRecDayE: 1,
      dlsRecHourE: 13,
      dlsRecMinE: 26,
      dlsOffset: 60 // 30/60/''
    }
    // init timezone string array
    this.timezoneStrArrInit()
    // init data
    this.currentTime = parseTime(mockData.time, '{d} {m} {y} {h}:{i}:{s}')
    this.selClockMode = mockData.sntpStatus
    if (this.selClockMode === '1') {
      this.clockMode = 'SNTP'
    } else if (this.selClockMode === '2') {
      this.clockMode = 'Local Time'
    } else {
      this.clockMode = 'Cloud Sync Time'
    }
    for (let i = 0; i < this.timezoneStrArr.length; i++) {
      const element = this.timezoneStrArr[i]
      if (element.value === mockData.timezone) {
        this.timezoneStr = element.str
        break
      }
    }
    this.selTimezone = mockData.timezone
    // this.timezoneStr = '(GMT+08:00) Beijing,Chongqing, Hong Kong,Urumqi'
    // init local date
    const date = new Date(mockData.time * 1000)
    this.dateY = date.getFullYear().toString()
    this.dateM = (date.getMonth() + 1).toString().padStart(2, '0')
    this.dateD = date.getDate().toString().padStart(2, '0')
    this.dateH = date.getHours().toString().padStart(2, '0')
    this.dateMin = date.getMinutes().toString().padStart(2, '0')
    this.dateS = date.getSeconds().toString().padStart(2, '0')
    // init SNTP Server
    this.sntpServer1 = mockData.srv1Host
    this.sntpServer2 = mockData.srv2Host
    this.selSntpServer1 = mockData.srv1Type
    this.selSntpServer2 = mockData.srv2Type
    if (this.selSntpServer1 === '') {
      this.selSntpServer1 = '1'
    }
    if (this.selSntpServer2 === '') {
      this.selSntpServer2 = '1'
    }
    if (mockData.sntpPollInterval) {
      this.sntpPollInterval = mockData.sntpPollInterval
    } else { this.sntpPollInterval = '1' }
    // DLS
    if (mockData.dlsStatus) {
      this.dlsStatus = '1' // enable
    } else {
      this.dlsStatus = '2' // disable
    }
    // from date
    if (mockData.dlsRecMonthS) {
      this.selFromM = mockData.dlsRecMonthS
    } else { this.selFromM = '1' }
    if (mockData.dlsRecDayS) {
      this.selFromD = mockData.dlsRecDayS
    } else { this.selFromD = '1' }
    if (mockData.dlsRecHourS) {
      this.selFromH = mockData.dlsRecHourS
    } else { this.selFromH = '0' }
    if (mockData.dlsRecMinS) {
      this.selFromMin = mockData.dlsRecMinS
    } else { this.selFromMin = '0' }
    // to date
    if (mockData.dlsRecMonthE) {
      this.selToM = mockData.dlsRecMonthE
    } else { this.selToM = '1' }
    if (mockData.dlsRecDayE) {
      this.selToD = mockData.dlsRecDayE
    } else { this.selToD = '1' }
    if (mockData.dlsRecHourE) {
      this.selToH = mockData.dlsRecHourE
    } else { this.selToH = '0' }
    if (mockData.dlsRecMinE) {
      this.selToMin = mockData.dlsRecMinE
    } else { this.selToMin = '0' }
    // DST Offset
    if (mockData.dlsOffset) {
      this.dstOffset = mockData.dlsOffset
    } else { this.dstOffset = '60' }
  },
  methods: {
    timeSetting() {
      if (this.selClockMode === '2') { // local time
        // check
        if (this.dateTimeApplyCheck()) {
          // post
          message.success()
        }
      } else if (this.selClockMode === '1') { // sntp server
        if (this.sntpApplyCheck()) {
          message.success()
        }
      } else {
        message.success()
      }
    },
    daylightSavingTimeSet() {
      // post
      message.success()
    },
    inputCheck(key) {
      if (key === 'sntpServer1') {
        if (this.selSntpServer1 === '1') {
          this[key] = this[key].replace(/[^0-9.]/g, '')
        } else if (this.selSntpServer1 === '2') {
          this[key] = this[key].replace(/[^a-fA-F0-9:]/g, '')
        } else {
          this[key] = this[key].replace(/[^a-zA-Z0-9.\-]/g, '')
        }
      } else if (key === 'sntpServer2') {
        if (this.selSntpServer2 === '1') {
          this[key] = this[key].replace(/[^0-9.]/g, '')
        } else if (this.selSntpServer2 === '2') {
          this[key] = this[key].replace(/[^a-fA-F0-9:]/g, '')
        } else {
          this[key] = this[key].replace(/[^a-zA-Z0-9.\-]/g, '')
        }
      } else {
        this[key] = this[key].replace(/[^0-9]/g, '')
      }
    },
    dateTimeApplyCheck() {
      if (!this.dateY || this.dateY < 2018 || this.dateY > 2099) {
        message.warnBox('The range of year is 2018 ~ 2099.')
        return false
      }
      if (!this.dateM || this.dateM < 1 || this.dateM > 12) {
        message.warnBox('The range of month is 1 ~ 12.')
        return false
      }
      if (!this.dateD || this.dateD < 0 || this.dateD > 31) {
        message.warnBox('Invalid day settings.')
        return false
      }
      if (!this.dateH || this.dateH < 0 || this.dateH > 23) {
        message.warnBox('Please enter an integer between 0 ~ 23')
        return false
      }
      if (!this.dateMin || this.dateMin < 0 || this.dateMin > 60) {
        message.warnBox('Please enter an integer between 0 ~ 60')
        return false
      }
      if (!this.dateS || this.dateS < 0 || this.dateS > 60) {
        message.warnBox('Please enter an integer between 0 ~ 60')
        return false
      }
      return true
    },
    sntpApplyCheck() {
      if (!this.sntpServer1) {
        message.warnBox('Invalid primary server address.')
        return false
      }
      if (this.selSntpServer1 === '1') {
        if (!applyCheck('ipv4', this.sntpServer1)) {
          message.warnBox('Invalid primary server address.')
          return false
        }
      } else if (this.selSntpServer1 === '2') {
        if (!applyCheck('ipv6', this.sntpServer1)) {
          message.warnBox('Invalid primary server address.')
          return false
        }
      }
      if (this.sntpServer2) {
        if (this.selSntpServer2 === '1') {
          if (!applyCheck('ipv4', this.sntpServer2)) {
            message.warnBox('Invalid secondary server address.')
            return false
          }
        } else if (this.selSntpServer2 === '2') {
          if (!applyCheck('ipv6', this.sntpServer2)) {
            message.warnBox('Invalid secondary server address.')
            return false
          }
        }
      }
      if (!this.sntpPollInterval || this.sntpPollInterval < 1 || this.sntpPollInterval > 60) {
        message.warnBox('Please enter an integer between 1 ~ 60')
        return false
      }
      return true
    },
    timezoneStrArrInit() {
      this.timezoneStrArr = [
        { str: 'UTC -12:00', value: -720 },
        { str: 'UTC -11:00', value: -660 },
        { str: 'UTC -10:00', value: -600 },
        { str: 'UTC -9:00', value: -540 },
        { str: 'UTC -8:00', value: -480 },
        { str: 'UTC -7:00', value: -420 },
        { str: 'UTC -6:00', value: -360 },
        { str: 'UTC -5:00', value: -300 },
        { str: 'UTC -4:30', value: -270 },
        { str: 'UTC -4:00', value: -240 },
        { str: 'UTC -3:30', value: -210 },
        { str: 'UTC -3:00', value: -180 },
        { str: 'UTC -2:00', value: -120 },
        { str: 'UTC -1:00', value: -60 },
        { str: 'UTC', value: 0 },
        { str: 'UTC +1:00', value: 60 },
        { str: 'UTC +2:00', value: 120 },
        { str: 'UTC +3:00', value: 180 },
        { str: 'UTC +3:30', value: 210 },
        { str: 'UTC +4:00', value: 240 },
        { str: 'UTC +4:30', value: 270 },
        { str: 'UTC +5:00', value: 300 },
        { str: 'UTC +5:30', value: 330 },
        { str: 'UTC +5:45', value: 345 },
        { str: 'UTC +6:00', value: 360 },
        { str: 'UTC +6:30', value: 390 },
        { str: 'UTC +7:00', value: 420 },
        { str: 'UTC +8:00', value: 480 },
        { str: 'UTC +9:00', value: 540 },
        { str: 'UTC +9:30', value: 570 },
        { str: 'UTC +10:00', value: 600 },
        { str: 'UTC +11:00', value: 660 },
        { str: 'UTC +12:00', value: 720 },
        { str: 'UTC +13:00', value: 780 }
      ]
      this.selMMArr = [
        { str: 'January', value: 1 },
        { str: 'February', value: 2 },
        { str: 'March', value: 3 },
        { str: 'April', value: 4 },
        { str: 'May', value: 5 },
        { str: 'June', value: 6 },
        { str: 'July', value: 7 },
        { str: 'August', value: 8 },
        { str: 'September', value: 9 },
        { str: 'October', value: 10 },
        { str: 'November', value: 11 },
        { str: 'December', value: 12 }
      ]
    }
  }
}
</script>

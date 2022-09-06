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

  </div>
</template>

<script>
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'
import message from '@/utils/message'
import { parseTime } from '@/utils'
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
      timezone: '',
      selClockMode: '1',
      dateY: '',
      dateM: '',
      dateD: '',
      dateH: '',
      dateMin: '',
      dateS: ''
    }
  },
  created() {
    const mockData = {
      sntpStatus: '2', // 1: sntp 2: local 3: cloud
      time: 1662497886
    }
    // init data
    this.currentTime = parseTime(mockData.time, '{d} {m} {y} {h}:{i}:{s}')
    if (mockData.sntpStatus === '1') {
      this.clockMode = 'SNTP'
      this.timezone = '(GMT+08:00) Beijing,Chongqing, Hong Kong,Urumqi'
    } else if (mockData.sntpStatus === '2') {
      this.clockMode = 'Local Time'
    } else {
      this.clockMode = 'Cloud Sync Time'
      this.timezone = '(GMT+08:00) Beijing,Chongqing, Hong Kong,Urumqi'
    }
    // init local date
    const date = new Date(mockData.time * 1000)
    this.dateY = date.getFullYear().toString()
    this.dateM = (date.getMonth() + 1).toString().padStart(2, '0')
    this.dateD = date.getDate().toString().padStart(2, '0')
    this.dateH = date.getHours().toString().padStart(2, '0')
    this.dateMin = date.getMinutes().toString().padStart(2, '0')
    this.dateS = date.getSeconds().toString().padStart(2, '0')
  },
  methods: {
    timeSetting() {
      if (this.selClockMode === '2') { // local time
        // check
        if (this.dateTimeApplyCheck()) {
          // post
          message.success()
        }
      }
    },
    inputCheck(key) {
      this[key] = this[key].replace(/[^0-9]/g, '')
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
    }
  }
}
</script>

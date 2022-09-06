<template>
  <div class="main_body">
    <div id="basetitle">System Time</div>
    <div>
      <common-table
        header-title="Current Time Settings"
        :first-column="['Clock Mode', 'Current Time', 'Time Zone']"
      >
        <template #0> {{ clockMode }} </template>
        <template #1>{{ currentTime }}</template>
        <template #2>{{ timezone }}</template>
      </common-table>
    </div>

  </div>
</template>

<script>
import commonTable from '@/components/CustomTable/common-table.vue'
import { parseTime } from '@/utils'
export default {
  components: {
    commonTable
  },
  data() {
    return {
      clockMode: '',
      currentTime: '',
      timezone: ''
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
  }
}
</script>

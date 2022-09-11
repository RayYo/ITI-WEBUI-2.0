<template>
  <div class="main_body">
    <div id="basetitle">System log Settings</div>
    <div>
      <common-table
        header-title="System log Settings"
        :first-column="['Time Stamp','Messages Buffered Size', 'Syslog Status']"
      >
        <template #0>
          <select v-model="timeStampEnabled">
            <option value="1"><span>Enabled</span></option>
            <option value="2"><span>Disabled</span></option>
          </select>
        </template>
        <template #1>
          <base-input v-model="bufSize" max-len="3" @check="inputCheck('buffSize')" />
          <span class="tipAfterInputBox">(1-512)</span>
        </template>
        <template #2>
          <select v-model="syslogStatus">
            <option value="1"><span>Enabled</span></option>
            <option value="2"><span>Disabled</span></option>
          </select>
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" :class="btnClass" value="Apply" @click="apply">
    </div>
  </div>
</template>

<script>
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'
import message from '@/utils/message'
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
      syslogStatus: '2'
    }
  },
  created() {
    const mockData = {
      timeStampEnabled: true,
      syslogEnabled: true,
      bufSize: '50'
    }
    // get data
    if (mockData.timeStampEnabled) {
      this.timeStampEnabled = '1'
    }
    if (mockData.syslogEnabled) {
      this.syslogStatus = '1'
    }
    this.bufSize = mockData.bufSize
  },
  methods: {
    inputCheck(k) {

    },
    apply() {
      // info set
      message.success()
    }
  }
}
</script>

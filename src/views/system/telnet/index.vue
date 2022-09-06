<template>
  <div class="main_body">
    <div id="basetitle">Telnet Settings</div>
    <div>
      <common-table
        header-title="Telnet Settings"
        :first-column="['Telnet Status','Port (1-65535)']"
      >
        <template #0>
          <select v-model="select">
            <option value="1"><span>Enabled</span></option>
            <option value="2"><span>Disabled</span></option>
          </select>
        </template>
        <template #1>
          <base-input v-model="port" max-len="5" @check="check()" />
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
      select: '',
      port: ''
    }
  },
  created() {
    this.select = 1
    this.port = '23'
    // get ssl enabled
    // this.$http.get('url_get_xxx').then(resp=>{
    //     this.timeout = resp.data.timeout
    // },
    // err=>{
    //     console.log('get ssl fail..');
    // })
  },
  methods: {
    apply() {
      // check
      if (this.port < 1 || this.port > 65535) {
        message.warnBox('Please enter an integer between 1 ~ 65535')
        return
      }
      // post
      message.success()
    },
    check() {
      this.port = this.port.replace(/[^0-9]/g, '')
    }
  }
}
</script>

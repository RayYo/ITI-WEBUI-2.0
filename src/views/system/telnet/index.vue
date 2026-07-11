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
import { cgiGet, cgiSet } from '@/api/cgi'
export default {
  components: {
    commonTable,
    baseInput
  },
  data() {
    return {
      btnClass: 'btnOutTable',
      select: '1',
      port: '23'
    }
  },
  created() {
    cgiGet('sys_telnet').then(d => {
      this.select = d.enabled ? '1' : '2'
      this.port = String(d.port)
    })
  },
  methods: {
    apply() {
      // check
      if (this.port < 1 || this.port > 65535) {
        message.warnBox('Please enter an integer between 1 ~ 65535')
        return
      }
      cgiSet('sys_telnet', { enabled: this.select === '1' ? 1 : 0, port: this.port })
    },
    check() {
      this.port = this.port.replace(/[^0-9]/g, '')
    }
  }
}
</script>

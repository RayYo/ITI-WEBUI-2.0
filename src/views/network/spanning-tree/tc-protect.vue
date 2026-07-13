<template>
  <div class="main_body">
    <div id="basetitle">Spanning Tree Protocol TC Protect</div>
    <div>
      <div class="table_title">Spanning Tree Protocol TC Protect</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>TC Protect Status</td>
            <td>
              <select v-model="tcStatus" :class="{ disabledStyle: stpOff }" :disabled="stpOff">
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>TC Protect Threshold</td>
            <td>
              <base-input v-model="threshold" type="text" max-len="3" :disabled="fieldOff" :css="fieldOff ? 'baseInput disabledStyle' : 'baseInput'" />
              <span class="tipAfterInputBox">cnt. (1-100)</span>
            </td>
          </tr>
          <tr>
            <td>TC Protect Cycle</td>
            <td>
              <base-input v-model="cycle" type="text" max-len="2" :disabled="fieldOff" :css="fieldOff ? 'baseInput disabledStyle' : 'baseInput'" />
              <span class="tipAfterInputBox">Sec.(1-10)</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" :class="['btnOutTable', { btnDisabled: stpOff }]" value="Apply" :disabled="stpOff" @click="onApply">
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import baseInput from '@/components/CustomInput/base-input.vue'

export default {
  components: { baseInput },
  data() {
    return {
      stpStatus: false, // 全局 STP
      tcStatus: '2',
      threshold: '20',
      cycle: '5'
    }
  },
  computed: {
    stpOff() {
      return !this.stpStatus
    },
    fieldOff() {
      // 全局 STP 关 或 TC Protect 关 → Threshold/Cycle 禁用
      return this.stpOff || this.tcStatus !== '1'
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('net_stpTcProtect').then(d => {
        this.stpStatus = !!d.status
        this.tcStatus = d.tcProtectStatus ? '1' : '2'
        this.threshold = String(d.tcProtectThreshold)
        this.cycle = String(d.tcProtectCycle)
      })
    },
    onApply() {
      cgiSet('net_stpTcProtect', {
        tcProtectStatus: this.tcStatus === '1' ? 1 : 0,
        tcProtectThreshold: this.threshold,
        tcProtectCycle: this.cycle
      }).then(() => this.load())
    }
  }
}
</script>

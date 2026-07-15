<template>
  <div class="main_body">
    <div id="basetitle">General Settings</div>
    <div>
      <div class="table_title">DHCP Snooping Global Settings</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>DHCP Snooping</td>
            <td>
              <select v-model="snooping">
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <br>
      <div class="table_title">General Settings</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Pass Through Option 82</td>
            <td>
              <select v-model="form.passThrough" :class="{ disabledStyle: off }" :disabled="off">
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Verify MAC Address</td>
            <td>
              <select v-model="form.verifyMac" :class="{ disabledStyle: off }" :disabled="off">
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Backup Database</td>
            <td>
              <select v-model="form.backup" :class="{ disabledStyle: off }" :disabled="off">
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Database Update Interval</td>
            <td>
              <base-input v-model="form.interval" max-len="5" :disabled="off" @check="onlyNum" />
              <span class="tipAfterInputBox">Sec&nbsp;(600 - 86400)</span>
            </td>
          </tr>
          <tr>
            <td>DHCP Option 82 Insertion</td>
            <td>
              <select v-model="form.insertion" :class="{ disabledStyle: off }" :disabled="off">
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
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
      snoopOn: false,
      snooping: '2',
      form: { passThrough: '2', verifyMac: '2', backup: '2', interval: '1200', insertion: '2' }
    }
  },
  computed: {
    // 从 GET 状态决定 General Settings 是否可编辑(DHCP Snooping Disabled 时置灰),与 LLDP Status 逻辑一致
    off() {
      return !this.snoopOn
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('sec_dhcpSnoopSettings').then(d => {
        this.snoopOn = !!d.snooping
        this.snooping = d.snooping ? '1' : '2'
        this.form.passThrough = d.passThrough ? '1' : '2'
        this.form.verifyMac = d.verifyMac ? '1' : '2'
        this.form.backup = d.backup ? '1' : '2'
        this.form.interval = String(d.interval != null ? d.interval : 1200)
        this.form.insertion = d.insertion ? '1' : '2'
      })
    },
    onlyNum() {
      this.form.interval = this.form.interval.replace(/[^0-9]/g, '')
    },
    onApply() {
      cgiSet('sec_dhcpSnoopSettingsEdit', {
        snooping: this.snooping === '1' ? 1 : 0,
        passThrough: this.form.passThrough === '1' ? 1 : 0,
        verifyMac: this.form.verifyMac === '1' ? 1 : 0,
        backup: this.form.backup === '1' ? 1 : 0,
        interval: Number(this.form.interval),
        insertion: this.form.insertion === '1' ? 1 : 0
      }).then(() => this.load())
    }
  }
}
</script>

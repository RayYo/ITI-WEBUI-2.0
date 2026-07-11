<template>
  <div class="main_body">
    <div id="basetitle">SNMP Engine ID Settings</div>
    <div class="table_title">Status Settings</div>
    <table class="from_table" border="" cellspacing="0">
      <tbody>
        <tr>
          <td>SNMP Agent Status</td>
          <td>
            <select v-model="agentStatus">
              <option value="1">Enabled</option>
              <option value="2">Disabled</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Apply" @click="onApplyStatus">
    </div>

    <div class="table_title">SNMP Engine ID Settings</div>
    <table class="from_table" border="" cellspacing="0">
      <tbody>
        <tr>
          <td>Engine ID</td>
          <td>
            <div class="inputBox"><input v-model="engineId" type="text" maxlength="64" autocomplete="off" class="baseInput"></div>
            <span class="tipAfterInputBox">*</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Apply" @click="onApplyEngine">
      <input type="button" class="btnOutTable" value="Reset" @click="onReset">
      <input type="button" class="btnOutTable" value="Reset to Default" @click="onResetDefault">
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'

export default {
  data() {
    return {
      agentStatus: '2',
      engineId: '',
      savedEngineId: '',
      defaultEngineId: ''
    }
  },
  created() {
    cgiGet('snmp_engine').then(d => {
      this.agentStatus = d.agentEnabled ? '1' : '2'
      this.engineId = d.engineId || ''
      this.savedEngineId = d.engineId || ''
      this.defaultEngineId = d.defaultEngineId || ''
    })
  },
  methods: {
    onApplyStatus() {
      cgiSet('snmp_agent', { enabled: this.agentStatus === '1' ? 1 : 0 })
    },
    onApplyEngine() {
      if (!/^[0-9a-fA-F]{10,64}$/.test(this.engineId)) {
        this.$message.error('Engine ID must be 10-64 hexadecimal characters.')
        return
      }
      cgiSet('snmp_engineID', { engineId: this.engineId }).then(() => {
        this.savedEngineId = this.engineId
      })
    },
    onReset() {
      this.engineId = this.savedEngineId
    },
    onResetDefault() {
      this.engineId = this.defaultEngineId
    }
  }
}
</script>

<template>
  <div class="main_body">
    <div id="basetitle">Save Settings to Flash</div>
    <div>
      <div class="table_title">Save Settings to Flash</div>
      <table class="from_table" border="" cellspacing="0">
        <tbody>
          <tr>
            <td>Config File</td>
            <td>
              <select v-model="configFile" disabled class="disabledStyle">
                <option value="1">Config 1</option>
                <option value="2">Config 2</option>
              </select>
              <input id="StartupConfig" v-model="startup" type="checkbox" class="tipAfterInputBox">
              <span>Startup-Config</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <span>Note: The switch will stop responding while saving the current configuration to flash.</span>
      </div>
      <div class="margin1015">
        <input
          type="button"
          class="btnOutTable"
          :class="{ btnDisabled: saving }"
          :disabled="saving"
          value="Save Settings to Flash"
          @click="onSave"
        >
      </div>
    </div>
  </div>
</template>

<script>
import { cgiSet } from '@/api/cgi'

export default {
  data() {
    return {
      saving: false,
      configFile: '1',
      startup: true
    }
  },
  methods: {
    onSave() {
      this.saving = true
      cgiSet(
        'home_save',
        { config: this.configFile, startup: this.startup ? 1 : 0 },
        { successMsg: 'Save settings to flash successfully.' }
      ).finally(() => {
        this.saving = false
      })
    }
  }
}
</script>

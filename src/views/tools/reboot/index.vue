<template>
  <div class="main_body">
    <div id="basetitle">Factory Default Reset</div>
    <div>
      <div class="table_title">Reboot</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Reboot Type</td>
            <td>
              <select v-model="rebootType">
                <option value="1">Normal</option>
                <option value="2">Factory Default</option>
                <option value="3">Factory Default Except Network Set(Cloud, IP, Gateway, DNS)</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        Note: System will reboot in a few seconds after pressing the Apply button.
      </div>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>
    </div>
  </div>
</template>

<script>
import { cgiSet } from '@/api/cgi'

export default {
  data() {
    return {
      rebootType: '1'
    }
  },
  methods: {
    onApply() {
      cgiSet('tools_reboot', { rebootType: this.rebootType })
    }
  }
}
</script>

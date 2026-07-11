<template>
  <div class="main_body">
    <div id="basetitle">RMON Basic Settings</div>
    <div>
      <div class="table_title">RMON Global Settings</div>
      <table class="from_table" border="" cellspacing="0">
        <tbody>
          <tr>
            <td>RMON Status</td>
            <td>
              <select v-model="status">
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

export default {
  data() {
    return { status: '2' }
  },
  created() {
    cgiGet('rmon_global').then(d => {
      this.status = d.enabled ? '1' : '2'
    })
  },
  methods: {
    onApply() {
      cgiSet('rmon_global', { enabled: this.status === '1' ? 1 : 0 })
    }
  }
}
</script>

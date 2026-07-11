<template>
  <div class="main_body">
    <div id="basetitle">IEEE 802.3az EEE</div>
    <div>
      <div class="table_title">IEEE 802.3az EEE</div>
      <table class="from_table" border="" cellspacing="0">
        <tbody>
          <tr>
            <td>EEE Status</td>
            <td>
              <select v-model="status">
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- 原版此页按钮容器为 .marginbutton(非 margin1015) -->
      <div class="marginbutton">
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
    cgiGet('port_eee').then(d => {
      this.status = d.enabled ? '1' : '2'
    })
  },
  methods: {
    onApply() {
      cgiSet('port_eee', { enabled: this.status === '1' ? 1 : 0 })
    }
  }
}
</script>

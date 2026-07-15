<template>
  <div class="main_body">
    <div id="basetitle">ARP Inspection Port Settings</div>
    <div>
      <div class="table_title">ARP Inspection Port Settings</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Port</td>
            <td>
              <select v-model="port">
                <option v-for="p in 28" :key="p" :value="String(p)">{{ p }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Trust State</td>
            <td>
              <select v-model="trustState">
                <option value="2">Disabled</option>
                <option value="1">Enabled</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
        <input type="button" class="btnOutTable" value="Set to Default" @click="onSetDefault">
      </div>

      <div class="table_title">ARP Inspection Port Table</div>
      <el-table
        v-loading="loading"
        :data="rows"
        class="tableBox"
        stripe
        border
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="port" label="Port" min-width="815" />
        <el-table-column prop="trustState" label="Trust State" min-width="815" />
      </el-table>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'

export default {
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      port: '1',
      trustState: '2',
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('sec_arpInspectionPort').then(d => {
        this.rows = (d.ports || []).map(p => ({
          port: p.port,
          trustState: p.trust ? 'Trusted' : 'Untrusted'
        }))
      }).finally(() => { this.loading = false })
    },
    onApply() {
      cgiSet('sec_arpInspectionPortEdit', { port: this.port, trust: this.trustState === '1' ? 1 : 0 }).then(() => this.load())
    },
    onSetDefault() {
      cgiSet('sec_arpInspectionPortDefault', {}).then(() => this.load())
    }
  }
}
</script>

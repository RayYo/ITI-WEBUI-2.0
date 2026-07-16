<template>
  <div class="main_body">
    <div id="basetitle">Ping Watchdog</div>
    <div>
      <div class="table_title">Global Settings</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Global Status</td>
            <td>
              <select v-model="globalStatus">
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApplyGlobal">
      </div>

      <div class="table_title">Ping Watchdog Host</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Host IP Address</td>
            <td>
              <base-input v-model="ip" max-len="15" />
            </td>
          </tr>
          <tr>
            <td>Query Interval</td>
            <td>
              <base-input v-model="queryInterval" max-len="4" @check="onlyNum('queryInterval')" />
              <span class="tipAfterInputBox">(30-3600){{ NBSP }}Sec</span>
            </td>
          </tr>
          <tr>
            <td>Retry Counts</td>
            <td>
              <base-input v-model="retryCounts" max-len="3" @check="onlyNum('retryCounts')" />
              <span class="tipAfterInputBox">(1-100)</span>
            </td>
          </tr>
          <tr>
            <td>Reboot Counts</td>
            <td>
              <base-input v-model="rebootCounts" max-len="5" @check="onlyNum('rebootCounts')" />
              <span class="tipAfterInputBox">(1-65535)</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Add" @click="onAdd">
      </div>
    </div>

    <div class="table_title">
      <span>Host Table</span>
      <span class="tipInTableTitle">( Total Entries: {{ rows.length }} )</span>
    </div>
    <el-table
      v-loading="loading"
      :data="rows"
      class="tableBox"
      stripe
      border
      empty-text="< < Table is empty > >"
      :header-cell-style="pageTableHeader"
      :cell-style="pageTableCell"
    >
      <el-table-column prop="ip" label="Host IP Address" min-width="251" />
      <el-table-column prop="queryInterval" label="Query Interval" min-width="198" />
      <el-table-column prop="retryCounts" label="Retry Counts" min-width="198" />
      <el-table-column prop="rebootCounts" label="Reboot Counts" min-width="206" />
      <el-table-column prop="status" label="Current Status" min-width="364" />
      <el-table-column label="Action" min-width="413">
        <template slot-scope="scope">
          <input type="button" class="btnInTable" value="Reset" @click="onReset(scope.row)">
          <input type="button" class="btnInTable" value="Edit" @click="onEdit(scope.row)">
          <input type="button" class="btnInTable" value="Delete" @click="onDelete(scope.row)">
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import message from '@/utils/message'
import baseInput from '@/components/CustomInput/base-input.vue'

const NBSP = '\u00A0'

export default {
  components: { baseInput },
  data() {
    return {
      NBSP,
      pageTableHeader,
      pageTableCell,
      loading: false,
      globalStatus: '2',
      ip: '',
      queryInterval: '',
      retryCounts: '',
      rebootCounts: '',
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    onlyNum(key) { this[key] = this[key].replace(/[^0-9]/g, '') },
    load() {
      this.loading = true
      cgiGet('tools_pingWatchdog').then(d => {
        this.globalStatus = String(d.globalStatus)
        this.rows = (d.hosts || []).map(h => ({
          ip: h.ip,
          queryInterval: h.queryInterval,
          retryCounts: h.retryCounts,
          rebootCounts: h.rebootCounts,
          status: `Try:${h.tryCnt}${NBSP}${NBSP}OK:${h.okCnt}${NBSP}${NBSP}Reboot:${h.rebootCnt}`
        }))
      }).finally(() => { this.loading = false })
    },
    onApplyGlobal() {
      cgiSet('tools_pingWatchdogGlobal', { globalStatus: this.globalStatus })
    },
    validate() {
      if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(this.ip)) { message.warnBox('Invalid IP Address(IPv4).'); return false }
      const q = Number(this.queryInterval)
      if (!this.queryInterval || q < 30 || q > 3600) { message.warnBox('Query Interval must be within 30 ~ 3600.'); return false }
      const r = Number(this.retryCounts)
      if (!this.retryCounts || r < 1 || r > 100) { message.warnBox('Retry Counts must be within 1 ~ 100.'); return false }
      const b = Number(this.rebootCounts)
      if (!this.rebootCounts || b < 1 || b > 65535) { message.warnBox('Reboot Counts must be within 1 ~ 65535.'); return false }
      return true
    },
    onAdd() {
      if (!this.validate()) return
      cgiSet('tools_pingWatchdogAdd', {
        ip: this.ip,
        queryInterval: this.queryInterval,
        retryCounts: this.retryCounts,
        rebootCounts: this.rebootCounts
      }, { successMsg: false }).then(() => {
        this.ip = ''
        this.queryInterval = ''
        this.retryCounts = ''
        this.rebootCounts = ''
        this.load()
      })
    },
    onReset(row) {
      cgiSet('tools_pingWatchdogReset', { ip: row.ip }, { successMsg: false }).then(() => this.load())
    },
    onEdit(row) {
      this.$router.push({ path: '/tools/ping-watchdog/host-edit', query: { ip: row.ip }})
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete host ${row.ip} ?`, 'Please confirm').then(async() => {
        await cgiSet('tools_pingWatchdogDel', { ip: row.ip }, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

<template>
  <div class="main_body">
    <div id="basetitle">History Control Settings</div>
    <div>
      <div class="table_title">History Control Settings</div>
      <table class="from_table" border="" cellspacing="0">
        <tbody>
          <tr>
            <td>Index</td>
            <td>
              <div class="inputBox"><input v-model="index" type="text" maxlength="5" autocomplete="off" class="baseInput"></div>
              <span class="tipAfterInputBox">*&nbsp;(1-65535)</span>
            </td>
          </tr>
          <tr>
            <td>Port</td>
            <td>
              <div class="inputBox"><input v-model="port" type="text" maxlength="2" autocomplete="off" class="baseInput"></div>
              <span class="tipAfterInputBox">*</span>
            </td>
          </tr>
          <tr>
            <td>Buckets Requested</td>
            <td>
              <div class="inputBox"><input v-model="buckets" type="text" maxlength="2" autocomplete="off" class="baseInput"></div>
              <span class="tipAfterInputBox">(1-50)</span>
            </td>
          </tr>
          <tr>
            <td>Interval</td>
            <td>
              <div class="inputBox"><input v-model="interval" type="text" maxlength="5" autocomplete="off" class="baseInput"></div>
              <span class="tipAfterInputBox">(1-3600&nbsp;Sec)</span>
            </td>
          </tr>
          <tr>
            <td>Owner</td>
            <td>
              <div class="inputBox"><input v-model="owner" type="text" maxlength="32" autocomplete="off" class="baseInput"></div>
              <span class="tipAfterInputBox">(32 characters limit)</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Add" @click="onAdd">
      <input type="button" class="btnOutTable" value="Reset" @click="onReset">
    </div>

    <div class="table_title">
      History Control Table
      <div style="display: inline; float: right; margin-top: 4px">
        <input type="button" value="Delete All" class="btnInTitle" :disabled="deleteAllDisabled" :class="{ btnDisabled: deleteAllDisabled }" @click="onDeleteAll">
      </div>
    </div>
    <el-table v-loading="loading" :data="entries" class="tableBox" stripe border empty-text="< < Table is empty > >" :header-cell-style="pageTableHeader" :cell-style="pageTableCell">
      <el-table-column prop="idx" label="Index" />
      <el-table-column prop="port" label="Port" />
      <el-table-column prop="bucketsReq" label="Buckets Requested" />
      <el-table-column prop="bucketsGranted" label="Buckets Granted" />
      <el-table-column prop="interval" label="Interval" />
      <el-table-column prop="owner" label="Owner" />
      <el-table-column label="Action">
        <template slot-scope="scope">
          <input type="button" class="btnInTable" value="Delete" @click="onDelete(scope.row)">
        </template>
      </el-table-column>
    </el-table>
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
      index: '',
      port: '',
      buckets: '',
      interval: '',
      owner: '',
      entries: []
    }
  },
  computed: {
    deleteAllDisabled() {
      return !this.entries.length
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('rmon_history').then(d => {
        this.entries = d.entries || []
      }).finally(() => { this.loading = false })
    },
    onReset() {
      this.index = ''
      this.port = ''
      this.buckets = ''
      this.interval = ''
      this.owner = ''
    },
    async onAdd() {
      const i = Number(this.index)
      const p = Number(this.port)
      const portNum = this.$store.getters.modelInfo('portNum')
      if (!Number.isInteger(i) || i < 1 || i > 65535) {
        this.$message.error('Index must be 1-65535.')
        return
      }
      if (!Number.isInteger(p) || p < 1 || p > portNum) {
        this.$message.error(`Port must be 1-${portNum}.`)
        return
      }
      const b = this.buckets === '' ? 50 : Number(this.buckets)
      if (!Number.isInteger(b) || b < 1 || b > 50) {
        this.$message.error('Buckets Requested must be 1-50.')
        return
      }
      const iv = this.interval === '' ? 1800 : Number(this.interval)
      if (!Number.isInteger(iv) || iv < 1 || iv > 3600) {
        this.$message.error('Interval must be 1-3600.')
        return
      }
      await cgiSet('rmon_historyAdd', { idx: i, port: p, bucketsReq: b, interval: iv, owner: this.owner })
      this.onReset()
      this.load()
    },
    async onDelete(row) {
      await this.$confirm(`Delete entry ${row.idx}?`, 'Warning', { type: 'warning' })
      await cgiSet('rmon_historyDel', { idx: row.idx }, { successMsg: false })
      this.load()
    },
    async onDeleteAll() {
      await this.$confirm('Delete all entries?', 'Warning', { type: 'warning' })
      await cgiSet('rmon_historyDel', { all: 1 }, { successMsg: false })
      this.load()
    }
  }
}
</script>

<template>
  <div class="main_body">
    <div id="basetitle">Ethernet Statistics Settings</div>
    <div>
      <div class="table_title">Ethernet Statistics Settings</div>
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
      Ethernet Statistics Table
      <div style="display: inline; float: right; margin-top: 4px">
        <input type="button" value="Delete All" class="btnInTitle" :disabled="deleteAllDisabled" :class="{ btnDisabled: deleteAllDisabled }" @click="onDeleteAll">
      </div>
    </div>
    <el-table v-loading="loading" :data="entries.slice((currentPage - 1) * pageSize, currentPage * pageSize)" class="tableBox" stripe border empty-text="< < Table is empty > >" :header-cell-style="pageTableHeader" :cell-style="pageTableCell">
      <el-table-column prop="idx" label="Index" />
      <el-table-column prop="port" label="Port" />
      <el-table-column prop="dropEvents" label="Drop Events" />
      <el-table-column prop="octets" label="Octets" />
      <el-table-column prop="packets" label="Packets" />
      <el-table-column prop="broadcast" label="Broadcast Packets" />
      <el-table-column prop="multicast" label="Multicast Packets" />
      <el-table-column prop="owner" label="Owner" />
      <el-table-column label="Action">
        <template slot-scope="scope">
          <input type="button" class="btnInTable" value="Delete" @click="onDelete(scope.row)">
        </template>
      </el-table-column>
    </el-table>
    <div>
      <emu-pagination :current-page.sync="currentPage" :page-size.sync="pageSize" :total="entries.length" />
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
      index: '',
      port: '',
      owner: '',
      entries: [],
      currentPage: 1,
      pageSize: 5
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
      cgiGet('rmon_statistics').then(d => {
        this.entries = d.entries || []
      }).finally(() => { this.loading = false })
    },
    onReset() {
      this.index = ''
      this.port = ''
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
      await cgiSet('rmon_statisticsAdd', { idx: i, port: p, owner: this.owner })
      this.onReset()
      this.load()
    },
    async onDelete(row) {
      await this.$confirm(`Delete entry ${row.idx}?`, 'Warning', { type: 'warning' })
      await cgiSet('rmon_statisticsDel', { idx: row.idx }, { successMsg: false })
      this.load()
    },
    async onDeleteAll() {
      await this.$confirm('Delete all entries?', 'Warning', { type: 'warning' })
      await cgiSet('rmon_statisticsDel', { all: 1 }, { successMsg: false })
      this.load()
    }
  }
}
</script>

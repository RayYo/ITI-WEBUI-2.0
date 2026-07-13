<template>
  <div class="main_body">
    <div id="basetitle">Trap Management</div>
    <div>
      <div class="table_title">Trap Management Global Settings</div>
      <table class="from_table" border="" cellspacing="0">
        <tbody>
          <tr>
            <td>Trap Status</td>
            <td>
              <select v-model="trapStatus">
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

      <div class="table_title">Add Host Table</div>
      <table class="from_table" border="" cellspacing="0">
        <tbody>
          <tr>
            <td rowspan="2">Host IP Address</td>
            <td class="special_td1">
              <div class="inputBox">
                <input v-model="hostIpv4" type="text" maxlength="15" class="baseInput" :disabled="ipVer !== '1'" :class="{ disabledStyle: ipVer !== '1' }">
              </div>
              <input id="IPv4" v-model="ipVer" value="1" type="radio" name="racal" class="tipAfterInputBox">
              <label for="IPv4">IPv4</label>
            </td>
          </tr>
          <tr>
            <td class="special_td2">
              <div class="inputBox">
                <input v-model="hostIpv6" type="text" maxlength="43" class="baseInput" :disabled="ipVer !== '2'" :class="{ disabledStyle: ipVer !== '2' }">
              </div>
              <input id="IPv6" v-model="ipVer" value="2" type="radio" name="racal" class="tipAfterInputBox">
              <label for="IPv6">IPv6</label>
            </td>
          </tr>
          <tr>
            <td>SNMP Version</td>
            <td>
              <select v-model="version">
                <option value="1">v1</option>
                <option value="2">v2c</option>
                <option value="3">v3-NoAuthNoPriv</option>
                <option value="4">v3-AuthNoPriv</option>
                <option value="5">v3-AuthPriv</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Community Name/User Name</td>
            <td>
              <div class="inputBox"><input v-model="name" type="text" maxlength="32" autocomplete="off" class="baseInput"></div>
              <span class="tipAfterInputBox"> * (32 characters limit)</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Add" @click="onAdd">
        <input type="button" class="btnOutTable" value="Reset" @click="onReset">
      </div>

      <div class="table_title">
        <span>Trap Management Table </span>
        <span class="tipInTableTitle">( Free Entries: {{ max - entries.length }}, Total Entries: {{ entries.length }} )</span>
        <div style="display: inline; float: right;">
          <input type="button" value="Delete All" class="btnInTitle" :disabled="deleteAllDisabled" :class="{ btnDisabled: deleteAllDisabled }" @click="onDeleteAll">
        </div>
      </div>
      <el-table :data="pageRows" class="tableBox" stripe border empty-text="< < Table is empty > >" :header-cell-style="pageTableHeader" :cell-style="pageTableCell">
        <el-table-column prop="host" label="Host IP Address" />
        <el-table-column prop="version" label="SNMP Version" width="280" />
        <el-table-column prop="name" label="Community Name/User Name" width="470" />
        <el-table-column label="Action" width="260">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Delete" @click="onDelete(scope.row)">
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="page"
        :page-size.sync="pageSize"
        small
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50]"
        :total="entries.length"
      />
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { applyCheck } from '@/utils'
import { pageTableHeader, pageTableCell } from '@/utils/emu'

const VERSIONS = { 1: 'v1', 2: 'v2c', 3: 'v3-NoAuthNoPriv', 4: 'v3-AuthNoPriv', 5: 'v3-AuthPriv' }

export default {
  data() {
    return {
      pageTableHeader,
      pageTableCell,
      trapStatus: '1',
      ipVer: '1',
      hostIpv4: '',
      hostIpv6: '',
      version: '1',
      name: '',
      max: 0,
      entries: [],
      page: 1,
      pageSize: 20
    }
  },
  computed: {
    pageRows() {
      return this.entries.slice((this.page - 1) * this.pageSize, this.page * this.pageSize)
    },
    deleteAllDisabled() {
      return !this.entries.length
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('snmp_trapEvent').then(t => {
        this.trapStatus = t.enabled ? '1' : '2'
      })
      cgiGet('snmp_notify').then(n => {
        this.max = n.max || 0
        this.entries = n.entries || []
      })
    },
    onApply() {
      cgiSet('snmp_trapEvent', { enabled: this.trapStatus === '1' ? 1 : 0 })
    },
    onReset() {
      this.hostIpv4 = ''
      this.hostIpv6 = ''
      this.version = '1'
      this.name = ''
    },
    async onAdd() {
      const host = this.ipVer === '1' ? this.hostIpv4 : this.hostIpv6
      if (this.ipVer === '1' && !applyCheck('ipv4', host)) {
        this.$message.error('Invalid Host IPv4 address.')
        return
      }
      if (this.ipVer === '2' && !applyCheck('ipv6', host)) {
        this.$message.error('Invalid Host IPv6 address.')
        return
      }
      if (!this.name) {
        this.$message.error('Community Name/User Name is required.')
        return
      }
      await cgiSet('snmp_notifyAdd', { host, version: VERSIONS[this.version], name: this.name })
      this.onReset()
      this.load()
    },
    async onDelete(row) {
      await this.$confirm(`Delete host "${row.host}"?`, 'Warning', { type: 'warning' })
      await cgiSet('snmp_notifyDel', { idx: row.idx }, { successMsg: false })
      this.load()
    },
    async onDeleteAll() {
      await this.$confirm('Delete all entries?', 'Warning', { type: 'warning' })
      await cgiSet('snmp_notifyDel', { all: 1 }, { successMsg: false })
      this.load()
    }
  }
}
</script>

<style lang="scss" scoped>
.special_td1 {
  border-bottom: 0 none;
}
.special_td2 {
  border-top: 0 none;
}
</style>

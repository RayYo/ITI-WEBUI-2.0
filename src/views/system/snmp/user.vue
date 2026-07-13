<template>
  <div class="main_body">
    <div id="basetitle">SNMP User/Group</div>
    <div>
      <div class="table_title">SNMP User/Group Settings</div>
      <table class="from_table" border="" cellspacing="0">
        <tbody>
          <tr>
            <td>User Name</td>
            <td colspan="2">
              <div class="inputBox"><input v-model="name" type="text" maxlength="32" autocomplete="off" class="baseInput"></div>
              * (32 characters limit)
            </td>
          </tr>
          <tr>
            <td>Group Name</td>
            <td colspan="2">
              <div class="inputBox"><input v-model="group" type="text" maxlength="32" autocomplete="off" class="baseInput"></div>
              * (32 characters limit)
            </td>
          </tr>
          <tr>
            <td>SNMP Version</td>
            <td>
              <select v-model="version" style="margin-left: 10px; min-width: 75px; width: 25%">
                <option value="1">v1</option>
                <option value="2">v2c</option>
                <option value="3">v3</option>
              </select>
            </td>
            <td>
              <input id="encrypted" v-model="encrypted" type="checkbox" :disabled="v3Off">
              encrypted
            </td>
          </tr>
          <tr>
            <td>Auth-Protocol</td>
            <td>
              <select v-model="authProto" :disabled="v3Off" :class="{ disabledStyle: v3Off }" style="margin-left: 10px; min-width: 75px; width: 25%">
                <option value="2">MD5</option>
                <option value="3">SHA</option>
              </select>
            </td>
            <td>
              <span>Password</span>
              <div class="inputBox">
                <input v-model="authPwd" type="password" maxlength="1024" autocomplete="new-password" class="baseInput" :disabled="v3Off" :class="{ disabledStyle: v3Off }">
              </div>
            </td>
          </tr>
          <tr>
            <td>Priv-Protocol</td>
            <td>
              <select v-model="privProto" :disabled="v3Off" :class="{ disabledStyle: v3Off }" style="margin-left: 10px; min-width: 75px; width: 25%">
                <option value="2">DES</option>
                <option value="1">None</option>
              </select>
            </td>
            <td>
              <span>Password</span>
              <div class="inputBox">
                <input v-model="privPwd" type="password" maxlength="1024" autocomplete="new-password" class="baseInput" :disabled="privOff" :class="{ disabledStyle: privOff }">
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Add" @click="onAdd">
        <input type="button" class="btnOutTable" value="Reset" @click="onReset">
      </div>

      <div class="table_title">
        SNMP User/Group Table
        <span class="tipInTableTitle">( Free Entries: {{ max - entries.length }}, Total Entries: {{ entries.length }} )</span>
        <div style="display: inline; float: right; margin-top: 4px">
          <input type="button" value="Delete All" class="btnInTitle" @click="onDeleteAll">
        </div>
      </div>
      <el-table v-loading="loading" :data="pageRows" class="tableBox" stripe border empty-text="< < Table is empty > >" :header-cell-style="pageTableHeader" :cell-style="pageTableCell">
        <el-table-column prop="name" label="User Name" />
        <el-table-column prop="group" label="Group Name" />
        <el-table-column prop="version" label="SNMP Version" />
        <el-table-column prop="auth" label="Auth-Protocol" />
        <el-table-column prop="priv" label="Priv-Protocol" />
        <el-table-column label="Action">
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
import { pageTableHeader, pageTableCell } from '@/utils/emu'

export default {
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      name: '',
      group: '',
      version: '1', // 1=v1 2=v2c 3=v3
      encrypted: false,
      authProto: '2', // 2=MD5 3=SHA
      authPwd: '',
      privProto: '2', // 2=DES 1=None(原版默认显示 DES)
      privPwd: '',
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
    v3Off() {
      return this.version !== '3'
    },
    privOff() {
      return this.v3Off || this.privProto === '1'
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('snmp_user').then(d => {
        this.max = d.max || 0
        this.entries = d.entries || []
      }).finally(() => { this.loading = false })
    },
    onReset() {
      this.name = ''
      this.group = ''
      this.version = '1'
      this.encrypted = false
      this.authProto = '2'
      this.authPwd = ''
      this.privProto = '1'
      this.privPwd = ''
    },
    async onAdd() {
      if (!this.name || !this.group) {
        this.$message.error('User Name and Group Name are required.')
        return
      }
      if (!this.v3Off && !this.authPwd) {
        this.$message.error('Auth password is required for v3.')
        return
      }
      await cgiSet('snmp_userAdd', {
        name: this.name,
        group: this.group,
        version: { 1: 'v1', 2: 'v2c', 3: 'v3' }[this.version],
        encrypted: this.encrypted ? 1 : 0,
        auth: this.v3Off ? 'None' : { 2: 'MD5', 3: 'SHA' }[this.authProto],
        authPwd: this.v3Off ? '' : this.authPwd,
        priv: this.privOff ? 'None' : 'DES',
        privPwd: this.privOff ? '' : this.privPwd
      })
      this.onReset()
      this.load()
    },
    async onDelete(row) {
      await this.$confirm(`Delete user "${row.name}"?`, 'Warning', { type: 'warning' })
      await cgiSet('snmp_userDel', { name: row.name }, { successMsg: false })
      this.load()
    },
    async onDeleteAll() {
      await this.$confirm('Delete all entries?', 'Warning', { type: 'warning' })
      await cgiSet('snmp_userDel', { all: 1 }, { successMsg: false })
      this.load()
    }
  }
}
</script>

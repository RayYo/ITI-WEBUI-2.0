<template>
  <div class="main_body">
    <div id="basetitle">SNMP Community Table</div>
    <div>
      <div class="table_title">SNMP Community Settings</div>
      <table class="from_table" border="" cellspacing="0">
        <tbody>
          <tr>
            <td>Community Name</td>
            <td>
              <div class="inputBox"><input v-model="name" type="text" maxlength="32" autocomplete="off" class="baseInput"></div>
              <span class="tipAfterInputBox"> * (32 characters limit)</span>
            </td>
          </tr>
          <tr>
            <td>User Name (View Policy)</td>
            <td>
              <div class="inputBox"><input v-model="policy" type="text" maxlength="32" autocomplete="off" class="baseInput"></div>
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
        SNMP Community Table
        <span class="tipInTableTitle">( Free Entries: {{ max - entries.length }}, Total Entries: {{ entries.length }} )</span>
        <div style="display: inline; float: right; margin-top: 4px">
          <input type="button" value="Delete All" class="btnInTitle" @click="onDeleteAll">
        </div>
      </div>
      <el-table :data="pageRows" class="tableBox" stripe border empty-text="< < Table is empty > >" :header-cell-style="pageTableHeader" :cell-style="pageTableCell">
        <el-table-column prop="name" label="Community Name" />
        <el-table-column prop="policy" label="User Name (View Policy)" />
        <el-table-column label="Action" width="450">
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
      pageTableHeader,
      pageTableCell,
      name: '',
      policy: '',
      max: 0,
      entries: [],
      page: 1,
      pageSize: 20
    }
  },
  computed: {
    pageRows() {
      return this.entries.slice((this.page - 1) * this.pageSize, this.page * this.pageSize)
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('snmp_community').then(d => {
        this.max = d.max || 0
        this.entries = d.entries || []
      })
    },
    onReset() {
      this.name = ''
      this.policy = ''
    },
    async onAdd() {
      if (!this.name || !this.policy) {
        this.$message.error('Community Name and User Name are required.')
        return
      }
      await cgiSet('snmp_communityAdd', { name: this.name, policy: this.policy })
      this.onReset()
      this.load()
    },
    async onDelete(row) {
      await this.$confirm(`Delete community "${row.name}"?`, 'Warning', { type: 'warning' })
      await cgiSet('snmp_communityDel', { name: row.name }, { successMsg: false })
      this.load()
    },
    async onDeleteAll() {
      await this.$confirm('Delete all entries?', 'Warning', { type: 'warning' })
      await cgiSet('snmp_communityDel', { all: 1 }, { successMsg: false })
      this.load()
    }
  }
}
</script>

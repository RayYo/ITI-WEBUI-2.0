<template>
  <div class="main_body">
    <div id="basetitle">SNMP View Table</div>
    <div class="table_title">SNMP View Settings</div>
    <table class="from_table" border="" cellspacing="0">
      <tbody>
        <tr>
          <td>View Name</td>
          <td>
            <div class="inputBox"><input v-model="name" type="text" maxlength="32" autocomplete="off" class="baseInput"></div>
            <span class="tipAfterInputBox">*(32 characters limit)</span>
          </td>
        </tr>
        <tr>
          <td>Subtree OID</td>
          <td>
            <div class="inputBox"><input v-model="oid" type="text" maxlength="16" autocomplete="off" class="baseInput"></div>
            <span class="tipAfterInputBox">*</span>
          </td>
        </tr>
        <tr>
          <td>OID Mask</td>
          <td>
            <div class="inputBox"><input v-model="mask" type="text" maxlength="16" autocomplete="off" class="baseInput"></div>
            <span class="tipAfterInputBox">*</span>
          </td>
        </tr>
        <tr>
          <td>View Type</td>
          <td>
            <select v-model="type">
              <option value="1">included</option>
              <option value="2">excluded</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Add" @click="onAdd">
      <input type="button" class="btnOutTable" value="Reset" @click="onReset">
    </div>

    <div class="table_title">
      SNMP View Table
      <span class="tipInTableTitle">( Free Entries: {{ max - entries.length }}, Total Entries: {{ entries.length }} )</span>
      <div style="display: inline; float: right; margin-top: 4px">
        <input type="button" value="Delete All" class="btnInTitle" @click="onDeleteAll">
      </div>
    </div>
    <el-table :data="pageRows" class="tableBox" stripe border empty-text="< < Table is empty > >" :header-cell-style="pageTableHeader" :cell-style="pageTableCell">
      <el-table-column prop="name" label="View Name" />
      <el-table-column prop="oid" label="Subtree OID" />
      <el-table-column prop="mask" label="OID Mask" />
      <el-table-column prop="type" label="View Type" />
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
      oid: '',
      mask: '',
      type: '1',
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
      cgiGet('snmp_view').then(d => {
        this.max = d.max || 0
        this.entries = d.entries || []
      })
    },
    onReset() {
      this.name = ''
      this.oid = ''
      this.mask = ''
      this.type = '1'
    },
    async onAdd() {
      if (!this.name || !this.oid || !this.mask) {
        this.$message.error('View Name, Subtree OID and OID Mask are required.')
        return
      }
      await cgiSet('snmp_viewAdd', {
        name: this.name,
        oid: this.oid,
        mask: this.mask,
        type: this.type === '1' ? 'included' : 'excluded'
      })
      this.onReset()
      this.load()
    },
    async onDelete(row) {
      await this.$confirm(`Delete view "${row.name}"?`, 'Warning', { type: 'warning' })
      await cgiSet('snmp_viewDel', { name: row.name }, { successMsg: false })
      this.load()
    },
    async onDeleteAll() {
      await this.$confirm('Delete all entries?', 'Warning', { type: 'warning' })
      await cgiSet('snmp_viewDel', { all: 1 }, { successMsg: false })
      this.load()
    }
  }
}
</script>

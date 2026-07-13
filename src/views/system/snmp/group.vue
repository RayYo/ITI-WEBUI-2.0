<template>
  <div class="main_body">
    <div id="basetitle">SNMP Group Access Table</div>
    <div>
      <div class="table_title">SNMP Group Access Settings</div>
      <table class="from_table" border="" cellspacing="0">
        <tbody>
          <tr>
            <td>Group Name</td>
            <td>
              <div class="inputBox"><input v-model="name" type="text" maxlength="32" autocomplete="off" class="baseInput"></div>
              * (32 characters limit)
            </td>
          </tr>
          <tr>
            <td>Read View Name</td>
            <td>
              <div class="inputBox"><input v-model="readView" type="text" maxlength="32" autocomplete="off" class="baseInput"></div>
              (32 characters limit)
            </td>
          </tr>
          <tr>
            <td>Write View Name</td>
            <td>
              <div class="inputBox"><input v-model="writeView" type="text" maxlength="32" autocomplete="off" class="baseInput"></div>
              (32 characters limit)
            </td>
          </tr>
          <tr>
            <td>Notify View Name</td>
            <td>
              <div class="inputBox"><input v-model="notifyView" type="text" maxlength="32" autocomplete="off" class="baseInput"></div>
              (32 characters limit)
            </td>
          </tr>
          <tr>
            <td>Security Model</td>
            <td>
              <select v-model="model">
                <option value="1">v1</option>
                <option value="2">v2c</option>
                <option value="3">v3</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Security Level</td>
            <td>
              <select v-model="level" :disabled="levelDisabled" :class="{ disabledStyle: levelDisabled }">
                <option value="1">NoAuthNoPriv</option>
                <option value="2">AuthNoPriv</option>
                <option value="3">AuthPriv</option>
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
        SNMP Group Access Table
        <span class="tipInTableTitle">( Free Entries: {{ max - entries.length }}, Total Entries: {{ entries.length }} )</span>
        <div style="display: inline; float: right; margin-top: 4px">
          <input type="button" value="Delete All" class="btnInTitle" @click="onDeleteAll">
        </div>
      </div>
      <el-table :data="pageRows" class="tableBox" stripe border empty-text="< < Table is empty > >" :header-cell-style="pageTableHeader" :cell-style="pageTableCell">
        <el-table-column prop="name" label="Group Name" />
        <el-table-column prop="readView" label="Read View" />
        <el-table-column prop="writeView" label="Write View" />
        <el-table-column prop="notifyView" label="Notify View" />
        <el-table-column prop="model" label="Security Model" />
        <el-table-column prop="level" label="Security Level" />
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

const MODEL = { 1: 'v1', 2: 'v2c', 3: 'v3' }
const LEVEL = { 1: 'NoAuthNoPriv', 2: 'AuthNoPriv', 3: 'AuthPriv' }

export default {
  data() {
    return {
      pageTableHeader,
      pageTableCell,
      name: '',
      readView: '',
      writeView: '',
      notifyView: '',
      model: '1',
      level: '1',
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
    /** Security Level 仅 v3 可选(原版联动) */
    levelDisabled() {
      return this.model !== '3'
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('snmp_group').then(d => {
        this.max = d.max || 0
        this.entries = d.entries || []
      })
    },
    onReset() {
      this.name = ''
      this.readView = ''
      this.writeView = ''
      this.notifyView = ''
      this.model = '1'
      this.level = '1'
    },
    async onAdd() {
      if (!this.name) {
        this.$message.error('Group Name is required.')
        return
      }
      await cgiSet('snmp_groupAdd', {
        name: this.name,
        readView: this.readView,
        writeView: this.writeView,
        notifyView: this.notifyView,
        model: MODEL[this.model],
        level: this.model === '3' ? LEVEL[this.level] : 'NoAuthNoPriv'
      })
      this.onReset()
      this.load()
    },
    async onDelete(row) {
      await this.$confirm(`Delete group "${row.name}"?`, 'Warning', { type: 'warning' })
      await cgiSet('snmp_groupDel', { name: row.name }, { successMsg: false })
      this.load()
    },
    async onDeleteAll() {
      await this.$confirm('Delete all entries?', 'Warning', { type: 'warning' })
      await cgiSet('snmp_groupDel', { all: 1 }, { successMsg: false })
      this.load()
    }
  }
}
</script>

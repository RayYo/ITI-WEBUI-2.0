<template>
  <div class="main_body">
    <div id="basetitle">RMON Event Settings</div>
    <div>
      <div class="table_title">RMON Event Settings</div>
      <table class="from_table" border="" cellspacing="0">
        <tbody>
          <tr>
            <td>Index</td>
            <td>
              <div class="inputBox"><input v-model="index" type="text" maxlength="5" autocomplete="off" class="baseInput"></div>
              <span class="tipAfterInputBox">* (1-65535)</span>
            </td>
          </tr>
          <tr>
            <td>Description</td>
            <td>
              <div class="inputBox"><input v-model="desc" type="text" maxlength="32" autocomplete="off" class="baseInput"></div>
              <span class="tipAfterInputBox">* (32 characters limit)</span>
            </td>
          </tr>
          <tr>
            <td>Type</td>
            <td>
              <select v-model="type">
                <option value="1">None</option>
                <option value="2">Log</option>
                <option value="3">SNMP Trap</option>
                <option value="4">Log and Trap</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Community</td>
            <td>
              <div class="inputBox">
                <input v-model="community" type="text" maxlength="32" autocomplete="off" class="baseInput" :disabled="communityOff" :class="{ disabledStyle: communityOff }">
              </div>
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
      RMON Event Table
      <div style="display: inline; float: right;">
        <input type="button" value="Delete All" class="btnInTitle" :disabled="deleteAllDisabled" :class="{ btnDisabled: deleteAllDisabled }" @click="onDeleteAll">
      </div>
    </div>
    <el-table :data="entries" class="tableBox" stripe border empty-text="< < Table is empty > >" :header-cell-style="pageTableHeader" :cell-style="pageTableCell">
      <el-table-column prop="idx" label="Index" />
      <el-table-column prop="desc" label="Description" />
      <el-table-column prop="type" label="Type" />
      <el-table-column prop="community" label="Community" />
      <el-table-column prop="owner" label="Owner" />
      <el-table-column prop="lastSent" label="Last Time Sent" />
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

const TYPES = { 1: 'None', 2: 'Log', 3: 'SNMP Trap', 4: 'Log and Trap' }

export default {
  data() {
    return {
      pageTableHeader,
      pageTableCell,
      index: '',
      desc: '',
      type: '1',
      community: '',
      owner: '',
      entries: []
    }
  },
  computed: {
    deleteAllDisabled() {
      return !this.entries.length
    },
    /** Community 仅 Trap 类型可填(原版联动) */
    communityOff() {
      return this.type !== '3' && this.type !== '4'
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('rmon_event').then(d => {
        this.entries = d.entries || []
      })
    },
    onReset() {
      this.index = ''
      this.desc = ''
      this.type = '1'
      this.community = ''
      this.owner = ''
    },
    async onAdd() {
      const i = Number(this.index)
      if (!Number.isInteger(i) || i < 1 || i > 65535) {
        this.$message.error('Index must be 1-65535.')
        return
      }
      if (!this.desc) {
        this.$message.error('Description is required.')
        return
      }
      await cgiSet('rmon_eventAdd', {
        idx: i,
        desc: this.desc,
        type: TYPES[this.type],
        community: this.communityOff ? '' : this.community,
        owner: this.owner
      })
      this.onReset()
      this.load()
    },
    async onDelete(row) {
      await this.$confirm(`Delete entry ${row.idx}?`, 'Warning', { type: 'warning' })
      await cgiSet('rmon_eventDel', { idx: row.idx }, { successMsg: false })
      this.load()
    },
    async onDeleteAll() {
      await this.$confirm('Delete all entries?', 'Warning', { type: 'warning' })
      await cgiSet('rmon_eventDel', { all: 1 }, { successMsg: false })
      this.load()
    }
  }
}
</script>

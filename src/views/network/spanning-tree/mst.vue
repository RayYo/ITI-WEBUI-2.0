<template>
  <div class="main_body">
    <div id="basetitle">MST Settings</div>
    <div>
      <div class="table_title">MST Settings</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Configuration Name</td>
            <td><base-input v-model="configName" type="text" max-len="32" /></td>
          </tr>
          <tr>
            <td>Revision Level</td>
            <td>
              <base-input v-model="revisionLevel" type="text" max-len="5" />
              <span class="tipAfterInputBox">(0-65535)</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApplyConfig">
      </div>

      <div class="table_title">MST Instance Settings</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>MSTI ID</td>
            <td>
              <base-input v-model="newId" type="text" max-len="2" />
              <span class="tipAfterInputBox">*(1-31)</span>
            </td>
          </tr>
          <tr>
            <td>VID List</td>
            <td>
              <base-input v-model="newVid" type="text" max-len="4094" />&nbsp;(1-4094)
            </td>
          </tr>
          <tr>
            <td class="blockTitle">Priority</td>
            <td>
              <select v-model="newPriority">
                <option v-for="v in PRIORITIES" :key="v" :value="v">{{ v }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Add" @click="onAdd">
      </div>

      <div class="table_title">MST Table</div>
      <el-table
        :data="table"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="mstiId" label="MSTI ID" min-width="80" />
        <el-table-column label="VID List" min-width="170">
          <template slot-scope="scope">
            <input v-model="scope.row.vidList" type="text" maxlength="1024" class="baseInput" :class="{ disabledStyle: isCist(scope.row) }" :disabled="isCist(scope.row)">
          </template>
        </el-table-column>
        <el-table-column label="Priority" min-width="160">
          <template slot-scope="scope">
            <select v-model="scope.row.priority" class="selectInTable" :class="{ disabledStyle: isCist(scope.row) }" :disabled="isCist(scope.row)">
              <option v-for="v in PRIORITIES" :key="v" :value="v">{{ v }}</option>
            </select>
          </template>
        </el-table-column>
        <el-table-column label="Action" min-width="270">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" :class="{ btnDisabled: isCist(scope.row) }" value="Apply" :disabled="isCist(scope.row)" @click="onRowApply(scope.row)">
            <input type="button" class="btnInTable" :class="{ btnDisabled: isCist(scope.row) }" value="Delete" :disabled="isCist(scope.row)" @click="onRowDelete(scope.row)">
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import message from '@/utils/message'
import baseInput from '@/components/CustomInput/base-input.vue'

const PRIORITIES = Array.from({ length: 16 }, (_, i) => i * 4096)

export default {
  components: { baseInput },
  data() {
    return {
      PRIORITIES,
      pageTableHeader,
      pageTableCell,
      configName: '',
      revisionLevel: '0',
      newId: '',
      newVid: '',
      newPriority: 32768,
      table: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    isCist(row) {
      return row.mstiId === 'CIST'
    },
    load() {
      cgiGet('net_stpMst').then(d => {
        this.configName = d.configName || ''
        this.revisionLevel = String(d.revisionLevel)
        this.table = (d.table || []).map(r => ({ ...r }))
      })
    },
    onApplyConfig() {
      cgiSet('net_stpMstConfig', {
        configName: this.configName,
        revisionLevel: this.revisionLevel
      }).then(() => this.load())
    },
    onAdd() {
      const id = Number(this.newId)
      if (!id || id < 1 || id > 31) { message.warnBox('MSTI ID must be within 1-31.'); return }
      cgiSet('net_stpMstAdd', { mstiId: id, vidList: this.newVid, priority: this.newPriority }).then(() => {
        this.newId = ''; this.newVid = ''; this.newPriority = 32768
        this.load()
      })
    },
    onRowApply(row) {
      cgiSet('net_stpMstAdd', { mstiId: row.mstiId, vidList: row.vidList, priority: row.priority }).then(() => this.load())
    },
    onRowDelete(row) {
      message.confirmWarnBox(`Do you want to delete MSTI ${row.mstiId} ?`, 'Please confirm').then(async() => {
        await cgiSet('net_stpMstDel', { mstiId: row.mstiId }, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

<template>
  <div class="main_body">
    <div id="basetitle">MST Port Settings</div>
    <div>
      <div class="table_title">MST Port Settings</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td class="textTh">Select MST Port</td>
            <td>
              <select v-model="port" @change="load">
                <option v-for="p in portList" :key="p" :value="p">{{ p }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <br>
      <div class="table_title">MST Port Info</div>
      <el-table
        :data="rows"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="mstiId" label="MSTI ID" min-width="80" />
        <el-table-column prop="designatedBridge" label="Designated Bridge" min-width="180" />
        <el-table-column prop="internalPathCost" label="Internal Path Cost" min-width="150" />
        <el-table-column label="Admin Path Cost (0 = Auto)" min-width="210">
          <template slot-scope="scope">
            <input v-model="scope.row.adminPathCost" type="text" maxlength="9" class="baseInput" style="width: 100% !important">
          </template>
        </el-table-column>
        <el-table-column label="Priority" min-width="160">
          <template slot-scope="scope">
            <select v-model="scope.row.priority" class="selectInTable">
              <option v-for="v in PRIORITIES" :key="v" :value="v">{{ v }}</option>
            </select>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" min-width="110" />
        <el-table-column prop="role" label="Role" min-width="110" />
        <el-table-column label="Action" min-width="110">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Apply" @click="onApply(scope.row)">
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'

const PRIORITIES = Array.from({ length: 16 }, (_, i) => i * 16)

export default {
  data() {
    return {
      PRIORITIES,
      pageTableHeader,
      pageTableCell,
      port: 1,
      rows: []
    }
  },
  computed: {
    portList() {
      const n = this.$store.getters.modelInfo('portNum') || 0
      return Array.from({ length: n }, (_, i) => i + 1)
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('net_stpMstPort', { port: this.port }).then(d => {
        this.rows = (d.list || []).map(r => ({ ...r }))
      })
    },
    onApply(row) {
      cgiSet('net_stpMstPortEdit', {
        port: this.port,
        mstiId: row.mstiId,
        adminPathCost: row.adminPathCost,
        priority: row.priority
      }).then(() => this.load())
    }
  }
}
</script>

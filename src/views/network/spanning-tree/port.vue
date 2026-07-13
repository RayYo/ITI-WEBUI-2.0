<template>
  <div class="main_body">
    <div id="basetitle">Port Settings</div>
    <div>
      <el-table
        :data="rows"
        class="tableBox stp-port-table"
        stripe
        border
        :header-cell-style="darkTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="port" label="Port" min-width="60" />
        <el-table-column label="STP Status" min-width="120">
          <template slot-scope="scope">
            <select v-model="scope.row.stpStatus" class="selectInTable" :class="{ disabledStyle: off }" :disabled="off">
              <option value="1">Enabled</option>
              <option value="2">Disabled</option>
            </select>
          </template>
        </el-table-column>
        <el-table-column label="Priority" min-width="120">
          <template slot-scope="scope">
            <select v-model="scope.row.priority" class="selectInTable" :class="{ disabledStyle: off }" :disabled="off">
              <option v-for="v in PORT_PRI" :key="v" :value="v">{{ v }}</option>
            </select>
          </template>
        </el-table-column>
        <el-table-column label="Admin Cost (0 = Auto)" min-width="170">
          <template slot-scope="scope">
            <input v-model="scope.row.adminCost" type="text" maxlength="9" class="baseInput" :class="{ disabledStyle: off }" :disabled="off">
          </template>
        </el-table-column>
        <el-table-column prop="externalCost" label="External Cost" min-width="120" />
        <el-table-column prop="state" label="Status" min-width="120" />
        <el-table-column label="Edge" min-width="140">
          <template slot-scope="scope">
            <select v-model="scope.row.edge" class="selectInTable" :class="{ disabledStyle: off }" :disabled="off">
              <option v-for="o in EDGE" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </template>
        </el-table-column>
        <el-table-column label="P2P" min-width="140">
          <template slot-scope="scope">
            <select v-model="scope.row.p2p" class="selectInTable" :class="{ disabledStyle: off }" :disabled="off">
              <option v-for="o in EDGE" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </template>
        </el-table-column>
        <el-table-column label="Restricted Role" min-width="140">
          <template slot-scope="scope">
            <select v-model="scope.row.restrictedRole" class="selectInTable" :class="{ disabledStyle: off }" :disabled="off">
              <option value="1">True</option>
              <option value="2">False</option>
            </select>
          </template>
        </el-table-column>
        <el-table-column label="Restricted TCN" min-width="140">
          <template slot-scope="scope">
            <select v-model="scope.row.restrictedTCN" class="selectInTable" :class="{ disabledStyle: off }" :disabled="off">
              <option value="1">True</option>
              <option value="2">False</option>
            </select>
          </template>
        </el-table-column>
        <el-table-column label="Migrate" min-width="120">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" :class="{ btnDisabled: off }" value="Restart" :disabled="off" @click="onMigrate(scope.row)">
          </template>
        </el-table-column>
        <el-table-column label="Apply" min-width="110">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" :class="{ btnDisabled: off }" value="Apply" :disabled="off" @click="onApply(scope.row)">
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { darkTableHeader, pageTableCell } from '@/utils/emu'

const PORT_PRI = Array.from({ length: 16 }, (_, i) => i * 16)
const EDGE = [
  { value: 'forcetrue', label: 'ForceTrue' },
  { value: 'forcefalse', label: 'ForceFalse' },
  { value: 'auto', label: 'Auto' }
]

export default {
  data() {
    return {
      PORT_PRI,
      EDGE,
      darkTableHeader,
      pageTableCell,
      stpEnabled: false,
      rows: []
    }
  },
  computed: {
    off() {
      return !this.stpEnabled
    }
  },
  created() {
    this.load()
  },
  methods: {
    async load() {
      const g = await cgiGet('net_stpProtocol')
      this.stpEnabled = !!g.status
      const d = await cgiGet('net_stpPort')
      const all = { port: 'All', stpStatus: '1', priority: 128, adminCost: '0', externalCost: '-', state: '-', edge: 'auto', p2p: 'auto', restrictedRole: '2', restrictedTCN: '2' }
      this.rows = [all].concat((d.ports || []).map(p => ({
        port: p.port,
        stpStatus: p.stpStatus ? '1' : '2',
        priority: p.priority,
        adminCost: String(p.adminCost),
        externalCost: p.externalCost,
        state: p.state,
        edge: p.edge || 'auto',
        p2p: p.p2p || 'auto',
        restrictedRole: p.restrictedRole ? '1' : '2',
        restrictedTCN: p.restrictedTCN ? '1' : '2'
      })))
    },
    onApply(row) {
      const isAll = row.port === 'All'
      const payload = isAll ? { all: 1 } : { port: row.port }
      payload.stpStatus = row.stpStatus === '1' ? 1 : 0
      payload.priority = row.priority
      payload.adminCost = row.adminCost
      payload.edge = row.edge
      payload.p2p = row.p2p
      payload.restrictedRole = row.restrictedRole === '1' ? 1 : 0
      payload.restrictedTCN = row.restrictedTCN === '1' ? 1 : 0
      cgiSet('net_stpPortEdit', payload).then(() => this.load())
    },
    onMigrate(row) {
      const payload = row.port === 'All' ? { all: 1 } : { port: row.port }
      cgiSet('net_stpPortMigrate', payload)
    }
  }
}
</script>

<style lang="scss" scoped>
/* 原版 .tableBox td 无内边距,控件自身高度决定行高 */
.stp-port-table ::v-deep td.el-table__cell {
  padding: 0 !important;
}
</style>

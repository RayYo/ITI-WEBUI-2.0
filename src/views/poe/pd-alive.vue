<template>
  <div class="main_body">
    <div id="basetitle">PD Alive</div>
    <div>
      <common-table header-title="PD Alive State" :first-column="['State']">
        <template #0>
          <select v-model="state">
            <option value="1">Enabled</option>
            <option value="2">Disabled</option>
          </select>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApplyState">
      </div>

      <div class="table_title">PD Alive Table</div>
      <div class="table-scroll">
        <el-table
          v-loading="loading"
          :data="rows"
          class="tableBox"
          stripe
          border
          style="min-width: 1600px"
          :header-cell-style="pageTableHeader"
          :cell-style="pageTableCell"
        >
          <el-table-column label="Port" min-width="72" align="center">
            <template slot-scope="scope"><span>{{ scope.row.port }}</span></template>
          </el-table-column>
          <el-table-column label="PD Alive State" min-width="158" align="center">
            <template slot-scope="scope">
              <select v-model="scope.row.pdState" class="selectInTable">
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </template>
          </el-table-column>
          <el-table-column label="PD IP Address" min-width="203" align="center">
            <template slot-scope="scope">
              <input v-model="scope.row.ip" type="text" maxlength="15" class="baseInput" :class="{ disabledStyle: scope.row.pdState !== '1' }" :disabled="scope.row.pdState !== '1'">
            </template>
          </el-table-column>
          <el-table-column label="Poll Interval (10~300 sec)" min-width="237" align="center">
            <template slot-scope="scope">
              <input v-model="scope.row.pollInterval" type="text" maxlength="3" class="baseInput" :class="{ disabledStyle: scope.row.pdState !== '1' }" :disabled="scope.row.pdState !== '1'">
            </template>
          </el-table-column>
          <el-table-column label="Retry Count (0~5)" min-width="169" align="center">
            <template slot-scope="scope">
              <input v-model="scope.row.retryCount" type="text" maxlength="1" class="baseInput" :class="{ disabledStyle: scope.row.pdState !== '1' }" :disabled="scope.row.pdState !== '1'">
            </template>
          </el-table-column>
          <el-table-column label="Power Off Time (3~120) (sec)" min-width="249" align="center">
            <template slot-scope="scope">
              <input v-model="scope.row.powerOffTime" type="text" maxlength="3" class="baseInput" :class="{ disabledStyle: scope.row.pdState !== '1' }" :disabled="scope.row.pdState !== '1'">
            </template>
          </el-table-column>
          <el-table-column label="Start Up Time (30~600) (sec)" min-width="249" align="center">
            <template slot-scope="scope">
              <input v-model="scope.row.startUpTime" type="text" maxlength="3" class="baseInput" :class="{ disabledStyle: scope.row.pdState !== '1' }" :disabled="scope.row.pdState !== '1'">
            </template>
          </el-table-column>
          <el-table-column label="Action Setting" min-width="158" align="center">
            <template slot-scope="scope">
              <select v-model="scope.row.actionSetting" class="selectInTable" :class="{ disabledStyle: scope.row.pdState !== '1' }" :disabled="scope.row.pdState !== '1'">
                <option value="1">Reset</option>
                <option value="2">Notify</option>
                <option value="3">Both</option>
              </select>
            </template>
          </el-table-column>
          <el-table-column label="Action" min-width="135" align="center">
            <template slot-scope="scope">
              <input type="button" class="btnInTable" value="Apply" @click="onApply(scope.row)">
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import commonTable from '@/components/CustomTable/common-table.vue'

export default {
  components: { commonTable },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      state: '2',
      // 行内详细字段(IP/Poll/Retry/PowerOff/StartUp/Action Setting)是否可编辑,
      // 由该行 PD Alive State select 前端控制(Enabled 可编辑,Disabled 置灰);
      // PD Alive State select 与 Apply 始终可用。全局 State 为独立设置项(带自己的 Apply)
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_poePdAlive').then(d => {
        this.state = d.state ? '1' : '2'
        this.rows = (d.ports || []).map(p => ({
          port: p.port,
          pdState: p.pdState ? '1' : '2',
          ip: p.ip || '',
          pollInterval: String(p.pollInterval != null ? p.pollInterval : ''),
          retryCount: String(p.retryCount != null ? p.retryCount : ''),
          powerOffTime: String(p.powerOffTime != null ? p.powerOffTime : ''),
          startUpTime: String(p.startUpTime != null ? p.startUpTime : ''),
          actionSetting: String(p.actionSetting != null ? p.actionSetting : 1)
        }))
      }).finally(() => { this.loading = false })
    },
    onApplyState() {
      cgiSet('net_poePdAliveStateEdit', { state: this.state === '1' ? 1 : 0 }).then(() => this.load())
    },
    onApply(row) {
      cgiSet('net_poePdAliveEdit', {
        port: row.port,
        pdState: row.pdState === '1' ? 1 : 0,
        ip: row.ip,
        pollInterval: row.pollInterval,
        retryCount: row.retryCount,
        powerOffTime: row.powerOffTime,
        startUpTime: row.startUpTime,
        actionSetting: row.actionSetting
      }).then(() => this.load())
    }
  }
}
</script>

<style lang="scss" scoped>
.table-scroll {
  overflow-x: auto;
}
</style>

<template>
  <div class="main_body">
    <div id="basetitle">Physical Interface</div>
    <div>
      <div class="table-scroll">
        <el-table :data="rows" class="tableBox" style="min-width: 1400px" stripe border :header-cell-style="darkTableHeader" :cell-style="pageTableCell">
          <el-table-column prop="port" label="Port" width="70" />
          <el-table-column prop="trunk" label="Trunk" width="80" />
          <el-table-column prop="type" label="Type" width="90" />
          <el-table-column label="Link Status" width="110">
            <template slot-scope="scope">{{ scope.row.linkStatus }}</template>
          </el-table-column>
          <el-table-column label="Admin Status" width="130">
            <template slot-scope="scope">
              <select v-model="scope.row.adminStatus">
                <option v-if="scope.row.port === 'All'" value="0">Ignore</option>
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </template>
          </el-table-column>
          <el-table-column label="Mode" width="150">
            <template slot-scope="scope">
              <select v-model="scope.row.mode">
                <option v-if="scope.row.port === 'All'" value="ignore">Ignore</option>
                <option value="auto">Auto</option>
                <option value="1000full">1000/Full</option>
                <option value="100full">100/Full</option>
                <option value="10full">10/Full</option>
                <option value="100half">100/Half</option>
                <option value="10half">10/Half</option>
              </select>
            </template>
          </el-table-column>
          <el-table-column label="Jumbo" width="120">
            <template slot-scope="scope">
              <select v-model="scope.row.jumbo">
                <option v-if="scope.row.port === 'All'" value="0">Ignore</option>
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </template>
          </el-table-column>
          <el-table-column label="Flow Ctrl" width="120">
            <template slot-scope="scope">
              <select v-model="scope.row.flowCtrl">
                <option v-if="scope.row.port === 'All'" value="0">Ignore</option>
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </template>
          </el-table-column>
          <el-table-column label="EAP PassThrough" width="150">
            <template slot-scope="scope">
              <select v-model="scope.row.eapPassThrough">
                <option v-if="scope.row.port === 'All'" value="0">Ignore</option>
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </template>
          </el-table-column>
          <el-table-column label="BPDU PassThrough" width="160">
            <template slot-scope="scope">
              <select v-model="scope.row.bpduPassThrough">
                <option v-if="scope.row.port === 'All'" value="0">Ignore</option>
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </template>
          </el-table-column>
          <el-table-column label="Port Description" width="180">
            <template slot-scope="scope">
              <input v-model="scope.row.description" type="text" maxlength="32">
            </template>
          </el-table-column>
          <el-table-column label="Action" width="90">
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
import { darkTableHeader, pageTableCell } from '@/utils/emu'

export default {
  data() {
    return {
      darkTableHeader,
      pageTableCell,
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('net_phyInterface').then(d => {
        const all = {
          port: 'All', trunk: '-', type: '-', linkStatus: '-',
          adminStatus: '0', mode: 'ignore', jumbo: '0', flowCtrl: '0',
          eapPassThrough: '0', bpduPassThrough: '0', description: ''
        }
        this.rows = [all].concat((d.ports || []).map(p => ({
          port: p.port,
          trunk: p.trunk || '-',
          type: p.type,
          linkStatus: p.linkStatus,
          adminStatus: p.adminEnabled ? '1' : '2',
          mode: p.mode || 'auto',
          jumbo: p.jumbo ? '1' : '2',
          flowCtrl: p.flowCtrl ? '1' : '2',
          eapPassThrough: p.eapPassThrough ? '1' : '2',
          bpduPassThrough: p.bpduPassThrough ? '1' : '2',
          description: p.description || ''
        })))
      })
    },
    async onApply(row) {
      const isAll = row.port === 'All'
      const payload = isAll ? { all: 1 } : { port: row.port }
      // All 行:值为 Ignore(0/'ignore')的字段不提交
      const boolField = (key, val) => {
        if (isAll && val === '0') return
        payload[key] = val === '1' ? 1 : 0
      }
      boolField('adminEnabled', row.adminStatus)
      boolField('jumbo', row.jumbo)
      boolField('flowCtrl', row.flowCtrl)
      boolField('eapPassThrough', row.eapPassThrough)
      boolField('bpduPassThrough', row.bpduPassThrough)
      if (!(isAll && row.mode === 'ignore')) payload.mode = row.mode
      if (!isAll) payload.description = row.description
      await cgiSet('net_phyInterfaceEdit', payload)
      this.load()
    }
  }
}
</script>

<style lang="scss" scoped>
.table-scroll {
  overflow-x: auto;
}
</style>

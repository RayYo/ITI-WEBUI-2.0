<template>
  <div class="main_body">
    <div id="basetitle">Dot1 TLVs Settings Table</div>
    <div class="table-scroll">
      <el-table
        v-loading="loading"
        :data="rows"
        class="tableBox"
        stripe
        border
        style="min-width: 1000px"
        :header-cell-style="darkTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column label="Port" min-width="80">
          <template slot-scope="scope"><span>{{ scope.row.port }}</span></template>
        </el-table-column>
        <el-table-column label="Port VLAN ID" min-width="150">
          <template slot-scope="scope">
            <select v-model="scope.row.portVlan" class="selectInTable">
              <option v-if="scope.row.port === 'All'" value="0">Ignore</option>
              <option value="1">Enabled</option>
              <option value="2">Disabled</option>
            </select>
          </template>
        </el-table-column>
        <el-table-column label="VLAN ID List" min-width="280">
          <template slot-scope="scope">
            <div class="InputInTable" style="display: inline-block; width: 45% !important">
              <input v-model="scope.row.vlanList" type="text" maxlength="1024" class="baseInput">
            </div>
            <span style="display: inline-block">Ex:(1,2,4-6)</span>
          </template>
        </el-table-column>
        <el-table-column label="Protocol Identity" min-width="280">
          <template slot-scope="scope">
            <label class="protoLabel"><input v-model="scope.row.eapol" type="checkbox"><span>EAPOL</span></label>
            <label class="protoLabel"><input v-model="scope.row.lacp" type="checkbox"><span>LACP</span></label>
            <label class="protoLabel"><input v-model="scope.row.gvrp" type="checkbox"><span>GVRP</span></label>
            <label class="protoLabel"><input v-model="scope.row.stp" type="checkbox"><span>STP</span></label>
          </template>
        </el-table-column>
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
import { darkTableHeader, pageTableCell } from '@/utils/emu'

export default {
  data() {
    return {
      loading: false,
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
      this.loading = true
      cgiGet('net_lldpDot1Tlv').then(d => {
        const all = { port: 'All', portVlan: '0', vlanList: '', eapol: false, lacp: false, gvrp: false, stp: false }
        this.rows = [all].concat((d.ports || []).map(p => ({
          port: p.port,
          portVlan: p.portVlan ? '1' : '2',
          vlanList: p.vlanList || '',
          eapol: !!(p.proto && p.proto.eapol),
          lacp: !!(p.proto && p.proto.lacp),
          gvrp: !!(p.proto && p.proto.gvrp),
          stp: !!(p.proto && p.proto.stp)
        })))
      }).finally(() => { this.loading = false })
    },
    onApply(row) {
      const isAll = row.port === 'All'
      const payload = isAll ? { all: 1 } : { port: row.port }
      if (row.portVlan !== '0') payload.portVlan = row.portVlan
      payload.vlanList = row.vlanList
      payload.proto = { eapol: row.eapol, lacp: row.lacp, gvrp: row.gvrp, stp: row.stp }
      cgiSet('net_lldpDot1TlvEdit', payload).then(() => this.load())
    }
  }
}
</script>

<style lang="scss" scoped>
.table-scroll {
  overflow-x: auto;
}
.protoLabel {
  margin-right: 6px;
  white-space: nowrap;
}
.protoLabel span {
  margin-left: 2px;
}
</style>

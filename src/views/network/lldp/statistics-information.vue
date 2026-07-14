<template>
  <div class="main_body">
    <div id="basetitle">LLDP Statistics Information</div>
    <div>
      <common-table
        header-title="LLDP Statistics Information"
        :first-column="['Last Change Time', 'Total Inserts', 'Total Deletes', 'Total Drops', 'Total Ageouts']"
      >
        <template #0><span>{{ g.lastChange }}</span></template>
        <template #1><span>{{ g.inserts }}</span></template>
        <template #2><span>{{ g.deletes }}</span></template>
        <template #3><span>{{ g.drops }}</span></template>
        <template #4><span>{{ g.ageouts }}</span></template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Clear Counter" @click="onClearCounter">
      </div>

      <div class="table_title">
        LLDP Statistics Ports
        <input type="button" class="btnOutTable" value="Clear All" style="float: right; margin-top: 5px; margin-right: 5px" @click="onClearAll">
      </div>
      <el-table
        v-loading="loading"
        :data="rows"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="port" label="Port" min-width="70" />
        <el-table-column prop="tx" label="Total Transmits" min-width="130" />
        <el-table-column prop="discards" label="Total Discards" min-width="120" />
        <el-table-column prop="errors" label="Total Errors" min-width="110" />
        <el-table-column prop="rx" label="Total Receives" min-width="120" />
        <el-table-column prop="tlvDiscards" label="Total TLV Discards" min-width="150" />
        <el-table-column prop="tlvUnknowns" label="Total TLV Unknows" min-width="150" />
        <el-table-column prop="ageouts" label="Total Ageouts" min-width="120" />
        <el-table-column label="Action" min-width="160">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Clear Counter" @click="onClearRow(scope.row)">
          </template>
        </el-table-column>
      </el-table>
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
      g: {},
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_lldpStatistics').then(d => {
        this.g = d.global || {}
        this.rows = (d.ports || []).map(p => ({
          port: p.port,
          tx: p.tx, discards: p.discards, errors: p.errors, rx: p.rx,
          tlvDiscards: p.tlvDiscards, tlvUnknowns: p.tlvUnknowns, ageouts: p.ageouts
        }))
      }).finally(() => { this.loading = false })
    },
    onClearCounter() {
      cgiSet('net_lldpStatisticsClear', { global: 1 }).then(() => this.load())
    },
    onClearAll() {
      cgiSet('net_lldpStatisticsClear', { all: 1 }).then(() => this.load())
    },
    onClearRow(row) {
      cgiSet('net_lldpStatisticsClear', { port: row.port }).then(() => this.load())
    }
  }
}
</script>

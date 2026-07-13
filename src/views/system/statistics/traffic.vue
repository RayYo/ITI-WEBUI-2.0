<template>
  <div class="main_body">
    <div id="basetitle">Statistics Traffic Information</div>
    <div>
      <!-- 原版:深灰表头端口计数表,首行 All(值为 -),Clear 列为行内 Apply 清零 -->
      <div class="table-scroll">
        <el-table :data="rows" class="tableBox" stripe border :header-cell-style="darkTableHeader" :cell-style="pageTableCell">
          <el-table-column prop="port" label="Port ID" min-width="80" />
          <el-table-column prop="inOctets" label="In Octets" min-width="95" />
          <el-table-column prop="inUcast" label="In Ucast Pkts" min-width="110" />
          <el-table-column prop="inNUcast" label="In NUcast Pkts" min-width="115" />
          <el-table-column prop="inDiscards" label="In Discards" min-width="100" />
          <el-table-column prop="outOctets" label="Out Octets" min-width="100" />
          <el-table-column prop="outUcast" label="Out Ucast Pkts" min-width="115" />
          <el-table-column prop="outNUcast" label="Out NUcast Pkts" min-width="120" />
          <el-table-column prop="outDiscards" label="Out Discards" min-width="105" />
          <el-table-column label="Clear" min-width="90">
            <template slot-scope="scope">
              <input type="button" class="btnInTable" value="Apply" @click="onClear(scope.row)">
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Refresh" @click="load">
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { darkTableHeader, pageTableCell } from '@/utils/emu'

const FIELDS = ['inOctets', 'inUcast', 'inNUcast', 'inDiscards', 'outOctets', 'outUcast', 'outNUcast', 'outDiscards']

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
      cgiGet('port_statistics').then(d => {
        const all = { port: 'All' }
        FIELDS.forEach(f => { all[f] = '-' })
        this.rows = [all].concat((d.ports || []).map(p => {
          const r = { port: p.port }
          FIELDS.forEach(f => { r[f] = p[f] })
          return r
        }))
      })
    },
    async onClear(row) {
      const payload = row.port === 'All' ? { all: 1 } : { port: row.port }
      await cgiSet('port_cntClear', payload, { successMsg: false })
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

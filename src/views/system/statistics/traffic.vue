<template>
  <div class="main_body">
    <div id="basetitle">Statistics Traffic Information</div>
    <div>
      <!-- 原版:深灰表头端口计数表,首行 All(值为 -),Clear 列为行内 Apply 清零 -->
      <div class="table-scroll">
        <el-table :data="rows" class="tableBox" style="min-width: 900px" stripe border :header-cell-style="darkTableHeader" :cell-style="pageTableCell">
          <el-table-column prop="port" label="Port ID" />
          <el-table-column prop="inOctets" label="In Octets" />
          <el-table-column prop="inUcast" label="In Ucast Pkts" />
          <el-table-column prop="inNUcast" label="In NUcast Pkts" />
          <el-table-column prop="inDiscards" label="In Discards" />
          <el-table-column prop="outOctets" label="Out Octets" />
          <el-table-column prop="outUcast" label="Out Ucast Pkts" />
          <el-table-column prop="outNUcast" label="Out NUcast Pkts" />
          <el-table-column prop="outDiscards" label="Out Discards" />
          <el-table-column label="Clear">
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

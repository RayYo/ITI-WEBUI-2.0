<template>
  <div class="main_body">
    <div id="basetitle">LLDP Local Port Information</div>
    <el-table
      v-loading="loading"
      :data="rows"
      class="tableBox"
      stripe
      border
      empty-text="< < Table is empty > >"
      :header-cell-style="darkTableHeader"
      :cell-style="pageTableCell"
    >
      <el-table-column prop="port" label="All" min-width="90" />
      <el-table-column prop="subtype" label="Port ID Subtype" min-width="180" />
      <el-table-column prop="portId" label="Port ID" min-width="120" />
      <el-table-column prop="desc" label="Port Description" min-width="400" />
      <el-table-column label="Action" min-width="180">
        <template slot-scope="scope">
          <input type="button" class="btnInTable" value="Show Detail" @click="onShowDetail(scope.row)">
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { cgiGet } from '@/api/cgi'
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
      cgiGet('net_lldpLocalPort').then(d => {
        this.rows = (d.ports || []).map(p => ({
          port: p.port,
          subtype: p.subtype,
          portId: p.portId,
          desc: p.desc
        }))
      }).finally(() => { this.loading = false })
    },
    // 原版:Show Detail 跳到详情子页(带 Previous Page 返回)
    onShowDetail(row) {
      this.$router.push({ path: '/network/lldp/local-port-detail', query: { port: row.port }})
    }
  }
}
</script>

<template>
  <div class="main_body">
    <div id="basetitle">LLDP Neighbors Information</div>
    <div class="table-scroll">
      <el-table
        v-loading="loading"
        :data="rows"
        class="tableBox"
        stripe
        border
        style="min-width: 1400px"
        empty-text="< < Table is empty > >"
        :header-cell-style="darkTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="entity" label="Entity" min-width="90" />
        <el-table-column prop="port" label="Port" min-width="80" />
        <el-table-column prop="chassisSubtype" label="Chassis ID Subtype" min-width="170" />
        <el-table-column prop="chassisId" label="Chassis ID" min-width="160" />
        <el-table-column prop="portSubtype" label="Port ID Subtype" min-width="160" />
        <el-table-column prop="portId" label="Port ID" min-width="100" />
        <el-table-column prop="desc" label="Port Description" min-width="180" />
        <el-table-column label="Show Detail" min-width="160">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Show Detail" @click="onShowDetail(scope.row)">
          </template>
        </el-table-column>
      </el-table>
    </div>
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
      cgiGet('net_lldpNeighbors').then(d => {
        this.rows = (d.list || []).map(e => ({
          entity: e.entity,
          port: e.port,
          chassisSubtype: e.chassisSubtype,
          chassisId: e.chassisId,
          portSubtype: e.portSubtype,
          portId: e.portId,
          desc: e.desc
        }))
      }).finally(() => { this.loading = false })
    },
    // Show Detail 跳详情子页(与 Local Port 一致,带 Previous Page 返回)
    onShowDetail(row) {
      this.$router.push({ path: '/network/lldp/neighbor-detail', query: { entity: row.entity }})
    }
  }
}
</script>

<style lang="scss" scoped>
.table-scroll {
  overflow-x: auto;
}
</style>

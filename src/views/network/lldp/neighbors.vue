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

    <el-dialog title="LLDP Neighbor Detail" :visible.sync="dialogVisible" width="600px">
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr><td>Entity</td><td>{{ detail.entity }}</td></tr>
          <tr><td>Port</td><td>{{ detail.port }}</td></tr>
          <tr><td>Chassis ID Subtype</td><td>{{ detail.chassisSubtype }}</td></tr>
          <tr><td>Chassis ID</td><td>{{ detail.chassisId }}</td></tr>
          <tr><td>Port ID Subtype</td><td>{{ detail.portSubtype }}</td></tr>
          <tr><td>Port ID</td><td>{{ detail.portId }}</td></tr>
          <tr><td>Port Description</td><td>{{ detail.desc }}</td></tr>
        </tbody>
      </table>
    </el-dialog>
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
      rows: [],
      dialogVisible: false,
      detail: {}
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
    onShowDetail(row) {
      this.detail = row
      this.dialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.table-scroll {
  overflow-x: auto;
}
</style>

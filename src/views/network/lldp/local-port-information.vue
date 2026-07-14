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

    <el-dialog title="LLDP Local Port Detail" :visible.sync="dialogVisible" width="600px">
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr><td>Port</td><td>{{ detail.port }}</td></tr>
          <tr><td>Port ID Subtype</td><td>{{ detail.subtype }}</td></tr>
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
      cgiGet('net_lldpLocalPort').then(d => {
        this.rows = (d.ports || []).map(p => ({
          port: p.port,
          subtype: p.subtype,
          portId: p.portId,
          desc: p.desc
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

<template>
  <div class="main_body">
    <div id="basetitle">Instance Information</div>
    <div>
      <el-table
        :data="rows"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="darkTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="mstiId" label="MSTI ID" min-width="80" />
        <el-table-column prop="internalRootCost" label="Internal Root Cost" min-width="150" />
        <el-table-column prop="rootPort" label="Root Port" min-width="100" />
        <el-table-column prop="regionalRootBridge" label="Regional Root Bridge" min-width="180" />
        <el-table-column prop="designatedBridge" label="Designated Bridge" min-width="180" />
        <el-table-column prop="priority" label="Instance Priority" min-width="150" />
      </el-table>
    </div>
  </div>
</template>

<script>
import { cgiGet } from '@/api/cgi'
import { darkTableHeader, pageTableCell } from '@/utils/emu'

export default {
  data() {
    return { darkTableHeader, pageTableCell, rows: [] }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('net_stpInstance').then(d => { this.rows = d.list || [] })
    }
  }
}
</script>

<template>
  <div class="main_body">
    <div id="basetitle">VLAN Current Database</div>
    <div>
      <div class="table_title">802.1Q Tagged VLAN</div>
      <el-table
        :data="pageRows"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="id" label="VLAN ID" min-width="196" />
        <el-table-column prop="name" label="VLAN Name" min-width="232" />
        <el-table-column prop="fdbId" label="VLAN FDB ID" min-width="232" />
        <el-table-column prop="memberPorts" label="Member Ports" min-width="388" />
        <el-table-column prop="untaggedPorts" label="Untagged Ports" min-width="388" />
        <el-table-column prop="status" label="Status" min-width="194" />
      </el-table>
      <el-pagination
        :current-page.sync="page"
        :page-size.sync="pageSize"
        small
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 20, 40]"
        :total="rows.length"
      />
    </div>
  </div>
</template>

<script>
import { cgiGet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'

export default {
  data() {
    return {
      pageTableHeader,
      pageTableCell,
      rows: [],
      page: 1,
      pageSize: 20
    }
  },
  computed: {
    pageRows() {
      const start = (this.page - 1) * this.pageSize
      return this.rows.slice(start, start + this.pageSize)
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('net_vlanCurrent').then(d => { this.rows = d.list || [] })
    }
  }
}
</script>

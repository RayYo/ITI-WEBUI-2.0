<template>
  <div class="main_body">
    <div id="basetitle">Multicast VLAN Table</div>
    <div>
      <div class="table_title">Multicast VLAN Table</div>
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
        <el-table-column prop="id" label="VLAN ID" min-width="90" />
        <el-table-column prop="name" label="VLAN Name" min-width="120" />
        <el-table-column label="State" min-width="90">
          <template slot-scope="scope">
            <span>{{ scope.row.state ? 'Enabled' : 'Disabled' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="taggedReceiver" label="Tagged Receiver Ports" min-width="170" />
        <el-table-column prop="untaggedReceiver" label="Untagged Receiver Ports" min-width="180" />
        <el-table-column prop="taggedSource" label="Tagged Source Ports" min-width="160" />
        <el-table-column prop="untaggedSource" label="Untagged Source Ports" min-width="170" />
      </el-table>
    </div>
  </div>
</template>

<script>
import { cgiGet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'

export default {
  data() {
    return {
      loading: false,
      pageTableHeader,
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
      cgiGet('net_mcvlanTable').then(d => { this.rows = d.list || [] }).finally(() => { this.loading = false })
    }
  }
}
</script>

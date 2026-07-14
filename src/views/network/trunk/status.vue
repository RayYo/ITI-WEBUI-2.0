<template>
  <div class="main_body">
    <div id="basetitle">LACP Group Status</div>
    <div>
      <common-table header-title="LACP Group Status" :first-column="['System Priority', 'System ID']">
        <template #0><span>{{ system.priority }}</span></template>
        <template #1><span>{{ system.id }}</span></template>
      </common-table>
      <br>
      <div class="table_title">LACP Group Table</div>
      <el-table
        v-loading="loading"
        :data="groups"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="id" label="LGA Group ID" min-width="120" />
        <el-table-column label="Member Ports" min-width="240">
          <template slot-scope="scope">
            <span>{{ scope.row.exists ? scope.row.memberPorts : 'This group does not exist' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="activePorts" label="Active Port List" min-width="240" />
        <el-table-column prop="standbyPorts" label="Standby Port List" min-width="240" />
      </el-table>
    </div>
  </div>
</template>

<script>
import { cgiGet } from '@/api/cgi'
import commonTable from '@/components/CustomTable/common-table.vue'
import { pageTableHeader, pageTableCell } from '@/utils/emu'

export default {
  components: { commonTable },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      system: { priority: '', id: '' },
      groups: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_trunkStatus').then(d => {
        this.system = d.system || { priority: '', id: '' }
        this.groups = (d.groups || []).map(g => ({
          id: g.id,
          exists: !!g.exists,
          memberPorts: g.memberPorts || '',
          activePorts: g.exists ? (g.activePorts || '') : '',
          standbyPorts: g.exists ? (g.standbyPorts || '') : ''
        }))
      }).finally(() => { this.loading = false })
    }
  }
}
</script>

<template>
  <div class="main_body">
    <div id="basetitle">IGMP Snooping Router Port</div>
    <div>
      <el-table
        v-loading="loading"
        :data="pageRows"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="darkTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="vlan" label="VLAN ID" min-width="120" />
        <el-table-column label="Static Router Port" min-width="220">
          <template slot-scope="scope">
            <span>{{ portText(scope.row.staticPorts) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Dynamic Router Port" min-width="220">
          <template slot-scope="scope">
            <span>{{ portText(scope.row.dynamicPorts) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Action" min-width="160">
          <template slot-scope="scope">
            <input
              type="button"
              class="btnInTable"
              :class="{ btnDisabled: !enabled }"
              value="Modify"
              :disabled="!enabled"
              @click="openModify(scope.row)"
            >
          </template>
        </el-table-column>
      </el-table>
      <emu-pagination :current-page.sync="page" :page-size.sync="pageSize" :total="rows.length" />
    </div>
  </div>
</template>

<script>
import { cgiGet } from '@/api/cgi'
import { portsToRange } from '@/utils'
import { darkTableHeader, pageTableCell } from '@/utils/emu'

export default {
  data() {
    return {
      loading: false,
      darkTableHeader,
      pageTableCell,
      enabled: false,
      rows: [],
      page: 1,
      pageSize: 5
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
      this.loading = true
      cgiGet('net_igmpRouterPort').then(d => {
        this.enabled = !!d.status
        this.rows = (d.rows || []).map(r => ({
          vlan: r.vlan,
          staticPorts: (r.staticPorts || []).slice(),
          dynamicPorts: (r.dynamicPorts || []).slice()
        }))
      }).finally(() => { this.loading = false })
    },
    portText(ports) {
      return ports && ports.length ? portsToRange(ports) : 'N/A'
    },
    openModify(row) {
      // 原版 Modify 跳转到独立编辑页(Modify IGS Static Router Port)
      this.$router.push({ path: '/network/igmp-snooping/router-port-modify', query: { vlan: row.vlan }})
    }
  }
}
</script>

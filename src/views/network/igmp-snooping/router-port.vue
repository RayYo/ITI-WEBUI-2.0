<template>
  <div class="main_body">
    <div id="basetitle">IGMP Snooping Router Port</div>
    <div>
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

      <!-- Modify:编辑该 VLAN 的 Static Router Port(原版弹窗内容在静态 emulator 中无法抓取,按标准解释实现) -->
      <el-dialog title="Static Router Port" :visible.sync="dialogVisible" width="720px" append-to-body>
        <div class="table_title">VLAN {{ editVlan }} Static Router Port</div>
        <port-checkbox-grid v-model="editPorts" bare :ports="allPorts" />
        <div slot="footer">
          <input type="button" class="btnOutTable" value="Apply" @click="applyModify">
          <input type="button" class="btnOutTable" value="Cancel" @click="dialogVisible = false">
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { portsToRange } from '@/utils'
import PortCheckboxGrid from '@/components/Emu/PortCheckboxGrid.vue'
import { darkTableHeader, pageTableCell } from '@/utils/emu'

export default {
  components: { PortCheckboxGrid },
  data() {
    return {
      loading: false,
      darkTableHeader,
      pageTableCell,
      enabled: false,
      rows: [],
      dialogVisible: false,
      editVlan: '',
      editPorts: []
    }
  },
  computed: {
    allPorts() {
      const n = this.$store.getters.modelInfo('portNum') || 0
      return Array.from({ length: n }, (_, i) => i + 1)
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
      this.editVlan = row.vlan
      this.editPorts = row.staticPorts.slice()
      this.dialogVisible = true
    },
    applyModify() {
      cgiSet('net_igmpRouterPortEdit', { vlan: this.editVlan, staticPorts: this.editPorts }).then(() => {
        this.dialogVisible = false
        this.load()
      })
    }
  }
}
</script>

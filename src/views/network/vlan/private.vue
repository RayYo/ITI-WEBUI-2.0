<template>
  <div class="main_body">
    <div id="basetitle">Private VLAN</div>
    <div>
      <common-table header-title="Private VLAN Settings" :first-column="['Private VLAN Status']">
        <template #0>
          <select v-model="status">
            <option value="1">Enabled</option>
            <option value="2">Disabled</option>
          </select>
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Apply" @click="onApplyStatus">
    </div>

    <div>
      <common-table header-title="Port Select" :first-column="['Source Port']">
        <template #0>
          <select v-model="sourcePort" :class="{ disabledStyle: off }" :disabled="off" @change="loadPortForwarding">
            <option v-for="p in portList" :key="p" :value="p">{{ p }}</option>
          </select>
        </template>
      </common-table>
      <br>
      <port-checkbox-grid v-model="forwardingPorts" title="Forwarding Ports" :ports="portList" :disabled="off" />
      <div class="margin1015">
        <input type="button" class="btnOutTable" :class="{ btnDisabled: off }" value="Apply" :disabled="off" @click="onApplyPort">
      </div>
    </div>

    <div>
      <div class="table_title">Port List</div>
      <el-table
        v-loading="loading"
        :data="portList2"
        class="tableBox"
        stripe
        border
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="port" label="Port" min-width="170" />
        <el-table-column prop="portMap" label="Port Map" min-width="170" />
      </el-table>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import commonTable from '@/components/CustomTable/common-table.vue'
import PortCheckboxGrid from '@/components/Emu/PortCheckboxGrid.vue'

export default {
  components: { commonTable, PortCheckboxGrid },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      status: '2',
      sourcePort: 1,
      forwardingPorts: [],
      portList2: []
    }
  },
  computed: {
    off() {
      return this.status !== '1'
    },
    portList() {
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
      cgiGet('net_vlanPrivate').then(d => {
        this.status = d.status ? '1' : '2'
        this.sourcePort = d.sourcePort || 1
        this.forwardingPorts = (d.forwardingPorts || []).slice()
        this.portList2 = d.portList || []
      }).finally(() => { this.loading = false })
    },
    loadPortForwarding() {
      // 切换 Source Port 时,从 Port List 回填该端口当前 Port Map
      const row = this.portList2.find(r => r.port === Number(this.sourcePort))
      if (row && row.portMap && row.portMap !== '-') {
        this.forwardingPorts = row.portMap.split(',').flatMap(seg => {
          const m = seg.split('-').map(Number)
          if (m.length === 2) { const a = []; for (let i = m[0]; i <= m[1]; i++) a.push(i); return a }
          return [m[0]]
        }).filter(Boolean)
      } else {
        this.forwardingPorts = []
      }
    },
    onApplyStatus() {
      cgiSet('net_vlanPrivateGlobal', { status: this.status === '1' ? 1 : 0 }).then(() => this.load())
    },
    onApplyPort() {
      cgiSet('net_vlanPrivatePort', {
        sourcePort: this.sourcePort,
        forwardingPorts: this.forwardingPorts.join(',')
      }).then(() => this.load())
    }
  }
}
</script>

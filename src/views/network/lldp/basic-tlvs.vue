<template>
  <div class="main_body">
    <div id="basetitle">Basic TLVs Settings Table</div>
    <port-edit-table
      :columns="columns"
      :rows="rows"
      min-width="1000px"
      :loading="loading"
      @apply="onApply"
    />
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import PortEditTable from '@/components/Emu/PortEditTable.vue'

// Basic TLVs 无 Ignore,All 行与端口行同为 Disabled/Enabled
const DIS_EN = [{ value: '0', label: 'Disabled' }, { value: '1', label: 'Enabled' }]

export default {
  components: { PortEditTable },
  data() {
    return {
      loading: false,
      columns: [
        { prop: 'port', label: 'Port', minWidth: 80, type: 'text' },
        { prop: 'portDesc', label: 'Port Description', minWidth: 180, type: 'select', options: DIS_EN },
        { prop: 'sysName', label: 'System Name', minWidth: 180, type: 'select', options: DIS_EN },
        { prop: 'sysDesc', label: 'System Description', minWidth: 180, type: 'select', options: DIS_EN },
        { prop: 'sysCap', label: 'System Capabilities', minWidth: 180, type: 'select', options: DIS_EN },
        { label: 'Action', minWidth: 120, type: 'action' }
      ],
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_lldpBasicTlv').then(d => {
        const b = v => v ? '1' : '0'
        const all = { port: 'All', portDesc: '0', sysName: '0', sysDesc: '0', sysCap: '0' }
        this.rows = [all].concat((d.ports || []).map(p => ({
          port: p.port,
          portDesc: b(p.portDesc),
          sysName: b(p.sysName),
          sysDesc: b(p.sysDesc),
          sysCap: b(p.sysCap)
        })))
      }).finally(() => { this.loading = false })
    },
    onApply(row) {
      const isAll = row.port === 'All'
      const payload = isAll ? { all: 1 } : { port: row.port }
      payload.portDesc = row.portDesc
      payload.sysName = row.sysName
      payload.sysDesc = row.sysDesc
      payload.sysCap = row.sysCap
      cgiSet('net_lldpBasicTlvEdit', payload).then(() => this.load())
    }
  }
}
</script>

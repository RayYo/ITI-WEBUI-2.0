<template>
  <div class="main_body">
    <div id="basetitle">GVRP Port Settings</div>
    <port-edit-table
      :columns="columns"
      :rows="rows"
      min-width="900px"
      :loading="loading"
      @apply="onApply"
    />
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import PortEditTable from '@/components/Emu/PortEditTable.vue'

const EN_DIS = [{ value: '1', label: 'Enabled' }, { value: '2', label: 'Disabled' }]
const IGNORE = { value: '0', label: 'Ignore' }

export default {
  components: { PortEditTable },
  data() {
    return {
      loading: false,
      columns: [
        { prop: 'port', label: 'Port', minWidth: 90, type: 'text' },
        { prop: 'dynamic', label: 'Dynamic VLAN Status', minWidth: 250, type: 'select', options: EN_DIS, allExtra: IGNORE },
        { prop: 'restricted', label: 'Restricted VLAN Registration', minWidth: 340, type: 'select', options: EN_DIS, allExtra: IGNORE },
        { label: 'Action', minWidth: 150, type: 'action' }
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
      cgiGet('net_gvrpPort').then(d => {
        const all = { port: 'All', dynamic: '0', restricted: '0' }
        this.rows = [all].concat((d.ports || []).map(p => ({
          port: p.port,
          dynamic: p.dynamic ? '1' : '2',
          restricted: p.restricted ? '1' : '2'
        })))
      }).finally(() => { this.loading = false })
    },
    onApply(row) {
      const isAll = row.port === 'All'
      const payload = isAll ? { all: 1 } : { port: row.port }
      // Ignore(0) 表示该项不变,不提交
      if (row.dynamic !== '0') payload.dynamic = row.dynamic === '1' ? 1 : 0
      if (row.restricted !== '0') payload.restricted = row.restricted === '1' ? 1 : 0
      cgiSet('net_gvrpPortEdit', payload).then(() => this.load())
    }
  }
}
</script>

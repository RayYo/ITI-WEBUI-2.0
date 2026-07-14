<template>
  <div class="main_body">
    <div id="basetitle">MED Port Settings</div>
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

const DIS_EN = [{ value: '0', label: 'Disabled' }, { value: '1', label: 'Enabled' }]
const IGNORE = { value: '-1', label: 'Ignore' }

export default {
  components: { PortEditTable },
  data() {
    return {
      loading: false,
      columns: [
        { prop: 'port', label: 'Port', minWidth: 90, type: 'text' },
        { prop: 'capabilities', label: 'Capabilities', minWidth: 340, type: 'select', options: DIS_EN, allExtra: IGNORE },
        { prop: 'inventory', label: 'Inventory', minWidth: 310, type: 'select', options: DIS_EN, allExtra: IGNORE },
        { label: 'Action', minWidth: 170, type: 'action' }
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
      cgiGet('net_lldpMed').then(d => {
        const b = v => v ? '1' : '0'
        const all = { port: 'All', capabilities: '-1', inventory: '-1' }
        this.rows = [all].concat((d.ports || []).map(p => ({
          port: p.port,
          capabilities: b(p.capabilities),
          inventory: b(p.inventory)
        })))
      }).finally(() => { this.loading = false })
    },
    onApply(row) {
      const isAll = row.port === 'All'
      const payload = isAll ? { all: 1 } : { port: row.port }
      if (row.capabilities !== '-1') payload.capabilities = row.capabilities
      if (row.inventory !== '-1') payload.inventory = row.inventory
      cgiSet('net_lldpMedEdit', payload).then(() => this.load())
    }
  }
}
</script>

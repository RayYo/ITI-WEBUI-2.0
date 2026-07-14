<template>
  <div class="main_body">
    <div id="basetitle">Port Priority</div>
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

const PRIO = Array.from({ length: 8 }, (_, i) => ({ value: String(i), label: String(i) }))

export default {
  components: { PortEditTable },
  data() {
    return {
      loading: false,
      columns: [
        { prop: 'port', label: 'Port', minWidth: 120, type: 'text' },
        { prop: 'priority', label: 'User Priority', minWidth: 250, type: 'select', options: PRIO },
        { label: 'Action', minWidth: 250, type: 'action' }
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
      cgiGet('net_qosPortPriority').then(d => {
        const all = { port: 'All', priority: '0' }
        this.rows = [all].concat((d.ports || []).map(p => ({ port: p.port, priority: String(p.priority != null ? p.priority : 0) })))
      }).finally(() => { this.loading = false })
    },
    onApply(row) {
      const isAll = row.port === 'All'
      const payload = isAll ? { all: 1 } : { port: row.port }
      payload.priority = row.priority
      cgiSet('net_qosPortPriorityEdit', payload).then(() => this.load())
    }
  }
}
</script>

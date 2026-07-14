<template>
  <div class="main_body">
    <div id="basetitle">Multicast Filtering</div>
    <port-edit-table :columns="columns" :rows="rows" min-width="700px" :loading="loading" @apply="onApply" />
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import PortEditTable from '@/components/Emu/PortEditTable.vue'

const MODES = [
  { value: '0', label: 'Forward' },
  { value: '1', label: 'Filter' }
]

export default {
  components: { PortEditTable },
  data() {
    return {
      loading: false,
      columns: [
        { prop: 'port', label: 'Port', minWidth: 80, type: 'text' },
        { prop: 'mode', label: 'Multicast Filter Mode', minWidth: 220, type: 'select', options: MODES },
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
      cgiGet('net_mcfilter').then(d => {
        const all = { port: 'All', mode: '0' }
        this.rows = [all].concat((d.ports || []).map(p => ({
          port: p.port,
          mode: p.filter ? '1' : '0'
        })))
      }).finally(() => { this.loading = false })
    },
    onApply(row) {
      const payload = row.port === 'All'
        ? { all: 1, filter: row.mode === '1' ? 1 : 0 }
        : { port: row.port, filter: row.mode === '1' ? 1 : 0 }
      cgiSet('net_mcfilterEdit', payload).then(() => this.load())
    }
  }
}
</script>

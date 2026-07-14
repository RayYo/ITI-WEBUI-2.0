<template>
  <div class="main_body">
    <div id="basetitle">Egress Rate Limiting</div>
    <div class="table_title">Egress Rate Limiting Settings<span style="font-size: 14px; margin-left: 14px">(Bandwidth = 64kbps x rate limit)</span></div>
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
        { prop: 'port', label: 'Port', minWidth: 80, type: 'text' },
        { prop: 'bandwidth', label: 'Bandwidth', minWidth: 200, type: 'input', maxlength: 6 },
        { prop: 'status', label: 'Status', minWidth: 130, type: 'select', options: EN_DIS, allExtra: IGNORE },
        { label: 'Action', minWidth: 110, type: 'action' }
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
      cgiGet('net_egressRate').then(d => {
        const all = { port: 'All', bandwidth: '', status: '0' }
        this.rows = [all].concat((d.ports || []).map(p => ({
          port: p.port,
          bandwidth: String(p.bandwidth != null ? p.bandwidth : 0),
          status: p.status ? '1' : '2'
        })))
      }).finally(() => { this.loading = false })
    },
    onApply(row) {
      const isAll = row.port === 'All'
      const payload = isAll ? { all: 1 } : { port: row.port }
      payload.bandwidth = row.bandwidth
      if (row.status !== '0') payload.status = row.status === '1' ? 1 : 0
      cgiSet('net_egressRateEdit', payload).then(() => this.load())
    }
  }
}
</script>

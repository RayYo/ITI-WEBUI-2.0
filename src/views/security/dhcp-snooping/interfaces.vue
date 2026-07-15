<template>
  <div class="main_body">
    <div id="basetitle">Trusted Interfaces</div>
    <port-edit-table
      title="Trusted Interfaces Settings"
      :columns="columns"
      :rows="rows"
      min-width="1630px"
      :loading="loading"
      :header-cell-style="pageTableHeader"
      @apply="onApply"
    />
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader } from '@/utils/emu'
import PortEditTable from '@/components/Emu/PortEditTable.vue'

const TRUST = [{ value: '1', label: 'Enabled' }, { value: '2', label: 'Disabled' }]
const IGNORE = { value: '0', label: 'Ignore' }

export default {
  components: { PortEditTable },
  data() {
    return {
      loading: false,
      pageTableHeader,
      columns: [
        { prop: 'port', label: 'Port', minWidth: 303, type: 'text' },
        { prop: 'trust', label: 'Trust', minWidth: 724, type: 'select', options: TRUST, allExtra: IGNORE },
        { label: 'Action', minWidth: 603, type: 'action' }
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
      cgiGet('sec_dhcpSnoopInterfaces').then(d => {
        const all = { port: 'All', trust: '0' }
        this.rows = [all].concat((d.ports || []).map(p => ({
          port: p.port,
          trust: p.trust ? '1' : '2'
        })))
      }).finally(() => { this.loading = false })
    },
    onApply(row) {
      const isAll = row.port === 'All'
      const payload = isAll ? { all: 1 } : { port: row.port }
      if (!(isAll && row.trust === '0')) payload.trust = row.trust === '1' ? 1 : 0
      cgiSet('sec_dhcpSnoopInterfacesEdit', payload).then(() => this.load())
    }
  }
}
</script>

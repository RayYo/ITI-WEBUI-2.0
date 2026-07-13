<template>
  <div class="main_body">
    <div id="basetitle">Port Settings</div>
    <div>
      <port-edit-table :columns="columns" :rows="rows" min-width="1630px" @apply="onApply" />
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import PortEditTable from '@/components/Emu/PortEditTable.vue'

const ACCEPT = [
  { value: 'all', label: 'All' },
  { value: 'tagged', label: 'Tagged' },
  { value: 'untagged', label: 'Untagged and Priority Tagged' }
]
const EN_DIS = [{ value: '1', label: 'Enabled' }, { value: '2', label: 'Disabled' }]

export default {
  components: { PortEditTable },
  data() {
    return {
      columns: [
        { prop: 'port', label: 'Port', minWidth: 80, type: 'text' },
        { prop: 'pvid', label: 'PVID', minWidth: 100, type: 'input', maxlength: 4 },
        { prop: 'acceptFrame', label: 'Acceptable Frame Types', minWidth: 280, type: 'select', options: ACCEPT },
        { prop: 'ingressFilter', label: 'Ingress Filtering', minWidth: 160, type: 'select', options: EN_DIS },
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
      cgiGet('net_vlanPort').then(d => {
        const all = { port: 'All', pvid: '', acceptFrame: 'all', ingressFilter: '2' }
        this.rows = [all].concat((d.ports || []).map(p => ({
          port: p.port,
          pvid: p.pvid,
          acceptFrame: p.acceptFrame || 'all',
          ingressFilter: p.ingressFilter ? '1' : '2'
        })))
      })
    },
    async onApply(row) {
      const isAll = row.port === 'All'
      const payload = isAll ? { all: 1 } : { port: row.port }
      if (!(isAll && (row.pvid === '' || row.pvid === undefined))) payload.pvid = row.pvid
      payload.acceptFrame = row.acceptFrame
      payload.ingressFilter = row.ingressFilter === '1' ? 1 : 0
      await cgiSet('net_vlanPortEdit', payload)
      this.load()
    }
  }
}
</script>

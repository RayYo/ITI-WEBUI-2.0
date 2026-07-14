<template>
  <div class="main_body">
    <div id="basetitle">Storm Control</div>
    <port-edit-table
      title="Storm Control Settings"
      :columns="columns"
      :rows="rows"
      min-width="1000px"
      :header-cell-style="pageTableHeader"
      :loading="loading"
      @apply="onApply"
    />
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import PortEditTable from '@/components/Emu/PortEditTable.vue'
import { pageTableHeader } from '@/utils/emu'

const EN_DIS = [{ value: '1', label: 'Enabled' }, { value: '2', label: 'Disabled' }]
const IGNORE = { value: '0', label: 'Ignore' }

export default {
  components: { PortEditTable },
  data() {
    return {
      loading: false,
      pageTableHeader,
      columns: [
        { prop: 'port', label: 'Port', minWidth: 70, type: 'text' },
        { prop: 'dlf', label: 'DLF', minWidth: 120, type: 'select', options: EN_DIS, allExtra: IGNORE },
        { prop: 'broadcast', label: 'Broadcast', minWidth: 120, type: 'select', options: EN_DIS, allExtra: IGNORE },
        { prop: 'multicast', label: 'Multicast', minWidth: 120, type: 'select', options: EN_DIS, allExtra: IGNORE },
        { prop: 'threshold', label: 'Threshold', minWidth: 220, type: 'input', maxlength: 6, prefix: '64pps x', suffix: '(1-4096)', inputWidth: '70px',
          // DLF/Broadcast/Multicast 任一为 Enabled(1) 时可编辑,否则禁用(灰底)
          disabledFn: row => !(row.dlf === '1' || row.broadcast === '1' || row.multicast === '1') },
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
      cgiGet('net_stormControl').then(d => {
        const all = { port: 'All', dlf: '0', broadcast: '0', multicast: '0', threshold: '' }
        this.rows = [all].concat((d.ports || []).map(p => ({
          port: p.port,
          dlf: p.dlf ? '1' : '2',
          broadcast: p.broadcast ? '1' : '2',
          multicast: p.multicast ? '1' : '2',
          threshold: String(p.threshold != null ? p.threshold : 0)
        })))
      }).finally(() => { this.loading = false })
    },
    onApply(row) {
      const isAll = row.port === 'All'
      const payload = isAll ? { all: 1 } : { port: row.port }
      // Ignore(0) 表示该项不变,不提交
      if (row.dlf !== '0') payload.dlf = row.dlf === '1' ? 1 : 0
      if (row.broadcast !== '0') payload.broadcast = row.broadcast === '1' ? 1 : 0
      if (row.multicast !== '0') payload.multicast = row.multicast === '1' ? 1 : 0
      payload.threshold = row.threshold
      cgiSet('net_stormControlEdit', payload).then(() => this.load())
    }
  }
}
</script>

<template>
  <div class="main_body">
    <div id="basetitle">Dot3 TLVs Settings Table</div>
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

// 端口行:Disabled/Enabled;All 行多一个 Ignore(-1)
const DIS_EN = [{ value: '0', label: 'Disabled' }, { value: '1', label: 'Enabled' }]
const IGNORE = { value: '-1', label: 'Ignore' }

export default {
  components: { PortEditTable },
  data() {
    return {
      loading: false,
      columns: [
        { prop: 'port', label: 'Port', minWidth: 80, type: 'text' },
        { prop: 'macPhy', label: 'MAC/PHY Configuration/Status', minWidth: 230, type: 'select', options: DIS_EN, allExtra: IGNORE },
        { prop: 'linkAgg', label: 'Link Aggregation', minWidth: 150, type: 'select', options: DIS_EN, allExtra: IGNORE },
        { prop: 'maxFrame', label: 'Maximum Frame Size', minWidth: 180, type: 'select', options: DIS_EN, allExtra: IGNORE },
        { prop: 'powerMdi', label: 'Power Via MDI', minWidth: 180, type: 'select', options: DIS_EN, allExtra: IGNORE },
        { label: 'Action', minWidth: 140, type: 'action' }
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
      cgiGet('net_lldpDot3Tlv').then(d => {
        const b = v => v ? '1' : '0'
        const all = { port: 'All', macPhy: '-1', linkAgg: '-1', maxFrame: '-1', powerMdi: '-1' }
        this.rows = [all].concat((d.ports || []).map(p => ({
          port: p.port,
          macPhy: b(p.macPhy),
          linkAgg: b(p.linkAgg),
          maxFrame: b(p.maxFrame),
          powerMdi: b(p.powerMdi)
        })))
      }).finally(() => { this.loading = false })
    },
    onApply(row) {
      const isAll = row.port === 'All'
      const payload = isAll ? { all: 1 } : { port: row.port }
      // Ignore(-1) 不提交
      if (row.macPhy !== '-1') payload.macPhy = row.macPhy
      if (row.linkAgg !== '-1') payload.linkAgg = row.linkAgg
      if (row.maxFrame !== '-1') payload.maxFrame = row.maxFrame
      if (row.powerMdi !== '-1') payload.powerMdi = row.powerMdi
      cgiSet('net_lldpDot3TlvEdit', payload).then(() => this.load())
    }
  }
}
</script>

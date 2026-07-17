<template>
  <div class="main_body">
    <div id="basetitle">Physical Interface</div>
    <div>
      <port-edit-table :columns="columns" :rows="rows" min-width="1400px" :loading="loading" @apply="onApply" />
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import PortEditTable from '@/components/Emu/PortEditTable.vue'

const EN_DIS = [{ value: '1', label: 'Enabled' }, { value: '2', label: 'Disabled' }]
const IGNORE = { value: '0', label: 'Ignore' }
// Giga(铜)口速率/双工模式
const MODES = [
  { value: 'auto', label: 'Auto' },
  { value: '1000full', label: '1000/Full' },
  { value: '100full', label: '100/Full' },
  { value: '10full', label: '10/Full' },
  { value: '100half', label: '100/Half' },
  { value: '10half', label: '10/Half' }
]
// SFP+(光)口只有 Auto / 10G/Full / 1G/Full
const MODES_SFP = [
  { value: 'auto', label: 'Auto' },
  { value: '10gfull', label: '10G/Full' },
  { value: '1000full', label: '1G/Full' }
]

export default {
  components: { PortEditTable },
  data() {
    return {
      loading: false,
      columns: [
        { prop: 'port', label: 'Port', minWidth: 50, type: 'text' },
        { prop: 'trunk', label: 'Trunk', minWidth: 65, type: 'text' },
        { prop: 'type', label: 'Type', minWidth: 110, type: 'text' },
        { prop: 'linkStatus', label: 'Link Status', minWidth: 100, type: 'text' },
        { prop: 'adminStatus', label: 'Admin Status', minWidth: 130, type: 'select', options: EN_DIS, allExtra: IGNORE },
        { prop: 'mode', label: 'Mode', minWidth: 150, type: 'select', optionsFn: row => this.isFiber(row.port) ? MODES_SFP : MODES, allExtra: { value: 'ignore', label: 'Ignore' }},
        { prop: 'jumbo', label: 'Jumbo', minWidth: 130, type: 'select', options: EN_DIS, allExtra: IGNORE },
        { prop: 'flowCtrl', label: 'Flow Ctrl', minWidth: 130, type: 'select', options: EN_DIS, allExtra: IGNORE },
        { prop: 'eapPassThrough', label: 'EAP PassThrough', minWidth: 150, type: 'select', options: EN_DIS, allExtra: IGNORE },
        { prop: 'bpduPassThrough', label: 'BPDU PassThrough', minWidth: 160, type: 'select', options: EN_DIS, allExtra: IGNORE },
        { prop: 'description', label: 'Port Description', minWidth: 140, type: 'input', maxlength: 32 },
        { label: 'Action', minWidth: 130, type: 'action' }
      ],
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    // 按 sys_devinfo 端口类型区分 Giga/SFP+(All 行返回 false 用 Giga 选项)
    isFiber(port) {
      const meta = (this.$store.getters.modelInfo('ports') || []).find(p => p.port === port)
      return !!(meta && meta.type === 'fiber')
    },
    load() {
      this.loading = true
      cgiGet('net_phyInterface').then(d => {
        const all = {
          port: 'All', trunk: '-', type: '-', linkStatus: '-',
          adminStatus: '0', mode: 'ignore', jumbo: '0', flowCtrl: '0',
          eapPassThrough: '0', bpduPassThrough: '0', description: ''
        }
        this.rows = [all].concat((d.ports || []).map(p => ({
          port: p.port,
          trunk: p.trunk || '-',
          type: p.type,
          linkStatus: p.linkStatus,
          adminStatus: p.adminEnabled ? '1' : '2',
          mode: p.mode || 'auto',
          jumbo: p.jumbo ? '1' : '2',
          flowCtrl: p.flowCtrl ? '1' : '2',
          eapPassThrough: p.eapPassThrough ? '1' : '2',
          bpduPassThrough: p.bpduPassThrough ? '1' : '2',
          description: p.description || ''
        })))
      }).finally(() => { this.loading = false })
    },
    async onApply(row) {
      const isAll = row.port === 'All'
      const payload = isAll ? { all: 1 } : { port: row.port }
      const boolField = (key, val) => {
        if (isAll && val === '0') return // All 行 Ignore 不提交
        payload[key] = val === '1' ? 1 : 0
      }
      boolField('adminEnabled', row.adminStatus)
      boolField('jumbo', row.jumbo)
      boolField('flowCtrl', row.flowCtrl)
      boolField('eapPassThrough', row.eapPassThrough)
      boolField('bpduPassThrough', row.bpduPassThrough)
      if (!(isAll && row.mode === 'ignore')) payload.mode = row.mode
      if (!isAll) payload.description = row.description
      await cgiSet('net_phyInterfaceEdit', payload)
      this.load()
    }
  }
}
</script>

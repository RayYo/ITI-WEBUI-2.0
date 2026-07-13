<template>
  <div class="main_body">
    <div id="basetitle">Physical Interface</div>
    <div>
      <port-edit-table :columns="columns" :rows="rows" min-width="1400px" @apply="onApply" />
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import PortEditTable from '@/components/Emu/PortEditTable.vue'

const EN_DIS = [{ value: '1', label: 'Enabled' }, { value: '2', label: 'Disabled' }]
const IGNORE = { value: '0', label: 'Ignore' }
const MODES = [
  { value: 'auto', label: 'Auto' },
  { value: '1000full', label: '1000/Full' },
  { value: '100full', label: '100/Full' },
  { value: '10full', label: '10/Full' },
  { value: '100half', label: '100/Half' },
  { value: '10half', label: '10/Half' }
]

export default {
  components: { PortEditTable },
  data() {
    return {
      columns: [
        { prop: 'port', label: 'Port', width: 70, type: 'text' },
        { prop: 'trunk', label: 'Trunk', width: 80, type: 'text' },
        { prop: 'type', label: 'Type', width: 90, type: 'text' },
        { prop: 'linkStatus', label: 'Link Status', width: 110, type: 'text' },
        { prop: 'adminStatus', label: 'Admin Status', width: 130, type: 'select', options: EN_DIS, allExtra: IGNORE },
        { prop: 'mode', label: 'Mode', width: 150, type: 'select', options: MODES, allExtra: { value: 'ignore', label: 'Ignore' }},
        { prop: 'jumbo', label: 'Jumbo', width: 120, type: 'select', options: EN_DIS, allExtra: IGNORE },
        { prop: 'flowCtrl', label: 'Flow Ctrl', width: 120, type: 'select', options: EN_DIS, allExtra: IGNORE },
        { prop: 'eapPassThrough', label: 'EAP PassThrough', width: 150, type: 'select', options: EN_DIS, allExtra: IGNORE },
        { prop: 'bpduPassThrough', label: 'BPDU PassThrough', width: 160, type: 'select', options: EN_DIS, allExtra: IGNORE },
        { prop: 'description', label: 'Port Description', width: 180, type: 'input', maxlength: 32 },
        { label: 'Action', width: 90, type: 'action' }
      ],
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
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
      })
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

<template>
  <div class="main_body">
    <div id="basetitle">Power Over Ethernet</div>
    <div>
      <common-table header-title="Power Over Ethernet Settings" :first-column="['Power Budget', 'Power Consumption']">
        <template #0><span>{{ budget }}</span></template>
        <template #1><span>{{ consumption }}</span></template>
      </common-table>
    </div>

    <div class="table_title">Power Over Ethernet Table</div>
    <port-edit-table
      :columns="columns"
      :rows="rows"
      min-width="1600px"
      :loading="loading"
      :header-cell-style="pageTableHeader"
      @apply="onApply"
    />
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader } from '@/utils/emu'
import commonTable from '@/components/CustomTable/common-table.vue'
import PortEditTable from '@/components/Emu/PortEditTable.vue'

const EN_DIS = [{ value: '1', label: 'Enabled' }, { value: '2', label: 'Disabled' }]
const IGNORE0 = { value: '0', label: 'Ignore' }
const IGNORE_TR = { value: 'Ignore', label: 'Ignore' }
const PRIORITY = [{ value: '1', label: 'Critical' }, { value: '2', label: 'High' }, { value: '3', label: 'Low' }]
const POWERLIMIT = [
  { value: '1', label: 'Auto' },
  { value: '7', label: 'Class 0' },
  { value: '2', label: 'Class 1' },
  { value: '3', label: 'Class 2' },
  { value: '4', label: 'Class 3' },
  { value: '5', label: 'Class 4' }
]

export default {
  components: { commonTable, PortEditTable },
  data() {
    return {
      loading: false,
      pageTableHeader,
      budget: '',
      consumption: '',
      timeRanges: [],
      rows: []
    }
  },
  computed: {
    columns() {
      const trOpts = [{ value: '', label: 'N/A' }].concat(this.timeRanges.map(r => ({ value: r, label: r })))
      return [
        { prop: 'port', label: 'Port', minWidth: 76, type: 'text' },
        { prop: 'admin', label: 'Admin', minWidth: 133, type: 'select', options: EN_DIS, allExtra: IGNORE0 },
        { prop: 'status', label: 'Status', minWidth: 133, type: 'text' },
        { prop: 'cls', label: 'Class', minWidth: 100, type: 'text' },
        { prop: 'priority', label: 'Priority', minWidth: 133, type: 'select', options: PRIORITY, allExtra: IGNORE0 },
        { prop: 'powerLimit', label: 'Power Limit', minWidth: 133, type: 'select', options: POWERLIMIT, allExtra: IGNORE0 },
        { prop: 'userDef', label: 'User Def', minWidth: 111, type: 'input', maxlength: 5 },
        { prop: 'timeRange', label: 'Time Range', minWidth: 279, type: 'select', options: trOpts, allExtra: IGNORE_TR },
        { prop: 'power', label: 'Power(mW)', minWidth: 133, type: 'text' },
        { prop: 'voltage', label: 'Voltage(V)', minWidth: 133, type: 'text' },
        { prop: 'current', label: 'Current(mA)', minWidth: 133, type: 'text' },
        { label: 'Action', minWidth: 133, type: 'action' }
      ]
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_poe').then(d => {
        this.budget = (d.budget != null ? d.budget : 0) + ' W'
        this.consumption = (d.consumption != null ? d.consumption : 0) + ' W'
        this.timeRanges = d.timeRanges || []
        const all = { port: 'All', admin: '0', status: '-', cls: '-', priority: '0', powerLimit: '0', userDef: '', timeRange: 'Ignore', power: '-', voltage: '-', current: '-' }
        this.rows = [all].concat((d.ports || []).map(p => ({
          port: p.port,
          admin: p.admin ? '1' : '2',
          status: p.status || 'POWER OFF',
          cls: p.cls || 'N/A',
          priority: String(p.priority != null ? p.priority : 3),
          powerLimit: String(p.powerLimit != null ? p.powerLimit : 1),
          userDef: String(p.userDef != null ? p.userDef : ''),
          timeRange: p.timeRange || '',
          power: String(p.power != null ? p.power : 0),
          voltage: String(p.voltage != null ? p.voltage : 0),
          current: String(p.current != null ? p.current : 0)
        })))
      }).finally(() => { this.loading = false })
    },
    onApply(row) {
      const isAll = row.port === 'All'
      const payload = isAll ? { all: 1 } : { port: row.port }
      // All 行的 Ignore 项不提交
      if (row.admin !== '0') payload.admin = row.admin === '1' ? 1 : 0
      if (row.priority !== '0') payload.priority = row.priority
      if (row.powerLimit !== '0') payload.powerLimit = row.powerLimit
      payload.userDef = row.userDef
      if (row.timeRange !== 'Ignore') payload.timeRange = row.timeRange
      cgiSet('net_poeEdit', payload).then(() => this.load())
    }
  }
}
</script>

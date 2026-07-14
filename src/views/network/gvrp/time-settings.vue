<template>
  <div class="main_body">
    <div id="basetitle">GVRP Time Settings</div>
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

export default {
  components: { PortEditTable },
  data() {
    return {
      loading: false,
      columns: [
        { prop: 'port', label: 'Port', minWidth: 90, type: 'text' },
        { prop: 'joinTime', label: 'JoinTime(10 ~ 2^30-14) csec', minWidth: 220, type: 'input', maxlength: 12 },
        { prop: 'leaveTime', label: 'LeaveTime (30 ~ 2^31-18) csec', minWidth: 220, type: 'input', maxlength: 12 },
        { prop: 'leaveAllTime', label: 'LeaveAllTime(40 ~ 2^31-8) csec', minWidth: 230, type: 'input', maxlength: 12 },
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
      cgiGet('net_gvrpTime').then(d => {
        const all = { port: 'All', joinTime: '', leaveTime: '', leaveAllTime: '' }
        this.rows = [all].concat((d.ports || []).map(p => ({
          port: p.port,
          joinTime: String(p.joinTime != null ? p.joinTime : ''),
          leaveTime: String(p.leaveTime != null ? p.leaveTime : ''),
          leaveAllTime: String(p.leaveAllTime != null ? p.leaveAllTime : '')
        })))
      }).finally(() => { this.loading = false })
    },
    onApply(row) {
      const isAll = row.port === 'All'
      const payload = isAll ? { all: 1 } : { port: row.port }
      payload.joinTime = row.joinTime
      payload.leaveTime = row.leaveTime
      payload.leaveAllTime = row.leaveAllTime
      cgiSet('net_gvrpTimeEdit', payload).then(() => this.load())
    }
  }
}
</script>

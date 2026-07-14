<template>
  <div class="main_body">
    <div id="basetitle">CoS</div>
    <div>
      <common-table header-title="CoS" :first-column="['CoS Status']">
        <template #0>
          <select v-model="status">
            <option value="1">Enabled</option>
            <option value="2">Disabled</option>
          </select>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApplyStatus">
      </div>
    </div>

    <div class="table_title">CoS Table</div>
    <port-edit-table
      :columns="columns"
      :rows="rows"
      min-width="900px"
      :disabled="off"
      :loading="loading"
      :header-cell-style="pageTableHeader"
      @apply="onApply"
    />
    <div style="margin-top: 10px; margin-bottom: 10px">
      <span class="note">Note: Disable will reset the settings to factory default and turn off the function.</span>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader } from '@/utils/emu'
import commonTable from '@/components/CustomTable/common-table.vue'
import PortEditTable from '@/components/Emu/PortEditTable.vue'

const QUEUE = Array.from({ length: 8 }, (_, i) => ({ value: String(i), label: String(i) }))

export default {
  components: { commonTable, PortEditTable },
  data() {
    return {
      loading: false,
      pageTableHeader,
      status: '2',
      // 可编辑性由加载到的 status 决定(同 LLDP);Disabled 时 CoS Table 置灰
      cosOn: false,
      columns: [
        { prop: 'port', label: 'Priority', minWidth: 150, type: 'text' },
        { prop: 'queue', label: 'Queue ID', minWidth: 230, type: 'select', options: QUEUE },
        { label: 'Action', minWidth: 230, type: 'action' }
      ],
      rows: []
    }
  },
  computed: {
    off() {
      return !this.cosOn
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_qosCos').then(d => {
        this.status = d.status ? '1' : '2'
        this.cosOn = !!d.status
        const all = { port: 'All', queue: '0' }
        this.rows = [all].concat((d.table || []).map(e => ({ port: String(e.priority), queue: String(e.queue) })))
      }).finally(() => { this.loading = false })
    },
    onApplyStatus() {
      cgiSet('net_qosCosStatusEdit', { status: this.status === '1' ? 1 : 0 }).then(() => this.load())
    },
    onApply(row) {
      const isAll = row.port === 'All'
      const payload = isAll ? { all: 1 } : { priority: row.port }
      payload.queue = row.queue
      cgiSet('net_qosCosEdit', payload).then(() => this.load())
    }
  }
}
</script>

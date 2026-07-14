<template>
  <div class="main_body">
    <div id="basetitle">Port Priority</div>
    <div>
      <common-table header-title="Port Priority Settings" :first-column="['System Priority', 'System ID']">
        <template #0><span>{{ system.priority }}</span></template>
        <template #1><span>{{ system.id }}</span></template>
      </common-table>
      <br>
      <div class="table_title">Port Priority Settings</div>
      <el-table
        v-loading="loading"
        :data="rows"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="port" label="Port" min-width="200" />
        <el-table-column label="Priority(0-65535)" min-width="200">
          <template slot-scope="scope">
            <div class="InputInTable" style="display: inline-block; width: 50%">
              <input v-model="scope.row.priority" type="text" maxlength="5" class="baseInput" @input="onlyNum(scope.row)">
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import message from '@/utils/message'
import commonTable from '@/components/CustomTable/common-table.vue'
import { pageTableHeader, pageTableCell } from '@/utils/emu'

export default {
  components: { commonTable },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      system: { priority: '', id: '' },
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_trunkPortPriority').then(d => {
        this.system = d.system || { priority: '', id: '' }
        this.rows = (d.ports || []).map(p => ({ port: p.port, priority: String(p.priority != null ? p.priority : 0) }))
      }).finally(() => { this.loading = false })
    },
    onlyNum(row) {
      row.priority = row.priority.replace(/[^0-9]/g, '')
    },
    onApply() {
      for (const r of this.rows) {
        const n = Number(r.priority)
        if (r.priority === '' || !Number.isInteger(n) || n < 0 || n > 65535) {
          message.warnBox(`Port ${r.port}: Priority must be an integer within 0-65535.`)
          return
        }
      }
      cgiSet('net_trunkPortPriority', {
        ports: this.rows.map(r => ({ port: r.port, priority: Number(r.priority) }))
      }).then(() => this.load())
    }
  }
}
</script>

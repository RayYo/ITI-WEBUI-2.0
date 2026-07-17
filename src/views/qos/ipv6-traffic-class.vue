<template>
  <div class="main_body">
    <div id="basetitle">IPv6 Traffic Class Priority Settings</div>
    <div>
      <common-table header-title="IPv6 Traffic Class Global Settings" :first-column="['State']">
        <template #0>
          <select v-model="state">
            <option value="1">Enabled</option>
            <option value="2">Disabled</option>
          </select>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApplyState">
      </div>

      <common-table header-title="IPv6 Traffic Class Settings" :first-column="['IPv6 Traffic Class', 'Priority']">
        <template #0>
          <base-input v-model="tc" max-len="3" :disabled="off" @check="onlyNum" />
        </template>
        <template #1>
          <select v-model="priority" :class="{ disabledStyle: off }" :disabled="off">
            <option v-for="n in 8" :key="n - 1" :value="String(n - 1)">{{ n - 1 }}</option>
          </select>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" :class="{ btnDisabled: off }" :disabled="off" value="Add" @click="onAdd">
      </div>

      <div class="table_title">
        IPv6 Traffic Class Table
        <span class="tipInTableTitle">( Total Entries: {{ rows.length }} )</span>
      </div>
      <el-table
        v-loading="loading"
        :data="pageRows"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="tc" label="IPv6 Traffic Class" min-width="200" />
        <el-table-column prop="priority" label="Priority" min-width="170" />
        <el-table-column label="Action" min-width="150">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Delete" @click="onDelete(scope.row)">
          </template>
        </el-table-column>
      </el-table>
      <emu-pagination :current-page.sync="page" :page-size.sync="pageSize" :total="rows.length" />
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import message from '@/utils/message'
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'

export default {
  components: { commonTable, baseInput },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      state: '2',
      // 可编辑性由加载到的 state 决定(同 LLDP)
      tcOn: false,
      tc: '',
      priority: '0',
      rows: [],
      page: 1,
      pageSize: 5
    }
  },
  computed: {
    off() {
      return !this.tcOn
    },
    pageRows() {
      const start = (this.page - 1) * this.pageSize
      return this.rows.slice(start, start + this.pageSize)
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_qosIpv6Tc').then(d => {
        this.state = d.state ? '1' : '2'
        this.tcOn = !!d.state
        this.rows = (d.list || []).map(e => ({ tc: e.tc, priority: e.priority }))
      }).finally(() => { this.loading = false })
    },
    onlyNum() {
      this.tc = this.tc.replace(/[^0-9]/g, '')
    },
    onApplyState() {
      cgiSet('net_qosIpv6TcStateEdit', { state: this.state === '1' ? 1 : 0 }).then(() => this.load())
    },
    async onAdd() {
      const v = Number(this.tc)
      if (this.tc === '' || v < 0 || v > 255) { message.warnBox('IPv6 Traffic Class must be within 0-255.'); return }
      await cgiSet('net_qosIpv6TcAdd', { tc: v, priority: this.priority })
      this.tc = ''
      this.load()
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete Traffic Class ${row.tc} ?`, 'Please confirm').then(async() => {
        await cgiSet('net_qosIpv6TcDel', { tc: row.tc }, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

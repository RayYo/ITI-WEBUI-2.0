<template>
  <div class="main_body">
    <div id="basetitle">Destination MAC Filter</div>
    <div>
      <common-table header-title="Add Destination MAC Filter" :first-column="['MAC Address']">
        <template #0>
          <base-input v-model="mac" max-len="17" />
          <span class="tipAfterInputBox">(e.g. 00:11:ab:cd:ef:22)</span>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Add" @click="onAdd">
      </div>

      <div class="table_title">
        Destination MAC Filter Table
        <span class="tipInTableTitle">( Free Entries: {{ 40 - rows.length }}, Total Entries: {{ rows.length }} )</span>
        <div style="display: inline; float: right; margin-top: 4px">
          <input type="button" value="Delete All" :disabled="!rows.length" :class="['btnInTitle', { btnDisabled: !rows.length }]" @click="onDeleteAll">
        </div>
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
        <el-table-column prop="mac" label="MAC Address" min-width="815" />
        <el-table-column label="Action" min-width="815">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Delete" @click="onDelete(scope.row)">
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="page"
        :page-size.sync="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 20, 40]"
        :total="rows.length"
      />
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import { applyCheck } from '@/utils'
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
      mac: '',
      rows: [],
      page: 1,
      pageSize: 20
    }
  },
  computed: {
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
      cgiGet('sec_destMacFilter').then(d => {
        this.rows = (d.list || []).map(e => ({ mac: e.mac }))
      }).finally(() => { this.loading = false })
    },
    async onAdd() {
      if (applyCheck('mac', this.mac.toLowerCase()) === false) { message.warnBox('Invalid MAC address.'); return }
      await cgiSet('sec_destMacFilterAdd', { mac: this.mac })
      this.mac = ''
      this.load()
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete MAC ${row.mac} ?`, 'Please confirm').then(async() => {
        await cgiSet('sec_destMacFilterDel', { mac: row.mac }, { successMsg: false })
        this.load()
      }).catch(() => {})
    },
    onDeleteAll() {
      message.confirmWarnBox('Do you want to delete all entries ?', 'Please confirm').then(async() => {
        await cgiSet('sec_destMacFilterDelAll', {}, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

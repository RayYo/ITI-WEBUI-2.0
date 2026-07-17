<template>
  <div class="main_body">
    <div id="basetitle">VLAN Settings</div>
    <div>
      <common-table header-title="VLAN Settings" :first-column="['VLAN ID']">
        <template #0>
          <base-input v-model="vid" max-len="4" @check="onlyNum" />
          <span class="tipAfterInputBox">(1 - 4094)</span>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Add" @click="onAdd">
        <input type="button" class="btnOutTable" value="Reset" @click="vid = ''">
      </div>

      <div class="table_title">
        VLAN Table
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
        <el-table-column prop="vid" label="VLAN ID" min-width="815" />
        <el-table-column label="Action" min-width="815">
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
      vid: '',
      rows: [],
      page: 1,
      pageSize: 5
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
      cgiGet('sec_dhcpSnoopVlan').then(d => {
        this.rows = (d.list || []).map(e => ({ vid: e.vid }))
      }).finally(() => { this.loading = false })
    },
    onlyNum() {
      this.vid = this.vid.replace(/[^0-9]/g, '')
    },
    async onAdd() {
      const v = Number(this.vid)
      if (!v || v < 1 || v > 4094) { message.warnBox('VLAN ID must be within 1-4094.'); return }
      await cgiSet('sec_dhcpSnoopVlanAdd', { vid: v })
      this.vid = ''
      this.load()
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete VLAN ${row.vid} ?`, 'Please confirm').then(async() => {
        await cgiSet('sec_dhcpSnoopVlanDel', { vid: row.vid }, { successMsg: false })
        this.load()
      }).catch(() => {})
    },
    onDeleteAll() {
      message.confirmWarnBox('Do you want to delete all entries ?', 'Please confirm').then(async() => {
        await cgiSet('sec_dhcpSnoopVlanDelAll', {}, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

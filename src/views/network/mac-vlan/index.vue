<template>
  <div class="main_body">
    <div id="basetitle">MAC VLAN</div>
    <div>
      <common-table header-title="Create MAC VLAN" :first-column="['MAC Address', 'Description', 'VLAN ID']">
        <template #0>
          <base-input v-model="mac" max-len="17" />
        </template>
        <template #1>
          <base-input v-model="desc" max-len="8" />
          <span class="tipAfterInputBox">(8 Characters Maximum)</span>
        </template>
        <template #2>
          <base-input v-model="vlan" max-len="4" @check="onlyNum" />
          <span class="tipAfterInputBox">(1-4094)</span>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Add" @click="onAdd">
      </div>

      <div class="table_title">
        MAC VLAN Table
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
        <el-table-column prop="mac" label="MAC Address" min-width="180" />
        <el-table-column prop="desc" label="Description" min-width="180" />
        <el-table-column prop="vlan" label="VLAN ID" min-width="180" />
        <el-table-column label="Action" min-width="300">
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
      desc: '',
      vlan: '',
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
      cgiGet('net_macVlan').then(d => {
        this.rows = (d.list || []).map(e => ({ mac: e.mac, desc: e.desc, vlan: e.vlan }))
      }).finally(() => { this.loading = false })
    },
    onlyNum() {
      this.vlan = this.vlan.replace(/[^0-9]/g, '')
    },
    async onAdd() {
      if (applyCheck('mac', this.mac.toLowerCase()) === false) { message.warnBox('Invalid MAC address.'); return }
      const v = Number(this.vlan)
      if (!v || v < 1 || v > 4094) { message.warnBox('VLAN ID must be within 1-4094.'); return }
      await cgiSet('net_macVlanAdd', { mac: this.mac, desc: this.desc, vlan: v })
      this.mac = ''; this.desc = ''; this.vlan = ''
      this.load()
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete MAC ${row.mac} ?`, 'Please confirm').then(async() => {
        await cgiSet('net_macVlanDel', { mac: row.mac }, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

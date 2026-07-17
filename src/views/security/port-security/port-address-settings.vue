<template>
  <div class="main_body">
    <div id="basetitle">Port Security Address Settings</div>
    <div>
      <common-table header-title="Port Security Address Settings" :first-column="['Port', 'MAC Address', 'VID (1 - 4094)']">
        <template #0>
          <select v-model="port">
            <option v-for="p in portNum" :key="p" :value="String(p)">{{ p }}</option>
          </select>
        </template>
        <template #1>
          <base-input v-model="mac" max-len="17" />
        </template>
        <template #2>
          <base-input v-model="vid" max-len="4" @check="onlyNum" />
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>

      <div class="table_title">
        Port Security Address Entries
        <span class="tipInTableTitle">( Total Entries: {{ rows.length }} )</span>
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
        <el-table-column prop="port" label="Port" min-width="174" />
        <el-table-column prop="vid" label="VID" min-width="171" />
        <el-table-column prop="mac" label="MAC Address" min-width="321" />
        <el-table-column prop="addrType" label="AddressType" min-width="321" />
        <el-table-column prop="remaining" label="Remaining Time (mins)" min-width="386" />
        <el-table-column label="Action" min-width="257">
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
      port: '1',
      mac: '',
      vid: '',
      rows: [],
      page: 1,
      pageSize: 20
    }
  },
  computed: {
    portNum() { return this.$store.getters.modelInfo('portNum') || 0 },
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
      cgiGet('sec_portSecAddr').then(d => {
        this.rows = (d.list || []).map(e => ({
          port: e.port,
          vid: e.vid,
          mac: e.mac,
          addrType: e.addrType || 'Permanent',
          remaining: e.remaining != null ? e.remaining : '-'
        }))
      }).finally(() => { this.loading = false })
    },
    onlyNum() {
      this.vid = this.vid.replace(/[^0-9]/g, '')
    },
    async onApply() {
      if (applyCheck('mac', this.mac.toLowerCase()) === false) { message.warnBox('Invalid MAC address.'); return }
      const v = Number(this.vid)
      if (!v || v < 1 || v > 4094) { message.warnBox('VID must be within 1-4094.'); return }
      await cgiSet('sec_portSecAddrAdd', { port: this.port, mac: this.mac, vid: v })
      this.mac = ''; this.vid = ''
      this.load()
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete MAC ${row.mac} ?`, 'Please confirm').then(async() => {
        await cgiSet('sec_portSecAddrDel', { port: row.port, mac: row.mac, vid: row.vid }, { successMsg: false })
        this.load()
      }).catch(() => {})
    },
    onDeleteAll() {
      message.confirmWarnBox('Do you want to delete all entries ?', 'Please confirm').then(async() => {
        await cgiSet('sec_portSecAddrDelAll', {}, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

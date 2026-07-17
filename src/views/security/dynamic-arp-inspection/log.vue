<template>
  <div class="main_body">
    <div id="basetitle">ARP Inspection Log</div>
    <div>
      <common-table header-title="ARP Inspection Log" :first-column="['Log Buffer (1 - 1024)']">
        <template #0>
          <base-input v-model="logBuffer" max-len="4" @check="onlyNum" />
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
        <input type="button" class="btnOutTable" value="Clear Log" @click="onClear">
      </div>
    </div>

    <div class="table_title">
      ARP Inspection Log Table
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
      <el-table-column prop="port" label="Port" min-width="174" />
      <el-table-column prop="vlan" label="VLAN" min-width="208" />
      <el-table-column prop="senderIp" label="Sender IP" min-width="416" />
      <el-table-column prop="senderMac" label="Sender MAC" min-width="416" />
      <el-table-column prop="occurrence" label="Occurrence" min-width="416" />
    </el-table>
    <emu-pagination :current-page.sync="page" :page-size.sync="pageSize" :total="rows.length" />
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'

export default {
  components: { commonTable, baseInput },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      logBuffer: '32',
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
      cgiGet('sec_arpInspectionLog').then(d => {
        this.logBuffer = String(d.logBuffer != null ? d.logBuffer : 32)
        this.rows = (d.list || []).map(e => ({
          port: e.port, vlan: e.vlan, senderIp: e.senderIp, senderMac: e.senderMac, occurrence: e.occurrence
        }))
      }).finally(() => { this.loading = false })
    },
    onlyNum() {
      this.logBuffer = this.logBuffer.replace(/[^0-9]/g, '')
    },
    onApply() {
      cgiSet('sec_arpInspectionLogEdit', { logBuffer: Number(this.logBuffer) }).then(() => this.load())
    },
    onClear() {
      cgiSet('sec_arpInspectionLogClear', {}).then(() => this.load())
    }
  }
}
</script>

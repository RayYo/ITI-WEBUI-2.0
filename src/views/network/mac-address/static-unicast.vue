<template>
  <div class="main_body">
    <div id="basetitle">Static Unicast Address Table</div>
    <div>
      <div class="table_title">Static Unicast Address Settings</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>802.1Q VLAN</td>
            <td>
              <base-input v-model="vlan" type="text" max-len="4" @check="onCheckVlan" />
              <span class="tipAfterInputBox">(1-4094)</span>
            </td>
          </tr>
          <tr>
            <td>Group MAC Address</td>
            <td>
              <base-input v-model="mac" type="text" max-len="17" />
            </td>
          </tr>
        </tbody>
      </table>
      <br>
    </div>

    <port-radio-grid v-model="port" title="Port Member Settings" :ports="portList" />

    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Apply" @click="onApply">
    </div>

    <div class="table_title">
      Static Unicast Table
      <span class="tipInTableTitle">( Free Entries: {{ max - rows.length }}, Total Entries: {{ rows.length }} )</span>
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
      <el-table-column prop="vlan" label="VLAN" min-width="80" />
      <el-table-column prop="mac" label="MAC Address" min-width="100" />
      <el-table-column prop="port" label="Port Members" min-width="80" />
      <el-table-column label="Action" min-width="180">
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
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import { applyCheck } from '@/utils'
import message from '@/utils/message'
import baseInput from '@/components/CustomInput/base-input.vue'
import PortRadioGrid from '@/components/Emu/PortRadioGrid.vue'

export default {
  components: { baseInput, PortRadioGrid },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      vlan: '',
      mac: '',
      port: 0,
      max: 256,
      rows: [],
      page: 1,
      pageSize: 20
    }
  },
  computed: {
    portList() {
      const n = this.$store.getters.modelInfo('portNum') || 0
      return Array.from({ length: n }, (_, i) => i + 1)
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
      cgiGet('mac_staticUnicast').then(d => {
        this.max = d.max || 256
        this.rows = d.list || []
      }).finally(() => { this.loading = false })
    },
    onCheckVlan() {
      this.vlan = this.vlan.replace(/[^0-9]/g, '')
    },
    async onApply() {
      const v = Number(this.vlan)
      if (!v || v < 1 || v > 4094) { message.warnBox('802.1Q VLAN must be within 1-4094.'); return }
      if (applyCheck('mac', this.mac.toLowerCase()) === false) { message.warnBox('Invalid MAC address.'); return }
      if (!this.port) { message.warnBox('Please select a port member.'); return }
      await cgiSet('mac_staticUnicastAdd', { vlan: v, mac: this.mac, port: this.port })
      this.vlan = ''; this.mac = ''; this.port = 0
      this.load()
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete MAC ${row.mac} ?`, 'Please confirm').then(async() => {
        await cgiSet('mac_staticUnicastDel', { vlan: row.vlan, mac: row.mac }, { successMsg: false })
        this.load()
      }).catch(() => {})
    },
    onDeleteAll() {
      message.confirmWarnBox('Do you want to delete all the entries ?', 'Please confirm').then(async() => {
        await cgiSet('mac_staticUnicastDel', { all: 1 }, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

<template>
  <div class="main_body">
    <div id="basetitle">Binding Database</div>
    <div>
      <div class="table_title">Binding Database Settings</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>MAC Address</td>
            <td>
              <base-input v-model="mac" max-len="17" />
              <span class="tipAfterInputBox">(e.g. 00:11:ab:cd:ef:22)</span>
            </td>
          </tr>
          <tr>
            <td rowspan="2">IP Address</td>
            <td>
              <base-input v-model="ipv4" max-len="15" :disabled="ipVer !== '1'" />
              <input id="radioIPv4" v-model="ipVer" type="radio" class="tipAfterInputBox" value="1">
              <label for="radioIPv4">IPv4</label>
            </td>
          </tr>
          <tr>
            <td>
              <base-input v-model="ipv6" max-len="43" :disabled="ipVer !== '2'" />
              <input id="radioIPv6" v-model="ipVer" type="radio" class="tipAfterInputBox" value="2">
              <label for="radioIPv6">IPv6</label>
            </td>
          </tr>
          <tr>
            <td>VLAN</td>
            <td>
              <base-input v-model="vlan" max-len="4" @check="onlyNum('vlan')" />
              <span class="tipAfterInputBox">(1-4094)</span>
            </td>
          </tr>
          <tr>
            <td>Port</td>
            <td>
              <select v-model="port">
                <option v-for="p in portNum" :key="p" :value="String(p)">{{ p }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Type</td>
            <td>
              <select v-model="type">
                <option value="1">Static</option>
                <option value="3">Dynamic</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Lease Time</td>
            <td>
              <base-input v-model="leaseTime" max-len="10" :disabled="type !== '3'" @check="onlyNum('leaseTime')" />
              <span class="tipAfterInputBox">Sec&nbsp;(10-4294967295)</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Add" @click="onAdd">
        <input type="button" class="btnOutTable" value="Reset" @click="onReset">
        <input type="button" class="btnOutTable" value="Clear Dynamic and Learning" @click="onClear">
      </div>

      <div class="table_title">
        Binding Database Table
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
        <el-table-column prop="mac" label="MAC Address" min-width="294" />
        <el-table-column prop="vid" label="VLAN ID" min-width="145" />
        <el-table-column prop="ip" label="IP Address" min-width="247" />
        <el-table-column prop="port" label="Port" min-width="174" />
        <el-table-column prop="type" label="Type" min-width="174" />
        <el-table-column prop="leaseTime" label="Lease Time" min-width="218" />
        <el-table-column label="Action" min-width="378">
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
import baseInput from '@/components/CustomInput/base-input.vue'

const TYPE = { 1: 'Static', 2: 'Learning', 3: 'Dynamic' }

export default {
  components: { baseInput },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      mac: '',
      ipVer: '1',
      ipv4: '',
      ipv6: '',
      vlan: '',
      port: '1',
      type: '1',
      leaseTime: '',
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
      cgiGet('sec_dhcpSnoopBinding').then(d => {
        this.rows = (d.list || []).map(e => ({
          mac: e.mac, vid: e.vid, ip: e.ip, port: e.port, type: TYPE[e.type] || 'Static', leaseTime: e.leaseTime != null ? e.leaseTime : '-'
        }))
      }).finally(() => { this.loading = false })
    },
    onlyNum(key) {
      this[key] = this[key].replace(/[^0-9]/g, '')
    },
    async onAdd() {
      if (applyCheck('mac', this.mac.toLowerCase()) === false) { message.warnBox('Invalid MAC address.'); return }
      const ip = this.ipVer === '1' ? this.ipv4 : this.ipv6
      await cgiSet('sec_dhcpSnoopBindingAdd', {
        mac: this.mac, ipVer: this.ipVer, ip, vlan: this.vlan, port: this.port, type: this.type, leaseTime: this.leaseTime
      })
      this.onReset()
      this.load()
    },
    onReset() {
      this.mac = ''; this.ipVer = '1'; this.ipv4 = ''; this.ipv6 = ''
      this.vlan = ''; this.port = '1'; this.type = '1'; this.leaseTime = ''
    },
    onClear() {
      message.confirmWarnBox('Do you want to clear dynamic and learning entries ?', 'Please confirm').then(async() => {
        await cgiSet('sec_dhcpSnoopBindingClear', {}, { successMsg: false })
        this.load()
      }).catch(() => {})
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete MAC ${row.mac} ?`, 'Please confirm').then(async() => {
        await cgiSet('sec_dhcpSnoopBindingDel', { mac: row.mac, vid: row.vid }, { successMsg: false })
        this.load()
      }).catch(() => {})
    },
    onDeleteAll() {
      message.confirmWarnBox('Do you want to delete all entries ?', 'Please confirm').then(async() => {
        await cgiSet('sec_dhcpSnoopBindingDelAll', {}, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

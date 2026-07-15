<template>
  <div class="main_body">
    <div id="basetitle">ARP Inspection Validation</div>
    <div>
      <div class="table_title">ARP Inspection Validation</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Src-MAC</td>
            <td colspan="2">
              <select v-model="val.srcMac">
                <option value="2">Disabled</option>
                <option value="1">Enabled</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Dst-MAC</td>
            <td colspan="2">
              <select v-model="val.dstMac">
                <option value="2">Disabled</option>
                <option value="1">Enabled</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>IP</td>
            <td colspan="2">
              <select v-model="val.ip">
                <option value="2">Disabled</option>
                <option value="1">Enabled</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApplyValidation">
      </div>
      <br>

      <div class="table_title">
        ARP Inspection VLAN Logging
        <span class="tipInTableTitle">( Total Entries: {{ logRows.length }} )</span>
      </div>
      <el-table
        v-loading="loading"
        :data="logPageRows"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="vid" label="VID" min-width="182" />
        <el-table-column prop="aclLogging" label="ACL Logging" min-width="543" />
        <el-table-column prop="dhcpLogging" label="DHCP Logging" min-width="543" />
        <el-table-column label="Action" min-width="362">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Delete" @click="onDeleteLog(scope.row)">
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="logPage"
        :page-size.sync="logPageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 20, 40]"
        :total="logRows.length"
      />
      <br>

      <div class="table_title">ARP Inspection Filter</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>ARP Access List Name</td>
            <td colspan="2"><base-input v-model="filter.name" max-len="32" /></td>
          </tr>
          <tr>
            <td>VID List</td>
            <td colspan="2"><base-input v-model="filter.vidList" max-len="1024" placeholder="1,4-6" /></td>
          </tr>
          <tr>
            <td>Static ACL</td>
            <td colspan="2">
              <select v-model="filter.staticAcl">
                <option value="1">Yes</option>
                <option value="2">No</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Add" @click="onAddFilter">
        <input type="button" class="btnOutTable" value="Delete" @click="onDeleteFilter">
      </div>

      <div class="table_title">
        ARP Inspection Filter Table
        <span class="tipInTableTitle">( Total Entries: {{ filterRows.length }} )</span>
      </div>
      <el-table
        v-loading="loading"
        :data="filterPageRows"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="vid" label="VID" min-width="187" />
        <el-table-column prop="name" label="ARP Access List Name" min-width="954" />
        <el-table-column prop="staticAcl" label="Static ACL" min-width="489" />
      </el-table>
      <el-pagination
        :current-page.sync="filterPage"
        :page-size.sync="filterPageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 20, 40]"
        :total="filterRows.length"
      />
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import message from '@/utils/message'
import baseInput from '@/components/CustomInput/base-input.vue'

export default {
  components: { baseInput },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      val: { srcMac: '2', dstMac: '2', ip: '2' },
      filter: { name: '', vidList: '', staticAcl: '1' },
      logRows: [],
      filterRows: [],
      logPage: 1,
      logPageSize: 20,
      filterPage: 1,
      filterPageSize: 20
    }
  },
  computed: {
    logPageRows() {
      const start = (this.logPage - 1) * this.logPageSize
      return this.logRows.slice(start, start + this.logPageSize)
    },
    filterPageRows() {
      const start = (this.filterPage - 1) * this.filterPageSize
      return this.filterRows.slice(start, start + this.filterPageSize)
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('sec_arpInspectionSettings').then(d => {
        this.val.srcMac = d.srcMac ? '1' : '2'
        this.val.dstMac = d.dstMac ? '1' : '2'
        this.val.ip = d.ip ? '1' : '2'
        this.logRows = (d.logList || []).map(e => ({
          vid: e.vid, aclLogging: e.aclLogging || 'Deny', dhcpLogging: e.dhcpLogging || 'Deny'
        }))
        this.filterRows = (d.filterList || []).map(e => ({
          vid: e.vid, name: e.name, staticAcl: e.staticAcl ? 'Yes' : 'No'
        }))
      }).finally(() => { this.loading = false })
    },
    onApplyValidation() {
      cgiSet('sec_arpInspectionValidationEdit', {
        srcMac: this.val.srcMac === '1' ? 1 : 0,
        dstMac: this.val.dstMac === '1' ? 1 : 0,
        ip: this.val.ip === '1' ? 1 : 0
      })
    },
    onDeleteLog(row) {
      message.confirmWarnBox(`Do you want to delete VID ${row.vid} ?`, 'Please confirm').then(async() => {
        await cgiSet('sec_arpInspectionLoggingDel', { vid: row.vid }, { successMsg: false })
        this.load()
      }).catch(() => {})
    },
    async onAddFilter() {
      if (!this.filter.name) { message.warnBox('Please input an ARP Access List Name.'); return }
      await cgiSet('sec_arpInspectionFilterAdd', {
        name: this.filter.name, vidList: this.filter.vidList, staticAcl: this.filter.staticAcl === '1' ? 1 : 0
      })
      this.load()
    },
    onDeleteFilter() {
      cgiSet('sec_arpInspectionFilterDel', {
        name: this.filter.name, vidList: this.filter.vidList
      }).then(() => this.load())
    }
  }
}
</script>

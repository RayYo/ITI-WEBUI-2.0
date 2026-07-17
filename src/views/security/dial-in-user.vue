<template>
  <div class="main_body">
    <div id="basetitle">Dial-In User</div>
    <div>
      <common-table header-title="Dial-In User Settings" :first-column="['User Name', 'Password', 'Dynamic VLAN']">
        <template #0>
          <base-input v-model="userName" max-len="20" />
          <span class="tipAfterInputBox">(Maximum length is 20)</span>
        </template>
        <template #1>
          <base-input v-model="password" type="password" max-len="20" autocomplete="new-password" />
          <span class="tipAfterInputBox">(20 characters max)</span>
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
        Dial-In User Table
        <span class="tipInTableTitle">( Free Entries: {{ 64 - rows.length }}, Total Entries: {{ rows.length }} )</span>
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
        <el-table-column prop="userName" label="User Name" min-width="446" />
        <el-table-column prop="password" label="Password" min-width="296" />
        <el-table-column prop="vlan" label="Dynamic VLAN" min-width="518" />
        <el-table-column label="Action" min-width="370">
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
      userName: '',
      password: '',
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
      cgiGet('sec_dialInUser').then(d => {
        this.rows = (d.list || []).map(e => ({ userName: e.userName, password: e.password || '****', vlan: e.vlan }))
      }).finally(() => { this.loading = false })
    },
    onlyNum() {
      this.vlan = this.vlan.replace(/[^0-9]/g, '')
    },
    async onAdd() {
      if (!this.userName) { message.warnBox('Please input a User Name.'); return }
      await cgiSet('sec_dialInUserAdd', { userName: this.userName, password: this.password, vlan: this.vlan })
      this.userName = ''; this.password = ''; this.vlan = ''
      this.load()
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete user ${row.userName} ?`, 'Please confirm').then(async() => {
        await cgiSet('sec_dialInUserDel', { userName: row.userName }, { successMsg: false })
        this.load()
      }).catch(() => {})
    },
    onDeleteAll() {
      message.confirmWarnBox('Do you want to delete all entries ?', 'Please confirm').then(async() => {
        await cgiSet('sec_dialInUserDelAll', {}, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

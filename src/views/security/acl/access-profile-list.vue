<template>
  <div class="main_body">
    <div id="basetitle">Access Profile List</div>
    <div style="margin-bottom: 12px">
      <span>Current/Max. Profile:</span>
      {{ curProfile }}/ {{ maxProfile }}
      <span>, Current/Max. Rule:</span>
      {{ curRule }}/ {{ maxRule }}
    </div>
    <div>
      <div class="table_title">
        <span>ACL L2 Profile list Table</span>
        <div style="display: inline; float: right; margin-top: 4px">
          <input type="button" value="Delete All" :disabled="!l2Rows.length" :class="['btnInTitle', { btnDisabled: !l2Rows.length }]" @click="onDeleteAll('L2')">
        </div>
        <input type="button" class="btnOutTable" value="Add Profile" style="float: right; margin-top: 5px; margin-right: 5px" @click="onAddProfile('L2')">
      </div>
      <el-table
        v-loading="loading"
        :data="l2PageRows"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="id" label="Profile ID" min-width="153" />
        <el-table-column prop="owner" label="Owner Type" min-width="189" />
        <el-table-column prop="summary" label="Profile Summary" min-width="246" show-overflow-tooltip />
        <el-table-column label="Action" min-width="379">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Show Details" @click="onDetail('L2', scope.row)">
          </template>
        </el-table-column>
        <el-table-column label="Action" min-width="379">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Edit/New Rules" @click="onRules('L2', scope.row)">
          </template>
        </el-table-column>
        <el-table-column label="Action" min-width="284">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Delete" @click="onDelete(scope.row)">
          </template>
        </el-table-column>
      </el-table>
      <emu-pagination :current-page.sync="l2Page" :page-size.sync="l2PageSize" :total="l2Rows.length" />
      <br>

      <div class="table_title">
        <span>ACL L3 Profile list Table</span>
        <div style="display: inline; float: right; margin-top: 4px">
          <input type="button" value="Delete All" :disabled="!l3Rows.length" :class="['btnInTitle', { btnDisabled: !l3Rows.length }]" @click="onDeleteAll('L3')">
        </div>
        <input type="button" class="btnOutTable" value="Add Profile" style="float: right; margin-top: 5px; margin-right: 5px" @click="onAddProfile('L3')">
      </div>
      <el-table
        v-loading="loading"
        :data="l3PageRows"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="id" label="Profile ID" min-width="153" />
        <el-table-column prop="owner" label="Owner Type" min-width="189" />
        <el-table-column prop="summary" label="Profile Summary" min-width="246" show-overflow-tooltip />
        <el-table-column label="Action" min-width="379">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Show Details" @click="onDetail('L3', scope.row)">
          </template>
        </el-table-column>
        <el-table-column label="Action" min-width="379">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Edit/New Rules" @click="onRules('L3', scope.row)">
          </template>
        </el-table-column>
        <el-table-column label="Action" min-width="284">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Delete" @click="onDelete(scope.row)">
          </template>
        </el-table-column>
      </el-table>
      <emu-pagination :current-page.sync="l3Page" :page-size.sync="l3PageSize" :total="l3Rows.length" />
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import { aclProfileSummary } from './acl-common'
import message from '@/utils/message'

export default {
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      curProfile: 0,
      maxProfile: 150,
      curRule: 0,
      maxRule: 256,
      l2Rows: [],
      l3Rows: [],
      l2Page: 1,
      l2PageSize: 20,
      l3Page: 1,
      l3PageSize: 20
    }
  },
  computed: {
    l2PageRows() {
      const start = (this.l2Page - 1) * this.l2PageSize
      return this.l2Rows.slice(start, start + this.l2PageSize)
    },
    l3PageRows() {
      const start = (this.l3Page - 1) * this.l3PageSize
      return this.l3Rows.slice(start, start + this.l3PageSize)
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('sec_aclProfileList').then(d => {
        this.curProfile = d.curProfile != null ? d.curProfile : 0
        this.maxProfile = d.maxProfile != null ? d.maxProfile : 150
        this.curRule = d.curRule != null ? d.curRule : 0
        this.maxRule = d.maxRule != null ? d.maxRule : 256
        const map = e => ({ id: e.id, owner: e.owner || 'ACL', summary: aclProfileSummary(e) })
        this.l2Rows = (d.l2 || []).map(map)
        this.l3Rows = (d.l3 || []).map(map)
      }).finally(() => { this.loading = false })
    },
    onAddProfile(type) {
      this.$router.push({ path: '/security/acl/add-profile', query: { type }})
    },
    onDetail(type, row) {
      this.$router.push({ path: '/security/acl/profile-details', query: { type, id: row.id }})
    },
    onRules(type, row) {
      this.$router.push({ path: '/security/acl/profile-rules', query: { type, id: row.id }})
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete profile ${row.id} ?`, 'Please confirm').then(async() => {
        await cgiSet('sec_aclProfileDel', { id: row.id }, { successMsg: false })
        this.load()
      }).catch(() => {})
    },
    onDeleteAll(type) {
      message.confirmWarnBox('Do you want to delete all profiles ?', 'Please confirm').then(async() => {
        await cgiSet('sec_aclProfileDelAll', { type }, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

<template>
  <div class="main_body">
    <div id="basetitle">Access Profile List</div>
    <div>
      <span>Current/Max. Profile:</span>
      {{ curProfile }}/ {{ maxProfile }}
      <span>, Current/Max. Rule:</span>
      {{ curRule }}/ {{ maxRule }}
    </div>
    <div>
      <div class="table_title">
        <span>ACL L2 Profile list Table</span>
        <div>
          <input type="button" value="Delete All" class="btnInTitle" :class="{ btnDisabled: !l2Rows.length }" :disabled="!l2Rows.length" @click="onDeleteAll('L2')">
        </div>
        <input type="button" class="btnOutTable" value="Add Profile" @click="onAddProfile('L2')">
      </div>
      <el-table
        v-loading="loading"
        :data="l2Rows"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="id" label="Profile ID" min-width="153" />
        <el-table-column prop="owner" label="Owner Type" min-width="189" />
        <el-table-column prop="summary" label="Profile Summary" min-width="246" />
        <el-table-column label="Action" min-width="379">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Show Detail" @click="onDetail(scope.row)">
          </template>
        </el-table-column>
        <el-table-column label="Action" min-width="379">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Add Rule" @click="onAddRule(scope.row)">
          </template>
        </el-table-column>
        <el-table-column label="Action" min-width="284">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Delete" @click="onDelete(scope.row)">
          </template>
        </el-table-column>
      </el-table>

      <div class="table_title">
        <span>ACL L3 Profile list Table</span>
        <div>
          <input type="button" value="Delete All" class="btnInTitle" :class="{ btnDisabled: !l3Rows.length }" :disabled="!l3Rows.length" @click="onDeleteAll('L3')">
        </div>
        <input type="button" class="btnOutTable" value="Add Profile" @click="onAddProfile('L3')">
      </div>
      <el-table
        v-loading="loading"
        :data="l3Rows"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="id" label="Profile ID" min-width="153" />
        <el-table-column prop="owner" label="Owner Type" min-width="189" />
        <el-table-column prop="summary" label="Profile Summary" min-width="246" />
        <el-table-column label="Action" min-width="379">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Show Detail" @click="onDetail(scope.row)">
          </template>
        </el-table-column>
        <el-table-column label="Action" min-width="379">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Add Rule" @click="onAddRule(scope.row)">
          </template>
        </el-table-column>
        <el-table-column label="Action" min-width="284">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Delete" @click="onDelete(scope.row)">
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
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
      l3Rows: []
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
        this.l2Rows = (d.l2 || []).map(e => ({ id: e.id, owner: e.owner || 'ACL', summary: e.summary }))
        this.l3Rows = (d.l3 || []).map(e => ({ id: e.id, owner: e.owner || 'ACL', summary: e.summary }))
      }).finally(() => { this.loading = false })
    },
    onAddProfile(type) {
      this.$router.push({ path: '/security/acl/add-profile', query: { type }})
    },
    onDetail(row) {
      message.warnBox(`Profile ${row.id} detail.`)
    },
    onAddRule(row) {
      message.warnBox(`Add rule to profile ${row.id}.`)
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

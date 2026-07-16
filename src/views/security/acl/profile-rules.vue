<template>
  <div class="main_body">
    <div id="basetitle">Access Profile List</div>
    <div>
      <div class="table_title">Access Profile</div>
      <el-table
        v-loading="loading"
        :data="rows"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="profileId" label="Profile ID" min-width="266" />
        <el-table-column label="Access ID" min-width="262">
          <template slot-scope="scope">
            <a class="href" @click="onEditRule(scope.row)">{{ scope.row.accessId }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="profileType" label="Profile Type" min-width="289" />
        <el-table-column prop="summary" label="Summary" min-width="262" show-overflow-tooltip />
        <el-table-column prop="status" label="Status" min-width="262" />
        <el-table-column label="Action" min-width="289">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Delete" @click="onDelete(scope.row)">
          </template>
        </el-table-column>
      </el-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Previous Page" @click="$router.back()">
        <input type="button" class="btnOutTable" value="Add Rule" @click="onAddRule">
      </div>
    </div>
  </div>
</template>

<script>
import { cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import { loadAclProfile } from './acl-common'
import message from '@/utils/message'

export default {
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      const { type, id } = this.$route.query
      this.loading = true
      loadAclProfile(type, id).then(({ profile }) => {
        this.rows = ((profile && profile.rules) || []).map(r => ({
          profileId: profile.id,
          accessId: r.accessId,
          profileType: r.profileType || (type === 'L3' ? 'ACL-L3' : 'ACL-L2'),
          summary: r.summary,
          status: r.status || 'Permit'
        }))
      }).finally(() => { this.loading = false })
    },
    onAddRule() {
      const { type, id } = this.$route.query
      this.$router.push({ path: '/security/acl/rule-edit', query: { type, id }})
    },
    onEditRule(row) {
      const { type, id } = this.$route.query
      this.$router.push({ path: '/security/acl/rule-edit', query: { type, id, accessId: row.accessId }})
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete rule ${row.accessId} ?`, 'Please confirm').then(async() => {
        await cgiSet('sec_aclRuleDel', { profileId: row.profileId, accessId: row.accessId }, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

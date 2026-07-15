<template>
  <div class="main_body">
    <div id="basetitle">ACL Finder</div>
    <div>
      <div class="table_title">General ACL Rules</div>
      <div class="margin1015">ACL rule finder helps you identify any rule has been assigned to a specific port</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Profile Type</td>
            <td>
              <select v-model="profileType">
                <option value="0">ACL-L2</option>
                <option value="1">ACL-L3</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Profile ID</td>
            <td>
              <select v-model="profileId">
                <option value="0">Any</option>
                <option v-for="id in profileIds" :key="id" :value="String(id)">{{ id }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Ports</td>
            <td>
              <base-input v-model="ports" max-len="1024" />
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Find" @click="onFind">
      </div>

      <div class="table_title">ACL Finder Table</div>
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
        <el-table-column prop="accessId" label="Access ID" min-width="262" />
        <el-table-column prop="profileType" label="Profile Type" min-width="289" />
        <el-table-column prop="summary" label="Summary" min-width="262" />
        <el-table-column prop="status" label="Status" min-width="262" />
        <el-table-column label="Action" min-width="289">
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
import baseInput from '@/components/CustomInput/base-input.vue'

export default {
  components: { baseInput },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      profileType: '0',
      profileId: '0',
      ports: '',
      profileIds: [],
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('sec_aclFinder').then(d => {
        this.profileIds = d.profileIds || []
      })
    },
    onFind() {
      this.loading = true
      cgiGet('sec_aclFinder').then(d => {
        this.rows = (d.list || []).map(e => ({
          profileId: e.profileId, accessId: e.accessId, profileType: e.profileType, summary: e.summary, status: e.status
        }))
      }).finally(() => { this.loading = false })
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete rule ${row.accessId} ?`, 'Please confirm').then(async() => {
        await cgiSet('sec_aclRuleDel', { profileId: row.profileId, accessId: row.accessId }, { successMsg: false })
        this.onFind()
      }).catch(() => {})
    }
  }
}
</script>

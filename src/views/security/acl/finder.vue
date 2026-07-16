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
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import message from '@/utils/message'
import baseInput from '@/components/CustomInput/base-input.vue'

/** "1,3-5" → Set{1,3,4,5};非法段忽略 */
function parsePortList(str) {
  const set = new Set()
  String(str || '').split(',').forEach(seg => {
    const m = seg.trim().match(/^(\d+)(?:-(\d+))?$/)
    if (!m) return
    const a = Number(m[1])
    const b = m[2] ? Number(m[2]) : a
    for (let i = Math.min(a, b); i <= Math.max(a, b); i++) set.add(i)
  })
  return set
}

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
      all: { l2: [], l3: [] },
      rows: []
    }
  },
  computed: {
    isL3() { return this.profileType === '1' },
    typeList() { return this.isL3 ? this.all.l3 : this.all.l2 },
    profileIds() { return this.typeList.map(p => p.id) }
  },
  watch: {
    // 切 Profile Type:Profile ID 复位为 Any,表格动态显示该 type 全部 rule
    profileType() {
      this.profileId = '0'
      this.buildRows(false)
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('sec_aclProfileList').then(d => {
        this.all = { l2: d.l2 || [], l3: d.l3 || [] }
        this.buildRows(false)
      }).finally(() => { this.loading = false })
    },
    // 表格行 = 选中 type 下所有 profile 的 rule;Find 时按 Profile ID / Ports 精细过滤
    buildRows(useFilter) {
      let out = []
      this.typeList.forEach(p => {
        (p.rules || []).forEach(r => {
          out.push({
            profileId: p.id,
            accessId: r.accessId,
            profileType: r.profileType || p.owner,
            summary: r.summary,
            status: r.status || 'Permit',
            ports: r.ports
          })
        })
      })
      if (useFilter) {
        if (this.profileId !== '0') out = out.filter(r => String(r.profileId) === this.profileId)
        const want = parsePortList(this.ports)
        if (want.size) {
          out = out.filter(r => {
            const has = parsePortList(r.ports)
            for (const p of want) { if (has.has(p)) return true }
            return false
          })
        }
      }
      this.rows = out
    },
    onFind() {
      this.buildRows(true)
    },
    onEditRule(row) {
      this.$router.push({
        path: '/security/acl/rule-edit',
        query: { type: this.isL3 ? 'L3' : 'L2', id: row.profileId, accessId: row.accessId }
      })
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

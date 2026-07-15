<template>
  <div class="main_body">
    <div id="basetitle">ARP Access List</div>
    <div>
      <common-table header-title="ARP Access List" :first-column="['ARP Access List Name']">
        <template #0>
          <base-input v-model="name" max-len="32" />
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>

      <div class="table_title">
        ARP Access List Table
        <span class="tipInTableTitle">( Total Entries: {{ rows.length }} )</span>
      </div>
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
        <el-table-column prop="name" label="ARP Access List Name" min-width="773" />
        <el-table-column label="Action" min-width="857">
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
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'

export default {
  components: { commonTable, baseInput },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      name: '',
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('sec_arpAccessList').then(d => {
        this.rows = (d.list || []).map(e => ({ name: e.name }))
      }).finally(() => { this.loading = false })
    },
    async onApply() {
      if (!this.name) { message.warnBox('Please input an ARP Access List Name.'); return }
      await cgiSet('sec_arpAccessListAdd', { name: this.name })
      this.name = ''
      this.load()
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete ${row.name} ?`, 'Please confirm').then(async() => {
        await cgiSet('sec_arpAccessListDel', { name: row.name }, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

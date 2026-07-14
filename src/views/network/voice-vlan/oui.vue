<template>
  <div class="main_body">
    <div id="basetitle">Voice VLAN OUI Settings</div>
    <div>
      <common-table header-title="Voice VLAN OUI Settings" :first-column="['Description', 'Telephony OUI']">
        <template #0>
          <base-input v-model="desc" max-len="20" :disabled="off" />
        </template>
        <template #1>
          <base-input v-model="mac" max-len="17" :disabled="off" />
          <span class="tipAfterInputBox">(e.g. 00:11:ab:cd:ef:22)</span>
        </template>
      </common-table>
      <div class="note">
        <span>Note: 10 maximum user defined OUI allowed.</span>
      </div>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Add" @click="onAdd">
      </div>

      <div class="table_title">
        Voice VLAN OUI Table
        <span class="tipInTableTitle">(Total Entries :{{ rows.length }})</span>
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
        <el-table-column prop="id" label="ID" min-width="80" />
        <el-table-column prop="desc" label="Description" min-width="320" />
        <el-table-column prop="mac" label="Telephony OUI" min-width="150" />
        <el-table-column prop="mask" label="OUI Mask" min-width="150" />
        <el-table-column label="Action" min-width="130">
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
import { applyCheck } from '@/utils'
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
      status: false,
      desc: '',
      mac: '',
      rows: []
    }
  },
  computed: {
    // Voice VLAN Disabled 时输入禁用置灰(原版逻辑)
    off() {
      return !this.status
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_voiceVlanOui').then(d => {
        this.status = !!d.status
        this.rows = (d.list || []).map(e => ({
          id: e.id,
          desc: e.desc,
          mac: e.mac,
          mask: e.mask
        }))
      }).finally(() => { this.loading = false })
    },
    async onAdd() {
      if (this.rows.length >= 10) { message.warnBox('10 maximum user defined OUI allowed.'); return }
      if (applyCheck('mac', this.mac.toLowerCase()) === false) { message.warnBox('Invalid Telephony OUI.'); return }
      await cgiSet('net_voiceVlanOuiAdd', { desc: this.desc, mac: this.mac })
      this.desc = ''; this.mac = ''
      this.load()
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete OUI ${row.mac} ?`, 'Please confirm').then(async() => {
        await cgiSet('net_voiceVlanOuiDel', { id: row.id }, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

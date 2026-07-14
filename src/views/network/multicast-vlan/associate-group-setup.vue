<template>
  <div class="main_body">
    <div id="basetitle">Multicast Associate Group Setup</div>
    <div>
      <common-table header-title="Associate Group Settings" :first-column="['VLAN ID', 'Profile Name']">
        <template #0>
          <base-input v-model="vid" max-len="4" @check="onlyNum" />
          <span class="tipAfterInputBox">(2-4094)</span>
        </template>
        <template #1>
          <base-input v-model="profileName" max-len="32" />
          <span class="tipAfterInputBox">(32 characters limit)</span>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Add" @click="onAdd">
        <input type="button" class="btnOutTable" value="Delete" @click="onDelete">
      </div>

      <div class="table_title">Multicast Associate Group Table</div>
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
        <el-table-column prop="vlan" label="Multicast VLAN ID" min-width="200" />
        <el-table-column prop="profileName" label="Multicast Profiles Name" min-width="250" />
      </el-table>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import message from '@/utils/message'
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'
import { pageTableHeader, pageTableCell } from '@/utils/emu'

export default {
  components: { commonTable, baseInput },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      vid: '',
      profileName: '',
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_mcvlanAssoc').then(d => { this.rows = d.list || [] }).finally(() => { this.loading = false })
    },
    onlyNum() {
      this.vid = this.vid.replace(/[^0-9]/g, '')
    },
    onAdd() {
      const id = Number(this.vid)
      if (!id || id < 2 || id > 4094) { message.warnBox('VLAN ID must be within 2-4094.'); return }
      if (!this.profileName) { message.warnBox('Please enter a profile name.'); return }
      cgiSet('net_mcvlanAssocAdd', { vlan: this.vid, profileName: this.profileName }).then(() => {
        this.vid = ''
        this.profileName = ''
        this.load()
      })
    },
    onDelete() {
      const id = Number(this.vid)
      if (!id) { message.warnBox('Please enter the VLAN ID to delete.'); return }
      message.confirmWarnBox(`Do you want to delete the associate group of VLAN ${id} ?`, 'Please confirm').then(async() => {
        await cgiSet('net_mcvlanAssocDel', { vlan: this.vid, profileName: this.profileName }, { successMsg: false })
        this.vid = ''
        this.profileName = ''
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

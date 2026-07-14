<template>
  <div class="main_body">
    <div id="basetitle">Multicast Group Setup</div>
    <div>
      <common-table header-title="Profile Create" :first-column="['Profile Name']">
        <template #0>
          <base-input v-model="createName" max-len="32" css="baseInput InputOutTable150" />
          <span class="tipAfterInputBox">(32 characters limit)</span>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Add" @click="onCreateProfile">
      </div>

      <common-table header-title="Group Profile Settings" :first-column="['Profile Name', 'IP Address Range']" :double-rows="[1]">
        <template #0>
          <base-input v-model="rangeName" max-len="32" css="baseInput InputOutTable150" />
          <span class="tipAfterInputBox">(32 characters limit)</span>
        </template>
        <template #1>
          <div class="InputOutTable150" style="display: inline-block; width: 50%">
            <input v-model="v4from" type="text" maxlength="15" class="baseInput" :class="{ disabledStyle: ipType !== 'ipv4' }" :disabled="ipType !== 'ipv4'">
          </div>
          <span>-</span>
          <div class="InputOutTable150" style="display: inline-block; width: 50%">
            <input v-model="v4to" type="text" maxlength="15" class="baseInput" :class="{ disabledStyle: ipType !== 'ipv4' }" :disabled="ipType !== 'ipv4'">
          </div>
          <input id="mcvlanIPv4" v-model="ipType" type="radio" value="ipv4" class="tipAfterInputBox">
          <label for="mcvlanIPv4">IPv4</label>
        </template>
        <template #1-2>
          <div class="InputOutTable150" style="display: inline-block; width: 50%; min-width: 150px !important">
            <input v-model="v6from" type="text" maxlength="43" class="baseInput" :class="{ disabledStyle: ipType !== 'ipv6' }" :disabled="ipType !== 'ipv6'">
          </div>
          <span>-</span>
          <div class="InputOutTable150" style="display: inline-block; width: 50%; min-width: 150px !important">
            <input v-model="v6to" type="text" maxlength="43" class="baseInput" :class="{ disabledStyle: ipType !== 'ipv6' }" :disabled="ipType !== 'ipv6'">
          </div>
          <input id="mcvlanIPv6" v-model="ipType" type="radio" value="ipv6" class="tipAfterInputBox">
          <label for="mcvlanIPv6">IPv6</label>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Add" @click="onAddRange">
        <input type="button" class="btnOutTable" value="Delete" @click="onDeleteRange">
      </div>

      <div class="table_title">Multicast Profile Table</div>
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
        <el-table-column prop="name" label="Profile Name" min-width="200" />
        <el-table-column prop="profiles" label="Multicast Group Profiles" min-width="300" />
        <el-table-column label="Action" min-width="120">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Delete" @click="onDeleteProfile(scope.row)">
          </template>
        </el-table-column>
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
      createName: '',
      rangeName: '',
      ipType: 'ipv4',
      v4from: '',
      v4to: '',
      v6from: '',
      v6to: '',
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_mcvlanGroup').then(d => {
        this.rows = (d.profiles || []).map(p => ({ name: p.name, profiles: (p.ranges || []).join(', ') }))
      }).finally(() => { this.loading = false })
    },
    onCreateProfile() {
      if (!this.createName) { message.warnBox('Please enter a profile name.'); return }
      cgiSet('net_mcvlanProfileAdd', { name: this.createName }).then(() => { this.createName = ''; this.load() })
    },
    onAddRange() {
      if (!this.rangeName) { message.warnBox('Please enter a profile name.'); return }
      const from = this.ipType === 'ipv4' ? this.v4from : this.v6from
      const to = this.ipType === 'ipv4' ? this.v4to : this.v6to
      if (!from || !to) { message.warnBox('Please enter the IP address range.'); return }
      cgiSet('net_mcvlanRangeAdd', { name: this.rangeName, ipType: this.ipType, from, to }).then(() => this.load())
    },
    onDeleteRange() {
      if (!this.rangeName) { message.warnBox('Please enter a profile name.'); return }
      const from = this.ipType === 'ipv4' ? this.v4from : this.v6from
      const to = this.ipType === 'ipv4' ? this.v4to : this.v6to
      cgiSet('net_mcvlanRangeDel', { name: this.rangeName, ipType: this.ipType, from, to }, { successMsg: false }).then(() => this.load())
    },
    onDeleteProfile(row) {
      message.confirmWarnBox(`Do you want to delete profile ${row.name} ?`, 'Please confirm').then(async() => {
        await cgiSet('net_mcvlanProfileDel', { name: row.name }, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

<template>
  <div class="main_body">
    <div id="basetitle">Multicast Global Settings</div>
    <div>
      <common-table header-title="Multicast Global Settings" :first-column="['Multicast IPv4 State', 'Multicast IPv6 State']">
        <template #0>
          <select v-model="ipv4State">
            <option value="1">Enabled</option>
            <option value="2">Disabled</option>
          </select>
        </template>
        <template #1>
          <select v-model="ipv6State">
            <option value="1">Enabled</option>
            <option value="2">Disabled</option>
          </select>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApplyGlobal">
      </div>

      <common-table header-title="Multicast VLAN Settings" :first-column="['VLAN ID', 'VLAN Name']">
        <template #0>
          <base-input v-model="newVid" max-len="4" @check="onlyNum" />
          <span class="tipAfterInputBox">(2-4094)</span>
        </template>
        <template #1>
          <base-input v-model="newName" max-len="32" />
          <span class="tipAfterInputBox">(32 characters limit)</span>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Add" @click="onAdd">
        <input type="button" class="btnOutTable" value="Delete" @click="onDelete">
      </div>

      <div class="table_title">The Port Setting of Multicast</div>
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
        <el-table-column prop="id" label="VLAN ID" min-width="100" />
        <el-table-column prop="name" label="VLAN Name" min-width="200" />
        <el-table-column label="State" min-width="110">
          <template slot-scope="scope">
            <select v-model="scope.row.state" class="selectInTable">
              <option value="1">Enabled</option>
              <option value="2">Disabled</option>
            </select>
          </template>
        </el-table-column>
        <el-table-column label="Receiver Ports" min-width="130">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Edit" @click="editPorts(scope.row, 'receiver')">
          </template>
        </el-table-column>
        <el-table-column label="Source Ports" min-width="130">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Edit" @click="editPorts(scope.row, 'source')">
          </template>
        </el-table-column>
        <el-table-column label="Action" min-width="100">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Apply" @click="onApplyState(scope.row)">
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
      ipv4State: '2',
      ipv6State: '2',
      newVid: '',
      newName: '',
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_mcvlanGlobal').then(d => {
        this.ipv4State = d.ipv4State ? '1' : '2'
        this.ipv6State = d.ipv6State ? '1' : '2'
        this.rows = (d.vlans || []).map(v => ({ id: v.id, name: v.name, state: v.state ? '1' : '2' }))
      }).finally(() => { this.loading = false })
    },
    onlyNum() {
      this.newVid = this.newVid.replace(/[^0-9]/g, '')
    },
    onApplyGlobal() {
      cgiSet('net_mcvlanGlobalState', {
        ipv4State: this.ipv4State === '1' ? 1 : 0,
        ipv6State: this.ipv6State === '1' ? 1 : 0
      })
    },
    onAdd() {
      const id = Number(this.newVid)
      if (!id || id < 2 || id > 4094) {
        message.warnBox('VLAN ID must be within 2-4094.')
        return
      }
      cgiSet('net_mcvlanVlanAdd', { id: this.newVid, name: this.newName }).then(() => {
        this.newVid = ''
        this.newName = ''
        this.load()
      })
    },
    onDelete() {
      const id = Number(this.newVid)
      if (!id) {
        message.warnBox('Please enter the VLAN ID to delete.')
        return
      }
      message.confirmWarnBox(`Do you want to delete Multicast VLAN ${id} ?`, 'Please confirm').then(async() => {
        await cgiSet('net_mcvlanVlanDel', { id: this.newVid }, { successMsg: false })
        this.newVid = ''
        this.newName = ''
        this.load()
      }).catch(() => {})
    },
    onApplyState(row) {
      cgiSet('net_mcvlanVlanState', { id: row.id, state: row.state === '1' ? 1 : 0 }).then(() => this.load())
    },
    editPorts(row, type) {
      // Receiver/Source Ports Edit → 独立端口设置页
      this.$router.push({ path: '/network/multicast-vlan/ports-settings', query: { vlan: row.id, type }})
    }
  }
}
</script>

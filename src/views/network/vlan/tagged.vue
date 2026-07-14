<template>
  <div class="main_body">
    <div id="basetitle">Tagged VLAN</div>
    <div>
      <div class="table_title">Tagged VLAN Settings</div>
      <table border="" cellspacing="0" class="from_table" style="table-layout: fixed;">
        <tbody>
          <tr>
            <td>VLAN ID</td>
            <td>
              <base-input v-model="vlanId" type="text" max-len="4" :disabled="editing" :css="editing ? 'baseInput disabledStyle' : 'baseInput'" @check="onCheckId" />
              <p class="tipAfterInputBox">(2-4094)</p>
            </td>
          </tr>
          <tr>
            <td>VLAN Name</td>
            <td>
              <base-input v-model="vlanName" type="text" max-len="32" />
              <p class="tipAfterInputBox">(32 characters limit)</p>
            </td>
          </tr>
        </tbody>
      </table>
      <br>
    </div>

    <port-member-radio-grid v-model="members" :states="STATES" :ports="portList" />

    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      <input type="button" class="btnOutTable" value="Clear" @click="onClear">
      <input type="button" class="btnOutTable" value="Reset to Default" @click="onReset">
    </div>

    <div id="vlantable">
      <div class="table_title">Tagged VLAN Table</div>
      <el-table
        v-loading="loading"
        :data="pageRows"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="id" label="VLAN ID" min-width="100" />
        <el-table-column prop="name" label="Name" min-width="260" />
        <el-table-column prop="type" label="VLAN Type" min-width="150" />
        <el-table-column label="Action" min-width="150">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Modify" @click="onModify(scope.row)">
            <input v-if="scope.row.id !== 1" type="button" class="btnInTable" value="Delete" @click="onDelete(scope.row)">
          </template>
        </el-table-column>
      </el-table>
      <p class="note">Note: If a port does not belong to any VLAN, its PVID will be changed to default VLAN ID and attends to default VLAN automatically.</p>
      <el-pagination
        :current-page.sync="page"
        :page-size.sync="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 20, 40]"
        :total="rows.length"
      />
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import message from '@/utils/message'
import baseInput from '@/components/CustomInput/base-input.vue'
import PortMemberRadioGrid from '@/components/Emu/PortMemberRadioGrid.vue'

// 端口成员归属:1=Static Tagged 2=Static Untagged 3=Not Member
const STATES = [
  { label: 'Static Tagged', value: 1 },
  { label: 'Static Untagged', value: 2 },
  { label: 'Not Member', value: 3 }
]

export default {
  components: { baseInput, PortMemberRadioGrid },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      STATES,
      vlanId: '',
      vlanName: '',
      members: [],
      editing: false, // Modify 时锁定 VLAN ID
      rows: [],
      page: 1,
      pageSize: 20
    }
  },
  computed: {
    portList() {
      const n = this.$store.getters.modelInfo('portNum') || 0
      return Array.from({ length: n }, (_, i) => i + 1)
    },
    pageRows() {
      const start = (this.page - 1) * this.pageSize
      return this.rows.slice(start, start + this.pageSize)
    }
  },
  created() {
    this.members = this.portList.map(() => 3)
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_vlanTagged').then(d => { this.rows = d.list || [] }).finally(() => { this.loading = false })
    },
    onCheckId() {
      this.vlanId = this.vlanId.replace(/[^0-9]/g, '')
    },
    onApply() {
      if (!this.editing) {
        const id = Number(this.vlanId)
        if (!id || id < 2 || id > 4094) { message.warnBox('VLAN ID must be within 2-4094.'); return }
      }
      cgiSet('net_vlanTaggedEdit', {
        id: this.vlanId,
        name: this.vlanName,
        members: this.members.join(',')
      }).then(() => { this.onClear(); this.load() })
    },
    onClear() {
      this.vlanId = ''
      this.vlanName = ''
      this.members = this.portList.map(() => 3)
      this.editing = false
    },
    onReset() {
      this.vlanName = ''
      this.members = this.portList.map(() => 2) // 默认全 Untagged
    },
    onModify(row) {
      this.vlanId = String(row.id)
      this.vlanName = row.name
      this.members = (row.members || []).slice()
      this.editing = true
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete VLAN ${row.id} ?`, 'Please confirm').then(async() => {
        await cgiSet('net_vlanTaggedDel', { id: row.id }, { successMsg: false })
        this.onClear()
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

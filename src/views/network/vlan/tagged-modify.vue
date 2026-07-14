<template>
  <div class="main_body">
    <div id="basetitle">Modify VLAN</div>
    <div>
      <common-table header-title="Tagged VLAN Settings" :first-column="['VLAN ID', 'VLAN Name']">
        <template #0><span>{{ vlanId }}</span></template>
        <template #1>
          <base-input v-model="vlanName" type="text" max-len="32" />
          <p class="tipAfterInputBox">(32 characters limit)</p>
        </template>
      </common-table>
      <br>
    </div>

    <port-member-radio-grid v-model="members" :states="STATES" :ports="portList" />

    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      <input type="button" class="btnOutTable" value="Restore" @click="onRestore">
      <input type="button" class="btnOutTable" value="Clear" @click="onClear">
      <input type="button" class="btnOutTable" value="Back" @click="$router.back()">
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'
import PortMemberRadioGrid from '@/components/Emu/PortMemberRadioGrid.vue'

// 端口成员归属:1=Static Tagged 2=Static Untagged 3=Not Member
const STATES = [
  { label: 'Static Tagged', value: 1 },
  { label: 'Static Untagged', value: 2 },
  { label: 'Not Member', value: 3 }
]

export default {
  components: { commonTable, baseInput, PortMemberRadioGrid },
  data() {
    return {
      STATES,
      vlanId: this.$route.query.id,
      vlanName: '',
      members: [],
      original: { name: '', members: [] }
    }
  },
  computed: {
    portList() {
      const n = this.$store.getters.modelInfo('portNum') || 0
      return Array.from({ length: n }, (_, i) => i + 1)
    }
  },
  created() {
    this.members = this.portList.map(() => 3)
    this.load()
  },
  methods: {
    load() {
      cgiGet('net_vlanTagged').then(d => {
        const row = (d.list || []).find(r => String(r.id) === String(this.vlanId))
        if (row) {
          this.vlanName = row.name
          this.members = (row.members || []).slice()
          this.original = { name: row.name, members: (row.members || []).slice() }
        }
      })
    },
    onRestore() {
      this.vlanName = this.original.name
      this.members = this.original.members.slice()
    },
    onClear() {
      this.members = this.portList.map(() => 3)
    },
    onApply() {
      cgiSet('net_vlanTaggedEdit', {
        id: this.vlanId,
        name: this.vlanName,
        members: this.members.join(',')
      }).then(() => this.$router.push({ path: '/network/vlan/tagged' }))
    }
  }
}
</script>

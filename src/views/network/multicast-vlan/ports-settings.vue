<template>
  <div class="main_body">
    <div id="basetitle">{{ title }}</div>
    <div>
      <common-table :header-title="title" :first-column="['VLAN ID', 'VLAN Name']">
        <template #0><span>{{ vlan }}</span></template>
        <template #1><span>{{ vlanName }}</span></template>
      </common-table>
      <br>
    </div>

    <port-member-radio-grid v-model="members" :states="states" :ports="portList" />

    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Previous Page" @click="$router.back()">
      <input type="button" class="btnOutTable" value="Clear" @click="onClear">
      <input type="button" class="btnOutTable" value="Apply" @click="onApply">
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import commonTable from '@/components/CustomTable/common-table.vue'
import PortMemberRadioGrid from '@/components/Emu/PortMemberRadioGrid.vue'

export default {
  components: { commonTable, PortMemberRadioGrid },
  data() {
    return {
      vlan: this.$route.query.vlan,
      type: this.$route.query.type === 'source' ? 'source' : 'receiver',
      vlanName: '',
      members: []
    }
  },
  computed: {
    title() {
      return this.type === 'source' ? 'Source Ports Settings' : 'Receiver Ports Settings'
    },
    states() {
      const label = this.type === 'source' ? 'Source' : 'Receiver'
      return [
        { label: `Tagged ${label} Ports`, value: 1 },
        { label: `Untagged ${label} Ports`, value: 2 },
        { label: 'Not Member Ports', value: 3 }
      ]
    },
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
      cgiGet('net_mcvlanGlobal').then(d => {
        const v = (d.vlans || []).find(x => String(x.id) === String(this.vlan))
        if (!v) return
        this.vlanName = v.name
        const cfg = (this.type === 'source' ? v.source : v.receiver) || { tagged: [], untagged: [] }
        this.members = this.portList.map(p => {
          if ((cfg.tagged || []).indexOf(p) !== -1) return 1
          if ((cfg.untagged || []).indexOf(p) !== -1) return 2
          return 3
        })
      })
    },
    onClear() {
      this.members = this.portList.map(() => 3)
    },
    onApply() {
      const tagged = this.portList.filter(p => this.members[p - 1] === 1)
      const untagged = this.portList.filter(p => this.members[p - 1] === 2)
      cgiSet('net_mcvlanPorts', { vlan: this.vlan, type: this.type, tagged, untagged }).then(() => {
        this.$router.push({ path: '/network/multicast-vlan/global-settings' })
      })
    }
  }
}
</script>

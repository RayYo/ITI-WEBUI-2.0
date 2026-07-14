<template>
  <div class="main_body">
    <div id="basetitle">Modify MLD Static Router Port</div>
    <div>
      <common-table header-title="Router Port Settings" :first-column="['802.1Q VLAN']">
        <template #0><span>{{ vlan }}</span></template>
      </common-table>
    </div>
    <br>
    <div>
      <port-checkbox-grid v-model="ports" title="Static Router Port" :ports="allPorts" />
    </div>
    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      <input type="button" class="btnOutTable" value="Restore" @click="onRestore">
      <input type="button" class="btnOutTable" value="Back" @click="$router.back()">
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import PortCheckboxGrid from '@/components/Emu/PortCheckboxGrid.vue'

export default {
  components: { PortCheckboxGrid },
  data() {
    return {
      vlan: this.$route.query.vlan,
      ports: [],
      original: []
    }
  },
  computed: {
    allPorts() {
      const n = this.$store.getters.modelInfo('portNum') || 0
      return Array.from({ length: n }, (_, i) => i + 1)
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('net_mldRouterPort').then(d => {
        const row = (d.rows || []).find(r => String(r.vlan) === String(this.vlan))
        this.original = row ? (row.staticPorts || []).slice() : []
        this.ports = this.original.slice()
      })
    },
    onRestore() {
      this.ports = this.original.slice()
    },
    onApply() {
      cgiSet('net_mldRouterPortEdit', { vlan: this.vlan, staticPorts: this.ports }).then(() => {
        this.$router.push({ path: '/network/mld-snooping/router-port' })
      })
    }
  }
}
</script>

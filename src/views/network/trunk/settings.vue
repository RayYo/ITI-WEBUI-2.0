<template>
  <div class="main_body">
    <div id="basetitle">Trunking</div>
    <div class="trunking_box" style="min-width: 650px">
      <div style="overflow: auto">
        <div class="table_title">Trunking Settings</div>
        <table border cellspacing="0" class="port_table" style="min-width: 1000px">
          <tbody>
            <tr v-for="t in trunks" :key="t.id">
              <td align="center" style="width: 10%">Trunk ID {{ t.id }}:</td>
              <td style="width: 74%; overflow: hidden">
                <port-checkbox-grid v-model="t.ports" bare :ports="allPorts" />
              </td>
              <td align="center" style="width: 16%">
                <select v-model="t.mode" class="selectInTable" style="width: 40% !important">
                  <option v-for="m in MODES" :key="m.value" :value="m.value">{{ m.label }}</option>
                </select>
                <input type="button" class="btnInTable" value="Apply" style="display: inline-block" @click="onApply(t)">
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="note" style="overflow: hidden">
        <span>Note: Disabling will turn off the function and return all values to default.</span>
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import PortCheckboxGrid from '@/components/Emu/PortCheckboxGrid.vue'

const MODES = [
  { value: 'active', label: 'Active' },
  { value: 'passive', label: 'Passive' },
  { value: 'manual', label: 'Manual' },
  { value: 'disabled', label: 'Disabled' }
]

export default {
  components: { PortCheckboxGrid },
  data() {
    return {
      MODES,
      trunks: []
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
      cgiGet('net_trunkSettings').then(d => {
        this.trunks = (d.trunks || []).map(t => ({
          id: t.id,
          ports: (t.ports || []).slice(),
          mode: t.mode || 'disabled'
        }))
      })
    },
    onApply(t) {
      cgiSet('net_trunkSettingsEdit', {
        id: t.id,
        ports: t.ports,
        mode: t.mode
      }).then(() => this.load())
    }
  }
}
</script>

<template>
  <div class="main_body">
    <div id="basetitle">Mirroring</div>
    <div>
      <common-table header-title="Mirroring Settings" :first-column="['Mirroring Status','Mirror Target Port']">
        <template #0>
          <select v-model="status">
            <option value="1">Enabled</option>
            <option value="2">Disabled</option>
          </select>
        </template>
        <template #1>
          <select v-model="targetPort" :class="{ disabledStyle: status !== '1' }" :disabled="status !== '1'">
            <option v-for="p in portList" :key="p" :value="p">{{ p }}</option>
          </select>
        </template>
      </common-table>
      <br>
      <port-checkbox-grid
        v-model="ingress"
        title="Mirroring Ingress Port Settings"
        :ports="portList"
        :disabled="status !== '1'"
      />
      <br>
      <port-checkbox-grid
        v-model="egress"
        title="Mirroring Egress Port Settings"
        :ports="portList"
        :disabled="status !== '1'"
      />

      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import message from '@/utils/message'
import commonTable from '@/components/CustomTable/common-table.vue'
import PortCheckboxGrid from '@/components/Emu/PortCheckboxGrid.vue'

export default {
  components: { commonTable, PortCheckboxGrid },
  data() {
    return {
      status: '2',
      targetPort: 1,
      ingress: [],
      egress: []
    }
  },
  computed: {
    portList() {
      const n = this.$store.getters.modelInfo('portNum') || 0
      return Array.from({ length: n }, (_, i) => i + 1)
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('net_mirror').then(d => {
        this.status = d.status ? '1' : '2'
        this.targetPort = d.targetPort || 1
        this.ingress = (d.ingress || []).slice()
        this.egress = (d.egress || []).slice()
      })
    },
    onApply() {
      if (this.status === '1' && this.ingress.indexOf(Number(this.targetPort)) !== -1) {
        message.warnBox('The target port cannot be a mirrored (ingress) port.')
        return
      }
      cgiSet('net_mirrorEdit', {
        status: this.status === '1' ? 1 : 0,
        targetPort: this.targetPort,
        ingress: this.ingress.join(','),
        egress: this.egress.join(',')
      })
    }
  }
}
</script>

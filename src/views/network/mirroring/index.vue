<template>
  <div class="main_body">
    <div id="basetitle">Mirroring</div>
    <div>
      <div class="table_title">Mirroring Settings</div>
      <table class="from_table" border="" cellspacing="0">
        <tbody>
          <tr>
            <td>Mirroring Status</td>
            <td>
              <select v-model="status">
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Mirror Target Port</td>
            <td>
              <select v-model="targetPort" :disabled="status !== '1'">
                <option v-for="p in portList" :key="p" :value="p">{{ p }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="table_title">Ingress Port Settings</div>
      <div class="port-check-box">
        <label v-for="p in portList" :key="'in' + p" class="port-check">
          <input v-model="ingress" type="checkbox" :value="p" :disabled="status !== '1'"> {{ p }}
        </label>
        <div class="margin1015">
          <input type="button" class="btnOutTable" value="All" @click="ingress = portList.slice()">
          <input type="button" class="btnOutTable" value="Clear" @click="ingress = []">
        </div>
      </div>

      <div class="table_title">Egress Port Settings</div>
      <div class="port-check-box">
        <label v-for="p in portList" :key="'eg' + p" class="port-check">
          <input v-model="egress" type="checkbox" :value="p" :disabled="status !== '1'"> {{ p }}
        </label>
        <div class="margin1015">
          <input type="button" class="btnOutTable" value="All" @click="egress = portList.slice()">
          <input type="button" class="btnOutTable" value="Clear" @click="egress = []">
        </div>
      </div>

      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import message from '@/utils/message'

export default {
  data() {
    return {
      status: '2',
      targetPort: '1',
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
        this.targetPort = String(d.targetPort || 1)
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

<style lang="scss" scoped>
.port-check-box {
  padding: 10px 15px;
}
.port-check {
  display: inline-block;
  width: 60px;
  margin: 4px 0;
  white-space: nowrap;
}
</style>

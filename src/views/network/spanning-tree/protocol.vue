<template>
  <div class="main_body">
    <div id="basetitle">Spanning Tree Protocol Settings</div>
    <div>
      <div class="table_title">Spanning Tree Protocol Settings</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Global STP Status</td>
            <td>
              <select v-model="status">
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Protocol Version</td>
            <td>
              <select v-model="version" :class="{ disabledStyle: off }" :disabled="off">
                <option value="stp">STP</option>
                <option value="rstp">RSTP</option>
                <option value="mstp">MSTP</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Bridge Priority</td>
            <td>
              <select v-model="bridgePriority" :class="{ disabledStyle: off }" :disabled="off">
                <option v-for="v in PRIORITIES" :key="v" :value="v">{{ v }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Maximum Age</td>
            <td>
              <base-input v-model="maxAge" type="text" max-len="2" :disabled="off" :css="off ? 'baseInput disabledStyle' : 'baseInput'" />
              <span class="tipAfterInputBox">(6-40) sec</span>
            </td>
          </tr>
          <tr>
            <td>Hello Time</td>
            <td>
              <base-input v-model="helloTime" type="text" max-len="2" :disabled="off" :css="off ? 'baseInput disabledStyle' : 'baseInput'" />
              <span class="tipAfterInputBox">(1-10) sec</span>
            </td>
          </tr>
          <tr>
            <td>Forward Delay</td>
            <td>
              <base-input v-model="forwardDelay" type="text" max-len="2" :disabled="off" :css="off ? 'baseInput disabledStyle' : 'baseInput'" />
              <span class="tipAfterInputBox">(4-30) sec</span>
            </td>
          </tr>
          <tr>
            <td>Transmit Hold Count</td>
            <td>
              <base-input v-model="txHoldCount" type="text" max-len="2" :disabled="off" :css="off ? 'baseInput disabledStyle' : 'baseInput'" />
              <span class="tipAfterInputBox">(1-10)</span>
            </td>
          </tr>
          <tr>
            <td>Max Hop Count</td>
            <td>
              <base-input v-model="maxHopCount" type="text" max-len="2" :disabled="off" :css="off ? 'baseInput disabledStyle' : 'baseInput'" />
              <span class="tipAfterInputBox">(6-40)</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <p class="note">Note: Enabling Spanning-Tree will temporarily cause the system to stop responding.</p>
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>

      <div class="table_title">Root Information</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr><td>Root Bridge</td><td><span>{{ root.bridge }}</span></td></tr>
          <tr><td>Root Cost</td><td><span>{{ rootText(root.cost) }}</span></td></tr>
          <tr><td>Root Maximum Age</td><td><span>{{ rootText(root.maxAge) }}</span></td></tr>
          <tr><td>Root Forward Delay</td><td><span>{{ rootText(root.forwardDelay) }}</span></td></tr>
          <tr><td>Root Port</td><td><span>{{ rootText(root.port) }}</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import baseInput from '@/components/CustomInput/base-input.vue'

const PRIORITIES = Array.from({ length: 16 }, (_, i) => i * 4096)

export default {
  components: { baseInput },
  data() {
    return {
      PRIORITIES,
      status: '2',
      version: 'rstp',
      bridgePriority: 32768,
      maxAge: '20',
      helloTime: '2',
      forwardDelay: '15',
      txHoldCount: '6',
      maxHopCount: '20',
      root: { bridge: '00:00:00:00:00:00:00:00', cost: 0, maxAge: 20, forwardDelay: 15, port: 0 }
    }
  },
  computed: {
    off() {
      return this.status !== '1'
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('net_stpProtocol').then(d => {
        this.status = d.status ? '1' : '2'
        this.version = d.version || 'rstp'
        this.bridgePriority = d.bridgePriority
        this.maxAge = String(d.maxAge)
        this.helloTime = String(d.helloTime)
        this.forwardDelay = String(d.forwardDelay)
        this.txHoldCount = String(d.txHoldCount)
        this.maxHopCount = String(d.maxHopCount)
        this.root = d.root || this.root
      })
    },
    rootText(v) {
      // STP 未启用时原版这些字段留空
      return this.status === '1' ? v : ''
    },
    onApply() {
      cgiSet('net_stpProtocol', {
        status: this.status === '1' ? 1 : 0,
        version: this.version,
        bridgePriority: this.bridgePriority,
        maxAge: this.maxAge,
        helloTime: this.helloTime,
        forwardDelay: this.forwardDelay,
        txHoldCount: this.txHoldCount,
        maxHopCount: this.maxHopCount
      }).then(() => this.load())
    }
  }
}
</script>

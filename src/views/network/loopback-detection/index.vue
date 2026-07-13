<template>
  <div class="main_body">
    <div id="basetitle">Loopback Detection</div>
    <div>
      <common-table header-title="Loopback Detection Settings" :first-column="['Loopback Detection Status']">
        <template #0>
          <select v-model="status">
            <option value="1">Enabled</option>
            <option value="2">Disabled</option>
          </select>
        </template>
      </common-table>

      <common-table header-title="Loopback Detection Time Settings" :first-column="['Interval','Recover Time']">
        <template #0>
          <base-input v-model="interval" max-len="5" :disabled="status !== '1'" @check="onlyNum('interval')" />
          <span class="tipAfterInputBox">(1-32767)</span>
        </template>
        <template #1>
          <base-input v-model="recoverTime" max-len="7" :disabled="status !== '1'" @check="onlyNum('recoverTime')" />
          <span class="tipAfterInputBox">Sec(0 or 60-1000000, 0 is Disabled)</span>
        </template>
      </common-table>

      <div class="note">Note: Disabling will turn off the function and return all values to default.</div>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApplyGlobal">
      </div>

      <port-edit-table
        title="Loopback Detection Table"
        :columns="columns"
        :rows="rows"
        min-width="700px"
        :disabled="status !== '1'"
        @apply="onApplyPort"
      />
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import message from '@/utils/message'
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'
import PortEditTable from '@/components/Emu/PortEditTable.vue'

export default {
  components: { commonTable, baseInput, PortEditTable },
  data() {
    return {
      status: '2',
      interval: '2',
      recoverTime: '60',
      columns: [
        { prop: 'port', label: 'Port', width: 90, type: 'text' },
        {
          prop: 'state', label: 'Loopback Detection State', type: 'select',
          options: [{ value: '1', label: 'Enabled' }, { value: '2', label: 'Disabled' }],
          allExtra: { value: '0', label: 'Ignore' }
        },
        { prop: 'loopStatus', label: 'Loop Status', type: 'text' },
        { label: 'Action', width: 160, type: 'action' }
      ],
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('net_loopback').then(d => {
        this.status = d.status ? '1' : '2'
        this.interval = String(d.interval != null ? d.interval : 2)
        this.recoverTime = String(d.recoverTime != null ? d.recoverTime : 60)
        const all = { port: 'All', state: '0', loopStatus: '' }
        this.rows = [all].concat((d.ports || []).map(p => ({
          port: p.port,
          state: p.state ? '1' : '2',
          loopStatus: p.loopStatus === 'loop' ? 'Loop' : 'Normal'
        })))
      })
    },
    onlyNum(key) {
      this[key] = this[key].replace(/[^0-9]/g, '')
    },
    onApplyGlobal() {
      if (this.status === '1') {
        const it = Number(this.interval)
        if (!it || it < 1 || it > 32767) {
          message.warnBox('Interval must be between 1 and 32767.')
          return
        }
        const rt = Number(this.recoverTime)
        if (rt !== 0 && (rt < 60 || rt > 1000000)) {
          message.warnBox('Recover Time must be 0 or between 60 and 1000000.')
          return
        }
      }
      cgiSet('net_loopbackGlobal', {
        status: this.status === '1' ? 1 : 0,
        interval: this.interval,
        recoverTime: this.recoverTime
      })
    },
    async onApplyPort(row) {
      if (row.port === 'All' && row.state === '0') {
        message.warnBox('Please select a state for the All row.')
        return
      }
      const payload = row.port === 'All'
        ? { all: 1, state: row.state === '1' ? 1 : 0 }
        : { port: row.port, state: row.state === '1' ? 1 : 0 }
      await cgiSet('net_loopbackPort', payload)
      this.load()
    }
  }
}
</script>

<template>
  <div class="main_body">
    <div id="basetitle">Port Security Port Settings</div>
    <div>
      <div class="table_title">Port Security Port Settings</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Port</td>
            <td>
              <select v-model="form.port">
                <option value="0">All</option>
                <option v-for="p in 28" :key="p" :value="String(p)">{{ p }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>State</td>
            <td>
              <select v-model="form.state">
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Maximum&nbsp;(0 - 64)</td>
            <td>
              <base-input v-model="form.maximum" max-len="2" @check="onlyNum('maximum')" />
            </td>
          </tr>
          <tr>
            <td>Violation Action</td>
            <td>
              <select v-model="form.violation">
                <option value="1">Protect</option>
                <option value="3">ShutDown</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Security Mode</td>
            <td>
              <select v-model="form.mode">
                <option value="3">Permanent</option>
                <option value="2">Delete-On-Timeout</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Aging Time &nbsp;(0 - 1440)</td>
            <td>
              <base-input v-model="form.agingTime" max-len="4" @check="onlyNum('agingTime')" />
            </td>
          </tr>
          <tr>
            <td>Aging Type</td>
            <td>
              <select v-model="form.agingType">
                <option value="1">Absolute</option>
                <option value="2">Inactivity</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>

      <div class="table_title">Port Security Port Table</div>
      <el-table
        v-loading="loading"
        :data="rows"
        class="tableBox"
        stripe
        border
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="port" label="Port" min-width="114" />
        <el-table-column prop="maximum" label="Maximum" min-width="146" />
        <el-table-column prop="currentNo" label="Current No." min-width="183" />
        <el-table-column prop="violation" label="Violation Action" min-width="219" />
        <el-table-column prop="mode" label="Security Mode" min-width="219" />
        <el-table-column prop="adminState" label="Admin State" min-width="183" />
        <el-table-column prop="currentState" label="Current State" min-width="201" />
        <el-table-column prop="agingTime" label="Aging Time" min-width="201" />
        <el-table-column prop="agingType" label="Aging Type" min-width="164" />
      </el-table>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import baseInput from '@/components/CustomInput/base-input.vue'

const VIOLATION = { 1: 'Protect', 3: 'ShutDown' }
const MODE = { 2: 'Delete-On-Timeout', 3: 'Permanent' }
const AGING_TYPE = { 1: 'Absolute', 2: 'Inactivity' }

export default {
  components: { baseInput },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      form: { port: '0', state: '2', maximum: '32', violation: '1', mode: '3', agingTime: '0', agingType: '1' },
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('sec_portSecPort').then(d => {
        this.rows = (d.ports || []).map(p => ({
          port: p.port,
          maximum: p.maximum,
          currentNo: p.currentNo != null ? p.currentNo : 0,
          violation: VIOLATION[p.violation] || 'Protect',
          mode: MODE[p.mode] || 'Permanent',
          adminState: p.state ? 'Enabled' : 'Disabled',
          currentState: p.currentState || '-',
          agingTime: p.agingTime,
          agingType: AGING_TYPE[p.agingType] || 'Absolute'
        }))
      }).finally(() => { this.loading = false })
    },
    onlyNum(key) {
      this.form[key] = this.form[key].replace(/[^0-9]/g, '')
    },
    onApply() {
      cgiSet('sec_portSecPortEdit', {
        port: this.form.port,
        state: this.form.state === '1' ? 1 : 0,
        maximum: Number(this.form.maximum),
        violation: this.form.violation,
        mode: this.form.mode,
        agingTime: Number(this.form.agingTime),
        agingType: this.form.agingType
      }).then(() => this.load())
    }
  }
}
</script>

<template>
  <div class="main_body">
    <div id="basetitle">Loopback Detection</div>
    <div>
      <div class="table_title">Loopback Detection Global Settings</div>
      <table class="from_table" border="" cellspacing="0">
        <tbody>
          <tr>
            <td>Loopback Detection Status</td>
            <td>
              <select v-model="status">
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Interval (1-32767)</td>
            <td>
              <input v-model="interval" type="text" maxlength="5" :disabled="status !== '1'" @input="interval = interval.replace(/[^0-9]/g, '')">
            </td>
          </tr>
          <tr>
            <td>Recover Time Sec (0 or 60-1000000, 0 is Disabled)</td>
            <td>
              <input v-model="recoverTime" type="text" maxlength="7" :disabled="status !== '1'" @input="recoverTime = recoverTime.replace(/[^0-9]/g, '')">
            </td>
          </tr>
        </tbody>
      </table>
      <div class="marginbutton">
        <input type="button" class="btnOutTable" value="Apply" @click="onApplyGlobal">
      </div>

      <div class="table_title">Loopback Detection Port Settings</div>
      <div class="table-scroll">
        <el-table :data="rows" class="tableBox" style="min-width: 600px" stripe border :header-cell-style="darkTableHeader" :cell-style="pageTableCell">
          <el-table-column prop="port" label="Port" width="80" />
          <el-table-column label="Loopback Detection State">
            <template slot-scope="scope">
              <select v-model="scope.row.state" :disabled="status !== '1'">
                <option v-if="scope.row.port === 'All'" value="0">Ignore</option>
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </template>
          </el-table-column>
          <el-table-column label="Loop Status">
            <template slot-scope="scope">{{ scope.row.loopStatus }}</template>
          </el-table-column>
          <el-table-column label="Action">
            <template slot-scope="scope">
              <input type="button" class="btnInTable" value="Apply" :disabled="status !== '1'" @click="onApplyPort(scope.row)">
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import message from '@/utils/message'
import { darkTableHeader, pageTableCell } from '@/utils/emu'

export default {
  data() {
    return {
      darkTableHeader,
      pageTableCell,
      status: '2',
      interval: '2',
      recoverTime: '60',
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
        const all = { port: 'All', state: '0', loopStatus: '-' }
        this.rows = [all].concat((d.ports || []).map(p => ({
          port: p.port,
          state: p.state ? '1' : '2',
          loopStatus: p.loopStatus === 'loop' ? 'Loop' : 'Normal'
        })))
      })
    },
    onApplyGlobal() {
      const it = Number(this.interval)
      if (this.status === '1' && (!it || it < 1 || it > 32767)) {
        message.warnBox('Interval must be between 1 and 32767.')
        return
      }
      const rt = Number(this.recoverTime)
      if (this.status === '1' && rt !== 0 && (rt < 60 || rt > 1000000)) {
        message.warnBox('Recover Time must be 0 or between 60 and 1000000.')
        return
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

<style lang="scss" scoped>
.table-scroll {
  overflow-x: auto;
}
</style>

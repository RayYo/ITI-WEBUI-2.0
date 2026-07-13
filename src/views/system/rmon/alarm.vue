<template>
  <div class="main_body">
    <div id="basetitle">RMON Alarm Settings</div>
    <div>
      <div class="table_title">RMON Alarm Settings</div>
      <table class="from_table" border="" cellspacing="0">
        <tbody>
          <tr>
            <td>Index</td>
            <td>
              <div class="inputBox"><input v-model="index" type="text" maxlength="5" autocomplete="off" class="baseInput"></div>
              <span class="tipAfterInputBox">*&nbsp;(1-65535)</span>
            </td>
          </tr>
          <tr>
            <td>Interval</td>
            <td>
              <div class="inputBox"><input v-model="interval" type="text" maxlength="10" autocomplete="off" class="baseInput"></div>
              <span class="tipAfterInputBox">(1-2^31-1 Sec)</span>
            </td>
          </tr>
          <tr>
            <td>Variable</td>
            <td>
              <div class="inputBox"><input v-model="variable" type="text" maxlength="32" autocomplete="off" class="baseInput"></div>
              <span class="tipAfterInputBox">*</span>
            </td>
          </tr>
          <tr>
            <td>Sample type</td>
            <td>
              <select v-model="sample">
                <option value="1">Absolute value</option>
                <option value="2">Delta value</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Rising Threshold</td>
            <td>
              <div class="inputBox"><input v-model="rising" type="text" maxlength="10" autocomplete="off" class="baseInput"></div>
              <span class="tipAfterInputBox">* (0-2^31-1)</span>
            </td>
          </tr>
          <tr>
            <td>Falling Threshold</td>
            <td>
              <div class="inputBox"><input v-model="falling" type="text" maxlength="10" autocomplete="off" class="baseInput"></div>
              <span class="tipAfterInputBox">* (0-2^31-1)</span>
            </td>
          </tr>
          <tr>
            <td>Rising Event Index</td>
            <td>
              <div class="inputBox"><input v-model="risingEvent" type="text" maxlength="5" autocomplete="off" class="baseInput"></div>
              <span class="tipAfterInputBox">(1-65535)</span>
            </td>
          </tr>
          <tr>
            <td>Falling Event Index</td>
            <td>
              <div class="inputBox"><input v-model="fallingEvent" type="text" maxlength="5" autocomplete="off" class="baseInput"></div>
              <span class="tipAfterInputBox">(1-65535)</span>
            </td>
          </tr>
          <tr>
            <td>Owner</td>
            <td>
              <div class="inputBox"><input v-model="owner" type="text" maxlength="32" autocomplete="off" class="baseInput"></div>
              <span class="tipAfterInputBox">(32 characters limit)</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Add" @click="onAdd">
      <input type="button" class="btnOutTable" value="Reset" @click="onReset">
    </div>

    <div class="table_title">
      RMON Alarm Table
      <div style="display: inline; float: right;">
        <input type="button" value="Delete All" class="btnInTitle" :disabled="deleteAllDisabled" :class="{ btnDisabled: deleteAllDisabled }" @click="onDeleteAll">
      </div>
    </div>
    <el-table :data="entries" class="tableBox" stripe border empty-text="< < Table is empty > >" :header-cell-style="pageTableHeader" :cell-style="pageTableCell">
      <el-table-column prop="idx" label="Index" />
      <el-table-column prop="interval" label="Interval" />
      <el-table-column prop="variable" label="Variable" />
      <el-table-column prop="sample" label="Sample Type" />
      <el-table-column prop="rising" label="Rising Threshold" />
      <el-table-column prop="falling" label="Falling Threshold" />
      <el-table-column prop="risingEvent" label="Rising Event Index" />
      <el-table-column prop="fallingEvent" label="Falling Event Index" />
      <el-table-column prop="owner" label="Owner" />
      <el-table-column label="Action">
        <template slot-scope="scope">
          <input type="button" class="btnInTable" value="Delete" @click="onDelete(scope.row)">
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'

const MAX31 = Math.pow(2, 31) - 1

export default {
  data() {
    return {
      pageTableHeader,
      pageTableCell,
      index: '',
      interval: '',
      variable: '',
      sample: '1', // 1=Absolute 2=Delta
      rising: '',
      falling: '',
      risingEvent: '',
      fallingEvent: '',
      owner: '',
      entries: []
    }
  },
  computed: {
    deleteAllDisabled() {
      return !this.entries.length
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('rmon_alarm').then(d => {
        this.entries = d.entries || []
      })
    },
    onReset() {
      this.index = ''
      this.interval = ''
      this.variable = ''
      this.sample = '1'
      this.rising = ''
      this.falling = ''
      this.risingEvent = ''
      this.fallingEvent = ''
      this.owner = ''
    },
    async onAdd() {
      const i = Number(this.index)
      if (!Number.isInteger(i) || i < 1 || i > 65535) {
        this.$message.error('Index must be 1-65535.')
        return
      }
      if (!this.variable) {
        this.$message.error('Variable is required.')
        return
      }
      const r = Number(this.rising)
      const f = Number(this.falling)
      if (!Number.isInteger(r) || r < 0 || r > MAX31 || !Number.isInteger(f) || f < 0 || f > MAX31) {
        this.$message.error('Thresholds must be 0-2^31-1.')
        return
      }
      await cgiSet('rmon_alarmAdd', {
        idx: i,
        interval: Number(this.interval) || 0,
        variable: this.variable,
        sample: this.sample === '1' ? 'Absolute value' : 'Delta value',
        rising: r,
        falling: f,
        risingEvent: Number(this.risingEvent) || 0,
        fallingEvent: Number(this.fallingEvent) || 0,
        owner: this.owner
      })
      this.onReset()
      this.load()
    },
    async onDelete(row) {
      await this.$confirm(`Delete entry ${row.idx}?`, 'Warning', { type: 'warning' })
      await cgiSet('rmon_alarmDel', { idx: row.idx }, { successMsg: false })
      this.load()
    },
    async onDeleteAll() {
      await this.$confirm('Delete all entries?', 'Warning', { type: 'warning' })
      await cgiSet('rmon_alarmDel', { all: 1 }, { successMsg: false })
      this.load()
    }
  }
}
</script>

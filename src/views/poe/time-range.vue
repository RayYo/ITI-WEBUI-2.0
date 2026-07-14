<template>
  <div class="main_body">
    <div id="basetitle">Time Range</div>
    <div>
      <div class="table_title">Time Range</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Range Name</td>
            <td colspan="7">
              <div style="display: inline-block; width: 50%">
                <input v-model="name" type="text" maxlength="32" placeholder="32 chars" autocomplete="off" class="baseInput">
              </div>
              <input v-model="daily" type="checkbox" class="tipAfterInputBox"> Daily
            </td>
          </tr>
          <tr>
            <td>From:Week</td>
            <td colspan="2">
              <select v-model="fromWeek" style="width: 40% !important">
                <option v-for="w in WEEKS" :key="w.value" :value="w.value">{{ w.label }}</option>
              </select>
            </td>
            <td colspan="2">To:Week</td>
            <td colspan="3">
              <select v-model="toWeek" style="width: 40% !important" :class="{ disabledStyle: endWeekday }" :disabled="endWeekday">
                <option v-for="w in WEEKS" :key="w.value" :value="w.value">{{ w.label }}</option>
              </select>{{ ' ' }}
              <input v-model="endWeekday" type="checkbox">
              <span class="tipAfterInputBox">End Weekday</span>
            </td>
          </tr>
          <tr>
            <td>From: Time (HH:MM)</td>
            <td colspan="2">
              <select v-model="fromHour" style="width: 40% !important">
                <option v-for="h in HOURS" :key="h" :value="h">{{ h }}</option>
              </select>{{ ' ' }}
              <select v-model="fromMin" style="width: 40% !important">
                <option v-for="m in MINS" :key="m" :value="m">{{ m }}</option>
              </select>
            </td>
            <td colspan="2">To:Time (HH:MM)</td>
            <td colspan="3">
              <select v-model="toHour" style="width: 40% !important">
                <option v-for="h in HOURS" :key="h" :value="h">{{ h }}</option>
              </select>{{ ' ' }}
              <select v-model="toMin" style="width: 40% !important">
                <option v-for="m in MINS" :key="m" :value="m">{{ m }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>

      <div class="table_title">Time Range Table</div>
      <el-table
        v-loading="loading"
        :data="rows"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="name" label="Range Name" min-width="300" />
        <el-table-column prop="startWeek" label="Start Weekday" min-width="120" />
        <el-table-column prop="endWeek" label="End Weekday" min-width="120" />
        <el-table-column prop="startTime" label="Start Time" min-width="100" />
        <el-table-column prop="endTime" label="End Time" min-width="100" />
        <el-table-column label="Action" min-width="150">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Delete Periodic" @click="onDeletePeriodic(scope.row)">
          </template>
        </el-table-column>
        <el-table-column label="Action" min-width="100">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Delete" @click="onDelete(scope.row)">
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 10px; margin-bottom: 10px">
        <span class="note">Note: PoE will be disabled when the system time runs into the time range attached to the PoE port.</span>
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import message from '@/utils/message'

const WEEKS = [
  { value: '1', label: 'Sun' }, { value: '2', label: 'Mon' }, { value: '3', label: 'Tue' },
  { value: '4', label: 'Wed' }, { value: '5', label: 'Thu' }, { value: '6', label: 'Fri' }, { value: '7', label: 'Sat' }
]
const pad2 = n => String(n).padStart(2, '0')
const HOURS = Array.from({ length: 24 }, (_, i) => pad2(i))
const MINS = Array.from({ length: 60 }, (_, i) => pad2(i))

export default {
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      WEEKS,
      HOURS,
      MINS,
      name: '',
      daily: false,
      fromWeek: '1',
      toWeek: '1',
      fromHour: '00',
      fromMin: '00',
      toHour: '00',
      toMin: '00',
      endWeekday: false,
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_poeTimeRange').then(d => {
        const wk = v => (WEEKS.find(w => w.value === String(v)) || {}).label || v
        this.rows = (d.list || []).map(e => ({
          name: e.name,
          startWeek: wk(e.fromWeek),
          endWeek: wk(e.toWeek),
          startTime: e.fromTime,
          endTime: e.toTime
        }))
      }).finally(() => { this.loading = false })
    },
    onApply() {
      if (!this.name) { message.warnBox('Please input a Range Name.'); return }
      cgiSet('net_poeTimeRangeAdd', {
        name: this.name,
        daily: this.daily ? 1 : 0,
        fromWeek: this.fromWeek,
        toWeek: this.toWeek,
        fromTime: `${this.fromHour}:${this.fromMin}`,
        toTime: `${this.toHour}:${this.toMin}`
      }).then(() => { this.name = ''; this.load() })
    },
    onDeletePeriodic(row) {
      message.confirmWarnBox(`Do you want to delete the periodic time of ${row.name} ?`, 'Please confirm').then(async() => {
        await cgiSet('net_poeTimeRangeDelPeriodic', { name: row.name }, { successMsg: false })
        this.load()
      }).catch(() => {})
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete ${row.name} ?`, 'Please confirm').then(async() => {
        await cgiSet('net_poeTimeRangeDel', { name: row.name }, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

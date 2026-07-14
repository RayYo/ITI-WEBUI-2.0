<template>
  <div class="main_body">
    <div id="basetitle">IGMP Snooping Settings</div>
    <div>
      <common-table
        header-title="IGMP Snooping Settings"
        :first-column="['IGMP Snooping Status', 'Aging Timeout', 'Querier Status', 'Fast Leave Status', 'Query Interval', 'Max Response Time', 'Robustness Variable', 'Last Member Query Interval', 'Router Timeout']"
      >
        <template #0>
          <select v-model="status">
            <option value="1">Enabled</option>
            <option value="2">Disabled</option>
          </select>
        </template>
        <template #1>
          <base-input v-model="agingTimeout" max-len="6" :disabled="off" @check="onlyNum('agingTimeout')" />
          <span class="tipAfterInputBox">Sec. (130-153025)</span>
        </template>
        <template #2>
          <select v-model="querierStatus" :class="{ disabledStyle: off }" :disabled="off">
            <option value="1">Enabled</option>
            <option value="2">Disabled</option>
          </select>
        </template>
        <template #3>
          <select v-model="fastLeaveStatus" :class="{ disabledStyle: off }" :disabled="off">
            <option value="1">Enabled</option>
            <option value="2">Disabled</option>
          </select>
        </template>
        <template #4>
          <base-input v-model="queryInterval" max-len="4" :disabled="off" @check="onlyNum('queryInterval')" />
          <span class="tipAfterInputBox">Sec. (60-600)</span>
        </template>
        <template #5>
          <base-input v-model="maxResponseTime" max-len="4" :disabled="off" @check="onlyNum('maxResponseTime')" />
          <span class="tipAfterInputBox">Sec. (10-25)</span>
        </template>
        <template #6>
          <base-input v-model="robustness" max-len="4" :disabled="off" @check="onlyNum('robustness')" />
          <span class="tipAfterInputBox">Times. (2-255)</span>
        </template>
        <template #7>
          <base-input v-model="lastMemberQueryInterval" max-len="4" :disabled="off" @check="onlyNum('lastMemberQueryInterval')" />
          <span class="tipAfterInputBox">Sec. (1-25)</span>
        </template>
        <template #8>
          <base-input v-model="routerTimeout" max-len="4" :disabled="off" @check="onlyNum('routerTimeout')" />
          <span class="tipAfterInputBox">Sec. (120-1200)</span>
        </template>
      </common-table>
      <div class="leftten" style="margin-top: 10px">
        <span class="note">Note: The Aging Timeout will be computed automatically in Querier Enabled by (Robustness Variable * Query Interval + Max Response Time).</span>
      </div>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>

      <div class="table_title">Multicast Group Entries
        <span class="tipInTableTitle">{{ '( Free Entries: ' + free + ', Total Entries: ' + total + ' )' }}</span>
      </div>
      <el-table
        v-loading="loading"
        :data="pageRows"
        class="tableBox"
        stripe
        border
        empty-text="< < Table is empty > >"
        :header-cell-style="pageTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column prop="vlan" label="VLANIndex" min-width="120" />
        <el-table-column prop="groupAddr" label="Multicast Group Address" min-width="220" />
        <el-table-column prop="memberPorts" label="Member Ports" min-width="160" />
      </el-table>
      <el-pagination
        :current-page.sync="page"
        :page-size.sync="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 20, 40]"
        :total="groups.length"
      />
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import message from '@/utils/message'
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'
import { pageTableHeader, pageTableCell } from '@/utils/emu'

export default {
  components: { commonTable, baseInput },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      status: '2',
      agingTimeout: '260',
      querierStatus: '2',
      fastLeaveStatus: '2',
      queryInterval: '125',
      maxResponseTime: '10',
      robustness: '2',
      lastMemberQueryInterval: '1',
      routerTimeout: '250',
      groups: [],
      free: 256,
      total: 0,
      page: 1,
      pageSize: 20
    }
  },
  computed: {
    off() {
      // IGMP Snooping 关闭时,除 Status 下拉外其余控件禁用置灰(与原版一致)
      return this.status !== '1'
    },
    pageRows() {
      const start = (this.page - 1) * this.pageSize
      return this.groups.slice(start, start + this.pageSize)
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_igmpSettings').then(d => {
        this.status = d.status ? '1' : '2'
        this.querierStatus = d.querierStatus ? '1' : '2'
        this.fastLeaveStatus = d.fastLeaveStatus ? '1' : '2'
        this.agingTimeout = String(d.agingTimeout != null ? d.agingTimeout : 260)
        this.queryInterval = String(d.queryInterval != null ? d.queryInterval : 125)
        this.maxResponseTime = String(d.maxResponseTime != null ? d.maxResponseTime : 10)
        this.robustness = String(d.robustness != null ? d.robustness : 2)
        this.lastMemberQueryInterval = String(d.lastMemberQueryInterval != null ? d.lastMemberQueryInterval : 1)
        this.routerTimeout = String(d.routerTimeout != null ? d.routerTimeout : 250)
        this.groups = d.groups || []
        this.free = d.free != null ? d.free : 256
        this.total = d.total != null ? d.total : (d.groups || []).length
      }).finally(() => { this.loading = false })
    },
    onlyNum(key) {
      this[key] = this[key].replace(/[^0-9]/g, '')
    },
    onApply() {
      if (this.status === '1') {
        const checks = [
          ['Aging Timeout', this.agingTimeout, 130, 153025],
          ['Query Interval', this.queryInterval, 60, 600],
          ['Max Response Time', this.maxResponseTime, 10, 25],
          ['Robustness Variable', this.robustness, 2, 255],
          ['Last Member Query Interval', this.lastMemberQueryInterval, 1, 25],
          ['Router Timeout', this.routerTimeout, 120, 1200]
        ]
        for (const [label, val, min, max] of checks) {
          const n = Number(val)
          if (val === '' || !Number.isInteger(n) || n < min || n > max) {
            message.warnBox(`${label} must be an integer within ${min}-${max}.`)
            return
          }
        }
      }
      cgiSet('net_igmpSettings', {
        status: this.status === '1' ? 1 : 0,
        querierStatus: this.querierStatus === '1' ? 1 : 0,
        fastLeaveStatus: this.fastLeaveStatus === '1' ? 1 : 0,
        agingTimeout: this.agingTimeout,
        queryInterval: this.queryInterval,
        maxResponseTime: this.maxResponseTime,
        robustness: this.robustness,
        lastMemberQueryInterval: this.lastMemberQueryInterval,
        routerTimeout: this.routerTimeout
      }).then(() => this.load())
    }
  }
}
</script>

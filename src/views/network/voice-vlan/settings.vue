<template>
  <div class="main_body">
    <div id="basetitle">Voice VLAN Settings</div>
    <div>
      <common-table header-title="Voice VLAN Status" :first-column="['Voice VLAN']">
        <template #0>
          <select v-model="status">
            <option value="1">Enabled</option>
            <option value="2">Disabled</option>
          </select>
        </template>
      </common-table>
      <div style="margin-top: 10px; margin-bottom: 10px">
        <span class="note">Note: Disabling will turn off the function and return all values to default.</span>
      </div>

      <common-table header-title="Voice VLAN Global Settings" :first-column="['VLAN ID:', 'Aging Time', 'Cos:']">
        <template #0>
          <select v-model="vlanId" :class="{ disabledStyle: off }" :disabled="off">
            <option v-for="v in vlanOptions" :key="v" :value="String(v)">{{ v }}</option>
          </select>
        </template>
        <template #1>
          <base-input v-model="agingTime" max-len="3" :disabled="off" @check="onlyNumAging" />&nbsp;&nbsp;(1-120 hours)
        </template>
        <template #2>
          <select v-model="cos" :class="{ disabledStyle: off }" :disabled="off">
            <option v-for="c in 8" :key="c - 1" :value="String(c - 1)">{{ c - 1 }}</option>
          </select>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>
    </div>

    <div class="table_title">Voice VLAN Port Settings Table</div>
    <port-edit-table
      :columns="columns"
      :rows="rows"
      min-width="900px"
      :disabled="off"
      :loading="loading"
      :header-cell-style="pageTableHeader"
      @apply="onApplyPort"
    />
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader } from '@/utils/emu'
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'
import PortEditTable from '@/components/Emu/PortEditTable.vue'

const EN_DIS = [{ value: '1', label: 'Enabled' }, { value: '2', label: 'Disabled' }]
const IGNORE = { value: '0', label: 'Ignore' }

export default {
  components: { commonTable, baseInput, PortEditTable },
  data() {
    return {
      loading: false,
      pageTableHeader,
      status: '2',
      vlanId: '',
      agingTime: '',
      cos: '0',
      vlanOptions: [],
      columns: [
        { prop: 'port', label: 'Port', minWidth: 150, type: 'text' },
        { prop: 'autoDetection', label: 'Auto Detection', minWidth: 290, type: 'select', options: EN_DIS, allExtra: IGNORE },
        { prop: 'state', label: 'Status', minWidth: 230, type: 'text' },
        { label: 'Action', minWidth: 230, type: 'action' }
      ],
      rows: []
    }
  },
  computed: {
    // Voice VLAN Disabled 时,全局设置字段与端口表控件均禁用置灰(原版逻辑)
    off() {
      return this.status === '2'
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_voiceVlanSettings').then(d => {
        this.status = d.status ? '1' : '2'
        this.vlanOptions = d.vlanList || []
        this.vlanId = String(d.vlanId != null ? d.vlanId : (this.vlanOptions[0] || ''))
        this.agingTime = String(d.agingTime != null ? d.agingTime : '')
        this.cos = String(d.cos != null ? d.cos : 0)
        const all = { port: 'All', autoDetection: '0', state: '-' }
        this.rows = [all].concat((d.ports || []).map(p => ({
          port: p.port,
          autoDetection: p.autoDetection ? '1' : '2',
          state: p.state || 'None'
        })))
      }).finally(() => { this.loading = false })
    },
    onlyNumAging() {
      this.agingTime = this.agingTime.replace(/[^0-9]/g, '')
    },
    onApply() {
      cgiSet('net_voiceVlanSettingsEdit', {
        status: this.status === '1' ? 1 : 0,
        vlanId: this.vlanId,
        agingTime: this.agingTime,
        cos: this.cos
      }).then(() => this.load())
    },
    onApplyPort(row) {
      const isAll = row.port === 'All'
      const payload = isAll ? { all: 1 } : { port: row.port }
      if (row.autoDetection !== '0') payload.autoDetection = row.autoDetection === '1' ? 1 : 0
      cgiSet('net_voiceVlanPortEdit', payload).then(() => this.load())
    }
  }
}
</script>

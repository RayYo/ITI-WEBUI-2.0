<template>
  <div class="main_body">
    <div id="basetitle">LLDP Global Settings</div>
    <div>
      <!-- LLDP Global Settings -->
      <common-table header-title="LLDP Global Settings" :first-column="['LLDP Status']">
        <template #0>
          <select v-model="status">
            <option value="1">Enabled</option>
            <option value="2">Disabled</option>
          </select>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApplyStatus">
      </div>

      <!-- LLDP-MED Parameter Settings -->
      <common-table header-title="LLDP-MED Parameter Settings" :first-column="['Fast Start Repeat Count']">
        <template #0>
          <base-input v-model="fastStart" max-len="1024" />
          <span class="tipAfterInputBox">Times.&nbsp;(1-10)</span>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApplyMedParam">
      </div>

      <!-- LLDP Parameter Settings -->
      <common-table
        header-title="LLDP Parameter Settings"
        :first-column="['Message TX Hold Multiplier', 'Message TX Interval', 'LLDP Reinit Delay', 'LLDP TX Delay']"
      >
        <template #0>
          <base-input v-model="txHold" max-len="1024" />
          <span class="tipAfterInputBox">(2-10)</span>
        </template>
        <template #1>
          <base-input v-model="txInterval" max-len="1024" />
          <span class="tipAfterInputBox">Sec.&nbsp;(5-32768)</span>
        </template>
        <template #2>
          <base-input v-model="reinitDelay" max-len="1024" />
          <span class="tipAfterInputBox">Sec.&nbsp;(1-10)</span>
        </template>
        <template #3>
          <base-input v-model="txDelay" max-len="1024" />
          <span class="tipAfterInputBox">Sec.&nbsp;(1-8192)</span>
        </template>
      </common-table>
      <div style="margin-top: 10px; margin-bottom: 10px">
        <span class="note">Note : (LLDP TX Delay ) &lt;= (0.25* (Message TX Interval)) and (Message TX Interval)*(Message TX Hold Multiplier) &lt; 65535.</span>
      </div>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApplyParam">
      </div>

      <!-- LLDP System Information(只读) -->
      <common-table
        header-title="LLDP System Information"
        :first-column="['Chassis ID Subtype', 'Chassis ID', 'System Name', 'System Description']"
      >
        <template #0><span>{{ sys.chassisSubtype }}</span></template>
        <template #1><span>{{ sys.chassisId }}</span></template>
        <template #2><span>{{ sys.sysName }}</span></template>
        <template #3><span>{{ sys.sysDesc }}</span></template>
      </common-table>

      <!-- LLDP-MED System Information -->
      <common-table
        header-title="LLDP-MED System Information"
        :first-column="['Device Class', 'Hardware Revision', 'Firmware Revision', 'Software Revision', 'Serial Number', 'Manufacturer Name', 'Mode Name', 'Asset ID']"
      >
        <template #0><span>{{ med.deviceClass }}</span></template>
        <template #1><span>{{ med.hwRev }}</span></template>
        <template #2><span>{{ med.fwRev }}</span></template>
        <template #3><span>{{ med.swRev }}</span></template>
        <template #4><span>{{ med.serial }}</span></template>
        <template #5><span>{{ med.manufacturer }}</span></template>
        <template #6><span>{{ med.modeName }}</span></template>
        <template #7>
          <base-input v-model="assetId" max-len="32" />
          <span class="tipAfterInputBox">&nbsp;&nbsp;(32 Alphanumeric Characters max)</span>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApplyAsset">
      </div>
    </div>

    <!-- LLDP Port State Settings -->
    <div class="table_title">LLDP Port State Settings</div>
    <port-edit-table
      :columns="columns"
      :rows="rows"
      min-width="1000px"
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

// 原版 State:Disabled=4 / RxTx=3 / RxOnly=2 / TxOnly=1
const STATE_OPTS = [
  { value: '4', label: 'Disabled' },
  { value: '3', label: 'RxTx' },
  { value: '2', label: 'RxOnly' },
  { value: '1', label: 'TxOnly' }
]

export default {
  components: { commonTable, baseInput, PortEditTable },
  data() {
    return {
      loading: false,
      pageTableHeader,
      status: '2',
      fastStart: '',
      txHold: '',
      txInterval: '',
      reinitDelay: '',
      txDelay: '',
      assetId: '',
      sys: {},
      med: {},
      columns: [
        { prop: 'port', label: 'Port', minWidth: 200, type: 'text' },
        { prop: 'state', label: 'State', minWidth: 400, type: 'select', options: STATE_OPTS },
        { label: 'Action', minWidth: 300, type: 'action' }
      ],
      rows: []
    }
  },
  computed: {
    // LLDP Disabled 时端口 State 表禁用置灰(原版逻辑)
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
      cgiGet('net_lldpSettings').then(d => {
        this.status = d.status ? '1' : '2'
        this.fastStart = String(d.fastStart != null ? d.fastStart : '')
        this.txHold = String(d.txHold != null ? d.txHold : '')
        this.txInterval = String(d.txInterval != null ? d.txInterval : '')
        this.reinitDelay = String(d.reinitDelay != null ? d.reinitDelay : '')
        this.txDelay = String(d.txDelay != null ? d.txDelay : '')
        this.assetId = d.assetId || ''
        this.sys = d.sys || {}
        this.med = d.med || {}
        this.rows = (d.ports || []).map(p => ({ port: p.port, state: String(p.state != null ? p.state : 4) }))
      }).finally(() => { this.loading = false })
    },
    onApplyStatus() {
      cgiSet('net_lldpSettingsEdit', { status: this.status === '1' ? 1 : 0 }).then(() => this.load())
    },
    onApplyMedParam() {
      cgiSet('net_lldpSettingsEdit', { fastStart: this.fastStart })
    },
    onApplyParam() {
      cgiSet('net_lldpSettingsEdit', {
        txHold: this.txHold,
        txInterval: this.txInterval,
        reinitDelay: this.reinitDelay,
        txDelay: this.txDelay
      })
    },
    onApplyAsset() {
      cgiSet('net_lldpSettingsEdit', { assetId: this.assetId })
    },
    onApplyPort(row) {
      cgiSet('net_lldpPortStateEdit', { port: row.port, state: row.state }).then(() => this.load())
    }
  }
}
</script>

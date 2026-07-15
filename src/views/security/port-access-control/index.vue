<template>
  <div class="main_body">
    <div id="basetitle">Port Access Control Settings</div>
    <div>
      <div class="table_title">Port Access Control Settings</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>NAS ID</td>
            <td><base-input v-model="nasId" max-len="16" /></td>
          </tr>
          <tr>
            <td>Port Access Control Status</td>
            <td>
              <select v-model="status">
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Authentication Method</td>
            <td>
              <select v-model="authMethod">
                <option value="1">RADIUS</option>
                <option value="2">TACACS+</option>
                <option value="3">Local</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
        <input type="button" class="btnOutTable" value="Settings" @click="panel = 'settings'">
        <input type="button" class="btnOutTable" value="Configuration Status" @click="onStatus">
      </div>

      <!-- Port Access Settings -->
      <div v-if="panel === 'settings'">
        <div class="table_title">Port Access Settings</div>
        <table border="" cellspacing="0" class="from_table">
          <tbody>
            <tr>
              <td>Port</td>
              <td>
                <select v-model="ps.port">
                  <option v-for="p in 28" :key="p" :value="String(p)">{{ p }}</option>
                </select>
                <input type="button" class="btnInTable btnDisabled" value="Initialize" disabled>
              </td>
            </tr>
            <tr>
              <td>Authentication Mode</td>
              <td>
                <select v-model="ps.authMode">
                  <option value="1">802.1x</option>
                  <option value="2">MAC Based</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Port Control</td>
              <td>
                <select v-model="ps.portControl">
                  <option value="1">Force Unauthorized</option>
                  <option value="2">Auto</option>
                  <option value="3">Force Authorized</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Re-authentication Status</td>
              <td>
                <select v-model="ps.reAuthStatus" :class="{ disabledStyle: ps.authMode === '2' }" :disabled="ps.authMode === '2'">
                  <option value="1">Enabled</option>
                  <option value="2">Disabled</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Supplicant Mode</td>
              <td>
                <select v-model="ps.supplicantMode">
                  <option value="1">Multiple</option>
                  <option value="2">Single</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Piggyback Mode</td>
              <td>
                <select v-model="ps.piggyback" :class="{ disabledStyle: ps.supplicantMode === '1' }" :disabled="ps.supplicantMode === '1'">
                  <option value="1">Enabled</option>
                  <option value="2">Disabled</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>VLAN Assignment</td>
              <td>
                <select v-model="ps.vlanAssign">
                  <option value="1">Enabled</option>
                  <option value="2">Disabled</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Secure VLAN</td>
              <td>
                <select v-model="ps.secureVlan" :class="{ disabledStyle: ps.vlanAssign === '2' }" :disabled="ps.vlanAssign === '2'">
                  <option value="1">ON</option>
                  <option value="2">OFF</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Guest VLAN ID</td>
              <td>
                <base-input v-model="ps.guestVlan" max-len="4" />
                <span class="tipAfterInputBox">(1 - 4094)</span>
              </td>
            </tr>
            <tr>
              <td>Transmission Period</td>
              <td>
                <base-input v-model="ps.transPeriod" max-len="5" />
                <span class="tipAfterInputBox">Sec&nbsp;(1 - 65535)</span>
              </td>
            </tr>
            <tr>
              <td>Quiet Period</td>
              <td>
                <base-input v-model="ps.quietPeriod" max-len="5" />
                <span class="tipAfterInputBox">Sec&nbsp;(1 - 65535)</span>
              </td>
            </tr>
            <tr>
              <td>Supplicant Timeout</td>
              <td>
                <base-input v-model="ps.supplicantTimeout" max-len="5" />
                <span class="tipAfterInputBox">Sec&nbsp;(1 - 65535)</span>
              </td>
            </tr>
            <tr>
              <td>Maximum Request</td>
              <td>
                <base-input v-model="ps.maxRequest" max-len="2" />
                <span class="tipAfterInputBox">(1 - 10)</span>
              </td>
            </tr>
            <tr>
              <td>Re-authentication Period</td>
              <td>
                <base-input v-model="ps.reAuthPeriod" max-len="5" />
                <span class="tipAfterInputBox">Sec&nbsp;(1 - 65535)</span>
              </td>
            </tr>
            <tr>
              <td>Server Timeout</td>
              <td>
                <base-input v-model="ps.serverTimeout" max-len="5" />
                <span class="tipAfterInputBox">Sec&nbsp;(1 - 65535)</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div>
          <p class="note">Note:In MAC based-authentication mode,re-authentication status is always "Enabled",and default period is 600 sec.</p>
          <input type="button" class="btnOutTable" value="Apply" @click="onApplySettings">
          <input type="button" class="btnOutTable" value="Cancel" @click="panel = ''">
        </div>
      </div>

      <!-- Configuration Status -->
      <div v-if="panel === 'status'">
        <div class="table_title">Current Settings Status</div>
        <table border="" cellspacing="0" class="from_table">
          <tbody>
            <tr><td>NAS ID</td><td>{{ cur.nasId }}</td></tr>
            <tr><td>802.1x Port Access</td><td>{{ cur.access }}</td></tr>
            <tr><td>Authentication Method</td><td>{{ cur.method }}</td></tr>
          </tbody>
        </table>
        <el-table
          :data="statusRows"
          class="tableBox"
          stripe
          border
          :header-cell-style="pageTableHeader"
          :cell-style="pageTableCell"
        >
          <el-table-column prop="port" label="Port" min-width="107" />
          <el-table-column prop="authMode" label="Auth Mode" min-width="152" />
          <el-table-column prop="portControl" label="Port Control" min-width="271" />
          <el-table-column prop="authStatus" label="Auth Status" min-width="169" />
          <el-table-column prop="supplicantMode" label="Supplicant Mode" min-width="220" />
          <el-table-column prop="piggyback" label="Piggyback" min-width="169" />
          <el-table-column prop="mac" label="Authorized MAC Address" min-width="373" />
          <el-table-column prop="vlanList" label="VLAN List" min-width="169" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import baseInput from '@/components/CustomInput/base-input.vue'

const METHOD = { 1: 'RADIUS', 2: 'TACACS+', 3: 'Local' }

export default {
  components: { baseInput },
  data() {
    return {
      pageTableHeader,
      pageTableCell,
      panel: '',
      nasId: 'Nas1',
      status: '2',
      authMethod: '3',
      ps: {
        port: '1', authMode: '1', portControl: '2', reAuthStatus: '2', supplicantMode: '1',
        piggyback: '2', vlanAssign: '2', secureVlan: '2', guestVlan: '',
        transPeriod: '30', quietPeriod: '60', supplicantTimeout: '30', maxRequest: '2',
        reAuthPeriod: '3600', serverTimeout: '30'
      },
      cur: { nasId: '', access: '', method: '' },
      statusRows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('sec_portAccessControl').then(d => {
        this.nasId = d.nasId != null ? d.nasId : 'Nas1'
        this.status = d.status ? '1' : '2'
        this.authMethod = String(d.authMethod != null ? d.authMethod : 3)
      })
    },
    onApply() {
      cgiSet('sec_portAccessControlEdit', {
        nasId: this.nasId,
        status: this.status === '1' ? 1 : 0,
        authMethod: this.authMethod
      })
    },
    onApplySettings() {
      cgiSet('sec_portAccessSettingsEdit', { port: this.ps.port, ...this.ps })
    },
    onStatus() {
      this.panel = 'status'
      cgiGet('sec_portAccessStatus').then(d => {
        this.cur = {
          nasId: d.nasId != null ? d.nasId : this.nasId,
          access: d.access || 'Disabled',
          method: METHOD[d.method] || 'Local'
        }
        this.statusRows = (d.ports || []).map(p => ({
          port: p.port,
          authMode: p.authMode || '802.1x',
          portControl: p.portControl || 'Force Authorized',
          authStatus: p.authStatus || 'Authorized',
          supplicantMode: p.supplicantMode || 'Multiple',
          piggyback: p.piggyback || 'Disabled',
          mac: p.mac || '-',
          vlanList: p.vlanList || '-'
        }))
      })
    }
  }
}
</script>

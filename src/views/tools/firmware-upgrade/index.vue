<template>
  <div class="main_body">
    <div id="basetitle">Firmware Upgrade</div>
    <div>
      <div>
        <div class="table_title">Image Select</div>
        <div>
          <table border="" cellspacing="0" class="from_table">
            <tbody>
              <tr>
                <td>Next Boot Image ID</td>
                <td>
                  <input v-model="nextBoot" value="1" type="radio" name="config">{{ ' ' }}{{ NBSP }}Image1{{ ' ' }}<span class="tipAfterInputBox" />{{ ' ' }}<input v-model="nextBoot" value="2" type="radio" name="config">{{ ' ' }}{{ NBSP }}Image2
                </td>
              </tr>
              <tr>
                <td>Running Image ID</td>
                <td id="RunningImageID">{{ running }}</td>
              </tr>
              <tr>
                <td>Image1 Version</td>
                <td>{{ ver1 }}</td>
              </tr>
              <tr>
                <td>Image2 Version</td>
                <td>{{ ver2 }}</td>
              </tr>
              <tr>
                <td>Upgrade Mode</td>
                <td>
                  <select id="UpgradeMode" v-model="mode" style="width: 40% !important">
                    <option value="1">Firmware Auto Upgrade Settings</option>
                    <option value="2">Via HTTP Settings</option>
                    <option value="3">Via TFTP Settings</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="margin1015">
            <input type="button" class="btnOutTable" value="Apply" @click="onApplyImage">
          </div>
        </div>
      </div>

      <!-- Upgrade Mode=1:Firmware Auto Upgrade Settings -->
      <div v-show="mode === '1'">
        <div class="table_title">Firmware Auto Upgrade Settings</div>
        <table border="" cellspacing="0" class="from_table">
          <tbody>
            <tr>
              <td>New Version</td>
              <td>{{ newVersion }}</td>
            </tr>
            <tr>
              <td>New Description</td>
              <td>{{ newDesc }}</td>
            </tr>
            <tr>
              <td>Operate</td>
              <td>
                <input id="Immediately" v-model="operate" value="1" type="radio" name="FwUpgradeOperate" class="tipAfterInputBox">{{ ' ' }}<label for="Immediately">Immediately</label>{{ ' ' }}<input id="Timing" v-model="operate" value="2" type="radio" name="FwUpgradeOperate" class="tipAfterInputBox">{{ ' ' }}<label for="Timing">Timing</label>
              </td>
            </tr>
            <tr>
              <td>From:Week</td>
              <td>
                <select v-model="fromWeek" :disabled="immediate" :class="{ disabledStyle: immediate }" style="width: 40% !important">
                  <option v-for="w in weeks" :key="w.value" :value="w.value">{{ w.label }}</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>To:Week</td>
              <td>
                <select v-model="toWeek" :disabled="immediate" :class="{ disabledStyle: immediate }" style="width: 40% !important">
                  <option v-for="w in weeks" :key="w.value" :value="w.value">{{ w.label }}</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>From: Time (HH:MM)</td>
              <td>
                <select v-model="fromHH" :disabled="immediate" :class="{ disabledStyle: immediate }" style="width: 40% !important">
                  <option v-for="h in 24" :key="h" :value="String(h - 1)">{{ pad2(h - 1) }}</option>
                </select>{{ ' ' }}<select v-model="fromMM" :disabled="immediate" :class="{ disabledStyle: immediate }" style="width: 40% !important">
                  <option v-for="m in 60" :key="m" :value="String(m - 1)">{{ pad2(m - 1) }}</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>To:Time (HH:MM)</td>
              <td>
                <select v-model="toHH" :disabled="immediate" :class="{ disabledStyle: immediate }" style="width: 40% !important">
                  <option v-for="h in 24" :key="h" :value="String(h - 1)">{{ pad2(h - 1) }}</option>
                </select>{{ ' ' }}<select v-model="toMM" :disabled="immediate" :class="{ disabledStyle: immediate }" style="width: 40% !important">
                  <option v-for="m in 60" :key="m" :value="String(m - 1)">{{ pad2(m - 1) }}</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Action</td>
              <td>
                <input id="Nothing" v-model="action" value="1" type="radio" name="FwUpgradeAction" class="tipAfterInputBox">{{ ' ' }}<label for="Nothing">Nothing</label>{{ ' ' }}<input id="Reboot" v-model="action" value="2" type="radio" name="FwUpgradeAction" class="tipAfterInputBox">{{ ' ' }}<label for="Reboot">Reboot</label>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="margin1015">
          <input type="button" class="btnOutTable" value="Apply" @click="onApplyAuto">
        </div>
      </div>

      <!-- Upgrade Mode=2:Via HTTP Settings -->
      <div v-show="mode === '2'">
        <div class="table_title">Via HTTP Settings</div>
        <form name="formFwUpgradeHttp" enctype="multipart/form-data" @submit.prevent>
          <table border="" cellspacing="0" class="from_table">
            <tbody>
              <tr>
                <td>Firmware File</td>
                <td><input ref="fwFile" type="file" name="filename" size="40"></td>
              </tr>
              <tr>
                <td>Firmware Backup</td>
                <td>
                  <select v-model="httpBackup">
                    <option value="1">Image1</option>
                    <option value="2">Image2</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
        <div class="margin1015">
          <input type="button" class="btnOutTable" value="Backup" @click="onHttpBackup">
          <input type="button" class="btnOutTable" value="Upgrade" @click="onHttpUpgrade">
        </div>
      </div>

      <!-- Upgrade Mode=3:Via TFTP Settings -->
      <div v-show="mode === '3'">
        <div class="table_title">Via TFTP Settings</div>
        <table border="" cellspacing="0" class="from_table">
          <tbody>
            <tr>
              <td rowspan="2">TFTP Server IP</td>
              <td>
                <base-input v-model="tftpIpv4" max-len="15" :disabled="ipVer !== '1'" />
                <input id="IPv4" v-model="ipVer" value="1" type="radio" name="racal" class="tipAfterInputBox">
                <label for="IPv4">IPv4</label>
              </td>
            </tr>
            <tr>
              <td>
                <base-input v-model="tftpIpv6" max-len="43" :disabled="ipVer !== '2'" />
                <input id="IPv6" v-model="ipVer" value="2" type="radio" name="racal" class="tipAfterInputBox">
                <label for="IPv6">IPv6</label>
              </td>
            </tr>
            <tr>
              <td>Image File Name</td>
              <td>
                <base-input v-model="imageFileName" max-len="64" />
                <span class="tipAfterInputBox">(64 Characters Max.)</span>
              </td>
            </tr>
            <tr>
              <td>Firmware Backup</td>
              <td>
                <select v-model="tftpBackup">
                  <option value="1">Image1</option>
                  <option value="2">Image2</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Retry Count</td>
              <td>
                <base-input v-model="retryCount" max-len="2" @check="onlyNum('retryCount')" />
              </td>
            </tr>
          </tbody>
        </table>
        <div class="margin1015">
          <input type="button" class="btnOutTable" value="Backup" @click="onTftp('backup')">
          <input type="button" class="btnOutTable" value="Upgrade" @click="onTftp('upgrade')">
        </div>
      </div>

      <div style="margin-top: 15px"><span id="transmitingStatus" /></div>
      <div class="note"><span>Note: System will not reset automatically after burning image to flash.</span></div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import message from '@/utils/message'
import baseInput from '@/components/CustomInput/base-input.vue'

const NBSP = '\u00A0'
const WEEKS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w, i) => ({ value: String(i + 1), label: w }))

export default {
  components: { baseInput },
  data() {
    return {
      NBSP,
      weeks: WEEKS,
      nextBoot: '1',
      running: '',
      ver1: '',
      ver2: '',
      mode: '1',
      newVersion: '',
      newDesc: '',
      operate: '1',
      fromWeek: '1',
      toWeek: '1',
      fromHH: '0',
      fromMM: '0',
      toHH: '0',
      toMM: '0',
      action: '1',
      httpBackup: '1',
      ipVer: '1',
      tftpIpv4: '',
      tftpIpv6: '',
      imageFileName: '',
      tftpBackup: '1',
      retryCount: '3'
    }
  },
  computed: {
    immediate() { return this.operate === '1' }
  },
  created() {
    cgiGet('tools_fwUpgrade').then(d => {
      this.nextBoot = String(d.nextBoot)
      this.running = d.running
      this.ver1 = d.ver1
      this.ver2 = d.ver2
      this.newVersion = d.newVersion
      this.newDesc = d.newDesc
    })
  },
  methods: {
    pad2(n) { return String(n).padStart(2, '0') },
    onlyNum(key) { this[key] = this[key].replace(/[^0-9]/g, '') },
    onApplyImage() {
      cgiSet('tools_fwImageSel', { nextBoot: this.nextBoot })
    },
    onApplyAuto() {
      cgiSet('tools_fwAutoUpgrade', {
        operate: this.operate,
        fromWeek: this.fromWeek, toWeek: this.toWeek,
        fromTime: `${this.pad2(this.fromHH)}:${this.pad2(this.fromMM)}`,
        toTime: `${this.pad2(this.toHH)}:${this.pad2(this.toMM)}`,
        action: this.action
      })
    },
    onHttpBackup() {
      cgiSet('tools_fwHttp', { act: 'backup', image: this.httpBackup })
    },
    onHttpUpgrade() {
      const f = this.$refs.fwFile
      if (!f.files || !f.files.length) { message.warnBox('Please select a firmware file.'); return }
      cgiSet('tools_fwHttp', { act: 'upgrade', image: this.httpBackup, file: f.files[0].name })
    },
    onTftp(act) {
      if (this.ipVer === '1') {
        if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(this.tftpIpv4)) { message.warnBox('Invalid IP Address(IPv4).'); return }
      } else {
        if (!/^[0-9a-f:]+$/i.test(this.tftpIpv6) || !this.tftpIpv6.includes(':')) { message.warnBox('Invalid IP Address(IPv6).'); return }
      }
      if (!this.imageFileName) { message.warnBox('Please input Image File Name.'); return }
      if (!/^\d+$/.test(this.retryCount)) { message.warnBox('Please input Retry Count.'); return }
      cgiSet('tools_fwTftp', {
        act,
        ip: this.ipVer === '1' ? this.tftpIpv4 : this.tftpIpv6,
        fileName: this.imageFileName,
        image: this.tftpBackup,
        retry: this.retryCount
      })
    }
  }
}
</script>

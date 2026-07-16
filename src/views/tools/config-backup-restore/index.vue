<template>
  <div class="main_body">
    <div id="basetitle">Backup/Restore</div>
    <div>
      <div>
        <div class="table_title">Configure Select</div>
        <div>
          <table border="" cellspacing="0" class="from_table">
            <tbody>
              <tr>
                <td>Boot Up Configure File</td>
                <td>
                  <input v-model="bootConfig" value="1" type="radio" name="config">{{ NBSP }}Config 1{{ ' ' }}<span class="tipAfterInputBox" />{{ ' ' }}<input v-model="bootConfig" value="2" type="radio" name="config">{{ NBSP }}Config 2
                </td>
              </tr>
              <tr>
                <td>Current Configure File</td>
                <td id="RunningImageID">{{ current }}</td>
              </tr>
            </tbody>
          </table>
          <div class="margin1015">
            <input type="button" class="btnOutTable" value="Apply" @click="onApply">
          </div>
        </div>
      </div>

      <div>
        <div class="table_title">Via HTTP Settings</div>
        <form name="formConfigHttp" enctype="multipart/form-data" @submit.prevent>
          <table border="" cellspacing="0" class="from_table">
            <tbody>
              <tr>
                <td>Select File</td>
                <td><input ref="cfgFile" type="file" name="filename" size="40"></td>
              </tr>
              <tr>
                <td>Config File</td>
                <td>
                  <select v-model="httpConfigFile" :disabled="httpStartup" :class="{ disabledStyle: httpStartup }">
                    <option value="1">Config 1</option>
                    <option value="2">Config 2</option>
                  </select>
                  <input id="startupConfig1" v-model="httpStartup" type="checkbox" name="startupConfig" class="tipAfterInputBox">
                  <label for="startupConfig1" class="tipAfterInputBox">Startup-Config</label>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
        <div class="margin1015">
          <input type="button" class="btnOutTable" value="Backup" @click="onHttp('backup')">
          <input type="button" class="btnOutTable" value="Restore" @click="onHttp('restore')">
        </div>
      </div>

      <div>
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
              <td>Config File</td>
              <td>
                <select v-model="tftpConfigFile" :disabled="tftpStartup" :class="{ disabledStyle: tftpStartup }">
                  <option value="1">Config 1</option>
                  <option value="2">Config 2</option>
                </select>
                <input id="startupConfig2" v-model="tftpStartup" type="checkbox" class="tipAfterInputBox">
                <label for="startupConfig2" class="tipAfterInputBox">Startup-Config</label>
              </td>
            </tr>
            <tr>
              <td>Config File Name</td>
              <td>
                <base-input v-model="configFileName" max-len="64" />
                <span class="tipAfterInputBox">(64 Characters Max.)</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="margin1015">
          <input type="button" class="btnOutTable" value="Backup" @click="onTftp('backup')">
          <input type="button" class="btnOutTable" value="Restore" @click="onTftp('restore')">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import message from '@/utils/message'
import baseInput from '@/components/CustomInput/base-input.vue'

const NBSP = '\u00A0'

export default {
  components: { baseInput },
  data() {
    return {
      NBSP,
      bootConfig: '1',
      current: '',
      httpConfigFile: '1',
      httpStartup: true,
      ipVer: '1',
      tftpIpv4: '',
      tftpIpv6: '',
      tftpConfigFile: '1',
      tftpStartup: true,
      configFileName: ''
    }
  },
  created() {
    cgiGet('tools_configFile').then(d => {
      this.bootConfig = String(d.bootConfig)
      this.current = d.current
    })
  },
  methods: {
    onApply() {
      cgiSet('tools_configSel', { bootConfig: this.bootConfig })
    },
    onHttp(act) {
      if (act === 'restore') {
        const f = this.$refs.cfgFile
        if (!f.files || !f.files.length) { message.warnBox('Please select a file.'); return }
      }
      cgiSet('tools_configHttp', {
        act,
        configFile: this.httpStartup ? 'startup' : this.httpConfigFile
      })
    },
    onTftp(act) {
      if (this.ipVer === '1') {
        if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(this.tftpIpv4)) { message.warnBox('Invalid IP Address(IPv4).'); return }
      } else {
        if (!/^[0-9a-f:]+$/i.test(this.tftpIpv6) || !this.tftpIpv6.includes(':')) { message.warnBox('Invalid IP Address(IPv6).'); return }
      }
      if (!this.configFileName) { message.warnBox('Please input Config File Name.'); return }
      cgiSet('tools_configTftp', {
        act,
        ip: this.ipVer === '1' ? this.tftpIpv4 : this.tftpIpv6,
        configFile: this.tftpStartup ? 'startup' : this.tftpConfigFile,
        fileName: this.configFileName
      })
    }
  }
}
</script>

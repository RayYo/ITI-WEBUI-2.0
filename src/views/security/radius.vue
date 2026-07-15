<template>
  <div class="main_body">
    <div id="basetitle">RADIUS</div>
    <div>
      <div class="table_title">RADIUS Settings</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Server Priority</td>
            <td>
              <select v-model="priority">
                <option v-for="p in 5" :key="p" :value="String(p)">{{ p }}</option>
              </select>
              <span class="tipAfterInputBox">(Highest :1, Lowest :5)</span>
            </td>
          </tr>
          <tr>
            <td rowspan="2">Server IP Address</td>
            <td>
              <base-input v-model="ipv4" max-len="15" :disabled="ipVer !== '1'" />
              <input id="IPv4" v-model="ipVer" value="1" type="radio" name="racal" class="tipAfterInputBox">
              <label for="IPv4">IPv4</label>
            </td>
          </tr>
          <tr>
            <td>
              <base-input v-model="ipv6" max-len="43" :disabled="ipVer !== '2'" />
              <input id="IPv6" v-model="ipVer" value="2" type="radio" name="racal" class="tipAfterInputBox">
              <label for="IPv6">IPv6</label>
            </td>
          </tr>
          <tr>
            <td>Server Port</td>
            <td>
              <base-input v-model="serverPort" max-len="5" @check="onlyNum('serverPort')" />
              <span class="tipAfterInputBox">(1 - 65535)</span>
            </td>
          </tr>
          <tr>
            <td>Accounting Port</td>
            <td>
              <base-input v-model="acctPort" max-len="5" @check="onlyNum('acctPort')" />
              <span class="tipAfterInputBox">(1 - 65535)</span>
            </td>
          </tr>
          <tr>
            <td>Shared Secret</td>
            <td>
              <base-input v-model="secret" max-len="32" />
              <span class="tipAfterInputBox">(Maximum length is 32)</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Add" @click="onAdd">
        <input type="button" class="btnOutTable" value="Cancel" @click="onCancel">
      </div>

      <div class="table_title">RADIUS Table</div>
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
        <el-table-column prop="priority" label="Server Priority" min-width="249" />
        <el-table-column prop="ip" label="Server IP Address" min-width="303" />
        <el-table-column prop="serverPort" label="Server Port" min-width="189" />
        <el-table-column prop="acctPort" label="Accounting Port" min-width="246" />
        <el-table-column prop="secret" label="Shared Secret" min-width="227" />
        <el-table-column label="Action" min-width="416">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Delete" @click="onDelete(scope.row)">
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import message from '@/utils/message'
import baseInput from '@/components/CustomInput/base-input.vue'

export default {
  components: { baseInput },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      priority: '1',
      ipVer: '1',
      ipv4: '',
      ipv6: '',
      serverPort: '1812',
      acctPort: '1813',
      secret: '',
      rows: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('sec_radius').then(d => {
        this.rows = (d.list || []).map(e => ({
          priority: e.priority, ip: e.ip, serverPort: e.serverPort, acctPort: e.acctPort, secret: e.secret
        }))
      }).finally(() => { this.loading = false })
    },
    onlyNum(key) {
      this[key] = this[key].replace(/[^0-9]/g, '')
    },
    async onAdd() {
      const ip = this.ipVer === '1' ? this.ipv4 : this.ipv6
      if (!ip) { message.warnBox('Please input a Server IP Address.'); return }
      await cgiSet('sec_radiusAdd', {
        priority: this.priority, ipVer: this.ipVer, ip, serverPort: this.serverPort, acctPort: this.acctPort, secret: this.secret
      })
      this.onCancel()
      this.load()
    },
    onCancel() {
      this.priority = '1'; this.ipVer = '1'; this.ipv4 = ''; this.ipv6 = ''
      this.serverPort = '1812'; this.acctPort = '1813'; this.secret = ''
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete server ${row.ip} ?`, 'Please confirm').then(async() => {
        await cgiSet('sec_radiusDel', { priority: row.priority }, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>

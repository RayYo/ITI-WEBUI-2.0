<template>
  <div class="main_body">
    <div id="basetitle">Denial of Service</div>
    <div>
      <div class="table_title">DoS Settings</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr v-for="item in items" :key="item.key">
            <td>{{ item.label }}</td>
            <td>
              <select v-model="form[item.key]">
                <option value="1">Deny</option>
                <option value="2">Allow</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
        <input type="button" class="btnOutTable" value="Reset to Default" @click="onReset">
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'

const ITEMS = [
  { key: 'land', label: 'Land Attack' },
  { key: 'blat', label: 'Blat Attack' },
  { key: 'tcpNull', label: 'TCP Null Scan' },
  { key: 'tcpXmas', label: 'TCP Xmascan' },
  { key: 'tcpSynFin', label: 'TCP SYN/FIN' },
  { key: 'tcpSynSrc', label: 'TCP SYN SrcPort less 1024' },
  { key: 'tcpTinyFrag', label: 'TCP Tiny Frag Attack' }
]

export default {
  data() {
    return {
      items: ITEMS,
      form: ITEMS.reduce((o, i) => { o[i.key] = '1'; return o }, {})
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('sec_dos').then(d => {
        ITEMS.forEach(i => { this.$set(this.form, i.key, d[i.key] === false ? '2' : '1') })
      })
    },
    onApply() {
      const payload = {}
      ITEMS.forEach(i => { payload[i.key] = this.form[i.key] === '1' ? 1 : 0 })
      cgiSet('sec_dosEdit', payload)
    },
    onReset() {
      ITEMS.forEach(i => { this.form[i.key] = '1' })
      cgiSet('sec_dosReset', {})
    }
  }
}
</script>

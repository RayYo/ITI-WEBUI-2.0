<template>
  <div class="main_body">
    <div id="basetitle">ARP Inspection VLAN</div>
    <div>
      <div class="table_title">ARP Inspection VLAN</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>VID List</td>
            <td>
              <base-input v-model="vidList" max-len="1024" placeholder="1,4-6" />
            </td>
          </tr>
          <tr>
            <td>State</td>
            <td>
              <select v-model="state">
                <option value="1">Enabled</option>
                <option value="2">Disabled</option>
              </select>
            </td>
          </tr>
          <tr>
            <td><span>ARP Inspection Enabled VID</span></td>
            <td>{{ enabledVid }}</td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import baseInput from '@/components/CustomInput/base-input.vue'

export default {
  components: { baseInput },
  data() {
    return {
      vidList: '',
      state: '1',
      enabledVid: ''
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('sec_arpInspectionVlan').then(d => {
        this.enabledVid = d.enabledVid || ''
      })
    },
    onApply() {
      cgiSet('sec_arpInspectionVlanEdit', {
        vidList: this.vidList,
        state: this.state === '1' ? 1 : 0
      }).then(() => this.load())
    }
  }
}
</script>

<template>
  <div class="main_body">
    <div id="basetitle">Forwarding Table Mode</div>
    <div>
      <common-table header-title="Forwarding Table Mode Settings" :first-column="['Learning Mode']">
        <template #0>
          <select v-model="mode">
            <option value="IVL">IVL</option>
            <option value="SVL">SVL</option>
          </select>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import commonTable from '@/components/CustomTable/common-table.vue'

export default {
  components: { commonTable },
  data() {
    return { mode: 'IVL' }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('net_vlanFwdMode').then(d => { this.mode = d.mode || 'IVL' })
    },
    onApply() {
      cgiSet('net_vlanFwdMode', { mode: this.mode })
    }
  }
}
</script>

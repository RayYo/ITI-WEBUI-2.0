<template>
  <div class="main_body">
    <div id="basetitle">GVRP Global Settings</div>
    <div>
      <common-table header-title="GVRP Global Settings" :first-column="['GVRP Status']">
        <template #0>
          <select v-model="status">
            <option value="1">Enabled</option>
            <option value="2">Disabled</option>
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
    return {
      status: '2'
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('net_gvrpGlobal').then(d => {
        this.status = d.status ? '1' : '2'
      })
    },
    onApply() {
      cgiSet('net_gvrpGlobalEdit', { status: this.status === '1' ? 1 : 0 })
    }
  }
}
</script>

<template>
  <div class="main_body">
    <div id="basetitle">Scheduling Algorithm</div>
    <div>
      <common-table header-title="Scheduling Algorithm" :first-column="['Scheduling Algorithm']">
        <template #0>
          <select v-model="algorithm">
            <option value="1">Strict Priority</option>
            <option value="2">Weighted Round Robin</option>
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
      algorithm: '1'
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('net_qosScheduling').then(d => {
        this.algorithm = String(d.algorithm != null ? d.algorithm : 1)
      })
    },
    onApply() {
      cgiSet('net_qosSchedulingEdit', { algorithm: this.algorithm })
    }
  }
}
</script>

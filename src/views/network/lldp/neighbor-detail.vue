<template>
  <div class="main_body">
    <div id="basetitle">LLDP Neighbors Information</div>
    <div>
      <common-table
        header-title="LLDP Neighbor Detail Table"
        :first-column="['Entity', 'Port', 'Chassis ID Subtype', 'Chassis ID', 'Port ID Subtype', 'Port ID', 'Port Description']"
      >
        <template #0><span>{{ info.entity }}</span></template>
        <template #1><span>{{ info.port }}</span></template>
        <template #2><span>{{ info.chassisSubtype }}</span></template>
        <template #3><span>{{ info.chassisId }}</span></template>
        <template #4><span>{{ info.portSubtype }}</span></template>
        <template #5><span>{{ info.portId }}</span></template>
        <template #6><span>{{ info.desc }}</span></template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Previous Page" @click="$router.back()">
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet } from '@/api/cgi'
import commonTable from '@/components/CustomTable/common-table.vue'

export default {
  components: { commonTable },
  data() {
    return {
      info: {}
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('net_lldpNeighbors').then(d => {
        const entity = this.$route.query.entity
        const list = d.list || []
        this.info = list.find(e => String(e.entity) === String(entity)) || list[0] || {}
      })
    }
  }
}
</script>

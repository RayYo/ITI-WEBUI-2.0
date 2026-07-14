<template>
  <div class="main_body">
    <div id="basetitle">LLDP Local Port Information</div>
    <div>
      <common-table
        header-title="LLDP Local Information Table"
        :first-column="['Entity', 'Port', 'Port ID Subtype', 'Port ID', 'Port Description', 'Port PVID', 'VLAN Name Entries Count', 'Protocol Identity Entries Count', 'MAC/PHY Configuration/Status', 'Link Aggregation', 'Maximum Frame Size', 'LLDP-MED Capabilities']"
      >
        <template #0><span>{{ info.entity }}</span></template>
        <template #1><span>{{ info.port }}</span></template>
        <template #2><span>{{ info.subtype }}</span></template>
        <template #3><span>{{ info.portId }}</span></template>
        <template #4><span>{{ info.desc }}</span></template>
        <template #5><span>{{ info.pvid }}</span></template>
        <template #6><a class="href" @click="toggle('vlan')">{{ vlanEntries.length }}</a></template>
        <template #7><a class="href" @click="toggle('proto')">{{ protoEntries.length }}</a></template>
        <template #8><a class="href" @click="toggle('macPhy')">Show Detail</a></template>
        <template #9><a class="href" @click="toggle('linkAgg')">Show Detail</a></template>
        <template #10><span>{{ info.maxFrame }}</span></template>
        <template #11><a class="href" @click="toggle('med')">Show Detail</a></template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Previous Page" @click="$router.back()">
      </div>

      <!-- VLAN Name Entries 明细 -->
      <template v-if="active === 'vlan'">
        <div class="table_title">LLDP Local Port VLAN Detail Table</div>
        <el-table
          :data="vlanEntries"
          class="tableBox"
          stripe
          border
          empty-text="< < Table is empty > >"
          :header-cell-style="pageTableHeader"
          :cell-style="pageTableCell"
        >
          <el-table-column prop="port" label="Port" min-width="80" align="center" />
          <el-table-column prop="vid" label="VID" min-width="80" align="center" />
          <el-table-column prop="name" label="Vlan Name" min-width="80" align="center" />
        </el-table>
      </template>

      <!-- Protocol Identity Entries 明细 -->
      <template v-if="active === 'proto'">
        <div class="table_title">LLDP Local Protocol Identity Detail Table</div>
        <el-table
          :data="protoEntries"
          class="tableBox"
          stripe
          border
          empty-text="< < Table is empty > >"
          :header-cell-style="pageTableHeader"
          :cell-style="pageTableCell"
        >
          <el-table-column prop="port" label="Port" min-width="80" align="center" />
          <el-table-column prop="index" label="Protocol Index" min-width="180" align="center" />
          <el-table-column prop="id" label="Protocol ID" min-width="150" align="center" />
          <el-table-column prop="name" label="Protocol Name" min-width="150" align="center" />
        </el-table>
      </template>

      <!-- MAC/PHY Configuration/Status 明细 -->
      <template v-if="active === 'macPhy'">
        <common-table
          header-title="MAC/PHY Configuration/Status"
          :first-column="['Auto-Negotiation Support', 'Auto-Negotiation Enabled', 'Auto-Negotiation Advertised Capability', 'Auto-Negotiation Operational MAU Type']"
        >
          <template #0><span>{{ macPhy.support }}</span></template>
          <template #1><span>{{ macPhy.enabled }}</span></template>
          <template #2><span>{{ macPhy.advertised }}</span></template>
          <template #3><span>{{ macPhy.mauType }}</span></template>
        </common-table>
      </template>

      <!-- Link Aggregation 明细 -->
      <template v-if="active === 'linkAgg'">
        <common-table
          header-title="Link Aggregation"
          :first-column="['Aggregation Capability', 'Aggregation Status', 'Aggregation Port ID']"
        >
          <template #0><span>{{ linkAgg.capability }}</span></template>
          <template #1><span>{{ linkAgg.status }}</span></template>
          <template #2><span>{{ linkAgg.portId }}</span></template>
        </common-table>
      </template>

      <!-- LLDP-MED Capabilities 明细 -->
      <template v-if="active === 'med'">
        <common-table
          header-title="LLDP-MED Capabilities Support"
          :first-column="['LLDP-MED Capabilities Support', 'Network Policy', 'Location Identification', 'Extended Power Via MDI PSE', 'Extended Power Via MDI PD', 'Inventory']"
        >
          <template #0><span>{{ med.capabilities }}</span></template>
          <template #1><span>{{ med.networkPolicy }}</span></template>
          <template #2><span>{{ med.location }}</span></template>
          <template #3><span>{{ med.powerPse }}</span></template>
          <template #4><span>{{ med.powerPd }}</span></template>
          <template #5><span>{{ med.inventory }}</span></template>
        </common-table>
      </template>
    </div>
  </div>
</template>

<script>
import { cgiGet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import commonTable from '@/components/CustomTable/common-table.vue'

export default {
  components: { commonTable },
  data() {
    return {
      pageTableHeader,
      pageTableCell,
      info: {},
      vlanEntries: [],
      protoEntries: [],
      macPhy: {},
      linkAgg: {},
      med: {},
      // 同时只展开一个明细(再次点击同一项收起)
      active: ''
    }
  },
  created() {
    this.load()
  },
  methods: {
    toggle(name) {
      this.active = this.active === name ? '' : name
    },
    load() {
      cgiGet('net_lldpLocalPortDetail').then(d => {
        const port = this.$route.query.port
        this.info = {
          entity: d.entity,
          port: port != null ? port : d.port,
          subtype: d.subtype,
          portId: port != null ? port : d.portId,
          desc: port != null ? `TPE-2840WS 3.01.007 Port ${String(port).padStart(2, '0')}` : d.desc,
          pvid: d.pvid,
          maxFrame: d.maxFrame
        }
        this.vlanEntries = d.vlanEntries || []
        this.protoEntries = d.protoEntries || []
        this.macPhy = d.macPhy || {}
        this.linkAgg = d.linkAgg || {}
        this.med = d.med || {}
      })
    }
  }
}
</script>

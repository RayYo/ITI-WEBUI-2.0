<template>
  <div>
    <switch-panel
      :copper-group-num="copperGroupNum"
      :port-link-change="portLinkData"
    />
    <!-- 窄窗口时表格横向滚动而非压缩列宽,保证数据与格式完整 -->
    <div class="table-scroll">
      <el-table
        v-loading="loading"
        :data="tableData"
        :style="{ minWidth: isPoe ? '1050px' : '620px' }"
        empty-text="< < Table is empty > >"
        :stripe="true"
        :border="true"
        :header-cell-style="{
          'background': 'rgb(88, 95, 105)',
          'color': 'rgb(255, 255, 255)',
          'font-weight': '700',
          'text-align': 'center',
        }"
        :cell-style="{
          'text-align': 'center'
        }"
      >
        <el-table-column label="Port">
          <template slot-scope="scope">
            <span>{{ scope.row.port }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Throughput">
          <template slot-scope="scope">
            <span>{{ scope.row.throughput+' Mbps' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Loopback Detection">
          <template slot-scope="scope">
            <span>{{ scope.row.loopStatus }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Distance">
          <template slot-scope="scope">
            <span>{{ scope.row.distance }}</span>
          </template>
        </el-table-column>

        <template v-if="isPoe">
          <el-table-column label="PoE On/Off">
            <template slot-scope="scope">
              <el-switch
                v-if="scope.row.poeEnable!=='-'"
                v-model="scope.row.poeEnable"
                active-color="#2AB4A7"
                inactive-color="#BEC1C8"
                active-text="ON"
                inactive-text="OFF"
                @change="poeEnableSet($event, scope.row.port)"
              />
              <span v-else>{{ scope.row.poeEnable }}</span>
            </template>
          </el-table-column>
          <el-table-column label="PoE Status">
            <template slot-scope="scope">
              <span v-if="scope.row.poeStatus !== '-'">{{ 'POWER '+scope.row.poeStatus }}</span>
              <span v-else>{{ scope.row.poeStatus }}</span>
            </template>
          </el-table-column>
          <el-table-column label="PoE Standard">
            <template slot-scope="scope">
              <span>{{ scope.row.poeStandard }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Power Consumption">
            <template slot-scope="scope">
              <span v-if="scope.row.poeConsumption !== '-'">{{ scope.row.poeConsumption+' W' }}</span>
              <span v-else>{{ scope.row.poeConsumption }}</span>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </div>
  </div>
</template>
<script>
import switchPanel from '@/components/Panel'
import { mapGetters } from 'vuex'
import { cgiGet, cgiSet } from '@/api/cgi'

export default {
  components: {
    switchPanel
  },
  data() {
    return {
      copperGroupNum: 0,
      portLinkData: [],
      tableData: [],
      isPoe: false,
      loading: false,
      timer: null
    }
  },
  computed: {
    ...mapGetters([
      'modelInfo'
    ])
  },
  created() {
    this.copperGroupNum = this.modelInfo('copperPortNum') / 8
    if (this.modelInfo('poeNum') > 0) { this.isPoe = true }
    this.loading = true
    this.updateData()
    this.timer = setInterval(this.updateData, 10000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    /** devinfo 端口类型 → 面板 ref(fiber 走 portf<n>) */
    portRefOf(port) {
      const meta = this.modelInfo('ports').find(p => p.port === port)
      return (meta && meta.type === 'fiber') ? `portf${port}` : `port${port}`
    },
    updateData() {
      cgiGet('panel_info').then(d => {
        const rows = []
        const links = []
        for (const p of d.ports || []) {
          rows.push({
            port: p.port,
            throughput: p.throughputMbps || 0,
            loopStatus: p.loopback === 'looped' ? 'Looped' : 'Normal',
            distance: p.distance == null ? '-' : p.distance,
            poeEnable: p.poe ? p.poe.on : '-',
            poeStatus: p.poe ? (p.poe.powering ? 'ON' : 'OFF') : '-',
            poeStandard: p.poe ? p.poe.standard : '-',
            poeConsumption: p.poe ? (p.poe.powerMw || 0) / 1000 : '-'
          })
          links.push({
            portRef: this.portRefOf(p.port),
            linkColor: !p.link ? 'black' : (p.speed >= 1000 ? 'green' : 'orange')
          })
        }
        this.tableData = rows
        this.portLinkData = links
        this.loading = false
      }, err => {
        console.log('panelInfo get error: ', err)
        this.loading = false
      })
    },
    poeEnableSet(v, port) {
      cgiSet('poe_portEdit', { port, enable: v ? 1 : 0 }, { successMsg: false }).catch(() => {
        // 失败回滚开关状态
        const row = this.tableData.find(r => r.port === port)
        if (row) row.poeEnable = !v
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.table-scroll {
  overflow-x: auto;
}
</style>

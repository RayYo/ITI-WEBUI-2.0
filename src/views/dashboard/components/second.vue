<template>
  <div>
    <switch-panel
      :copper-group-num="copperGroupNum"
      :port-link-change="portLinkData"
    />
    <el-table
      v-loading="loading"
      :data="tableData"
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
</template>
<script>
import switchPanel from '@/components/Panel'
import { mapGetters } from 'vuex'

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
    this.updateData()
    this.timer = setInterval(this.updateData, 10000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    updateData() {
      this.loading = true
      this.tableData = []
      this.portLinkData = []
      setTimeout(() => {
        this.$http.get('url_get_panelInfo').then(resp => {
          for (const i in resp.data.ports) {
            const obj = resp.data.ports[i]
            this.tableData.push(obj)
            // port link
            let pRef = ''
            let pColor = ''
            if (obj.port.indexOf('F') !== -1) {
              pRef = 'portf' + obj.port.substr(0, obj.port.length - 1)
            } else {
              pRef = 'port' + obj.port
            }
            if (obj.speed === '1000') {
              pColor = 'green'
            } else {
              pColor = 'orange'
            }
            if (!obj.linkup) {
              pColor = 'black'
            }
            this.portLinkData.push({
              portRef: pRef,
              linkColor: pColor
            })
          }
          this.loading = false
        },
        err => {
          console.log('panelInfo get error: ', err)
          this.loading = false
        })
      }, 1000)
    },
    poeEnableSet(v, port) {
      console.log(port, v)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

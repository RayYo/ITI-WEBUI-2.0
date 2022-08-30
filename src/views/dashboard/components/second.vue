<template>
  <div>
    <switch-panel
      :copper-group-num="copperGroupNum"
      :port-link-change="portLinkData"
    />
    <el-table
      :data="tableData"
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
            <span>{{ scope.row.poeConsumption+' W' }}</span>
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
      portLinkData: {
        portRef: '',
        linkColor: ''
      },
      tableData: [],
      isPoe: false,
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
    this.$http.get('url_get_panelInfo').then(resp => {
      for (const i in resp.data.ports) {
        this.tableData.push(resp.data.ports[i])
      }
    },
    err => {
      console.log('panelInfo get error: ', err)
    })
    this.timer = setInterval(this.updateData, 30000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    updateData() {
      this.portLinkData = {
        portRef: 'port3',
        linkColor: 'green'
      }
    },
    poeEnableSet(v, port) {
      console.log(port, v)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

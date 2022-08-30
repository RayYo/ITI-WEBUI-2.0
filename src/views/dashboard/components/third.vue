<template>
  <div>
    <switch-panel
      :copper-group-num="copperGroupNum"
      :port-link-change="portLinkData"
    />
    <div class="rahama">
      <el-radio-group v-model="radio" @change="radioChange">
        <el-radio v-for="(item, idx) in radioArr" :key="idx" :label="idx+1">{{ item }}</el-radio>
      </el-radio-group>
    </div>
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
      radio: 1,
      radioArr: [],
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
    this.radioArr = ['Status', 'Duplex', 'Speed']
    if (this.modelInfo('poeNum') !== 0) {
      this.radioArr.push('PoE')
    }
    this.timer = setInterval(this.updateData, 3000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    updateData() {
      this.portLinkData = {
        portRef: 'portf27',
        linkColor: 'orange'
      }
    },
    radioChange(v) {
      console.log('Radio change ', v)
    }
  }
}
</script>

<style lang="scss" scoped>
.rahama {
    font-size: 13px;
    text-align: center;
    width: 350px;
    margin: 20px auto 0;
}
</style>

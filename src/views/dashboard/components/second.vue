<template>
  <div>
    <switch-panel
      :copper-group-num="copperGroupNum"
      :port-link-change="portLinkData"
    />
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
    }
  }
}
</script>

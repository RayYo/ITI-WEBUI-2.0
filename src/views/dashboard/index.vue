<template>
  <div class="main_body ds" style="position: relative;">
    <div style="position: absolute; right: 25px; top: 12px;">
      <span>{{ getCurrentTime }}</span>
    </div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="Dashboard" name="first">
        <div>
          <first-view v-if="isFirst" />
        </div>
      </el-tab-pane>
      <el-tab-pane label="Switch View" name="second">
        <div>
          <second-view v-if="isSecond" />
        </div>
      </el-tab-pane>
      <el-tab-pane label="Real-time Statistics" name="third">
        <div>
          <third-view v-if="isThird" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { parseTime } from '@/utils'
import firstView from '@/views/dashboard/components/first.vue'
import secondView from '@/views/dashboard/components/second.vue'
import thirdView from '@/views/dashboard/components/third.vue'

export default {
  components: {
    firstView,
    secondView,
    thirdView
  },
  data() {
    return {
      activeName: 'first',
      isFirst: true,
      isSecond: false,
      isThird: false,
      getCurrentTime: parseTime(new Date(), '{d} {m} {y} {h}:{i}:{s}'),
      timerId: 0
    }
  },
  mounted() {
    this.timerId = setInterval(() => {
      this.getCurrentTime = parseTime(new Date(), '{d} {m} {y} {h}:{i}:{s}')
    }, 1000)
  },
  beforeDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId)
    }
  },
  methods: {
    handleClick(tabVc, event) {
      if (tabVc.name === 'first') {
        this.isFirst = true
        this.isSecond = false
        this.isThird = false
      } else if (tabVc.name === 'second') {
        this.isFirst = false
        this.isSecond = true
        this.isThird = false
      } else if (tabVc.name === 'third') {
        this.isFirst = false
        this.isSecond = false
        this.isThird = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-tabs__item {
  font-size: 18px;
  font-weight: 200;
  &.is-active {
    color: #1890ff;
  }
  &:hover {
    color: #1890ff;
    cursor: pointer;
  }
}
</style>

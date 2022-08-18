<template>
  <div class="main_body" style="position: relative;">
    <div style="position: absolute; right: 25px; top: 12px;">
      <span>{{ getCurrentTime }}</span>
    </div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="Dashboard" name="first">
        <div>
          <first-view />
        </div>
      </el-tab-pane>
      <el-tab-pane label="Switch View" name="second">Switch View</el-tab-pane>
      <el-tab-pane label="Real-time Statistics" name="third">Real-time Statistics</el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { parseTime } from '@/utils'
import firstView from '@/views/dashboard/components/first.vue'

export default {
  components: {
    firstView
  },
  data() {
    return {
      activeName: 'first',
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
      // console.log(tabVc, event) 01 Jan 2021 0:19:57 {y}-{m}-{d} {h}:{i}:{s}
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

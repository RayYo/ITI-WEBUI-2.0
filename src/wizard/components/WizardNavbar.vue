<template>
  <div class="navbar">
    <div class="sidebar-logo-container2 collapse" style="float: left;">
      <img :src="logo" class="logo">
    </div>
    <div class="left-info">{{ modelInfo('modelName') }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      logo: require('@/assets/logo/trendnet_logo.png')
    }
  },
  computed: {
    ...mapGetters([
      'modelInfo'
    ])
  }
}
</script>

<style lang="scss" scoped>

.navbar {
  height: 66px;
  overflow: hidden;
  position: relative;
  background: #16243d;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  padding-right: 10px;

  .sidebar-logo-container2 {
    position: relative;
    width: 200px;
    height: 66px;
    line-height: 66px;
    background: #2e3c56;
    overflow: hidden;
  }
  .sidebar-logo-container2 .logo {
    font-size: 26px;
    margin: 17px;
    text-align: center;
    font-weight: 700;
    width: 65%;
  }
  .left-info {
    color: #fff;
    padding: 22px;
    font-weight: 300;
    font-size: 1.14286rem;
    float: left;
    height: 100%;
  }
}
</style>

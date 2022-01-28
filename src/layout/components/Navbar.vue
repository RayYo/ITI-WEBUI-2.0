<template>
  <div class="navbar">
    <hamburger v-if="isDisplayHambruger" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <div class="left-info">{{ modelName }}</div>

    <div class="right-menu">
      <svg-icon class="menu-item" icon-class="cloud" @click="redirectRoutePath('toCloud')" />
      <svg-icon class="menu-item" icon-class="save-nav" @click="redirectRoutePath('toSave')" />
      <div id="navbar-warning" class="header-warning menu-item" style="display: contents;vertical-align: top;">
        <el-popover
          placement="top-start"
          width="340"
          popper-class="navbar-el-popover"
          trigger="hover"
        >
          <div class="warning_box">
            <div class="warning_top">
              <p class="new_warning">{{ sysLogNum }} NEW MESSAGES</p>
              <a href="#/system/management" class="warning_link">View All</a>
            </div>
            <div class="warning_content">
              <div class="warning_item">
                <div class="item_left">
                  <svg-icon icon-class="critical" />
                </div>
                <div class="item_right">
                  <p>System started up</p>
                  <p />
                  <p>{{ sysStartUpTime }}</p>
                </div>
                <div class="clear_both" />
              </div>
            </div>
          </div>
          <el-badge slot="reference" :value="sysLogNum > 99 ? '99+' : sysLogNum" class="item" type="primary">
            <svg-icon class="menu-item" icon-class="bell" />
          </el-badge>
        </el-popover>
      </div>
      <a href="http://www.trendnet.com/support/support-detail.asp?prod=255_TPE-2840WS" target="_blank">
        <svg-icon class="menu-item" icon-class="info" />
      </a>
      <svg-icon class="menu-item" icon-class="logout" @click="logout" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Hamburger from '@/components/Hamburger'

export default {
  components: {
    Hamburger
  },
  data() {
    return {
      modelName: this.$store.getters.modelInfo('modelName'),
      sysLogNum: 9,
      sysStartUpTime: '01/01/2018 00:01:59'
    }
  },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    isDisplayHambruger() {
      return this.$store.state.app.device === 'mobile'
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    redirectRoutePath(newPath) {
      switch (newPath) {
        case 'toCloud':
          this.$router.push({ path: '/system/cloud' })
          break
        case 'toSave':
          // this.$router.push({ path: '/save/save' })
          this.saveLoading()
          break
        case 'toInfo':
          this.$router.push({ path: '/save/save' })
          break
        default:
          break
      }
    },
    saveLoading() {
      const loading = this.$loading({
        lock: true,
        text: 'Save Settings to Flash',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      // simulation
      setTimeout(() => {
        loading.close()
        this.$message.success('Save Settings to Flash Succeed.')
      }, 1000)
    }
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

  .hamburger-container {
    line-height: 60px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }
  .left-info {
    color: #fff;
    padding: 22px;
    font-weight: 300;
    font-size: 1.14286rem;
    float: left;
    height: 100%;
  }
  .right-menu {
    padding-top: 16px;
    float: right;
    height: 100%;
    line-height: 50px;
    .svg-icon {
      fill: #637193;
    }
    .svg-icon:hover{
      fill: beige;
    }
    .menu-item {
      cursor: pointer;
      width: 27px!important;
      height: 27px!important;
      //vertical-align: 15px!important;
      margin: 0 18px;
    }
  }
}

// reset el-badge
::v-deep .el-badge__content {
  transform: translateY(-5%) translateX(100%)!important;
  border: 0 none !important;
  right: 28px;
}
</style>

<style lang="scss">
// reset el-popover style
.navbar-el-popover {
  top: 66px !important;
  padding: 0!important;
  border: 0!important;
  .popper__arrow {
    border-bottom-color: #e6ebf5 !important;
  }
  .popper__arrow:after {
    border-bottom-color: #2e3c56 !important;
  }

  .warning_box {
    background-color: #2e3c56;
      .warning_top {
      height: 55px;
      border-bottom: 2px solid #4b5770;
      line-height: 55px;
      padding: 0 15px;
      box-sizing: border-box;
      color: #b6bcbf;
      font-weight: 700;
    }
    .new_warning {
      padding: 0;
      margin: 0;
      float: left;
    }
    .warning_link {
      color: #1db9d4;
      float: right;
    }
    .warning_content {
      max-height: 600px;
      overflow: hidden;
    }
    .warning_content .warning_item {
      padding: 20px 20px;
      box-sizing: border-box;
      .clear_both {
        clear: both;
      }
    }
    .warning_content .warning_item .item_left .svg-icon {
      width: 38px!important;
      height: 38px!important;
    }
    .item_left {
      width: 40px;
      height: 100%;
      float: left;
      margin-right: 15px;
    }
    .item_right {
      float: left;
      height: 100%;
      width: 240px;
      p {
        padding: 0;
        margin: 0;
        color: #b6bcbf;
        margin-bottom: 5px;
      }
    }
    .item_right>p:first-child {
      font-size: 16px!important;
    }
    .item_right>p:nth-child(2) {
      font-size: 7px;
    }
    .item_right>p:nth-child(3) {
      font-size: 8px;
      margin-bottom: 0;
      color: #9ca9c4;
    }
  }
}
</style>

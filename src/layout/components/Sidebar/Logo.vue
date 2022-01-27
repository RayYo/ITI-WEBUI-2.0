<template>
  <div class="sidebar-logo-container" :class="{'collapse':collapse}">
    <transition name="sidebarLogoFade">
      <hamburger v-if="collapse" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
      <img v-else :src="logo" class="sidebar-logo">
    </transition>
    <transition name="sidebarLogoFade">
      <hamburger v-if="!collapse" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Hamburger from '@/components/Hamburger'

export default {
  name: 'SidebarLogo',
  components: {
    Hamburger
  },
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      logo: require('@/assets/logo/trendnet_logo.png')
    }
  },
  computed: {
    ...mapGetters([
      'sidebar'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 66px;
  line-height: 66px;
  background: #2e3c56;
  overflow: hidden;

  & .sidebar-logo {
    width: 60%;
    margin: 15px;
  }
  & .hamburger-container {
    height: 100%;
    float: right;
    cursor: pointer;
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>

<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        ref="elMenu"
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="true"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="true"
        mode="vertical"
        @open="handleOpen"
        @close="handleClose"
        @select="handleSelect"
      >
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'

// first level menu index
let curruntSubMenuOpenedIdx = null

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    routes() {
      return this.$router.options.routes
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  methods: {
    handleOpen(key, keyPath) {
      if (keyPath.length === 1) {
        curruntSubMenuOpenedIdx = key
      }
    },
    handleClose(key, keyPath) {
      if (keyPath.length === 1) {
        if (curruntSubMenuOpenedIdx === key) {
          curruntSubMenuOpenedIdx = null
        }
      }
    },
    handleSelect(key, keyPath) {
      /*
       * Forcibly refresh components of the same route
       * 1. Bind query to the current route
       * 2. AppMain.vue -> <router-view :key="route.path + route.query"
       */
      if (key === this.$route.path) {
        this.$router.push({
          path: key,
          query: {
            flag: Date.now()
          }
        })
      }

      if (keyPath.length === 1) {
        if (curruntSubMenuOpenedIdx !== null) {
          this.$refs.elMenu.close(curruntSubMenuOpenedIdx)
        }
      }
    }
  }
}
</script>

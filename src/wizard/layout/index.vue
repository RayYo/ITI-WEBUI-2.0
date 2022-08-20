<template>
  <div class="app-wrapper hideSidebar">
    <div class="main-container">
      <wizard-navbar />
      <app-main style="min-height: 100%;" />
      <footerbar />
    </div>
  </div>
</template>

<script>
import WizardNavbar from '@/wizard/components/WizardNavbar'
import { AppMain, Footerbar } from '@/layout/components'

export default {
  name: 'WizardLayout',
  components: {
    WizardNavbar,
    AppMain,
    Footerbar
  },
  computed: {
    fixedHeader() {
      return false
    }
  }
}
</script>

<style lang="scss" scoped>

  .app-wrapper {
    position: relative;
    height: 100%;
    width: 100%;
    background: #e7ecf0 !important;
  }
  .main-container {
    margin-left: 0px !important;
  }
  .hideSidebar .fixed-header {
    width: calc(100% - 54px)
  }

</style>

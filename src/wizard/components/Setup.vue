<template>
  <div class="main_body">
    <div id="basetitle">Switch Setup Wizard</div>
    <div>
      <table class="from_table" cellspacing="0" border=""><tbody>
        <tr><td>This wizard will guide you through a step-by-step process to configure your switch and connect to the Internet.</td></tr></tbody>
      </table>
      <div class="marginBtn">
        <el-button type="primary" @click.native="next">Next</el-button>
        <el-button type="primary" @click.native="cancel">Cancel</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default
{
  methods:
  {
    next() {
      this.$router.push('/wizard/step1')
    },

    cancel() {
      this.$router.push('/dashboard')
    }
  }
}
</script>

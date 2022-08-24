<template>
  <div class="main_body">
    <div id="basetitle">Switch Setup Wizard</div>
    <div>
      <table class="from_table" cellspacing="0" border=""><tbody>
        <tr><td>This wizard will guide you through a step-by-step process to configure your switch and connect to the Internet.</td></tr></tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Next" @click="next">
        <input type="button" class="btnOutTable" value="Cancel" @click="cancel">
      </div>
    </div>
  </div>
</template>

<script>
export default
{
  created() {
    this.$store.dispatch('wizard/updateState')
  },
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

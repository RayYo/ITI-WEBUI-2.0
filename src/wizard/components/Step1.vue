<template>
  <div class="main_body">
    <div id="basetitle">Switch Setup Wizard</div>
    <div>
      <div class="table_title">Step 1: Change your login credentials</div>
      <table class="from_table" cellspacing="0" border="">
        <tbody><tr><td>Username</td> <td><div id="UserName" title="admin" style="display: inline-block; width: 50%;">
                 <input type="text" disabled="disabled" maxlength="20" placeholder="" autocomplete="off" class="baseInput disabledStyle"></div>
               </td></tr>
          <tr><td>Password</td>
            <td><div id="Password" title="" style="display: inline-block; width: 50%;">
              <input type="password" maxlength="20" placeholder="" autocomplete="new-password" class="baseInput"></div>
              (Maximum length is 20)
            </td></tr>
          <tr><td>Confirm Password</td>
            <td><div id="ConfirmPassword" title="" style="display: inline-block; width: 50%;">
              <input type="password" maxlength="20" placeholder="" autocomplete="new-password" class="baseInput"></div></td></tr>
        </tbody></table>

      <div class="marginBtn">
        <el-button type="primary" @click.native="previous">Previous</el-button>
        <el-button type="primary" @click.native="next">Next</el-button>
        <el-button type="primary" @click.native="cancel">Cancel</el-button>
      </div>
    </div>
  </div></template>

<script>
export default
{
  methods:
  {
    previous() {
      this.$router.push('/wizard/setup')
    },

    next() {
      this.$router.push('/wizard/step2')
    },

    cancel() {
      this.$router.push('/dashboard')
    }
  }

}
</script>

<template>
  <div class="main_body">
    <div id="basetitle">Switch Setup Wizard</div>
    <common-table
      header-title="Step 1: Change your login credentials"
      :first-column="['Username','Password', 'Confirm Password']"
    >
      <template #0>
        <div style="display: inline-block; width: 50%;">
          <input type="text" :value="username" disabled="disabled" maxlength="20" class="baseInput disabledStyle">
        </div>
      </template>
      <template #1>
        <div style="display: inline-block; width: 50%;">
          <input ref="psw" type="password" maxlength="20" autocomplete="new-password" class="baseInput">
        </div> (Maximum length is 20)
      </template>
      <template #2>
        <div style="display: inline-block; width: 50%;">
          <input ref="confirm_psw" type="password" maxlength="20" autocomplete="new-password" class="baseInput">
        </div>
      </template>
    </common-table>

    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Previous" @click="previous">
      <input type="button" class="btnOutTable" value="Next" @click="next">
      <input type="button" class="btnOutTable" value="Cancel" @click="cancel">
    </div>
  </div>
</template>

<script>
import commonTable from '@/components/CustomTable/common-table.vue'

export default
{
  components: {
    commonTable
  },
  data() {
    return {
      username: 'ffff'
    }
  },
  methods:
  {
    previous() {
      this.$router.push('/wizard/setup')
    },

    next() {
      if (this.$refs.psw.value === '' ||
        this.$refs.confirm_psw.value === '' ||
        this.$refs.psw.value !== this.$refs.confirm_psw.value) {
        this.$msgbox({
          type: 'warning',
          title: 'Warning',
          message: 'The passwords do not match.'
        })

        return
      }

      // add username/password to store
      const account = {
        username: this.username,
        password: this.$refs.psw.value
      }
      this.$store.dispatch('wizard/userAccount', account)
      this.$router.push('/wizard/step2')
    },

    cancel() {
      this.$router.push('/dashboard')
    }
  }
  /**
     * todo... get data
     * this.username = resp...
     */
  // created() {
  //   this.$http.get('url_get_xxx').then(resp => {
  //   },
  //   err => {
  //     console.log('wizard get error: ', err)
  //   })
  // }
}
</script>

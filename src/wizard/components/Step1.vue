<template>
  <div class="main_body">
    <div id="basetitle">Switch Setup Wizard</div>
    <common-table
      header-title="Step 1: Change your login credentials"
      :first-column="['Username','Password', 'Confirm Password']"
    >
      <template #0>
        <div style="display: inline-block; width: 50%;">
          <input type="text" :value="userAccount.username" disabled="disabled" maxlength="20" class="baseInput disabledStyle">
        </div>
      </template>
      <template #1>
        <div style="display: inline-block; width: 50%;">
          <input ref="psw" v-model="password" type="password" maxlength="20" autocomplete="new-password" class="baseInput">
        </div> (Maximum length is 20)
      </template>
      <template #2>
        <div style="display: inline-block; width: 50%;">
          <input v-model="confirmPsw" type="password" maxlength="20" autocomplete="new-password" class="baseInput">
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
import { mapGetters } from 'vuex'

export default
{
  components: {
    commonTable
  },
  data() {
    return {
      password: '',
      confirmPsw: ''
    }
  },
  computed: {
    ...mapGetters([
      'userAccount'
    ])
  },
  methods:
  {
    previous() {
      this.$router.push('/wizard/setup')
    },

    next() {
      if (this.password === '') {
        this.$msgbox({
          type: 'warning',
          title: 'Warning',
          message: 'The length of Password is between 1 and 20!'
        })

        this.confirmPsw = ''
        this.$refs.psw.focus()
        return
      }

      if (this.confirmPsw === '' ||
        this.password !== this.confirmPsw) {
        this.$msgbox({
          type: 'warning',
          title: 'Warning',
          message: 'The passwords do not match.'
        })
        this.password = ''
        this.confirmPsw = ''
        this.$refs.psw.focus()
        return
      }

      // add username/password to store
      const account = {
        username: this.userAccount.username,
        password: this.password
      }
      this.$store.dispatch('wizard/userAccount', account)
      this.$router.push('/wizard/step2')
    },

    cancel() {
      this.$router.push('/dashboard')
    }
  }
}
</script>

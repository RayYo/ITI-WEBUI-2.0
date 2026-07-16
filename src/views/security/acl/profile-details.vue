<template>
  <div class="main_body">
    <div id="basetitle">Access Profile Details</div>
    <div>
      <div class="table_title">Access Profile Details</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr v-for="r in rows" :key="r[0]">
            <td>{{ r[0] }}</td>
            <td>{{ r[1] }}</td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Previous Page" @click="$router.back()">
      </div>
    </div>
  </div>
</template>

<script>
import { aclProfileDetailRows, loadAclProfile } from './acl-common'

export default {
  data() {
    return {
      rows: []
    }
  },
  created() {
    const { type, id } = this.$route.query
    loadAclProfile(type, id).then(({ profile }) => {
      if (profile) this.rows = aclProfileDetailRows(profile)
    })
  }
}
</script>

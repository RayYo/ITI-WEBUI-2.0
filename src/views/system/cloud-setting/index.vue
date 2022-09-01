<template>
  <div class="main_body">
    <div id="basetitle">Cloud Settings</div>
    <common-table
      header-title="Cloud Settings"
      :first-column="['Cloud Mode','Status', 'Registration']"
    >
      <template #0>
        <select>
          <option title="Enabled" value="1"><span>Enabled</span></option>
          <option title="Disabled" value="2"><span>Disabled</span></option>
        </select>
      </template>
      <template #1>Disconnect</template>
      <template #2>
        <select class="disabledStyle" disabled="disabled">
          <option title="Enabled" value="1"><span>Enabled</span></option>
          <option title="Disabled" value="2"><span>Disabled</span></option>
        </select>
      </template>
    </common-table>

    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Apply" @click="apply">
    </div>
  </div>
</template>

<script>
import commonTable from '@/components/CustomTable/common-table.vue'

export default {
  components: {
    commonTable
  },
  data() {
    return {
    }
  },
  created() {
  },
  methods: {
    apply() {
      this.$message.success({
        showClose: true,
        message: 'Success.'
      })
    }
  }
}
</script>


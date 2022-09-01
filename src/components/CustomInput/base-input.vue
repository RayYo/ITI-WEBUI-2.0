<template>
  <div style="display: inline-block; width: 50%;">
    <input
      :value="value"
      :type="type"
      :maxlength="maxLen"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :class="css"
      @input="inputChange"
      @keyup="check"
    >
  </div>
</template>
<script>
export default {
  props: {
    value: {
      type: String,
      required: true,
      default: ''
    },
    type: {
      type: String,
      required: false,
      default: 'text'
    },
    maxLen: {
      type: String,
      required: false,
      default: '30'
    },
    autocomplete: {
      type: String,
      required: false,
      default: 'off'
    },
    placeholder: {
      type: String,
      required: false,
      default: ''
    },
    css: {
      type: String,
      required: false,
      default: 'baseInput'
    }
  },
  data() {
    return {}
  },
  methods: {
    inputChange(e) {
      this.$emit('input', e.target.value)
    },
    check() {
      this.$emit('check')
    }
  }
}
</script>

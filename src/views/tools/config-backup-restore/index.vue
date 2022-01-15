<template>
  <div class="main_body">
    <div class="styleTest">{{ placeholderString }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      todo: 'TODO...'
    }
  },
  computed: {
    placeholderString() {
      const tmpStr = this.$route.meta.title + ' need ' + this.todo
      return tmpStr
    }
  },
  created() {
    // console.log('send request...')
  }
}
</script>

<style lang="scss" scoped>
.styleTest {
font-size: 35px;
    color: rgb(14, 153, 245);
}
</style>

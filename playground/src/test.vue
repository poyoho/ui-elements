<template>
  <div class="test">
    <div class="a">
      bbbb
    </div>
    hello world
  </div>
</template>
<script>
import {ref, defineComponent} from "vue"
export default defineComponent({
  setup () {
    const a = ref("")
  }
})
</script>
<style scoped>
.a {
  color: red;
}
</style>
<style>
.b {
  color: red;
}
</style>

<template>
  <div id="app">
    <!-- FIXME see how to integrate into the 47rooks website LandF -->
    <span style="display: none">
      <img alt="Vue logo" src="./assets/MemZayin64PaleGreen.png" width="28px" height="28px" />
    </span>

    <h1>
      Typing Practice Tool
    </h1>
    <TypingPractice msg="Welcome to Your Vue.js + TypeScript App" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TypingPractice from '@/components/TypingPractice.vue';

@Component({
  components: {
    TypingPractice,
  },
})
export default class App extends Vue {}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
#app img {
  text-align: left;
}
</style>

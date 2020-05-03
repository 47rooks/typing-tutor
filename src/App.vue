<template>
  <div id="app">
    <!-- FIXME replace with 47rooks logo -->
    <h1><span><img alt="Vue logo" src="./assets/logo.png" width="25px" height="25px"></span>
    Typing Practice Tool</h1>
    <TypingPractice msg="Welcome to Your Vue.js + TypeScript App"/>
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

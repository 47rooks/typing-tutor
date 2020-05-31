<template>
  <div id="app">
    <h1>Typing Practice Tool</h1>
    <TypingPractice msg="Welcome to Your Vue.js + TypeScript App" />
        <!-- <header>
      <div>
      <span></span>
      <img id="logo" alt="47Rooks logo" src="assets/MemZayin64PaleGreen.png"/>
    </div>
  </header> -->

  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TypingPractice from '@/components/TypingPractice.vue';

@Component({
  name: 'App',
  components: {
    TypingPractice,
  },
})
export default class App extends Vue {}
</script>

<style>
#app,
textarea,
input {
  font-family: Accordance, Cardo, 'Times New Roman', Helvetica, Arial, sans-serif;
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  /* color: #043d00;  Standard 47rooks green*/
}
</style>

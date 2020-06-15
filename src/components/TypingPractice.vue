<template>
  <div class="typing-practice">
    <div id="control-pane">
      <ul>
        <li>
          <font-picker @selected="fontHandler"
          :fonts="FONT_LIST" :preferred-font="PREFERRED_FONT"></font-picker>
        </li>
        <li>
          <span>Text size</span>
          <select v-model="curTextsize">
            <option
              v-for="ts in textsizes"
              v-bind:key="ts"
              v-bind:value="ts"
              :selected="ts === curTextsize ? true : false"
              >{{ ts }}</option
            >
          </select>
        </li>
        <li>
          <span>Highlight errors</span>
          <input type="checkbox" id="show-correction" v-model="showCorrections">
        </li>
        <li>
          <button
            id="practice-button"
            type="button"
            @click="practiceHdlr"
            :disabled="practiceButtonDisabled"
          >
            Practice
          </button>
        </li>
        <li>
          <button
            id="clear-button"
            type="button"
            @click="clearHdlr"
            :disabled="clearButtonDisabled"
          >
            Clear
          </button>
        </li>
      </ul>
      <ul :style="correctionsKeyStyle">
        <li><span style="color:orange">Orange text, added</span></li>
        <li><span style="color:blue">Blue text, omitted, marked on reference</span></li>
        <li><span style="color:red">Red text, incorrect</span></li>
      </ul>
    </div>
    <div id="reference-pane" v-bind:style="referencePaneStyle">
      <textarea
        id="reference-ta"
        :rows="refTextareaRows"
        :cols="refTextareaCols"
        v-model="reftext"
        :style="textareaStyle"
        :placeholder="PLACEHOLDER_TEXT"
      ></textarea>
    </div>
    <div id="typing-pane" v-bind:style="typingPaneStyle">
      <div id="typing-pane-color-layer">
        <div id="typed-text-pane">
          <p id="typed-text" :style="typedTextStyle"><span v-html="typedPracticeText"></span></p>
        </div>
        <div id="correction-pane-vis" v-bind:style="correctionsPaneStyle">
          <div id="corrections-pane">
            <table>
              <tr>
                <td>Reference</td>
                <td id="annotated-ref-line"><span v-html="annotatedRefLine"></span></td>
              </tr>
              <tr>
                <td>Typed</td>
                <td id="annotated-typed-line"><span v-html="annotatedTypedLine"></span></td>
              </tr>
            </table>
          </div>
        </div>
        <p id="ref-line"><span v-html="textExampleLine"></span></p>
        <input
          id="practice-line"
          size="80"
          :value="practiceLineText"
          @keydown="enterHdlr"
          :style="practiceInputStyle"
        />
        <div id="yet-to-be-typed-text-pane">
          <p id="yet-to-be-typed-text" :style="typedTextStyle">
            <span v-html="yetToBeTypedPracticeText"></span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./TypingPractice.ts"></script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped src="./TypingPractice.css"></style>

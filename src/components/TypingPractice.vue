<template>
  <div id="typing-practice">
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
            title="Begin practicing with this text"
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
            title="Clear current state and reset to initial state"
          >
            Clear
          </button>
        </li>
        <li>
          <button
            id="restart-button"
            type="Restart"
            @click="restartHdlr"
            :disabled="restartButtonDisabled"
            title="Restart the same practice text"
          >
            Restart
          </button>
        </li>
        <li>
          <span>Words/minute {{typingRate}}</span>
        </li>
      </ul>
      <ul :style="correctionsKeyStyle">
        <li><span style="color:orange">Orange text, added</span></li>
        <li><span style="color:blue">Blue text, omitted, marked on reference</span></li>
        <li><span style="color:red">Red text, incorrect</span></li>
      </ul>
    </div>
    <div id="library-pane">
      <ul>
        <li>
          <span>Library</span>
          <select @change="handleLibrarySelection"
           v-model="selectedText"
           :disabled="librarySelectListDisabled">
            <option value="none" disabled hidden>
              Select a text from the library or paste in new text
            </option>
            <option
              v-for="textId in libraryTextsList"
              v-bind:key="textId"
              v-bind:value="textId"
              >{{ textId }}</option
            >
          </select>
        </li>
        <li>
          <button
            id="save-button"
            type="Save"
            @click="saveHdlr"
            :disabled="saveButtonDisabled"
            title="Save the current text to the library"
            >
            Save
          </button>
        </li>
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
    <input-popup title="Save current text to library"
                 prompt="Enter a name for the text"
                 save-help-text="Save the current text to the library"
                 save-button-name="Save"
                 v-on:input-name="handleSaveName"
                 :validation-error="validationErrorText"
                 confirm-help-text="Confirm use of name"
                 confirm-button-name="Confirm"
                 v-if="promptForSaveName"
                 v-on:input-cancelled="handleCancel"
    ></input-popup>
  </div>
</template>

<script lang="ts" src="./TypingPractice.ts"></script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped src="./TypingPractice.css"></style>

<template>
  <div id="input-popup-pane">
    <form>
      <div>
        <span>{{ title }}</span>
      </div>
      <div>
        <input id="input" v-model="enteredText" :placeholder="prompt"
               onInput=""/>
      </div>
      <div>
        <span v-if="validationError !== ''"> {{ validationError }}</span>
      </div>
      <div>
        <button id="saveButton"
                type="button"
                @click="saveButtonHdlr"
                :disabled="saveButtonDisabled"
                :title="saveHelpText"
                :value="saveButtonName"
        >
        {{ saveButtonName }}
        </button>
        <button id="confirmButton"
                type="button"
                @click="confirmButtonHdlr"
                :disabled="confirmButtonDisabled"
                :title="confirmHelpText"
                :value="confirmButtonName"
                v-if="validationError !== ''"
        >
        {{ confirmButtonName }}
        </button>
                <button id="cancelButton"
                type="button"
                @click="cancelButtonHdlr"
                title="Cancel, abort saving"
        >
        Cancel
        </button>

      </div>
    </form>
  </div>
</template>
<script lang="ts">
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';

@Component
export default class InputPopup extends Vue {
  @Prop({ default: 'Please set \'title\' attribute' }) title!: string;

  @Prop({ default: 'Please set \'prompt\' attibute' }) prompt!: string; // Prompt text string

  @Prop({ default: '' }) saveHelpText!: string; // Help string displayed on mouseover of button

  @Prop({ default: 'Ok' }) saveButtonName!: string; // Text to display on button

  @Prop({ default: '' }) confirmHelpText!: string; // Help string displayed on mouseover of button

  @Prop({ default: 'Ok' }) confirmButtonName!: string; // Text to display on button

  @Prop({ default: '' }) validationError!: string; // Validation error

  enteredText = '';

  /**
   * Forward the input on to any input-name listener.
   */
  saveButtonHdlr(): void {
    console.log(`Got ${this.enteredText}`);
    this.$emit('input-name', this.enteredText);
  }

  /**
   * Disable the save button when:
   *   there is no text in the reference text area,
   *   when the text in textarea is an unmodified library item
   */
  get saveButtonDisabled(): boolean {
    return this.enteredText === '';
  }

  /**
   * Send input-confirmed to any listeners.
   */
  confirmButtonHdlr(): void {
    console.log(`Got ${this.enteredText}`);
    this.$emit('input-confirmed', this.enteredText);
  }

  /**
   * Disable the save button when:
   *   there is no text in the reference text area,
   *   when the text in textarea is an unmodified library item
   */
  get confirmButtonDisabled(): boolean {
    return this.validationError === '';
  }

  /**
   * Cancel the save operation. Notify any listeners
   */
  cancelButtonHdlr(): void {
    this.$emit('input-cancelled');
  }
}
</script>
<style scoped>
/* FIXME This is not currently properly centered left-right on the page */
div#input-popup-pane {
  z-index: 1500;
  width: 20%;
  height: 15%;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -5%;
  margin-left: -10%;
  background-color: beige;
  border-radius: 10px;
  border-width: 2px;
  border-color: black;
  border-style: solid;
  padding: 10px;
}
div#input-popup-pane span,
div#input-popup-pane input,
div#input-popup-pane button {
  vertical-align: middle;
  margin: 5px 5px;
}
div#input-popup-pane span {
  font-weight: bold;
}
</style>

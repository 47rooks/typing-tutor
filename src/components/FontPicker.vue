<template>
  <div>
    <span>Font</span>
    <select @change="handleSelection">
      <option
        v-for="font in fontList"
        v-bind:key="font"
        v-bind:value="font"
        :selected="font === initiallySelectedFont ? true : false"
        >{{ font }}</option
      >
    </select>
  </div>
</template>
<script lang="ts">
import {
  Component, Vue, Prop,
} from 'vue-property-decorator';

@Component
export default class FontPicker extends Vue {
  private DEFAULT_FONTS = ['sans-serif'];

  DEFAULT_FONT = 'sans-serif';

  @Prop() fonts!: string[];

  installedFonts: string[] = [];

  initiallySelectedFont!: string;

  /**
   * Get the list of fonts for the SELECT element.
   */
  get fontList(): string[] {
    // FIXME Testing for installed fonts commented out for now. See notes for
    //   getInstalledFonts().
    // this.installedFonts = this.getInstalledFonts();
    if (this.fonts === undefined) {
      this.installedFonts = this.DEFAULT_FONTS;
    } else {
      this.installedFonts = this.fonts;
    }
    this.installedFonts.sort();
    [this.initiallySelectedFont] = this.installedFonts;
    return this.installedFonts;
  }

  /**
   * Check that the fonts are present on this machine.
   * Checking whether a font is installed on a machine is in fact not possible from a
   * browser. The implementation below is a modification of a common but flawed approach
   * to determining whether a font is installed. It iterates over the list of fonts
   * supplied and renders a span of text and measures how wide it is. This is then compared
   * to some standard font which is assumed to be present on most machines and assumed to
   * be the fallback font. If it renders to a different length then the font must be installed.
   *
   * The weaknesses in this approach are several and it will have both false positives and
   * false negatives. Weaknesses include:
   *
   *   1. reference font is not installed, so fallback is used
   *   2. font being tested just happens to render the test string to the same number of
   *      pixels
   *   3. font fallback is to a different font for different classes of fonts, serif, sans-serif
   *      or monospace
   *   4. font fallback is not to the reference font, but reference font is present. If the
   *      fallback font and reference font render to different widths many fonts may be
   *      accepted as though installed
   *   5. test string is either too short or insufficiently complex to result in a pixel or
   *      more difference in width
   *
   * Given these weaknesses this routine is not used though it is retained for future reference
   * in case it should be useful. In any case it provides a single point of testing a font
   * if another method is found.
   *
   * Note that this code below uses multiple test strings, aimed to test variations in width
   * of characters. It also experiements with multiple reference fonts but that buys one
   * nothing really as one still does not know if any are installed.
   *
   * @returns the list of fonts installed, and if none then the default list
   */
  private getInstalledFonts(): string[] {
    if (this.fonts === undefined) {
      return this.DEFAULT_FONTS;
    }
    const rv: string[] = [];
    // Create a test span in the document
    const testTexts: string[] = ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmonpqrstuvwxyz',
      'IIIIIIIIIII', '..............'];
    const spanElt = document.createElement('span');
    spanElt.textContent = 'MWImwiNSns';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tpDiv = document.getElementById('typing-practice') as Node;
    document.body.appendChild(spanElt);
    // Get reference widths
    const styleBase = 'display: inline-block; visibility: visible; font-family: sans-serif';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const testFonts = ['sans-serif', 'monospace', 'serif'];
    const refWidths: number[] = [];
    const refHeights: number[] = [];
    spanElt.setAttribute(
      'style',
      styleBase,
    );
    testTexts.forEach((f) => {
      // spanElt.setAttribute(
      //   'style',
      //   `${styleBase}${f}`,
      // );
      spanElt.textContent = f;
      refWidths.push(spanElt.offsetWidth);
      refHeights.push(spanElt.offsetHeight);
      console.log(`Computed style=${window.getComputedStyle(spanElt, null).getPropertyValue('font-family')}`);
    });
    console.log(`widths = ${refWidths}`);
    console.log(`heights = ${refHeights}`);

    // eslint-disable-next-line arrow-parens
    this.fonts.forEach(fontBeingTested => {
      // Get length of font being tested
      spanElt.setAttribute(
        'style',
        `display: inline-block; visibility: visible; font-family: ${fontBeingTested}`,
      );
      console.log(`Computed style=${window.getComputedStyle(spanElt, null).getPropertyValue('font-family')}`);

      const testWidths: number[] = [];
      const testHeights: number[] = [];
      testTexts.forEach((t) => {
        spanElt.textContent = t;
        testWidths.push(spanElt.offsetWidth);
        testHeights.push(spanElt.offsetHeight);
      });
      // const testWidth = spanElt.offsetWidth;
      console.log(`font: ${fontBeingTested} testWidths = ${testWidths}`);
      console.log(`font: ${fontBeingTested} testHeights = ${testHeights}`);
      // if (!refWidths.every(() => w === testWidth)) {
      for (let i = 1; i < 4; i += 1) {
        if (refWidths[i] !== testWidths[i]) {
          rv.push(fontBeingTested);
          break;
        }
      }
      // if (refWidths !== testWidths) {
      //   rv.push(fontBeingTested);
      // }
    });
    spanElt.remove();
    return rv;
  }

  /**
   * Forward the selection on to any @selected listener.
   */
  handleSelection(event: Event): void {
    const font = (event.target as HTMLSelectElement).value;
    this.$emit('selected', font);
  }
}
</script>
<style scoped>
div > span {
  display: inline-block;
  margin: 0 5px;
}
</style>

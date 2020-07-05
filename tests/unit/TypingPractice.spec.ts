import { expect } from 'chai';
import { shallowMount, Wrapper } from '@vue/test-utils';
import TypingPracticeVue from '@/components/TypingPractice.vue';
import Vue from 'vue';
import TypingPractice from '../../src/components/TypingPractice';

describe('TypingPractice showTypingErrors unit tests', () => {
  let wrapper: Wrapper<TypingPracticeVue>;
  beforeEach(() => {
    const elem = document.createElement('div');
    if (document.body) {
      document.body.appendChild(elem);
    }
    wrapper = shallowMount(TypingPracticeVue, {
      attachTo: elem,
    });
  });

  afterEach(() => {
    wrapper.destroy();
  });

  async function testShowErrors(reference: string, entered: string,
    expectedAnnotatedRef: string, expectedAnnotatedEntered: string) {
    const refTa = wrapper.find('#reference-ta');
    refTa.setValue(reference);
    await Vue.nextTick();
    const practiceB = wrapper.find('#practice-button');
    practiceB.trigger('click');
    await Vue.nextTick();
    const tp = wrapper.vm as TypingPractice;
    tp.showTypingErrors(entered);

    // Validate the annotated results
    expect(tp.annotatedRefLine).to.equal(expectedAnnotatedRef);
    expect(tp.annotatedTypedLine).to.equal(expectedAnnotatedEntered);
  }

  it('detects one incorrect grapheme in a word', () => testShowErrors(
    'Τῶν',
    'Ταν',
    'Τῶν',
    'Τ<span style="color:red">α</span>ν',
  ));

  it('detects one grapheme missing', () => testShowErrors(
    'Τῶν',
    'Τν',
    'Τ<span style="color:blue">ῶ</span>ν',
    'Τν',
  ));

  it('detects one grapheme added in a word', () => testShowErrors(
    'Τῶν',
    'Τῶνα',
    'Τῶν',
    'Τῶν<span style="color:orange">α</span>',
  ));

  it('detects one grapheme duplicated in a word', () => testShowErrors(
    'Τῶν',
    'Τῶνν',
    'Τῶν',
    'Τῶν<span style="color:orange">ν</span>',
  ));

  // FIXME Should this be highlighted distinctly somehow ?
  it('detects two transposed graphemes in a word', () => testShowErrors(
    'Ἰσραὴλ',
    'Ἰσαρὴλ',
    'Τῶν',
    'Τῶν<span style="color:orange">ν</span>',
  ));

  // FIXME Currently this misses the addition thinking that there is an omission and then
  // additions ? It also shows that the punctuation is included in the assessement which is
  // probably incorrect.
  it('detects an inserted extra grapheme in a word', () => testShowErrors(
    'βαπτίζων.',
    'βαπτίζνων.',
    'Τῶν',
    'Τῶν<span style="color:orange">ν</span>',
  ));

  // FIXME This is the trailing apostrophe issue from paste from Accordance from the end of
  // John 1:32. Compare with paste from another source and check encoding.
  it('detects trailing apostrophe from Accordance paste', () => testShowErrors(
    'ἐπ̓ ',
    'ἐπ᾿ ',
    'Τῶν',
    'Τῶν<span style="color:orange">ν</span>',
  ));

  // FIXME The full stop when omitted is not noticed by the annotator
  it('detects omitted fullstop', () => testShowErrors(
    'ἐγεννήθησαν.',
    'ἐγεννήθησαν',
    'Τῶν',
    'Τῶν<span style="color:orange">ν</span>',
  ));

  it('detects one incorrect word in a sentence', () => testShowErrors(
    'Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ μαν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ μ<span style="color:red">α</span>ν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
  ));

  it('detects one word missing in a sentence', () => testShowErrors(
    'Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ <span style="color:blue">μέν </span>ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
  ));

  it('detects one word added in a sentence', () => testShowErrors(
    'Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ μέν ἀγάπη ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ μέν <span style="color:orange">ἀγάπη </span>ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
  ));

  it('detects one word duplicated in a sentence', () => testShowErrors(
    'Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ μέν μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ μέν <span style="color:orange">μέν </span>ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
  ));

  // FIXME - this requires more subtle use of the diff metric to distinguish missing from wrong
  it('detects one word missing, next word incorrect in a sentence FIXME', () => testShowErrors(
    'ὁρμή, ὄρεξις, ἔκκλισις καὶ ἑνὶ λόγῳ ὅσα ἡμέτερα ἔργα',
    'ὁρμή, ὄρεξις, ἔκκλισις καὶ ἑνὶ λόγῳ ἡμέτaρα ἔργα',
    'ὁρμή, ὄρεξις, ἔκκλισις καὶ ἑνὶ λόγῳ <span style="color:blue">ὅσα</span> ἡμέτερα ἔργα',
    'ὁρμή, ὄρεξις, ἔκκλισις καὶ ἑνὶ λόγῳ <span style="color:red">ἡ</span><span style="color:red">μ</span><span style="color:red">έ</span><span style="color:orange">τaρα</span> ἔργα',
  ));

  it('detects mismatched words of same length with some common letters', () => testShowErrors(
    'ἐστιν',
    'ἡμῖν,',
    'ἐστ<span style="color:blue">ι</span>ν',
    '<span style="color:red">ἡ</span><span style="color:red">μ</span><span style="color:red">ῖ</span>ν<span style="color:orange">,</span>',
  ));

  it('detects two words added at the same place in a sentence FIXME', () => testShowErrors(
    'Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ μέν μέν ἀγάπη ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    '<span><span>Τῶν</span> <span>ὄντων</span> <span>τὰ</span> <span>μ<span style="color:red">α</span>ν</span> <span>ἐστιν</span> <span>ἐφ̓</span> <span>ἡμῖν,</span> <span>τὰ</span> <span>δὲ</span> <span>οὐκ</span> <span>ἐφ̓</span> <span>ἡμῖν.</span> </span>',
  ));

  it('detects one incorrect duplicate word and one added word in a sentence', () => testShowErrors(
    'Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ μαν μέν ἀγάπη ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ <span style="color:orange">μαν </span>μέν <span style="color:orange">ἀγάπη </span>ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
  ));

  it('detects one incorrect word and one added word in a sentence', () => testShowErrors(
    'Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ μαν ἀγάπη ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
    'Τῶν ὄντων τὰ μ<span style="color:red">α</span>ν <span style="color:orange">ἀγάπη </span>ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
  ));
});

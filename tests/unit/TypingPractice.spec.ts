import { expect } from 'chai';
import { shallowMount, Wrapper } from '@vue/test-utils';
import TypingPracticeTemplate from '@/components/TypingPractice.vue';
import TypingPractice from '@/components/TypingPractice';
import Vue from 'vue';

describe('TypingPractice showTypingErrors', () => {
  let wrapper: Wrapper<TypingPractice>;

  beforeEach(() => {
    const elem = document.createElement('div');
    if (document.body) {
      document.body.appendChild(elem);
    }
    wrapper = shallowMount(TypingPracticeTemplate, {
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
    const tp = wrapper.vm;
    tp.showTypingErrors(entered);

    // Validate the annotated results
    expect(tp.annotatedRefLine).to.equal(expectedAnnotatedRef);
    expect(tp.annotatedTypedLine).to.equal(expectedAnnotatedEntered);
  }

  it('detects one incorrect grapheme in a word', () => {
    testShowErrors('Τῶν', 'Ταν',
      '<span><span>Τῶν</span> </span>',
      '<span><span>Τ<span style="color:red">α</span>ν</span> </span>');
  });

  it('detects one grapheme missing', () => {
    testShowErrors('Τῶν', 'Τν',
      '<span><span>Τ<span style="color:blue">ῶ</span>ν</span> </span>',
      '<span><span>Τν</span> </span>');
  });

  it('detects one grapheme added in a word', () => {
    testShowErrors('Τῶν', 'Τῶνα',
      '<span><span>Τῶν</span> </span>',
      '<span><span>Τῶν<span style="color:orange">α</span></span> </span>');
  });

  it('detects one grapheme duplicated in a word', () => {
    testShowErrors('Τῶν', 'Τῶνν',
      '<span><span>Τῶν</span> </span>',
      '<span><span>Τῶν<span style="color:orange">ν</span></span> </span>');
  });

  it('detects one incorrect word in a sentence', () => {
    testShowErrors('Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
      'Τῶν ὄντων τὰ μαν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
      '<span><span>Τῶν</span> <span>ὄντων</span> <span>τὰ</span> <span>μέν</span> <span>ἐστιν</span> <span>ἐφ̓</span> <span>ἡμῖν,</span> <span>τὰ</span> <span>δὲ</span> <span>οὐκ</span> <span>ἐφ̓</span> <span>ἡμῖν.</span> </span>',
      '<span><span>Τῶν</span> <span>ὄντων</span> <span>τὰ</span> <span>μ<span style="color:red">α</span>ν</span> <span>ἐστιν</span> <span>ἐφ̓</span> <span>ἡμῖν,</span> <span>τὰ</span> <span>δὲ</span> <span>οὐκ</span> <span>ἐφ̓</span> <span>ἡμῖν.</span> </span>');
  });

  it('detects one word missing in a sentence', () => {
    testShowErrors('Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
      'Τῶν ὄντων τὰ ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
      '<span><span>Τῶν</span> <span>ὄντων</span> <span>τὰ</span> <span style="color:blue">μέν </span><span>ἐστιν</span> <span>ἐφ̓</span> <span>ἡμῖν,</span> <span>τὰ</span> <span>δὲ</span> <span>οὐκ</span> <span>ἐφ̓</span> <span>ἡμῖν.</span> </span>',
      '<span><span>Τῶν</span> <span>ὄντων</span> <span>τὰ</span> <span>μ<span style="color:red">α</span>ν</span> <span>ἐστιν</span> <span>ἐφ̓</span> <span>ἡμῖν,</span> <span>τὰ</span> <span>δὲ</span> <span>οὐκ</span> <span>ἐφ̓</span> <span>ἡμῖν.</span> </span>');
  });

  it('detects one word added in a sentence', () => {
    testShowErrors('Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
      'Τῶν ὄντων τὰ μέν ἀγάπη ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
      '<span><span>Τῶν</span> <span>ὄντων</span> <span>τὰ</span> <span>μέν</span> <span style="color:orange">ἀγάπη </span><span>ἐστιν</span> <span>ἐφ̓</span> <span>ἡμῖν,</span> <span>τὰ</span> <span>δὲ</span> <span>οὐκ</span> <span>ἐφ̓</span> <span>ἡμῖν.</span> </span>',
      '<span><span>Τῶν</span> <span>ὄντων</span> <span>τὰ</span> <span>μ<span style="color:red">α</span>ν</span> <span>ἐστιν</span> <span>ἐφ̓</span> <span>ἡμῖν,</span> <span>τὰ</span> <span>δὲ</span> <span>οὐκ</span> <span>ἐφ̓</span> <span>ἡμῖν.</span> </span>');
  });

  it('detects one word duplicated in a sentence', () => {
    testShowErrors('Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
      'Τῶν ὄντων τὰ μέν μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
      '<span><span>Τῶν</span> <span>ὄντων</span> <span>τὰ</span> <span>μέν</span> <span>ἐστιν</span> <span>ἐφ̓</span> <span>ἡμῖν,</span> <span>τὰ</span> <span>δὲ</span> <span>οὐκ</span> <span>ἐφ̓</span> <span>ἡμῖν.</span> </span>',
      '<span><span>Τῶν</span> <span>ὄντων</span> <span>τὰ</span> <span>μ<span style="color:red">α</span>ν</span> <span>ἐστιν</span> <span>ἐφ̓</span> <span>ἡμῖν,</span> <span>τὰ</span> <span>δὲ</span> <span>οὐκ</span> <span>ἐφ̓</span> <span>ἡμῖν.</span> </span>');
  });

  it('detects one word missing, next word incorrect in a sentence', () => {
    testShowErrors('ὁρμή, ὄρεξις, ἔκκλισις καὶ ἑνὶ λόγῳ ὅσα ἡμέτερα ἔργα',
      'ὁρμή, ὄρεξις, ἔκκλισις καὶ ἑνὶ λόγῳ ἡμέτaρα ἔργα',
      '<span><span>Τῶν</span> <span>ὄντων</span> <span>τὰ</span> <span style="color:blue">μέν </span><span>ἐστιν</span> <span>ἐφ̓</span> <span>ἡμῖν,</span> <span>τὰ</span> <span>δὲ</span> <span>οὐκ</span> <span>ἐφ̓</span> <span>ἡμῖν.</span> </span>',
      '<span><span>Τῶν</span> <span>ὄντων</span> <span>τὰ</span> <span>μ<span style="color:red">α</span>ν</span> <span>ἐστιν</span> <span>ἐφ̓</span> <span>ἡμῖν,</span> <span>τὰ</span> <span>δὲ</span> <span>οὐκ</span> <span>ἐφ̓</span> <span>ἡμῖν.</span> </span>');
  });

  it('detects one word duplicated and one added word in a sentence SPINS', () => {
    testShowErrors('Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
      'Τῶν ὄντων τὰ μέν μέν ἀγάπη ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
      '<span><span>Τῶν</span> <span>ὄντων</span> <span>τὰ</span> <span>μέν</span> <span>ἐστιν</span> <span>ἐφ̓</span> <span>ἡμῖν,</span> <span>τὰ</span> <span>δὲ</span> <span>οὐκ</span> <span>ἐφ̓</span> <span>ἡμῖν.</span> </span>',
      '<span><span>Τῶν</span> <span>ὄντων</span> <span>τὰ</span> <span>μ<span style="color:red">α</span>ν</span> <span>ἐστιν</span> <span>ἐφ̓</span> <span>ἡμῖν,</span> <span>τὰ</span> <span>δὲ</span> <span>οὐκ</span> <span>ἐφ̓</span> <span>ἡμῖν.</span> </span>');
  });

  it('detects one incorrect word and one added word in a sentence', () => {
    testShowErrors('Τῶν ὄντων τὰ μέν ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
      'Τῶν ὄντων τὰ μαν μέν ἀγάπη ἐστιν ἐφ̓ ἡμῖν, τὰ δὲ οὐκ ἐφ̓ ἡμῖν.',
      '<span><span>Τῶν</span> <span>ὄντων</span> <span>τὰ</span> <span>μέν</span> <span>ἐστιν</span> <span>ἐφ̓</span> <span>ἡμῖν,</span> <span>τὰ</span> <span>δὲ</span> <span>οὐκ</span> <span>ἐφ̓</span> <span>ἡμῖν.</span> </span>',
      '<span><span>Τῶν</span> <span>ὄντων</span> <span>τὰ</span> <span>μ<span style="color:red">α</span>ν</span> <span>ἐστιν</span> <span>ἐφ̓</span> <span>ἡμῖν,</span> <span>τὰ</span> <span>δὲ</span> <span>οὐκ</span> <span>ἐφ̓</span> <span>ἡμῖν.</span> </span>');
  });
});

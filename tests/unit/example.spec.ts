import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import TypingPractice from '@/components/TypingPractice.vue';
import Vue from 'vue/types/umd';

describe('TypingPractice.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'Highlight errors';
    const wrapper = shallowMount(TypingPractice);
    expect(wrapper.text()).to.include(msg);
  });

  it('detects one incorrect grapheme in a word', async () => {
    const wrapper = shallowMount(TypingPractice);
    const refTa = wrapper.find('#reference-ta');
    refTa.setValue('Τῶν ὄντων τὰ');
    const practiceB = wrapper.find('#practice-button');
    practiceB.trigger('click');
    await Vue.nextTick();
    console.log(wrapper.props());
    expect(wrapper.props().textExampleLine).to.include('Τῶν');
  });

  it('detects one grapheme missing', () => {
    console.log('not here');
    expect(1).equal(2);
  });

  it.skip('detects one grapheme added in a word', () => {
    console.log('not here');
  });
});

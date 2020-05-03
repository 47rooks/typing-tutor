import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import TypingPractice from '@/components/TypingPractice.vue';

describe('TypingPractice.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message';
    const wrapper = shallowMount(TypingPractice, {
      propsData: { msg },
    });
    expect(wrapper.text()).to.include(msg);
  });
});

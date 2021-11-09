import React from 'react';
import { COLORS } from '@department-of-veterans-affairs/caseflow-frontend-toolkit/util/StyleConstants';
import { PlusIcon } from '../../app/components/icons/PlusIcon';

export default {
  title: 'Commons/Components/Icons/PlusIcon',
  component: PlusIcon,
  parameters: {
    controls: { expanded: true },
  },
  argTypes: {
    color: { control: { type: 'color' } },
    size: { control: { type: 'number' } },
    cname: { control: { type: 'text' } }
  },
  args: {
    color: COLORS.WHITE,
    size: '12px',
    cname: ''
  }
};

const Template = (args) => <PlusIcon {...args} />;

export const Default = Template.bind({});
Default.decorators = [(Story) => <div style={{ padding: '20px', background: '#333' }}><Story /></div>];

export const ColorPlusIcon = Template.bind({});
ColorPlusIcon.args = { color: 'green' };

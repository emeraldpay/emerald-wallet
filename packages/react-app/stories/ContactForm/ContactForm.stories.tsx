import { Blockchains } from '@emeraldwallet/core';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import * as React from 'react';
import ContactForm from '../../src/address-book/ContactForm';

const meta: Meta<typeof ContactForm> = {
  title: 'ContactForm',
  component: ContactForm,
};
export default meta;

type Story = StoryObj<typeof ContactForm>;

export const AddContact: Story = {
  render: () =>
    <ContactForm
      blockchains={Object.values(Blockchains)}
      title="Add Contact"
      onCancel={action('onCancel')}
      onSubmit={action('onSubmit')}
    />
};

export const EditContact: Story = {
  render: () =>
    <ContactForm
      blockchains={Object.values(Blockchains)}
      contact={{
        address: {
          address: '0x0',
          type: 'plain',
        },
        blockchain: 10009,
        label: 'Test',
      }}
      title="Edit Contact"
      onCancel={action('onCancel')}
      onSubmit={action('onSubmit')}
    />
}



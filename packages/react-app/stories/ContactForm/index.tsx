import { Blockchains } from '@emeraldwallet/core';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ContactForm from '../../src/address-book/ContactForm';

storiesOf('ContactForm', module)
  .add('new contact', () => (
    <ContactForm
      blockchains={Object.values(Blockchains)}
      title="Add Contact"
      onCancel={action('onCancel')}
      onSubmit={action('onSubmit')}
    />
  ))
  .add('edit', () => (
    <ContactForm
      blockchains={Object.values(Blockchains)}
      contact={{
        address: {
          address: '0x0',
          type: 'plain',
        },
        blockchain: 10005,
        label: 'Test',
      }}
      title="Edit Contact"
      onCancel={action('onCancel')}
      onSubmit={action('onSubmit')}
    />
  ));

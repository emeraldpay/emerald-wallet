import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ContactForm from '../../src/address-book/ContactForm';

storiesOf('ContactForm', module)
  .add('new contact', () => (
    <ContactForm
      title='Add Contact'
      onCancel={action('onCancel')}
      onSubmit={action('onSubmit')}
    />))
  .add('edit', () => (
    <ContactForm
      title='Edit Contact'
      initialValues={{}}
      onCancel={action('onCancel')}
      onSubmit={action('onSubmit')}
    />
  ));

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ContactForm from '../../src/components/addressbook/ContactForm';

storiesOf('ContactForm', module)
  .add('new contact', () => (
    <ContactForm
      title="Add Contact"
      onCancel={action('onCancel')}
      onSubmit={action('onSubmit')}
    />))
  .add('edit', () => (
    <ContactForm
      title="Edit Contact"
      initialValues={{}}
      onCancel={action('onCancel')}
      onSubmit={action('onSubmit')}
    />
  ));

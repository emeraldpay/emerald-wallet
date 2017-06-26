import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { renderTextField } from 'elements/formFields';
import { Card, CardText, FlatButton } from 'material-ui';
import { required, address } from 'lib/validators';
import { cardSpace } from 'lib/styles';
import { translate } from 'react-i18next';

const Render = translate('addressbook')(({ t, handleSubmit, blockAddress, invalid, pristine, submitting, cancel }) => (
      <Card style={cardSpace}>
        <CardText expandable={false}>
            <form onSubmit={handleSubmit}>
                <Field name="address"
                        component={renderTextField}
                        type="text"
                        label={t('form.networkAddress')}
                        disabled={blockAddress}
                        validate={[required, address]} />
                <Field name="name"
                        component={renderTextField}
                        type="text"
                        label={t('form.addressName')}
                        validate={ required } />
                <Field name="description"
                        component={renderTextField}
                        type="text"
                        label={t('form.addressDescription')} />
                <FlatButton label={t('common:save')} type="submit"
                            disabled={pristine || submitting || invalid } />
                <FlatButton label={t('common:cancel')}
                            secondary={true}
                            onClick={cancel} />
            </form>
        </CardText>
      </Card>
    ));

export const AddressForm = reduxForm({
    form: 'AddressForm',
    fields: ['name', 'address', 'description'],
})(Render);

import { connect } from 'react-redux';
import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Field, reduxForm } from 'redux-form';
import { Card, CardText } from 'material-ui';
import { TextField } from 'redux-form-material-ui';
import { ButtonGroup } from 'emerald-js-ui';
import Button from '../../../elements/Button';
import { required } from '../../../lib/validators';
import { cardSpace } from '../../../lib/styles';


export const AccountEdit = ({
  muiTheme, handleSubmit, invalid, pristine, submitting, cancel,
}) => (
  <Card style={cardSpace}>
    <CardText expandable={false}>
      <form onSubmit={handleSubmit}>
        <div>
          <Field
            name="name"
            component={TextField}
            type="text"
            floatingLabelText="Account Name"
            floatingLabelStyle={{color: muiTheme.palette.textColor}}
            validate={required}
          />
        </div>
        <ButtonGroup>
          <Button
            label="Cancel"
            onClick={cancel} />
          <Button
            primary
            label="Save"
            type="submit"
            disabled={pristine || submitting || invalid} />
        </ButtonGroup>
      </form>
    </CardText>
  </Card>
);

export const AccountEditForm = reduxForm({
  form: 'AddressForm',
  fields: ['name', 'address'],
})(AccountEdit);

export default connect(
  (state, ownProps) => ({
    blockAddress: true,
    initialValues: {
      name: ownProps.account.get('name'),
      address: ownProps.account.get('id'),
      description: ownProps.account.get('description'),
    },
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data) => {
      ownProps.submit(data);
    },
    cancel: () => {
      ownProps.cancel();
    },
  })
)(muiThemeable()(AccountEditForm));

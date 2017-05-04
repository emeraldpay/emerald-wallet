import React from 'react';
import { Field, reduxForm, change, formValueSelector, SubmissionError } from 'redux-form';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import { SelectField, TextField, RadioButtonGroup } from 'redux-form-material-ui';
import { RadioButton} from 'material-ui/RadioButton';
import { MenuItem, FlatButton, FontIcon } from 'material-ui';
import { Divider } from 'material-ui/Divider';
import { IconMenu } from 'material-ui/IconMenu';
import { IconButton } from 'material-ui/IconButton';
import { ImportContacts } from 'material-ui/svg-icons/communication/import-contacts';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { red200 } from 'material-ui/styles/colors';
import { cardSpace } from '../../lib/styles';
import { positive, number, required, address } from 'lib/validators';

const Render = (props) => {

  const {fields: {from, to}, accounts, account, handleSubmit, invalid, pristine, resetForm, submitting, cancel} = props;
  const {addressBook, tokens, token, isToken, onChangeToken} = props;
  const {error} = props;

  return (
    <Card style={cardSpace}>
      <CardHeader
        title='Send Transaction'
        actAsExpander={false}
        showExpandableButton={false}
      />

      <CardText expandable={false}>
        <Row>
          <Col xs={12} md={6}>
            <Row>
              <Col xs={12}>
                <Field name="from"
                       floatingLabelText="From"
                       component={SelectField}
                       fullWidth={true}>
                  {accounts.map( (account) =>
                    <MenuItem key={account.get('id')} value={account.get('id')} primaryText={account.get('id')} />
                  )}
                </Field>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Field name="password"
                       floatingLabelText="Password"
                       type="password"
                       component={TextField}
                       fullWidth={true}
                       validate={required}>
                </Field>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Field name="to"
                       component={TextField}
                       floatingLabelText="Target Address"
                       validate={[required, address]}
                />
                <IconMenu
                    iconButtonElement={<IconButton><ImportContacts /></IconButton>}
                    onItemTouchTap={handleSelect}
                >
                {accounts.map( (account) => 
                  <MenuItem key={account.get('id')} value={account.get('id')} primaryText={account.get('id')} />
                )}
                <Divider />
                {addressBook.map( (account) => 
                  <MenuItem key={account.get('id')} value={account.get('id')} primaryText={account.get('id')} />
                )} 
                </IconMenu>
              </Col>
            </Row>
            <Row>
              <Col xs={8} md={6}>
                <Field name="value"
                       component={TextField}
                       floatingLabelText="Amount"
                       hintText="1.0000"
                       validate={[required, number]}
                />
              </Col>
              <Col xs={4} md={4}>
                <Field name="token"
                       component={SelectField}
                       onChange={onChangeToken}
                       value={token}
                       fullWidth={true}>
                  {tokens.map( (token) =>
                    <MenuItem key={token.get('address')} value={token.get('address')} label={token.get('symbol')} primaryText={token.get('symbol')} />
                  )}
                </Field>
              </Col>
              {isToken &&
              <Col>
                <Field name="isTransfer"
                       component={RadioButtonGroup}
                       defaultSelected="true"
                       validate={required}>
                  <RadioButton value="true" label="Transfer"/>
                  <RadioButton value="false" label="Approve for Withdrawal"/>
                </Field>
              </Col> }
            </Row>
          </Col>

          <Col xs={12} md={6}>
            <Row>
              <Col xs={12}>
                <Field name="gasPrice"
                       component={TextField}
                       floatingLabelText="Gas Price (MGas)"
                       hintText="10000"
                       validate={[required, number, positive]}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Field name="gasAmount"
                       component={TextField}
                       floatingLabelText="Gas Amount"
                       hintText="21000"
                       validate={[required, number, positive]}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        {error && (
          <Row>
            <Col>
              <span style={{ color: red200 }}><strong>{error}</strong></span>
            </Col>
          </Row>
        )}
      </CardText>

      <CardActions>
        <FlatButton label="Send"
                    disabled={pristine || submitting || invalid }
                    onClick={handleSubmit}
                    icon={<FontIcon className="fa fa-check" />}/>
        <FlatButton label="Cancel"
                    onClick={cancel}
                    icon={<FontIcon className="fa fa-ban" />}/>
      </CardActions>
    </Card>
  )
};

const CreateTxForm = reduxForm({
  form: 'createTx',
  fields: ['to', 'from', 'password', 'value', 'token', 'gasPrice', 'gasAmount', 'token', 'isTransfer']
})(Render);

export default CreateTxForm;
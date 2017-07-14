import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { SelectField, TextField, RadioButtonGroup } from 'redux-form-material-ui';
import { RadioButton } from 'material-ui/RadioButton';
import { MenuItem, FlatButton, IconButton } from 'material-ui';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import { IconMenu } from 'material-ui/IconMenu';
import ImportContacts from 'material-ui/svg-icons/communication/import-contacts';
import { CardHeadEmerald } from 'elements/card';
import { cardStyle, formStyle } from 'lib/styles';
import { red200 } from 'material-ui/styles/colors';
import { positive, number, required, address } from 'lib/validators';
import IdentityIcon from '../accounts/identityIcon';

const textEtc = {
  fontSize: '20px',
  fontWeight: '500',
  lineHeight: '24px',
};

const textFiat = {
  marginTop: '5px',
  fontSize: '14px',
  lineHeight: '16px',
};

const textFiatLight = {
  marginTop: '5px',
  fontSize: '14px',
  lineHeight: '16px',
  color: '#747474',
  textAlign: 'center',
  width: '100%',
};

const linkText = {
    marginTop: '5px',
    color: '#47B04B', 
    fontSize: '14px',  
    fontWeight: '500', 
    lineHeight: '20px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    textDecoration: 'none',
};

const balanceGroup = {
    marginTop: '10px',
    height: '40px',
};

const BalanceField = ({ input, rate }) => {
  const style = {
    marginTop: '10px',
    color: '#191919',
    textAlign: 'left',
  };

  return (
    <div style={style}>
      <div style={textEtc}>
        {input.value.getEther(6)} ETC
      </div>
      <div style={textFiat}>
        ${input.value.getFiat(rate)}
      </div>
    </div>
  );
};

const Render = (props) => {
    const { fields: { from, to }, accounts, balance, handleSubmit, invalid, pristine, submitting } = props;
    const { addressBook, handleSelect, tokens, token, isToken, onChangeToken, onChangeAccount } = props;
    const { fiatRate, value, fromAddr, onEntireBalance } = props;
    const { error, cancel } = props;

    return (
    <Grid style={cardStyle}>
      <CardHeadEmerald 
        backLabel='DASHBOARD'
        title='Send Ether & Tokens'
        cancel={cancel}
      />
        <Row>
          <Col xs={12} md={8}>
            <Row middle="xs">
              <Col xs={2} xsOffset={1} style={formStyle.label}>
                From
              </Col>
              <Col xs={8} style={formStyle.group}>
                <Field name="from"
                       style={formStyle.input}
                       onChange={(event, val) => onChangeAccount(accounts, val)}
                       component={SelectField}
                       underlineShow={false}
                       fullWidth={true}>
                  {accounts.map((account) =>
                    <MenuItem 
                        leftIcon={<IdentityIcon id={account.get('id')}/>}
                        key={account.get('id')} 
                        value={account.get('id')} 
                        primaryText={account.get('id')} />
                  )}
                </Field>
              </Col>
            </Row>
            <Row middle="xs">
              <Col xs={2} xsOffset={1} style={formStyle.label}>
                Password
              </Col>            
              <Col xs={8} style={formStyle.group}>
                <Field name="password"
                       style={formStyle.input}
                       type="password"
                       component={TextField}
                       underlineShow={false}
                       fullWidth={true}
                       validate={required}>
                </Field>
              </Col>
            </Row>
            <Row middle="xs">
              <Col xs={2} xsOffset={1} style={formStyle.label}>
                To
              </Col>
              <Col xs={7} style={formStyle.group}>
                <Field name="to"
                       style={formStyle.input}
                       component={TextField}
                       validate={[required, address]}
                       underlineShow={false}
                       fullWidth={true}
                />
              </Col>
              <Col xs={1} style={formStyle.group}>
                <IconMenu
                    iconButtonElement={<IconButton><ImportContacts /></IconButton>}
                    onItemTouchTap={handleSelect}
                >
                {accounts.map((account) =>
                  <MenuItem 
                    leftIcon={<IdentityIcon id={account.get('id')}/>}
                    key={account.get('id')}
                    value={account.get('id')}
                    primaryText={account.get('name') ? account.get('name') : account.get('id')} />
                )}
                {/*
                <Divider />
                {addressBook.map((account) =>
                  <MenuItem key={account.get('id')} value={account.get('id')} primaryText={account.get('id')} />
                )}
                */}
                </IconMenu>
              </Col>
            </Row>
            <Row middle="xs">
              <Col xs={2} xsOffset={1} style={formStyle.label}>
                Amount
              </Col>
              <Col xs={7} style={formStyle.group}>
                <Field name="value"
                       style={formStyle.input}
                       component={TextField}
                       hintText="1.0000"
                       fullWidth={true}
                       underlineShow={false}
                       validate={[required]}
                />
              </Col>
              <Col xs={1} style={formStyle.group}>
                <Field name="token"
                       component={SelectField}
                       onChange={onChangeToken}
                       value={token}
                       underlineShow={false}
                       fullWidth={true}>
                  {tokens.map((it) =>
                    <MenuItem key={it.get('address')}
                              style={formStyle.input}
                              value={it.get('address')}
                              label={it.get('symbol')}
                              primaryText={it.get('symbol')} />
                  )}
                </Field>
              </Col>
              {isToken &&
              <Col xs={2} style={formStyle.group}>
                <Field name="isTransfer"
                       style={formStyle.input}
                       component={RadioButtonGroup}
                       defaultSelected="true"
                       validate={required}>
                  <RadioButton value="true" label="Transfer"/>
                  <RadioButton value="false" label="Approve for Withdrawal"/>
                </Field>
              </Col> }
            </Row>
            <Row top="xs" style={balanceGroup}>
              <Col xs={3} style={formStyle.label} />
              <Col xs={2} style={textFiatLight}>
                  {value && `$${value.getFiat(fiatRate).toString()}` }
              </Col>
              <Col xs={3} style={linkText} onClick={() => onEntireBalance(balance)}>
                Entire Balance
              </Col>
            </Row>
            <Row middle="xs">
              <Col xs={2} xsOffset={1} style={formStyle.label}>
                Fee
              </Col>
              <Col xs={5} style={formStyle.group}>
                <Field name="gasPrice"
                       component={TextField}
                       hintText="23000"
                       style={formStyle.input}
                       underlineShow={false}
                       validate={[required, number, positive]}
                />
              </Col>
            </Row>
            {/*<Row>
              <Col xs={12}>
                <Field name="gas"
                       component={TextField}
                       floatingLabelText="Gas Amount"
                       hintText="21000"
                       validate={[required, number, positive]}
                />
              </Col>
            </Row>*/}
            <Row top="xs">
              <Col xs={3} style={formStyle.label} />
              <Col xs={3} style={formStyle.group}>
                <FlatButton label={`Send ${value && value.getEther(2).toString() } ETC`}
                            disabled={ pristine || submitting || invalid }
                            onClick={handleSubmit}
                            style={formStyle.submitButton}
                            backgroundColor="#47B04B"
                             />
                <br />
              </Col>
              <Col xs={3} style={formStyle.group}>                             
                <FlatButton label="Cancel"
                            onClick={cancel}
                            style={formStyle.cancelButton}
                            backgroundColor="#DDD" />                     
              </Col>              
            </Row>         
          </Col>

          <Col xs={12} md={4}>
            <Row>
              <Field name="balance"
                     disabled={true}
                     component={BalanceField}
                     floatingLabelText="Balance"
                     rate={fiatRate}
              />
            </Row>
            <Row style={{marginTop: '40px'}}>
                <a style={linkText} href={`http://gastracker.io/addr/${fromAddr}`}>Transaction History</a>
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
    </Grid>
    );
};

Render.propTypes = {
    fields: PropTypes.array.isRequired, // verify in react-form
    accounts: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    invalid: PropTypes.bool.isRequired,
    pristine: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    cancel: PropTypes.func.isRequired,
    fiatRate: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    balance: PropTypes.number.isRequired,
    fromAddr: PropTypes.string.isRequired,
    onEntireBalance: PropTypes.func.isRequired,

    addressBook: PropTypes.object.isRequired,
    handleSelect: PropTypes.func.isRequired,
    tokens: PropTypes.object.isRequired,
    token: PropTypes.object,
    isToken: PropTypes.string,
    onChangeToken: PropTypes.func.isRequired,

    error: PropTypes.string,
};

const CreateTxForm = reduxForm({
    form: 'createTx',
    fields: ['to', 'from', 'password', 'value', 'token', 'gasPrice', 'gas', 'token', 'isTransfer'],
})(Render);

export default CreateTxForm;

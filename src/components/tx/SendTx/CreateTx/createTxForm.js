import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { RadioButtonGroup } from 'redux-form-material-ui';
import { MenuItem, IconButton, IconMenu } from 'material-ui';
import { Button, IdentityIcon, ButtonGroup, LinkButton, WarningText, Warning } from 'emerald-js-ui';
import { Book as BookIcon } from 'emerald-js-ui/lib/icons3';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { positive, number, required, address } from 'lib/validators';
import { Form, Row, styles } from '../../../../elements/Form';
import TextField from '../../../../elements/Form/TextField';
import SelectField from '../../../../elements/Form/SelectField';
import HelpText from '../../../../elements/HelpText';
import AccountBalance from '../../../accounts/Balance';
import SelectAddressField from './selectAddressField';

import classes from './createTxForm.scss';

import { Currency } from '../../../../lib/currency';


const textEtc = {
  fontSize: '20px',
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
};


/**
 * Input with IdentityIcon. We show it in to field control
 */
const InputWithIcon = (props) => {
  const leftIcon = props.input.value ? <IdentityIcon size={30} id={props.input.value} /> : null;
  return (
    <TextField {...props} fieldStyle={{ paddingLeft: '5px' }} leftIcon={leftIcon} />
  );
};

/**
 * Address with IdentityIcon. We show it in from field select control
 */
const AddressWithIcon = ({ accountAddress, name }) => {
  const style = {
    div: {
      display: 'flex',
      alignItems: 'center',
    },
    address: {
      marginLeft: '5px',
      fontSize: '16px',
      color: '#191919',
    },
  };
  return (
    <div style={style.div}>
      <IdentityIcon size={30} id={accountAddress} />
      <div style={style.address}>{name || accountAddress}</div>
    </div>
  );
};


export const CreateTxForm = (props) => {
  const { accounts, balance, handleSubmit, invalid, pristine, submitting, muiTheme } = props;
  const { addressBook, handleSelect, tokens, token, isToken } = props;
  const { onEntireBalance, onChangeToken, onChangeAccount, onChangeGasLimit } = props;
  const { fiatRate, fiatCurrency, value, fee } = props;
  const { error, cancel } = props;
  const { useLedger, ledgerConnected } = props;
  const showFiat = !isToken && props.showFiat;

  const sendDisabled = pristine || submitting || invalid || (useLedger && !ledgerConnected);

  const sendButton = <Button primary
    label="Create Transaction"
    onClick={handleSubmit} />;

  let sendMessage = null;
  if (useLedger && !ledgerConnected) {
    sendMessage = <HelpText>Make sure Ledger Nano is connected &amp; Browser Mode is switched off.</HelpText>;
  }

  const RecipientPopupMenu = (<IconMenu
    iconButtonElement={<IconButton><BookIcon /></IconButton>}
    onItemClick={handleSelect}
  >
    {addressBook.map((account) =>
      <MenuItem
        key={account.get('address')}
        value={account.get('address')}
        primaryText={
          <AddressWithIcon
            name={account.get('name')}
            accountAddress={account.get('address')}
          />}
      />
    )}
    {/*
           <Divider />
           {addressBook.map((account) =>
           <MenuItem key={account.get('id')} value={account.get('id')} primaryText={account.get('id')} />
           )}
           */}
  </IconMenu>);

  return (
    <Form style={{ padding: '0', marginTop: '-41px' }}>
      <Row>
        <div style={styles.left}>
          <div style={styles.fieldName}>From</div>
        </div>
        <div style={{ ...styles.right, alignItems: 'center' }}>
          <SelectAddressField name='from' accounts={accounts} onChangeAccount={onChangeAccount} />
        </div>
        <div style={{ ...styles.right, color: muiTheme.palette.secondaryTextColor }}>
          <AccountBalance
            showFiat={showFiat}
            symbol={balance.symbol}
            balance={balance.value}
            precision={6}
            fiatStyle={textFiat}
            coinsStyle={textEtc}
          />
        </div>
      </Row>
      <Row>
        <div style={styles.left}>
          <div style={styles.fieldName}>
            To
          </div>
        </div>
        <div style={styles.right}>
          <Field
            rightIcon={RecipientPopupMenu}
            name="to"
            style={{ minWidth: '400px', paddingLeft: '10px', paddingRight: '10px' }}
            component={InputWithIcon}
            validate={[required, address]}
            underlineShow={false}
            fullWidth={true}
          />
        </div>
      </Row>

      <Row>
        <div style={styles.left}>
          <div style={styles.fieldName}>
            Amount
          </div>
        </div>
        <div style={{ ...styles.right, justifyContent: 'space-between' }}>
          <Field
            name="value"
            component={TextField}
            hintText="1.0000"
            fullWidth={true}
            underlineShow={false}
            validate={[required, number]}
            value={parseFloat(value)}
          />
          <Field
            name="token"
            style={{ marginLeft: '19px', maxWidth: '125px' }}
            component={SelectField}
            onChange={onChangeToken}
            value={token}
            underlineShow={false}
            fullWidth={true}
          >
            {tokens.map((it) =>
              <MenuItem
                key={it.get('address')}
                value={it.get('address')}
                label={it.get('symbol')}
                primaryText={it.get('symbol')}
              />
            )}
          </Field>

          {/* {isToken &&*/}
          {/* <Field name="isTransfer"*/}
          {/* style={formStyle.input}*/}
          {/* component={RadioButtonGroup}*/}
          {/* defaultSelected="true"*/}
          {/* validate={required}>*/}
          {/* <RadioButton value="true" label="Transfer"/>*/}
          {/* <RadioButton value="false" label="Approve for Withdrawal"/>*/}
          {/* </Field>*/}
          {/* }*/}

        </div>
      </Row>

      <Row>
        <div style={styles.left} />
        <div style={styles.right}>
          <div className={classes.entireBalanceContainer}>
            {showFiat &&
              <div style={textFiatLight}>
                {value && Currency.format(Currency.convert(value, fiatRate, 2), fiatCurrency)}
              </div>
            }
            <LinkButton
              onClick={() => onEntireBalance(balance.value, fee, isToken)}
              label="Entire Balance"
            />
          </div>
        </div>
      </Row>

      <Row>
        <div style={styles.left}>
          <div style={styles.fieldName}>
            Gas Limit
          </div>
        </div>

        <div style={styles.right}>
          <Field
            name="gas"
            onChange={onChangeGasLimit}
            component={TextField}
            underlineShow={false}
            validate={[required, number, positive]}
          />
        </div>
      </Row>
      <Row>
        <div style={styles.left}>
          <div style={styles.fieldName}>Transaction Fee</div>
        </div>
        <div style={styles.right}>
          <AccountBalance
            balance={fee}
            symbol="ETC"
            precision={6}
            fiatStyle={textFiat}
            coinsStyle={textEtc}
          />
        </div>
      </Row>

      {/* <Row>
         <Col xs={12}>
         <Field name="gas"
         component={TextField}
         floatingLabelText="Gas Amount"
         hintText="21000"
         validate={[required, number, positive]}
         />
         </Col>
         </Row>*/}

      <Row>
        <div style={styles.left} />
        <div style={{ ...styles.right }}>
          <ButtonGroup>
            <Button label="Cancel" onClick={cancel} />
            {sendButton}
          </ButtonGroup>
        </div>
      </Row>

      <Row>
        <div style={styles.left} />
        <div style={styles.right}>{sendMessage}</div>
      </Row>

      {error && (
        <Row>
          <div style={styles.left} />
          <div style={styles.right}>
            <Warning>
              <WarningText>{error}</WarningText>
            </Warning>
          </div>
        </Row>
      )}

    </Form>
  );
};

CreateTxForm.propTypes = {
  fields: PropTypes.array.isRequired, // verify in react-form
  accounts: PropTypes.object.isRequired,
  addressBook: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  invalid: PropTypes.bool.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  cancel: PropTypes.func.isRequired,
  fiatRate: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  balance: PropTypes.object.isRequired,
  fromAddr: PropTypes.string.isRequired,
  onEntireBalance: PropTypes.func.isRequired,

  handleSelect: PropTypes.func.isRequired,
  tokens: PropTypes.object.isRequired,
  token: PropTypes.object,
  isToken: PropTypes.string,
  onChangeToken: PropTypes.func.isRequired,

  error: PropTypes.string,
};

export default reduxForm({
  form: 'createTx',
  destroyOnUnmount: false,
  fields: ['to', 'from', 'value', 'token', 'gasPrice', 'gas', 'isTransfer'],
})(muiThemeable()(CreateTxForm));


import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { RadioButtonGroup } from 'redux-form-material-ui';
import { RadioButton } from 'material-ui/RadioButton';
import { MenuItem, IconButton } from 'material-ui';
import { IconMenu } from 'material-ui/IconMenu';
import ImportContacts from 'material-ui/svg-icons/communication/import-contacts';
import { formStyle } from 'lib/styles';
import { positive, number, required, address } from 'lib/validators';
import IdentityIcon from '../../../elements/IdentityIcon';
import { Form, Row, styles } from '../../../elements/Form';
import TextField from '../../../elements/Form/TextField';
import SelectField from '../../../elements/Form/SelectField';
import AccountBalance from '../../accounts/AccountBalance';
import Button from '../../../elements/Button';
import LinkButton from 'elements/LinkButton';


import classes from './createTxForm.scss';
import { WarningText, Warning } from '../../../elements/Warning';

import { Currency } from '../../../lib/currency';

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


const BalanceField = ({ input }) => {
    if (!input.value) {
        return null;
    }
    return (
        <AccountBalance
            balance={ input.value }
            precision={ 6 }
            fiatStyle={ textFiat }
            etcStyle={ textEtc }
        />
    );
};

/**
 * Address with IdentityIcon. We show it in from field select control
 */
const AddressWithIcon = ({ address, name }) => {
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
            <IdentityIcon size={30} expanded={true} id={ address }/>
            <div style={ style.address }>{ name || address }</div>
        </div>
    );
};

const FromAddressField = ({accounts, onChangeAccount}) => {
    return (<Field name="from"
                   // style={formStyle.input}
                   onChange={(event, val) => onChangeAccount(accounts, val)}
                   component={SelectField}
                   underlineShow={false}
                   fullWidth={true}
                   dropDownMenuProps={{
                       menuStyle: {
                           overflowX: 'hidden',
                       },
                       selectionRenderer: (val) => (<AddressWithIcon address={val}/>),
                   }}>
        {accounts.map((account) =>
            <MenuItem
                key={account.get('id')}
                value={account.get('id')}
                primaryText={<AddressWithIcon address={account.get('id')}/>}/>
        )}
    </Field>);
};

const CreateTxForm = (props) => {
    const { accounts, balance, handleSubmit, invalid, pristine, submitting } = props;
    const { addressBook, handleSelect, tokens, token, isToken, onChangeToken, onChangeAccount, onChangeGasLimit } = props;
    const { fiatRate, fiatCurrency, value, fromAddr, onEntireBalance, fee } = props;
    const { error, cancel, goDashboard } = props;
    const { useLedger, ledgerConnected } = props;

    const sendDisabled = pristine || submitting || invalid || (useLedger && !ledgerConnected);
    const sendButton = <Button primary
        label={`Send ${value && value.getEther(2).toString()} ETC`}
        disabled={ sendDisabled }
        onClick={ handleSubmit } />;

    let sendMessage = null;
    if (useLedger && !ledgerConnected) {
        sendMessage = <span style={formStyle.helpText}>
            Make sure Ledger Nano is connected &amp; Browser Mode is switched off.
        </span>;
    }

    let passwordField = null;
    if (!useLedger) {
        passwordField = (
            <Row>
                <div style={styles.left}>
                    <div style={styles.fieldName}>
                        Password
                    </div>
                </div>
                <div style={styles.right}>
                    <Field name="password"
                           type="password"
                           component={ TextField }
                           underlineShow={false}
                           fullWidth={true}
                           validate={ [required] }/>
                </div>
            </Row>);
    }


    return (
    <Form caption="Send Ether & Tokens" onCancel={ goDashboard }>
        <Row>
            <div style={styles.left}>
                <div style={styles.fieldName}>
                    From
                </div>
            </div>
            <div style={{...styles.right, alignItems: 'center'}}>
                <FromAddressField accounts={accounts} onChangeAccount={onChangeAccount}/>
            </div>
            <div style={{...styles.right}}>
                <Field name="balance"
                       disabled={true}
                       component={BalanceField}
                       floatingLabelText="Balance"
                />
            </div>
        </Row>

        {passwordField}

        <Row>
            <div style={styles.left}>
                <div style={styles.fieldName}>
                    To
                </div>
            </div>
            <div style={styles.right}>
                <Field name="to"
                       component={ TextField }
                       validate={[required, address]}
                       underlineShow={false}
                       fullWidth={true}
                />

                <IconMenu
                    iconButtonElement={<IconButton><ImportContacts /></IconButton>}
                    onItemTouchTap={ handleSelect }
                >
                    {accounts.map((account) =>
                        <MenuItem
                            key={ account.get('id') }
                            value={ account.get('id') }
                            primaryText={
                                <AddressWithIcon name={ account.get('name') } address={ account.get('id') }/> }
                        />
                    )}
                    {/*
                     <Divider />
                     {addressBook.map((account) =>
                     <MenuItem key={account.get('id')} value={account.get('id')} primaryText={account.get('id')} />
                     )}
                     */}
                </IconMenu>

            </div>
            <div style={styles.right}>
                <LinkButton
                    href={ `http://gastracker.io/addr/${fromAddr}` }
                    label="Transaction History"
                />
            </div>
        </Row>

        <Row>
            <div style={styles.left}>
                <div style={styles.fieldName}>
                    Amount
                </div>
            </div>
            <div style={{...styles.right, justifyContent: 'space-between'}}>
                <Field name="value"
                       component={ TextField }
                       hintText="1.0000"
                       fullWidth={true}
                       underlineShow={false}
                       validate={[required]}
                />

                    <Field name="token"
                           style={{ marginLeft: '19px', maxWidth: '125px' }}
                           component={ SelectField }
                           onChange={onChangeToken}
                           value={token}
                           underlineShow={false}
                           fullWidth={true}>
                        {tokens.map((it) =>
                            <MenuItem key={it.get('address')}
                                      value={it.get('address')}
                                      label={it.get('symbol')}
                                      primaryText={it.get('symbol')} />
                        )}
                    </Field>

                {isToken &&
                    <Field name="isTransfer"
                           style={formStyle.input}
                           component={RadioButtonGroup}
                           defaultSelected="true"
                           validate={required}>
                        <RadioButton value="true" label="Transfer"/>
                        <RadioButton value="false" label="Approve for Withdrawal"/>
                    </Field>
                }


            </div>
        </Row>

        <Row>
            <div style={ styles.left }/>
            <div style={ styles.right }>
                <div className= { classes.entireBalanceContainer }>
                    <div style={textFiatLight}>
                        { value && Currency.format(value.getFiat(fiatRate), fiatCurrency) }
                    </div>
                    <LinkButton
                        onClick={() => onEntireBalance(balance, fee)}
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
                    onChange={ onChangeGasLimit }
                    component={ TextField }
                    underlineShow={ false }
                    validate={[required, number, positive]}
                />
            </div>
        </Row>
        <Row>
            <div style={styles.left}>
                <div style={styles.fieldName}>
                    Fee
                </div>
            </div>
            <div style={styles.right}>
                <AccountBalance
                    balance={ fee }
                    precision={ 6 }
                    fiatStyle={ textFiat }
                    etcStyle={ textEtc }
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
            <div style={styles.left}/>
            <div style={{...styles.right}}>
                {sendButton}
                <div style={{ marginLeft: '10px' }}>
                    <Button label="Cancel" onClick={ cancel } />
                </div>
            </div>
        </Row>

        <Row>
            <div style={styles.left}/>
            <div style={styles.right}>{sendMessage}</div>
        </Row>

        {error && (
            <Row>
                <div style={styles.left}/>
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

    addressBook: PropTypes.object.isRequired,
    handleSelect: PropTypes.func.isRequired,
    tokens: PropTypes.object.isRequired,
    token: PropTypes.object,
    isToken: PropTypes.string,
    onChangeToken: PropTypes.func.isRequired,

    error: PropTypes.string,
};


export default reduxForm({
    form: 'createTx',
    fields: ['to', 'from', 'password', 'value', 'token', 'gasPrice', 'gas', 'token', 'isTransfer'],
})(CreateTxForm);


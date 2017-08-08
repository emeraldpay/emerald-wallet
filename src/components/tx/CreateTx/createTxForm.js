import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { SelectField, TextField, RadioButtonGroup } from 'redux-form-material-ui';
import { RadioButton } from 'material-ui/RadioButton';
import { MenuItem, FlatButton, IconButton } from 'material-ui';
import { IconMenu } from 'material-ui/IconMenu';
import ImportContacts from 'material-ui/svg-icons/communication/import-contacts';
import { cardStyle, formStyle } from 'lib/styles';
import { red200 } from 'material-ui/styles/colors';
import { positive, number, required, address } from 'lib/validators';
import IdentityIcon from '../../../elements/IdentityIcon';
import {InnerDialog, styles} from '../../../elements/Form';
import AccountBalance from '../../accounts/AccountBalance';


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


const BalanceField = ({ input }) => {
    if (!input.value) {
        return null;
    }
    return (
        <AccountBalance balance={input.value}
                        precision={6}
                        fiatStyle={textFiat}
                        etcStyle={textEtc}/>
    );
};

/**
 * Address with IdentityIcon. We show it in from field select control
 */
const AddressWithIcon = ({ address }) => {
    const style = {
        div: {display: 'flex', alignItems: 'center'},
        address: {marginLeft: '5px', fontSize: '16px', color: '#191919'},
    };
    return (<div style={style.div}>
        <IdentityIcon size={30} expanded={true} id={address}/>
        <div style={style.address}>{address}</div>
    </div>);
};

const FromAddressField = ({accounts, onChangeAccount}) => {
    return (<Field name="from"
                   style={formStyle.input}
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
                // innerDivStyle={{display: 'flex'}}
                key={account.get('id')}
                value={account.get('id')}
                primaryText={<AddressWithIcon address={account.get('id')}/>}/>
        )}
    </Field>);
};

const CreateTxForm = (props) => {
    const { fields: { from, to }, accounts, balance, handleSubmit, invalid, pristine, submitting } = props;
    const { addressBook, handleSelect, tokens, token, isToken, onChangeToken, onChangeAccount } = props;
    const { fiatRate, value, fromAddr, onEntireBalance } = props;
    const { error, cancel } = props;
    const { useLedger, ledgerConnected } = props;

    const sendDisabled = pristine || submitting || invalid || (useLedger && !ledgerConnected);
    const sendButton = <FlatButton label={`Send ${value && value.getEther(2).toString()} ETC`}
                              disabled={sendDisabled}
                              onClick={handleSubmit}
                              style={formStyle.submitButton}
                              backgroundColor={sendDisabled ? '#CBDBCC' : '#47B04B'}/>;
    let sendMessage = null;
    if (useLedger && !ledgerConnected) {
        sendMessage = <span style={formStyle.helpText}>
            Make sure Ledger Nano is connected &amp; Browser Mode is switched off.
        </span>;
    }

    let passwordField = null;
    if (!useLedger) {
        passwordField =

            <div style={styles.formRow}>
                <div style={styles.left}>
                    <div style={styles.fieldName}>
                        Password
                    </div>
                </div>
                <div style={styles.right}>
                    <Field name="password"
                           style={formStyle.input}
                           type="password"
                           component={TextField}
                           underlineShow={false}
                           fullWidth={true}
                           validate={required}/>
                </div>
            </div>;
    }


    return (
    <InnerDialog caption="Send Ether & Tokens" onCancel={cancel}>
        <div id="row" style={styles.formRow}>
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
        </div>

        {passwordField}

        <div id="row" style={styles.formRow}>
            <div style={styles.left}>
                <div style={styles.fieldName}>
                    To
                </div>
            </div>
            <div style={styles.right}>
                <Field name="to"
                       style={formStyle.input}
                       component={TextField}
                       validate={[required, address]}
                       underlineShow={false}
                       fullWidth={true}
                />

                <IconMenu
                    iconButtonElement={<IconButton><ImportContacts /></IconButton>}
                    onItemTouchTap={handleSelect}
                >
                    {accounts.map((account) =>
                        <MenuItem
                            leftIcon={<IdentityIcon size={30} expanded={true} id={account.get('id')}/>}
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

            </div>
            <div style={styles.right}>
                <a style={linkText} href={`http://gastracker.io/addr/${fromAddr}`}>Transaction History</a>
            </div>
        </div>


        <div id="row" style={styles.formRow}>
            <div style={styles.left}>
                <div style={styles.fieldName}>
                    Amount
                </div>
            </div>
            <div style={{...styles.right, justifyContent: 'space-between'}}>
                <Field name="value"
                       style={formStyle.input}
                       component={TextField}
                       hintText="1.0000"
                       fullWidth={true}
                       underlineShow={false}
                       validate={[required]}
                />

                    <Field name="token"
                           style={{...formStyle.input, marginLeft: '19px', maxWidth: '125px'}}
                           component={SelectField}
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
        </div>

        <div id="row" style={styles.formRow}>
            <div style={styles.left}></div>
            <div style={styles.right}>
                <div style={textFiatLight}>
                    {value && `$${value.getFiat(fiatRate).toString()}` }
                </div>
                <div style={{...linkText, marginLeft: '20px'}} onClick={() => onEntireBalance(balance)}>
                    Entire Balance
                </div>
            </div>
        </div>


        <div id="row" style={styles.formRow}>
            <div style={styles.left}>
                <div style={styles.fieldName}>
                    Fee
                </div>
            </div>

            <div style={styles.right}>
                <Field name="gasPrice"
                       component={TextField}
                       hintText="23000"
                       style={formStyle.input}
                       underlineShow={false}
                       validate={[required, number, positive]}
                />
            </div>
        </div>

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

        <div id="row" style={styles.formRow}>

            <div style={styles.left}></div>
            <div style={{...styles.right}}>
                {sendButton}
                <FlatButton label="Cancel"
                            onClick={cancel}
                            style={{...formStyle.cancelButton, marginLeft: '10px'}}
                            backgroundColor="#DDD" />
            </div>
        </div>

        <div id="row" style={styles.formRow}>
            <div style={styles.left}></div>
            <div style={styles.right}>{sendMessage}</div>
        </div>

        {error && (
            <div id="row" style={styles.formRow}>
                    <span style={{ color: red200 }}><strong>{error}</strong></span>
            </div>
        )}

    </InnerDialog>
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


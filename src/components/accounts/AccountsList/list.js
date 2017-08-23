import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import { translate } from 'react-i18next';

import { gotoScreen } from 'store/screenActions';
import Account from './account';
import WalletsTokensButton from './menuButton';

import styles from './list.scss';


const Render = translate('accounts')((props) => {
    const { t, accounts, generate, importJson, importLedger, importPrivateKey } = props;
    const table = <div>
        {accounts.map((account) =>
            <div style={{marginBottom: '6px'}} key={account.get('id')}>
                <Account account={account}/>
            </div>)}
    </div>;

    return (
        <div>
            <div className={ styles.header }>
                <div>
                    <span className={ styles.title }>{ t('list.title') }</span>
                </div>
                <WalletsTokensButton
                    generate={ generate }
                    importJson={ importJson }
                    importLedger={ importLedger }
                    importPrivateKey={ importPrivateKey }
                    t={ t }
                />
            </div>

            <div style={{}}>
                { table }
            </div>
        </div>
    );
});

Render.propTypes = {
    accounts: PropTypes.object.isRequired,
    generate: PropTypes.func.isRequired,
    importJson: PropTypes.func.isRequired,
    importLedger: PropTypes.func.isRequired,
};

const AccountsList = connect(
    (state, ownProps) => ({
        accounts: state.accounts.get('accounts', Immutable.List()),
    }),
    (dispatch, ownProps) => ({
        generate: () => {
            dispatch(gotoScreen('generate'));
        },
        importJson: () => {
            dispatch(gotoScreen('importjson'));
        },
        importPrivateKey: () => {
            dispatch(gotoScreen('import-private-key'));
        },
        importLedger: () => {
            dispatch(gotoScreen('add-from-ledger'));
        },

    })
)(Render);

export default AccountsList;

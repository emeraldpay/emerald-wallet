import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { gotoScreen, showDialog } from '../../../store/wallet/screen/screenActions';
import Menu from './menu';

import classes from './header.scss';

class Header extends React.Component {

    render() {
        const { t, generate, importJson, importLedger, importPrivateKey, addToken } = this.props;
        return (
            <div className={ classes.header }>
                <div>
                    <span className={ classes.title }>{ t('list.title') }</span>
                </div>
                <Menu
                    generate={ generate }
                    importJson={ importJson }
                    importLedger={ importLedger }
                    importPrivateKey={ importPrivateKey }
                    addToken={ addToken }
                    t={ t }
                />
            </div>);
    }
}

export default translate('accounts')(
    connect(
        null,
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
            addToken: () => {
                dispatch(gotoScreen('add-token'));
            },
        })
    )(Header)
);

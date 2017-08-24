import React from 'react';
import { connect } from 'react-redux';
import log from 'electron-log';
import { translate } from 'react-i18next';
import { gotoScreen } from 'store/screenActions';

import Screen from '../screen';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Error from '../error';
import Dialog from '../dialog';

import './main.scss';

const maxWidth = '1100px';

const Render = translate('common')(({t, ...props}) => (
<div>
    {props.screen !== 'welcome' && props.screen !== 'paper-wallet' && <Header maxWidth = {maxWidth}/>}
            <div style={{margin: '20px auto', maxWidth}}>
                <Screen id="body"/>
            </div>
        <Error/><Dialog/>
    {props.screen !== 'welcome' && props.screen !== 'paper-wallet' && <Footer maxWidth = {maxWidth}/> }
</div>
));

const Main = connect(
    (state, ownProps) => ({
        screen: state.screen.get('screen'),
    }),
    (dispatch, ownProps) => ({
        openAccounts: () => {
            log.info('accounts');
            dispatch(gotoScreen('home'));
        },
        openAddressBook: () => {
            log.info('address book');
            dispatch(gotoScreen('address-book'));
        },
        openContracts: () => {
            log.info('contracts');
            dispatch(gotoScreen('contracts'));
        },
    })
)(Render);

export default Main;

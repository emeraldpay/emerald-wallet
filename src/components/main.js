import React from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import log from 'electron-log';
import Networks from 'lib/networks';
import { translate } from 'react-i18next';
import { switchChain } from 'store/networkActions';
import { gotoScreen } from 'store/screenActions';
import './main.scss';
import Screen from './screen';
import Header from './layout/header';
import Footer from './layout/footer';
import Error from './error';
import Dialog from './dialog';

const Render = translate('common')(({t, ...props}) => (
<div>
    {props.screen !== 'welcome' && <Header/>}
        <div style={{}}>
            <div style={{margin: '0 auto', maxWidth: '1060px'}}>
                <Screen id="body"/>
            </div>
        </div>
        <Error/><Dialog/>
    {props.screen !== 'welcome' && <Footer /> }
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
        switchChain: (network) => {
            dispatch(switchChain(network.get('name'), network.get('id')));
        },
    })
)(Render);

export default Main;

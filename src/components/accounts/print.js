import { BrowserWindow } from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';
import PaperWallet from './PaperWallet';
import { rpc } from 'lib/rpc';
import log from 'electron-log';
import { gotoScreen } from 'store/screenActions';

class PrintAccountRender extends React.Component {

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    exportKeyFile(address) {
        const chain = this.props.chain;

        rpc.call('emerald_exportAccount', [{address}, {chain}]).then((result) => {
            //this.printWallet(address, result);
            this.props.showPaperWallet(address, result);
        });
    }

    handleClick() {
        const address = this.props.account.get('id');
        this.exportKeyFile(address);
    }

    render() {
        return (<MenuItem
            leftIcon={<FontIcon className="fa fa-print"/>}
            primaryText='PRINT'
            onTouchTap={this.handleClick}/>);
    }
}

PrintAccountRender.propTypes = {
    account: PropTypes.object.isRequired,
};

const PrintAccountButton = connect(
    (state, ownProps) => ({
        chain: state.network.getIn(['chain', 'name']),
    }),
    (dispatch, ownProps) => ({
        showPaperWallet: (address, privKey) => {
            dispatch(gotoScreen('paper-wallet', {address, privKey}));
        },
    })
)(PrintAccountRender);

export default PrintAccountButton;

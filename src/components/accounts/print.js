import { BrowserWindow } from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types'
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon'
import PaperWallet from './paper';
import { rpc } from 'lib/rpc';
import log from 'electron-log';


class PrintAccountRender extends React.Component {

    constructor(props) {
        super(props);
    }

    printWallet = (address, key) => {
      const printWindow = window.open('/');

      const onloadHandler = () => {
        log.debug("print window loaded");
      
        ReactDOM.render((
          <PaperWallet address={address} privKey={key} />
          ), printWindow.document.body);
      };

      onloadHandler();
      printWindow.onLoad = onloadHandler;
    }    

    exportKeyFile = (address) => {
        const chain = this.props.chain

        rpc.call('emerald_exportAccount', [{address}, {chain}]).then((result) => {
            this.printWallet(address, result);
        })
    }

    handleClick = () => {
        const address = this.props.account.get('id')
        this.exportKeyFile(address)
    }

    render () {
        return (<MenuItem
            leftIcon={<FontIcon className="fa fa-print"/>}
            primaryText='PRINT'
            onTouchTap={this.handleClick}/>)
    }
}

PrintAccountRender.propTypes = {
    account: PropTypes.object.isRequired,
}

const PrintAccountButton = connect(
    (state, ownProps) => ({
        chain: state.network.getIn(['chain', 'name'])
    }),
    null
)(PrintAccountRender);

export default PrintAccountButton;

import React from 'react';
import { connect } from 'react-redux';
import { IconMenu, IconButton, MenuItem } from 'material-ui';
import MoreHorizIcon from 'material-ui/svg-icons/navigation/more-horiz';
import FontIcon from 'material-ui/FontIcon';
import log from 'electron-log';

import { rpc } from 'lib/rpc';
import { gotoScreen } from 'store/screenActions';
import Wallet from 'lib/wallet';

const SecondaryMenu = ({ account, onPrint, onExport }) => {
    return (
        <IconMenu iconButtonElement={<IconButton><MoreHorizIcon /></IconButton>}>
            <MenuItem
                leftIcon={<FontIcon className="fa fa-hdd-o"/>}
                primaryText='EXPORT'
                onTouchTap={onExport}/>

            <MenuItem
                leftIcon={<FontIcon className="fa fa-print"/>}
                primaryText='PRINT'
                onTouchTap={onPrint}/>

        </IconMenu>
    );
};

// from http://stackoverflow.com/questions/283956/
const saveAs = (uri, filename) => {
    const link = document.createElement('a');
    if (typeof link.download === 'string') {
        document.body.appendChild(link); // Firefox requires the link to be in the body
        link.download = filename;
        link.href = uri;
        link.click();
        document.body.removeChild(link); // remove the link when done
    } else {
        location.replace(uri);
    }
};

export default connect(
    (state, ownProps) => ({
        chain: state.network.getIn(['chain', 'name']),
    }),
    (dispatch, ownProps) => ({
        onPrint: () => {
            const address = ownProps.account.get('id');
            const chain = ownProps.chain;

            rpc.call('emerald_exportAccount', [{address}, {chain}]).then((result) => {
                const wallet = Wallet.fromV3(result, '12345678');
                const privKey = wallet.getPrivateKeyString();
                dispatch(gotoScreen('paper-wallet', { address, privKey }));
            });
        },
        onExport: () => {
            const address = ownProps.account.get('id');
            const chain = ownProps.chain;

            rpc.call('emerald_exportAccount', [{address}, {chain}]).then((result) => {
                const fileData = {
                    filename: `${address}.json`,
                    mime: 'text/plain',
                    contents: result,
                };

                const blob = new Blob([fileData.contents], {type: fileData.mime});
                const url = URL.createObjectURL(blob);
                saveAs(url, fileData.filename);
            });
        },
    })
)(SecondaryMenu);

import React from 'react';
import { connect } from 'react-redux';
import { IconMenu, IconButton, MenuItem } from 'material-ui';
import MoreHorizIcon from 'material-ui/svg-icons/navigation/more-horiz';
import FontIcon from 'material-ui/FontIcon';
import log from 'electron-log';

import { api } from 'lib/rpc/api';
import { gotoScreen } from 'store/screenActions';
import saveAs from 'lib/saveAs';

const SecondaryMenu = ({ account, onPrint, onExport, chain }) => {
    return (
        <IconMenu iconButtonElement={<IconButton><MoreHorizIcon /></IconButton>}>
            <MenuItem
                leftIcon={<FontIcon className="fa fa-hdd-o"/>}
                primaryText='EXPORT'
                onTouchTap={ onExport(chain) }/>

            <MenuItem
                leftIcon={<FontIcon className="fa fa-print"/>}
                primaryText='PRINT'
                onTouchTap={ onPrint(chain) }/>

        </IconMenu>
    );
};

export default connect(
    (state, ownProps) => ({
        chain: state.launcher.getIn(['chain', 'name']),
    }),
    (dispatch, ownProps) => ({
        onPrint: (chain) => () => {
            const address = ownProps.account.get('id');

            dispatch(gotoScreen('export-paper-wallet', address));

        },
        onExport: (chain) => () => {
            const address = ownProps.account.get('id');

            api.emerald.exportAccount(address, chain).then((result) => {
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

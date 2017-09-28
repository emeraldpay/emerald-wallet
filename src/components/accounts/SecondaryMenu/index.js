import React from 'react';
import { connect } from 'react-redux';
import { IconMenu, IconButton, MenuItem } from 'material-ui';
import MoreHorizIcon from 'material-ui/svg-icons/navigation/more-horiz';
import FontIcon from 'material-ui/FontIcon';
import { api } from 'lib/rpc/api';
import saveAs from 'lib/saveAs';
import screen from '../../../store/wallet/screen';
import { gotoScreen } from '../../../store/wallet/screen/screenActions';

const renderDelete = (chain, account, onDelete, precision = 3) => {
    const balance = account.get('balance');

    if (!balance) {
        return;
    }

    // hide delete button if account has value
    if (balance.getEther(precision) > 0) {
        return;
    }

    return (
        <MenuItem
          leftIcon={<FontIcon className="fa fa-trash-o"/>}
          primaryText='DELETE'
          onTouchTap={ onDelete(chain) }/>
    )
};

const SecondaryMenu = ({ account, onPrint, onExport, onDelete, chain }) => {
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

            {renderDelete(chain, account, onDelete)}

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
        onDelete: (chain) => () => {
            const address = ownProps.account.get('id');
            dispatch(screen.actions.showDialog('delete', address));
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

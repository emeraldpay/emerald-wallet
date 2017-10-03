import React from 'react';
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit';
import { EditIcon } from 'elements/Icons';
import AccountAddress from '../AccountAddress';


const AddressAvatar = (props) => {
    const { primary, secondary, addr, abbreviated, tertiary, nameEdit, onAddressClick, onEditClick } = props;
    // TODO: handle tertiary (description if exists)
    const styles = {
        bc: {
            backgroundColor: 'inherit',
        },
        nopad: {
            padding: 0,
        },
        address: {
            color: '#747474',
            fontSize: '14px',
            lineHeight: '16px',
        },
        editIcon: {
            width: '20px',
            cursor: 'pointer',

        },
        accountName: {
            lineHeight: '22px',
            fontSize: '14px',
        },
    };
    return (
        <div style={{...styles.bc}}>
            <div style={ styles.accountName }>
                {primary ||
                <div onClick={ onEditClick } style={ {display: 'flex', alignItems: 'center'} }>
                    <div>{ nameEdit }</div>
                    <div style={{display: 'flex', alignItems: 'center', marginLeft: '5px'}}>
                        <EditIcon style={ styles.editIcon } />
                    </div>
                </div>}
            </div>
            <div>
                {secondary || <AccountAddress
                    onClick={ onAddressClick }
                    id={ addr }
                    style={ styles.address }
                    abbreviated={ abbreviated }
                />}
            </div>
        </div>
    );
};

export default AddressAvatar;

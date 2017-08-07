import React from 'react';
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit';
import AccountAddress from './accountAddress';

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
            fontSize: '14px',
        },
    };
    return (
        <div style={{...styles.bc}}>
            <div style={styles.accountName}>
                {primary ||
                <span onClick={onEditClick}>{nameEdit} <ModeEdit style={styles.editIcon} /></span>}
            </div>
            <div>
                {secondary ||
                <AccountAddress onClick={onAddressClick} id={addr} style={styles.address} abbreviated={abbreviated}/>}
            </div>
        </div>
    );
};

export default AddressAvatar;

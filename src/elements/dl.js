import React from 'react';
import ListItem from 'material-ui/List/ListItem';
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit';
import { Card, CardHeader } from 'material-ui/Card';
import copy from 'copy-to-clipboard';
import FontIcon from 'material-ui/FontIcon';
import { copyIcon, noShadow, link } from 'lib/styles';

export const DescriptionList = (props) => {
    const style = {
        width: '100%',
        overflow: 'hidden'
    };
    return (
        <dl style={style} {...props}>
            {props.children}
            <br />
        </dl>
    );
};

export const DescriptionTitle = (props) => {
    const style = {
        float: 'left',
        width: '35%',
        textAlign: "right",
        margin: 0,
        padding: "0 5px 0 0",
        fontWeight: 900
    };
    return (
        <dt style={style} {...props}>
            {props.children}
        </dt>
    );
};

export const DescriptionData = (props) => {
    const style = {
        float: 'left',
        width: '60%',
        margin: 0,
        padding: "0 0 0 5px"
    };
    return (
        <dd style={style} {...props}>
            {props.children}
        </dd>
    );
};

export const AccountAddress = (props) => {
    const { id, abbreviated } = props;
    function copyAddressToClipBoard() {
        copy(id);
    }
    const styles = {
        light: {
            fontSize: '0.8rem',
            color: 'gray',
            fontWeight: '300',
        },
    };
    let icons = null;
    if (!abbreviated) {
        icons = <FontIcon className='fa fa-clone'
                          onClick={copyAddressToClipBoard}
                          style={copyIcon} />;
    }
    return (
        <span style={styles.light}>
            <span>{abbreviated ? id.substring(2, 7) + '...' + id.substring(id.length-6, id.length-1) : id}</span>
            {icons}
        </span>
    );
};

export const AddressAvatar = (props) => {
    const { primary, secondary, addr, abbreviated, tertiary, nameEdit, onClick } = props;
    // TODO: handle tertiary (description if exists)
    const styles = {
        bc: {
            backgroundColor: 'inherit',
        },
        nopad: {
            padding: 0
        },
        address: {
            color: '#747474', 
            fontSize: '14px',
            lineHeight: '16px',
        }
    };
    return (
        <Card style={{...noShadow, ...styles.bc, ...link}} >
            <CardHeader
                style={styles.nopad}
                title={primary || 
                    <span>{nameEdit} <ModeEdit style={{width: '20px'}} /></span>}
                subtitle={secondary || 
                    <AccountAddress id={addr} style={styles.address} abbreviated={abbreviated}/>}
                onClick={onClick}
            />
        </Card>
    );
};

export function ValueCard(props) {
    let { name, value } = props;
    value = value || props['default'];
    const styles = {
        bc: {
            backgroundColor: 'inherit',
        },
        light: {
            fontSize: '0.8rem',
            color: 'gray',
            fontWeight: '300',
        },
    };
    const val = <span style={styles.light}>
        <span>{value}</span>
    </span>;
    return (
        <Card style={{...noShadow, ...styles.bc, ...link}} >
            <CardHeader
                title={name}
                subtitle={val}
            />
        </Card>
    );
}

export const AccountItem = (props) => {
    const { primary, secondary } = props;
    return (
        <ListItem
            insetChildren={true}
            disabled={true}
            primaryText={primary}
            secondaryText={secondary}
        />
    );
};

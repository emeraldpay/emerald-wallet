import React from 'react';
import Avatar from 'material-ui/Avatar';
import ListItem from 'material-ui/List/ListItem';
import ImportContacts from 'material-ui/svg-icons/communication/import-contacts';

import { deepOrange300, purple500 } from 'material-ui/styles/colors';

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

export const AddressAvatar = (props) => {
    const { primary, secondary, tertiary, openAccount } = props;
    return (
        <ListItem
          leftAvatar={
            <Avatar color={deepOrange300}
              backgroundColor={purple500}
              size={30}>⟠
            </Avatar>
          }
          rightIcon={<ImportContacts />}
          onClick={openAccount}
          primaryText={primary}
          secondaryText={(tertiary) ?
            <p>{tertiary}
                <br />
                {secondary}
            </p> : secondary
        }
        />
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
}
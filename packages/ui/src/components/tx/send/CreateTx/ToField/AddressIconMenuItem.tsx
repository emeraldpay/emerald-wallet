import { Account } from '@emeraldplatform/ui';
import MenuItem from '@material-ui/core/MenuItem';
import * as React from 'react';

interface Props {
  onChange: Function;
  address: string;
}

class AddressIconMenuItem extends React.Component<Props> {
  public static muiName = 'MenuItem';

  constructor (props: Props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  public onClick () {
    this.props.onChange(this.props.address);
  }

  public render () {
    const menuStyle = {
      paddingBottom: '5px',
      paddingTop: '5px',
      minHeight: 'auto',
      height: 'auto'
    };
    return (
      <MenuItem onClick={this.onClick} style={menuStyle}>
        <Account
          identityProps={{ size: 30 }}
          address={this.props.address}
          identity={true}
          addressProps={{ hideCopy: true }}
        />
      </MenuItem>
    );
  }
}

export default AddressIconMenuItem;

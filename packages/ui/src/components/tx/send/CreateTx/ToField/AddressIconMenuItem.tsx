import * as React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { Account } from '@emeraldplatform/ui';

interface Props {
  onChange: Function,
  address: string,
}

class AddressIconMenuItem extends React.Component<Props> {
  static muiName = 'MenuItem';

  constructor(props: Props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onChange(this.props.address);
  }

  render() {
    const menuStyle = {
      paddingBottom: '5px',
      paddingTop: '5px',
      minHeight: 'auto',
      height: 'auto',
    };
    return (
      <MenuItem onClick={this.onClick} style={menuStyle}>
        <Account
          identityProps={{size: 30}}
          address={this.props.address}
          identity={true}
          addressProps={{hideCopy: true}}
        />
      </MenuItem>
    );
  }
}

export default AddressIconMenuItem;

import React from 'react';
import PropTypes from 'prop-types';
import { Account } from '@emeraldplatform/ui';
import { MenuItem } from 'material-ui';

class AddressIconMenuItem extends React.Component {
  static muiName = 'MenuItem';

  static propTypes = {
    onChange: PropTypes.func.isRequired,
    address: PropTypes.string.isRequired,
  };

  constructor(...props) {
    super(...props);
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
      <MenuItem
        onClick={this.onClick}
        style={menuStyle}
        primaryText={
          <Account identityProps={{size: 30}} address={this.props.address} identity={true} hideCopy={true} />
        }
      />
    );
  }
}

export default AddressIconMenuItem;

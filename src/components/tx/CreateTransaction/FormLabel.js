import React from 'react';
import PropTypes from 'prop-types';
import muiThemeable from 'material-ui/styles/muiThemeable';

function getStyles(muiTheme) {
  return {
    flexShrink: 1,
    width: '120px',
    textAlign: 'right',
    paddingRight: '30px',
    fontSize: '16px',
    fontWeight: '400',
    color: muiTheme.palette.textColor,
    fontFamily: muiTheme.fontFamily,
  };
}

class FormLabel extends React.Component {
  static propTypes = {
    muiTheme: PropTypes.object,
  };

  render() {
    return (<label style={getStyles(this.props.muiTheme)}>{this.props.children}</label>);
  }
}

export default muiThemeable()(FormLabel);

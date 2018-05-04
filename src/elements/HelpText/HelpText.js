import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

const HelpText = ({children, muiTheme}) => {
  const style = {
    fontSize: '16px',
    color: muiTheme.palette.textColor,
  };
  return (
    <span style={style}>{children}</span>
  );
};

export default muiThemeable()(HelpText);

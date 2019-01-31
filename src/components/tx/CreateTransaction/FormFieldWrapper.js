import React from 'react';
import PropTypes from 'prop-types';

function getStyles(style) {
  return {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 0,
    paddingBottom: '20px',
    ...style,
  };
}


class FormFieldWrapper extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    style: PropTypes.object,
  };

  static defaultProps = {
    style: {},
  };


  render() {
    return (
      <div style={getStyles(this.props.style)}>
        {this.props.children}
      </div>
    );
  }
}

export default FormFieldWrapper;

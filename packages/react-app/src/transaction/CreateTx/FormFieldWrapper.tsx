import * as React from 'react';

function getStyles (style?: any) {
  return {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 0,
    paddingBottom: '20px',
    ...style
  };
}

interface IProps {
  children?: any;
  style?: any;
}

class FormFieldWrapper extends React.Component<IProps> {
  public static defaultProps = {
    style: {}
  };

  public render () {
    const { style, children } = this.props;
    return (
      <div style={getStyles(style)}>
        {children}
      </div>
    );
  }
}

export default FormFieldWrapper;

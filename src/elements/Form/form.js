// @flow
import React from 'react';
import { Card } from 'emerald-js-ui';
import formStyles from './form.scss';

export const styles = {
  fieldName: {
    color: '#747474',
    fontSize: '16px',
    textAlign: 'right',
  },
  left: {
    flexBasis: '20%',
    marginLeft: '14.75px',
    marginRight: '14.75px',
  },
  right: {
    flexGrow: 2,
    display: 'flex',
    alignItems: 'center',
    marginLeft: '14.75px',
    marginRight: '14.75px',
    maxWidth: '580px',
  },
  formRow: {
    display: 'flex',
    marginBottom: '19px',
    alignItems: 'center',
  },
};

export const Row = (props: {children: any}) => {
  return (
    <div className={ formStyles.formRow }>
      {props.children}
    </div>
  );
};


export class Form extends React.Component {
  props: {
    backButton: Element,
    caption: string,
    children: Element,
  }

  render() {
    const { children, caption, backButton } = this.props;
    return (
      <Card>
        <div className={ formStyles.form }>
          <div style={styles.formRow}>
            <div style={styles.left}>
              { backButton }
            </div>
            <div style={styles.right}>
              <div style={{fontSize: '22px'}}>
                {caption}
              </div>
            </div>
          </div>
          <div style={{paddingTop: '30px'}}>
            {children}
          </div>
        </div>
      </Card>);
  }
}


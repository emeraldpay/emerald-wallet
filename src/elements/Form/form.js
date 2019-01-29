import React from 'react';
import withStyles from 'react-jss';
import { Card } from 'emerald-js-ui';

const styles2 = {
  form: {
    paddingTop: '41px',
    paddingBottom: '41px',
  },
  formRow: {
    display: 'flex',
    marginBottom: '19px',
    alignItems: 'center',
  },
};

export const styles = {
  fieldName: {
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

export const Row = withStyles(styles2)((props) => {
  const { classes, children } = props;
  return (
    <div className={classes.formRow}>
      {children}
    </div>
  );
});

export const Form = withStyles(styles2)((props) => {
  const {
    children, caption, backButton, style, classes,
  } = props;
  return (
    <Card style={style}>
      <div className={classes.form}>
        <div style={styles.formRow}>
          <div style={styles.left}>
            {backButton}
          </div>
          <div style={styles.right}>
            <div style={{ fontSize: '22px' }}>
              {caption}
            </div>
          </div>
        </div>
        <div style={{ paddingTop: '30px' }}>
          {children}
        </div>
      </div>
    </Card>);
});

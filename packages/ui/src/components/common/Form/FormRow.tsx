import { WithStyles, createStyles, withStyles } from '@material-ui/core';
import { CSSProperties } from 'react';
import * as React from 'react';

const styles = createStyles({
  container: {
    alignItems: 'center',
    display: 'flex',
    paddingBottom: 20,
  },
});

interface OwnProps {
  last?: boolean;
  style?: CSSProperties;
}

class FormRow extends React.Component<OwnProps & WithStyles<typeof styles>> {
  render(): React.ReactNode {
    const { children, classes, last, style } = this.props;

    return (
      <div className={classes.container} style={{ paddingBottom: last === undefined ? undefined : 0, ...style }}>
        {children}
      </div>
    );
  }
}

export default withStyles(styles)(FormRow);

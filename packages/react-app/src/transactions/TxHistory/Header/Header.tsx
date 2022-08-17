import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';

const styles = createStyles({
  headerContainer: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerMain: {
    alignItems: 'center',
    display: 'flex',
  },
  headerTitle: {
    color: '#191919',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: '24px',
    textTransform: 'uppercase',
  },
});

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const Header: React.FC<StylesProps> = ({ classes }) => {
  return (
    <div className={classes.headerContainer}>
      <div className={classes.headerMain}>
        <div className={classes.headerTitle}>History</div>
      </div>
    </div>
  );
};

export default withStyles(styles)(Header);

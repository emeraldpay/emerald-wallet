import { createStyles, Theme, useTheme, withStyles } from '@material-ui/core';
import * as React from 'react';

const styles = createStyles({
  container: {
    alignItems: 'center',
    display: 'inline-flex',
    justifyContent: 'center',
    padding: 4,
    position: 'relative',
  },
  pie: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
});

interface OwnProps {
  progress: number;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const ProgressPie: React.FC<OwnProps & StylesProps> = ({ children, classes, progress }) => {
  const theme = useTheme<Theme>();

  return (
    <div className={classes.container}>
      {progress > 0 && progress < 100 && (
        <svg className={classes.pie} height="20" width="20" viewBox="0 0 20 20">
          <circle
            r="5"
            cx="10"
            cy="10"
            fill="transparent"
            stroke={theme.palette.primary.main}
            strokeDasharray={`calc(${progress} * 31.42 / 100) 31.42`}
            strokeWidth="10"
            transform="rotate(-90) translate(-20)"
          />
        </svg>
      )}
      {children}
    </div>
  );
};

export default withStyles(styles)(ProgressPie);

/*
Copyright 2019 ETCDEV GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import {withStyles} from '@material-ui/core/styles';
import * as React from 'react';

const styles = (theme?: any) => ({
  toggledIcon: {
    cursor: 'pointer',
    marginLeft: '4px'
  }
});

interface IProps {
  onClick: any;
  icon: any;
  toggledIcon: any;
  toggleDuration?: number;
  classes: any;
}

function ToggledIconButton(props: IProps) {
  const {classes, toggledIcon, icon, onClick} = props;
  const toggleDuration = props.toggleDuration || 1000;
  const [toggled, setToggled] = React.useState(false);

  React.useEffect(() => {
    if (toggled) {
      const timeout = setTimeout(() => setToggled(false), toggleDuration);
      return () => clearTimeout(timeout);
    }
  });

  function handleClick() {
    if (onClick) {
      onClick();
    }
    setToggled(true);
  }

  return (
    <div className={classes.toggledIcon} onClick={handleClick}>
      {toggled ? toggledIcon : icon}
    </div>
  );
}

export default withStyles(styles)(ToggledIconButton);

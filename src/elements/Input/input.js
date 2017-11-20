import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from 'material-ui';

import styles from './input.scss';

export default class Input extends React.Component {
    static propTypes = {
      value: PropTypes.string,
      underlineShow: PropTypes.bool,
      className: PropTypes.string,
    }

    render() {
      const { value, underlineShow, className } = this.props;
      return (
        <div className={ styles.container }>
          <TextField
            className={ className }
            value={ value }
            underlineShow={ underlineShow }
            fullWidth={ true }
          />
        </div>
      );
    }
}

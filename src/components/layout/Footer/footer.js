import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import { LinkButton } from 'emerald-js-ui';
import styles from './footer.scss';

const Footer = (props) => {
  const { maxWidth = '1220px', handleAbout } = props;

  const footerDiv = {
    paddingLeft: '6px',
    paddingRight: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    margin: '0 auto',
    maxWidth,
  };

  const linkButton = {
    color: '#747474',
    fontWeight: 'normal',
    textTransform: 'none',
    paddingRight: '0px',
  };

  return (
    <div style={ footerDiv }>
      <div className={ styles.leftContainer }>
        <div>Ethereum Classic</div>
        <div><LinkButton href="https://www.etcdevteam.com/support.html" label="Donation" /></div>
      </div>

      <div>
        <FlatButton
          onClick={ handleAbout }
          labelStyle={ linkButton }
          hoverColor="transparent"
          label="About"
          disableTouchRipple={ true }
        />
        <FlatButton
          labelStyle={ linkButton }
          hoverColor="transparent"
          label="Help"
          disableTouchRipple={ true }
          href="https://github.com/ethereumproject/emerald-wallet" />
        <FlatButton
          labelStyle={{ ...linkButton }}
          style={{ textAlign: 'right' }}
          hoverColor="transparent"
          label="Support"
          disableTouchRipple={ true }
          href="https://github.com/ethereumproject/emerald-wallet" />
      </div>
    </div>
  );
};

export default Footer;

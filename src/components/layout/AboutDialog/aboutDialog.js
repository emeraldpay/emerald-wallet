import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import CloseButton from 'elements/CloseButton';
import version from '../../../version';

import classes from './aboutDialog.scss';

export const AboutDialog = ({ onClose }) => {
  return <Dialog
    modal={false}
    open={true}
    onRequestClose={ onClose }>
    <div className={ classes.header }>
      <div>
        <h1>About</h1>
      </div>
      <div>
        <CloseButton onClick={ onClose } className={ classes.closeButton }/>
      </div>
    </div>
    <div>
      <div>
        < div style={{color: 'limegreen'}}>
          {version}
        </div>
        <div style={{color: 'gray', fontWeight: '300', fontSize: '14px'}}>
          <p style={{marginTop: 0}}>
                        Find an issue? Got a suggestion? <br/>
                        Please let us know on our <a href='https://github.com/ethereumproject/emerald-wallet/issues'>
                        Github issues page</a>.
          </p>
          <p>
                        Made with ❤️&nbsp; by <strong>ETCDEV</strong> and <a
              href='https://github.com/ethereumproject/emerald-wallet/graphs/contributors'>many wonderful
                        contributors</a>.
          </p>
        </div>
        <div>
          <FlatButton
            label="Source"
            labelPosition="before"
            href="https://github.com/ethereumproject/emerald-wallet"
            icon={ <FontIcon className="fa fa-github"/> }
          />
        </div>
      </div>
    </div>
  </Dialog>;
};

export default AboutDialog;


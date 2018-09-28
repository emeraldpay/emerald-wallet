import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PlayCircle } from 'emerald-js-ui/lib/icons3';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import FlatButton from 'material-ui/FlatButton';
import muiThemeable from 'material-ui/styles/muiThemeable';
import screen from '../../store/wallet/screen';

const Render = ({ muiTheme, numberOfAccounts, nextPage }) => {
  return (
    <Row>
      <Col xs={12}>
        <div style={{fontWeight: '300'}}>
          <p>
            Welcome to Emerald Wallet. Thanks for trying it out!<br/>
          </p>
          <p>
            Made with ❤️&nbsp; by <strong>ETCDEV</strong> and <strong>many wonderful contributors</strong>.
          </p>
        </div>
      </Col>
      <Col xs={12}>
        <FlatButton label="Open Wallet"
          icon={<PlayCircle style={{color: muiTheme.palette.alternateTextColor}}/>}
          style={{backgroundColor: muiTheme.palette.primary1Color, color: muiTheme.palette.alternateTextColor}}
          onClick={() => nextPage(numberOfAccounts)}/>
      </Col>
    </Row>
  );
};


Render.propTypes = {
  save: PropTypes.func.isRequired,
};

const OpenWallet = connect(
  (state, ownProps) => ({
    numberOfAccounts: state.accounts.get('accounts').size,
  }),
  (dispatch, ownProps, state) => ({
    nextPage: (numberOfAccounts) => {
      dispatch(screen.actions.gotoScreen(numberOfAccounts === 0 ? 'landing' : 'home'));
    },
  })
)(Render);

export default muiThemeable()(OpenWallet);

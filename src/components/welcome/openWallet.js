import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { cardSpace } from 'lib/styles';
import { saveSettings } from 'store/launcherActions';

const Render = ({ save }) => {

    return (
        <Row>
            <Col xs={12}>
                <div style={{fontWeight: '300'}}>
                    <p>
                        Welcome to Emerald Wallet Alpha. Thanks for trying it out!<br/>
                        We're looking forward to a Beta release by July 20th.
                    </p>
                    <p>
                        Made with ❤️&nbsp; by <strong>ETCDEV</strong> and <strong>many wonderful contributors</strong>.
                    </p>
                </div>
            </Col>
            <Col xs={12}>
                <FlatButton label="Open Wallet"
                            icon={<FontIcon className="fa fa-play-circle" />}
                            style={{backgroundColor: 'limegreen', color: 'white'}}
                            onClick={save}/>
            </Col>
        </Row>
    );
};


Render.propTypes = {
    save: PropTypes.func.isRequired,
};

const OpenWallet = connect(
    (state, ownProps) => ({
    }),
    (dispatch, ownProps) => ({
        save: () => {
            dispatch(saveSettings());
        },
    })
)(Render);

export default OpenWallet;

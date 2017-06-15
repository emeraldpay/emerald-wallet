import React from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { align, cardSpace } from 'lib/styles';
import logo from 'images/etc_logo.png';
import Status from './status';
import Total from './total';
import Navigation from './navigation';


const Render = () => {
    const style = {
        paddingTop: '15px',
        paddingBottom: '20px',
        cardSpace,
    };
    const titleStyle = {
        fontWeight: 900,
        fontSize: '28px',
    };

    return (
        <div style={style}>
            <Row>
                <Col xs={4}>
                    <Row middle="xs">
                        <Col xs={3} style={align.center}>
                            <img src={logo} height={48}/>
                        </Col>
                        <Col xs={9} style={titleStyle}>
                            Emerald Wallet
                        </Col>
                    </Row>
                </Col>
                <Col xs={4} style={align.center}>
                    <Status/>
                </Col>
                <Col xs={4} style={align.right}>
                    <Navigation/>
                </Col>
            </Row>
            <Row>
                <Col xs={10} xsOffset={1} style={align.center}>
                    <Total/>
                </Col>
            </Row>
        </div>
    );
};

const Header = connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({})
)(Render);

export default Header;

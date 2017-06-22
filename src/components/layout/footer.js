import React from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { align, cardSpace } from 'lib/styles';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { Card, CardHeader } from 'material-ui/Card';

// #footer {
//   padding: 72px 24px 72px 24px;
//   box-sizing: border-box;
//   background-color: #333;
//   color: #92c1ff;
//   text-align: center;
//
//   a {
//     color: #89a8ff;
//   }
// }


const Render = () => {
    const styles = {
        footerDiv: {
            paddingTop: '40px',
            paddingBottom: '40px',
            cardSpace,
            // backgroundColor: 'dimgray',
            margin: '5px',
        },
    };

    return (
        <Row style={{...styles.footerDiv}}>
            <Col xs={2} style={{color: 'limegreen'}}>
                Beta 0.0.1
            </Col>
            <Col xs={8} middle='xs' style={{color: 'gray'}}>
                <p style={{marginTop: 0}}>
                Welcome to Emerald Wallet Beta. Thanks for trying it out!<br/>
                We're anticipating an Alpha release by July 20th.
                In the meantime, you're encouraged to submit issues
                as well as suggestions to our <a target='_blank' href='//github.com/ethereumproject/emerald-wallet/issues'>
                issues page</a>.
                </p>
                <p>
                Made with ❤️&nbsp; by <strong>ETCDEV</strong> and <a target='_blank' href='https://github.com/ethereumproject/emerald-wallet/network/members'> wonderful contributors</a>.
                </p>
            </Col>
            <Col xs={2} style={align.right} middle="xs">

                <FlatButton label="On GitHub"
                    labelPosition="before"
                    href="https://github.com/ethereumproject/emerald-wallet"
                    icon={<FontIcon className="fa fa-github" />}/>
            </Col>
        </Row>
    );
};

const Footer = connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({})
)(Render);

export default Footer;

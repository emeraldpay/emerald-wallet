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
                Alpha 0.2.0
            </Col>
            <Col xs={8} style={{color: 'gray', fontWeight: '300'}}>
                <p style={{marginTop: 0}}>
                Find an issue? Got a suggestion? <br/>
                Please let us know on our <a  href='https://github.com/ethereumproject/emerald-wallet/issues'>
                Github issues page</a>.
                </p>
                <p>
                Made with ❤️&nbsp; by <strong>ETCDEV</strong> and <a href='https://github.com/ethereumproject/emerald-wallet/graphs/contributors'>many wonderful contributors</a>.
                </p>
            </Col>
            <Col xs={2} style={align.right}>

                <FlatButton label="Source"
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

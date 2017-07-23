import React from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { align, cardSpace } from 'lib/styles';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { Card, CardHeader } from 'material-ui/Card';

const Render = () => {
    const styles = {
        footerDiv: {
            padding: '32px 6px',
            cardSpace,

            display: 'flex',
            justifyContent: 'space-between',
            margin: '0 auto',
            maxWidth: '1060px',
        },
    };

    return (
        <div style={{...styles.footerDiv}}>
            <div style={{color: 'limegreen'}}>
                Alpha 0.3.0
            </div>
            <div style={{color: 'gray', fontWeight: '300', fontSize: '14px'}}>
                <p style={{marginTop: 0}}>
                Find an issue? Got a suggestion? <br/>
                Please let us know on our <a  href='https://github.com/ethereumproject/emerald-wallet/issues'>
                Github issues page</a>.
                </p>
                <p>
                Made with ❤️&nbsp; by <strong>ETCDEV</strong> and <a href='https://github.com/ethereumproject/emerald-wallet/graphs/contributors'>many wonderful contributors</a>.
                </p>
            </div>
            <div style={align.right}>
                <FlatButton label="Source"
                    labelPosition="before"
                    href="https://github.com/ethereumproject/emerald-wallet"
                    icon={<FontIcon className="fa fa-github" />}/>
            </div>
        </div>
    );
};

const Footer = connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({})
)(Render);

export default Footer;

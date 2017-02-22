import React from 'react'
import { connect } from 'react-redux'
import AppBar from 'material-ui/AppBar'
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index'
import './main.scss'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'
import Screen from './screen'
import { open } from '../store/screenActions'


const Render = ({openAccounts}) => (
    <Grid>
        <Row>
            <Col xs={12}>
            <AppBar
                title="Emerald - Ethereum Classic Wallet"
                iconElementRight={<FlatButton label="Accounts"
                                              onClick={openAccounts}
                                              icon={<FontIcon className="fa fa-address-book-o" />
                                              } />}
            />
            </Col>
        </Row>
        <Row>
            <Col xs={12}>
                <Screen id="body"/>
            </Col>
        </Row>
        <Row>
            <Col xs={12}>
                <div id="footer">
                    Emerald Wallet, Ethereum Classic, 2017<br/>
                    <FlatButton label="Fork on GitHub"
                                backgroundColor="#505050"
                                href="https://github.com/ethereumproject/emerald-wallet"
                                icon={<FontIcon className="fa fa-github" />}/>
                </div>
            </Col>
        </Row>
    </Grid>
);

const Main = connect(
    (state, ownProps) => {
        return {}
    },
    (dispatch, ownProps) => {
        return {
            openAccounts: () => {
                dispatch(open('home'))
            }
        }
    }
)(Render);

export default Main;
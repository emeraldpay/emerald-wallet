import React from 'react'
import AppBar from 'material-ui/AppBar'
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index'
import './main.scss'
// import 'flexboxgrid/src/css/flexboxgrid.css'

import Screen from './screen'


const Main = () => (
    <Grid>
        <Row>
            <Col xs={12}>
            <AppBar
                title="Ethereum Classic Wallet"
                iconClassNameRight="muidocs-icon-navigation-expand-more"
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
                    <div>
                        Ethereum Classic, 2017 | <a href="https://github.com/ethereumproject/wallet">Fork on GitHub</a>
                    </div>
                </div>
            </Col>
        </Row>
    </Grid>
);

export default Main;
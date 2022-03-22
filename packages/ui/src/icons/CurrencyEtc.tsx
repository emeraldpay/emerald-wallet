/*
Copyright 2019 ETCDEV GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import * as React from 'react';
import SvgIcon, {SvgIconProps} from '@material-ui/core/SvgIcon';

const CurrencyEtc: React.ComponentType<SvgIconProps> = (props) => (
  <SvgIcon style={{fill: 'none'}} stroke="currentColor" fill="none" strokeWidth="4" viewBox="0 0 64 64" {...props} >
    <path d="M32 56L16 32 32 8l16 24-16 24z"/>
    <path d="M16 32l16-8 16 8m-32 0l16 8 16-8"/>
  </SvgIcon>
);

export default CurrencyEtc;

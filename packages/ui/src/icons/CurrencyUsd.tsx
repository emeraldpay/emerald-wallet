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

const CurrencyUsd: React.ComponentType<SvgIconProps> = (props) => (
  <SvgIcon style={{fill: 'none'}} stroke="currentColor" fill="none" strokeWidth="4" viewBox="0 0 64 64" {...props} >
    <path d="M28 32a8 8 0 0 1 0-16m8 16a8 8 0 0 1 0 16M32 8v8m0 32v8m-4-24h8m8-12s-4-4-8-4h-8m-8 28s4 4 8 4h8"/>
  </SvgIcon>
);

export default CurrencyUsd;

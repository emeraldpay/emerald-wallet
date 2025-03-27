/*
Copyright 2024 Igor Artamonov

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
import SvgIcon, {SvgIconProps} from '@mui/material/SvgIcon';

const CurrencyGbp: React.ComponentType<SvgIconProps> = (props) => (
  <SvgIcon style={{fill: 'none'}} stroke="currentColor" fill="none" strokeWidth="4" viewBox="0 0 64 64" {...props} >
    <path
      d="M12.4531,25A8.7775,8.7775,0,0,0,14,20a10.6,10.6,0,0,0-.18-2H22V16H13.2175c-.0842-.2109-.17-.4194-.2556-.624A9.8586,9.8586,0,0,1,12,11a4.792,4.792,0,0,1,5-5,6.1234,6.1234,0,0,1,5.2222,2.6279l1.5556-1.2558A8.11,8.11,0,0,0,17,4a6.7781,6.7781,0,0,0-7,7,11.65,11.65,0,0,0,1.0559,5H8v2h3.7729A8.209,8.209,0,0,1,12,20c0,2.5234-1.4858,5-3,5v2H24V25Z"/>
  </SvgIcon>
);

export default CurrencyGbp;

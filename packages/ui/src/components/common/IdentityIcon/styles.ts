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

const styles = {
  expandedButton: {
    '&:before': {
      content: 'url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDEyIDE0Ij48cGF0aCBmaWxsPSIjNDdCMDRCIiBkPSJNOS41IDcuNXYtMXEwLTAuMjAzLTAuMTQ4LTAuMzUydC0wLjM1Mi0wLjE0OGgtMnYtMnEwLTAuMjAzLTAuMTQ4LTAuMzUydC0wLjM1Mi0wLjE0OGgtMXEtMC4yMDMgMC0wLjM1MiAwLjE0OHQtMC4xNDggMC4zNTJ2MmgtMnEtMC4yMDMgMC0wLjM1MiAwLjE0OHQtMC4xNDggMC4zNTJ2MXEwIDAuMjAzIDAuMTQ4IDAuMzUydDAuMzUyIDAuMTQ4aDJ2MnEwIDAuMjAzIDAuMTQ4IDAuMzUydDAuMzUyIDAuMTQ4aDFxMC4yMDMgMCAwLjM1Mi0wLjE0OHQwLjE0OC0wLjM1MnYtMmgycTAuMjAzIDAgMC4zNTItMC4xNDh0MC4xNDgtMC4zNTJ6TTEyIDdxMCAxLjYzMy0wLjgwNSAzLjAxMnQtMi4xODQgMi4xODQtMy4wMTIgMC44MDUtMy4wMTItMC44MDUtMi4xODQtMi4xODQtMC44MDUtMy4wMTIgMC44MDUtMy4wMTIgMi4xODQtMi4xODQgMy4wMTItMC44MDUgMy4wMTIgMC44MDUgMi4xODQgMi4xODQgMC44MDUgMy4wMTJ6Ij48L3BhdGg+PC9zdmc+)',
      position: 'absolute',
      fontFamily: 'FontAwesome, serif',
      top: 0,
      fontStyle: 'normal',
      fontWeight: 'normal',
      left: '24px',
      fontSize: '20px',
      height: '20px',
      width: '20px',
      margin: '0',
      color: '#47B04B',
      backgroundColor: 'white',
      borderRadius: '50%',
      textAlign: 'center',
      border: '1px solid #FFFFFF'
    }
  },
  clickAble: {
    '&:hover': {
      cursor: 'pointer'
    }
  }
};

export default styles;

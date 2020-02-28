import { Check2 as CheckIcon } from '@emeraldplatform/ui-icons';
import { Grid } from '@material-ui/core';
import { CSSProperties } from '@material-ui/styles';
import * as React from 'react';
import Button from '../../common/Button';

interface IProps {
  onAgree?: any;
}

export const Terms = ({ onAgree }: IProps) => {
  const style = {
    width: '100%',
    height: '250px',
    overflowY: 'scroll'
  } as CSSProperties;

  return (
    <Grid container={true} direction='column' justify='center' alignItems='center'>
      <Grid item={true} xs={12}>
        <div style={style}>
          <p>
            End-User License Agreement for Emerald Wallet<br/>
            Last updated: 12 February 2019
          </p>
          <p>
            This End-User License Agreement (&quot;EULA&quot; or &quot;AGREEMENT&quot;) is a legal agreement between
            you (either an individual or a single entity) and ETCDEV GmbH (&quot;COMPANY&quot;), including all
            contributors to source code of this Software identified above, which includes computer software and
            may include associated media, printed materials, and “online” or electronic documentation (“SOFTWARE”).
          </p>
          <p>
            By installing, copying, or otherwise using the SOFTWARE, you agree to be bounded by the terms of this
            AGREEMENT. If you do not agree to the terms of this AGREEMENT, do not install or use the SOFTWARE.
          </p>
          <p>
            COMPANY grants you a revocable, non­exclusive, non­transferable, limited license
            to download, install and use the Application solely for your personal, non­commercial purposes
            strictly in accordance with the terms of this AGREEMENT.
          </p>
          <p>
            You agree not to, and you will not permit others to:
            a) license, sell, rent, lease, assign, distribute, transmit, host, outsource, disclose or otherwise
            commercially exploit the Application or make the Application available to any third party.
          </p>
          <p>
            COMPANY reserves the right to modify, suspend or discontinue, temporarily or
            permanently, the Application or any service to which it connects, with or without notice and without
            liability to you
          </p>
          <p>
            This AGREEMENT shall remain in effect until terminated by you or COMPANY.<br/>
            COMPANY may, in its sole discretion, at any time and for any or no reason,
            suspend or terminate this AGREEMENT with or without prior notice.<br/>
            This AGREEMENT will terminate immediately, without prior notice from COMPANY, in
            the event that you fail to comply with any provision of this AGREEMENT. You may also terminate this
            AGREEMENT by deleting the Application and all copies thereof from your mobile device or from your
            desktop.<br/>
            Upon termination of this AGREEMENT, you shall cease all use of the Application and delete all copies
            of the Application from your mobile device or from your desktop
          </p>
          <p>
            If any provision of this AGREEMENT is held to be unenforceable or invalid, such provision will be
            changed and interpreted to accomplish the objectives of such provision to the greatest extent
            possible under applicable law and the remaining provisions will continue in full force and effect.
          </p>
          <p>
            COMPANY reserves the right, at its sole discretion, to modify or replace this
            AGREEMENT at any time. If a revision is material we will provide at least 30 days notice
            prior to any new terms taking effect. What constitutes a material change will be determined at our
            sole discretion.
          </p>
          <p>
            THE SOFTWARE IS PROVIDED ON AN &quot;AS IS&quot; BASIS, AND NO WARRANTY, EITHER EXPRESS OR IMPLIED,
            IS GIVEN. YOUR USE OF THE SOFTWARE IS AT YOUR SOLE RISK. AUTHORS do not warrant that (i)
            the SOFTWARE will meet your specific requirements; (ii) the SOFTWARE is fully compatible
            with any particular platform; (iii) your use of the SOFTWARE will be uninterrupted, timely,
            secure, or error-free; (iv) the results that may be obtained from the use of the SOFTWARE
            will be accurate or reliable; (v) the quality of any products, services, information, or
            other material purchased or obtained by you through the SOFTWARE will meet your
            expectations; or (vi) any errors in the SOFTWARE will be corrected.
          </p>
          <p>
            YOU EXPRESSLY UNDERSTAND AND AGREE THAT AUTHORS SHALL NOT BE LIABLE FOR ANY DIRECT,
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR EXEMPLARY DAMAGES, INCLUDING BUT NOT
            LIMITED TO, DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA OR OTHER INTANGIBLE LOSSES
            (EVEN IF AUTHORS OR ETHEREUM CLASSIC MEMBERS HAS BEEN ADVISED OF THE POSSIBILITY OF
            SUCH DAMAGES) RELATED TO THE SOFTWARE, including, for example: (i) the use or the inability
            to use the SOFTWARE; (ii) the cost of procurement of substitute goods and services
            resulting from any goods,
            data, information or services purchased or obtained or messages received or transactions
            entered into through or from the SOFTWARE; (iii) unauthorized access to or alteration of
            your transmissions or data; (iv) statements or conduct of any third-party on the SOFTWARE;
            (v) or any other matter relating to the SOFTWARE.
          </p>
          <p>
            If you have any questions about this AGREEMENT, please contact us.
          </p>
        </div>
      </Grid>
      <Grid item={true} xs={true} style={{ paddingTop: '20px' }}>
        <Button
          label='I Agree'
          primary={true}
          icon={<CheckIcon />}
          onClick={onAgree}
        />
      </Grid>
    </Grid>
  );
};

export default Terms;

import * as React from 'react';

import './network-policy-controls.css';
import { EndpointCardClicked } from '../iframe-api';

type NetworkPolicyControlProps = Omit<EndpointCardClicked, "kind"> & {}

export function NetworkPolicyControls ({ namespace, labels }: NetworkPolicyControlProps) {
  return <div className='hubble-ui-network-policy-controls'>
           <div className='hubble-ui-network-policy-controls-popup'>
             namespace: { namespace }
             <br/>
             labels: <pre style={{overflow: "hidden"}}>{JSON.stringify(labels)}</pre>
           </div>
         </div>;
}

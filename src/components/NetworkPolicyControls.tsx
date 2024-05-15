import * as React from 'react';

import './network-policy-controls.css';
import { EndpointCardClicked } from '../iframe-api';

type NetworkPolicyControlProps = Omit<EndpointCardClicked, "kind"> & {
  onCloseButtonClicked?: () => void
}

export function NetworkPolicyControls (
  { namespace, labels, onCloseButtonClicked }: NetworkPolicyControlProps) {
  return <div className='hubble-ui-network-policy-controls'>
           <div className='hubble-ui-network-policy-controls-popup'>
             namespace: { namespace }
             <br/>
             labels: <pre style={{overflow: "hidden"}}>{JSON.stringify(labels)}</pre>
             <button onClick={() => onCloseButtonClicked?.() }
               className="hubble-ui-network-policy-controls-close-button">X</button>
           </div>
         </div>;
}

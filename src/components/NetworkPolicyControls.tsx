import * as React from 'react';

import { Modal, ModalVariant, Title, TitleSizes } from '@patternfly/react-core';

import { t } from "../lib/translations";

import { HubbleUIViewAttentionRequest } from '../iframe-api';

type NetworkPolicyControlProps = Omit<HubbleUIViewAttentionRequest, "kind"> & {
  onClose?: () => void
}

export function NetworkPolicyControls (
  { namespace, filters, onClose }: NetworkPolicyControlProps) {
    const title = t("Hubble Network Policy Editor");

    const header =
      <Title id="network-policy-controls-title" headingLevel="h1" size={TitleSizes['2xl']}>
        { title }
      </Title>;

    return <Modal
             isOpen
             variant={ModalVariant.large}
             title={title}
             onClose={onClose}
             header={header}
             aria-labelledby="network-policy-controls-title"
           >
             namespace: { namespace }
             <br/>
             labels: <pre style={{overflow: "hidden"}}>{JSON.stringify(filters)}</pre>
           </Modal>;
}

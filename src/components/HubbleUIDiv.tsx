import * as React from 'react';
import { useRef,useEffect } from 'react';
import Helmet from 'react-helmet';
import {
  Page,
  PageSection,
  Title,
} from '@patternfly/react-core';
import useFetch from 'use-http';

import './hubble-ui-div.css';
import { onIframeMessage } from  '../iframe-api';

type UseFetchError = ReturnType<typeof useFetch>['error'];

function t(translatableString : string) { return translatableString; }

export default function HubbleUIDiv() {

  const { data, error } = useFetch(
    "/api/plugins/okd-epfl-hubble-ui/runtime/frontend-config.json",
    {credentials: "include"});

  return (
    <>
      <Helmet>
        <title data-test="example-page-title">{t('Hubble UI')}</title>
      </Helmet>
      <Page>
        <PageSection variant="light">
          <Title headingLevel="h1">{t('Hubble UI')}</Title>
        </PageSection>
        { data ? <HubbleUI {...data} /> : error ? <Error error={error}/>: <Loading/> }
      </Page>
    </>
  );
}

function HubbleUI({ iframeDomain, tokenReflectorURI}:
  { iframeDomain : string, tokenReflectorURI : string }) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
      return onIframeMessage(iframeRef, "bearer-token-request",
        async () => {
          try {
            const res = await fetch(tokenReflectorURI, {credentials: "include"});
            const token = res.headers.get("X-Token");
            iframeRef.current.contentWindow.postMessage(
              { kind: "token",
                token });
          } catch (e) {
            console.error("in onIframeMessage handler: ", e);
          }
        });
    });

    return <iframe ref={iframeRef} src={iframeDomain}></iframe>
}

function Error ({ error }: { error: UseFetchError }) {
  return <>
           <h4>{t("Error!")}</h4>
           <pre>{JSON.stringify(error)}</pre>
         </>;
}

function Loading () {
  return <>⏳</>;
}

import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import Helmet from 'react-helmet';
import {
  Page,
  PageSection,
  Title,
} from '@patternfly/react-core';
import useAsyncEffect from 'use-async-effect';
import { onIframeMessage, EndpointCardClicked } from  '../iframe-api';
import { NetworkPolicyControls } from './NetworkPolicyControls';
import './hubble-ui-div.css';


type FetchOutcome<T> = {
  data ?: T;
  error?: Error;
}

type TwelveFactorHubbleUIConfig = {
  iframeDomain : string;
  tokenReflectorURI : string;
}

function t(translatableString : string) { return translatableString; }

export default function HubbleUIDiv() {
  const [ fetched, setFetched ] = useState< FetchOutcome<TwelveFactorHubbleUIConfig> >({});

  useAsyncEffect(async (isStillMounted) => {
    try {
      const res = await fetch("/api/plugins/okd-epfl-hubble-ui/runtime/frontend-config.json",
        {credentials: "include"});
      const data = await res.json();
      if (isStillMounted) setFetched({ data });
    } catch (error) {
      console.error(error);
      if (isStillMounted) setFetched({ error });
    }
  }, []);

  const [ endpoint, setEndpoint ] = useState<EndpointCardClicked>();

  return (
    <>
      <Helmet>
        <title data-test="example-page-title">{t('Hubble UI')}</title>
      </Helmet>
      <Page>
        <PageSection variant="light">
          <Title headingLevel="h1">{t('Hubble UI')}</Title>
          { endpoint ? <NetworkPolicyControls
                         onCloseButtonClicked={ () => setEndpoint(null) }
                         {...endpoint}/> : <></> }
        </PageSection>
        { fetched.data ? <HubbleUI
                           onEndpointCardClicked={ (e) => setEndpoint(e) }
                           {...fetched.data} />  :
          fetched.error ? <Error error={fetched.error}/> :
            <Loading/> }
      </Page>
    </>
  );
}

type HubbleUIProps = TwelveFactorHubbleUIConfig & {
  onEndpointCardClicked : (event: EndpointCardClicked) => void
};

let _manuallyEnteredToken : string | undefined;

async function obtainToken (tokenReflectorURI : string) : Promise<string> {
  if (_DEVELOPMENT_MANUAL_INPUT_TOKEN) {
    if (! _manuallyEnteredToken) {
      _manuallyEnteredToken = prompt("DEVELOPMENT ONLY — Please enter token");
    }
    return _manuallyEnteredToken;
  }

  const res = await fetch(tokenReflectorURI, {credentials: "include"});
  return res.headers.get("X-Token");
}

function HubbleUI({ iframeDomain, tokenReflectorURI, onEndpointCardClicked }: HubbleUIProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
      return onIframeMessage(iframeRef, "bearer-token-request",
        async () => {
          try {
            iframeRef.current.contentWindow.postMessage(
              { kind: "token",
                token: await obtainToken(tokenReflectorURI) },
              iframeDomain);
          } catch (e) {
            console.error("in onIframeMessage handler: ", e);
          }
        });
    });

    useEffect(
      () => onIframeMessage(iframeRef, "endpoint-card-clicked-⚙️", onEndpointCardClicked),
      [onEndpointCardClicked]);

    return <iframe ref={iframeRef} src={iframeDomain}
             sandbox="allow-same-origin allow-scripts allow-modals"
             style={{height: "100%", width: "100%" }} />
}

function Error ({ error }: { error: Error }) {
  return <>
           <h4>{t("Error!")}</h4>
           <pre>{String(error)}</pre>
         </>;
}

function Loading () {
  return <>⏳</>;
}

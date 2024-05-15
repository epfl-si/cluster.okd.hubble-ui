import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import Helmet from 'react-helmet';
import {
  Page,
  PageSection,
  Title,
} from '@patternfly/react-core';
import useAsyncEffect from 'use-async-effect';
import { onIframeMessage } from  '../iframe-api';
import { DeveloperTokenControls } from './DeveloperTokenControls';
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
      if (isStillMounted) setFetched({ error });
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('Hubble UI')}</title>
      </Helmet>
      <Page>
        <PageSection variant="light">
          <Title headingLevel="h1">{t('Hubble UI')}</Title>
        </PageSection>
        { fetched.data ? <HubbleUI {...fetched.data} />  :
          fetched.error ? <Error error={fetched.error}/> :
            <Loading/> }
      </Page>
    </>
  );
}

const devBearerToken = (function() {
  const STORAGE_KEY = "devBearerToken";
  return {
    get() : string { return window.localStorage.getItem(STORAGE_KEY); },
    set(value : string) { return window.localStorage.setItem(STORAGE_KEY, value); }
  }
})();

async function obtainToken (tokenReflectorURI : string) : Promise<string> {
  if (_DEVELOPMENT_MANUAL_INPUT_TOKEN) {
    return devBearerToken.get();
  }

  const res = await fetch(tokenReflectorURI, {credentials: "include"});
  return res.headers.get("X-Token");
}

type HubbleUIProps = TwelveFactorHubbleUIConfig & {
  onHubbleUIAttention : (event: HubbleUIViewAttentionRequest) => void
};

function HubbleUI({ iframeDomain, tokenReflectorURI }: TwelveFactorHubbleUIConfig) {
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
      () => onIframeMessage(iframeRef, "hubble-ui-view-attention-request",
        onHubbleUIAttention),
      [onHubbleUIAttention]);

    return <>
             { _DEVELOPMENT_MANUAL_INPUT_TOKEN ?
               <DeveloperTokenControls bearerToken={devBearerToken}/> : <></> }
             <iframe ref={iframeRef} src={iframeDomain}
               sandbox="allow-same-origin allow-scripts allow-modals"
               style={{height: "100%", width: "100%" }} />
           </>;
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

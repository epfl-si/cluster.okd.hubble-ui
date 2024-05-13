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
  });

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

function HubbleUI({ iframeDomain, tokenReflectorURI }: TwelveFactorHubbleUIConfig) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
      return onIframeMessage(iframeRef, "bearer-token-request",
        async () => {
          try {
            const res = await fetch(tokenReflectorURI, {credentials: "include"});
            const token = res.headers.get("X-Token");
            iframeRef.current.contentWindow.postMessage(
              { kind: "token",
                token },
              iframeDomain);
          } catch (e) {
            console.error("in onIframeMessage handler: ", e);
          }
        });
    });

    return <iframe ref={iframeRef} src={iframeDomain}></iframe>
}

function Error ({ error }: { error: Error }) {
  return <>
           <h4>{t("Error!")}</h4>
           <pre>{JSON.stringify(error)}</pre>
         </>;
}

function Loading () {
  return <>⏳</>;
}

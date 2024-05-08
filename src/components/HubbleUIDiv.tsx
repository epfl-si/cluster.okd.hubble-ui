import * as React from 'react';
import Helmet from 'react-helmet';
import {
  Page,
  PageSection,
  Title,
} from '@patternfly/react-core';

import './hubble-ui-div.css';

declare global {
  interface Window {
    _12factor: {
      iframeDomain: string;
    };
  }
}

const iframeDomain = window._12factor.iframeDomain;

export default function HubbleUIDiv() {
  function t(translatableString : string) { return translatableString; }

  return (
    <>
      <Helmet>
        <title data-test="example-page-title">{t('Hubble UI')}</title>
      </Helmet>
      <Page>
        <PageSection variant="light">
          <Title headingLevel="h1">{t('Hubble UI')}</Title>
        </PageSection>
        <iframe src={iframeDomain} />
      </Page>
    </>
  );
}

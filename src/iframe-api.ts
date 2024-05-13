/**
 * API for sending / receiving messages with the Hubble UI
 *
 * TODO: find a way to share the types with https://github.com/epfl-si/hubble-ui-epfl/blob/feature/mashable/src/iframe-api/index.ts
 */

export type IframeSentMessage = BearerToken;

type BearerToken = {
  kind: "token",
  token: string
}

export type IframeReceivedMessage = BearerTokenRequest;

type BearerTokenRequest = {
  kind: "bearer-token-request"
}

/**
 * @return A void function that unregisters the handler when called.
 */
export function onIframeMessage<T extends IframeReceivedMessage['kind']> (
  originIframeRef: { current: HTMLIFrameElement },
  kind : T,
  handler : (message : IframeReceivedMessage & { kind : T }) => void)
: () => void {
  const secureHandler = (event : MessageEvent) => {
    // A number of browser plug-ins do `window.postMessage` from the
    // window to itself; see
    // https://github.com/facebook/react/issues/27529#issuecomment-1766536750
    if (event.source === window) return;

    if (! originIframeRef.current) {
      console.log("Too soon?");
      return;
    }

    if (originIframeRef.current.contentWindow !== event.source) {
      console.log("OMG H4X!!");
      return;
    }

    if (event.data?.kind !== kind) return;

    handler(event.data);
  }

  window.addEventListener("message", secureHandler);
  return () => window.removeEventListener("message", secureHandler);
}

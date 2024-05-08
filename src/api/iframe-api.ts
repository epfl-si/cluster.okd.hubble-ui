/**
 * API for sending / receiving messages across iframes
 */

export type SentMessage = BearerToken;

type BearerToken = {
  kind: "token",
  token: string
}

export type ReceivedMessage = BearerTokenRequest | EndpointCardClicked;

type BearerTokenRequest = {
  kind: "bearer-token-request"
}

type EndpointCardClicked = {
  kind: "endpoint-card-clicked-⚙️",
  namespace ?: string,
  labels: Array<{ key: string, value: string }>
}

/**
 * @return A void function that unregisters the handler when called.
 */
export function onReceiveMessageFromIframe (
  handler : (message : ReceivedMessage) => void,
  expectedDomain : string
) : () => void {
  const secureHandler = (event : MessageEvent) => {
    // A number of browser plug-ins do `window.postMessage` from the
    // window to itself; see
    // https://github.com/facebook/react/issues/27529#issuecomment-1766536750
    if (event.source === window) return;

    if (isSameUrl(event.origin, expectedDomain)) {
      handler(event.data);
    } else {
      console.error("OMG H4XX !1!!");
      console.log("Mismatched origins:", event.origin, expectedDomain);
    }
  }

  window.addEventListener("message", secureHandler);
  return () => window.removeEventListener("message", secureHandler);
}

function isSameUrl (urlA : string, urlB : string) {
  if (urlA === urlB) return true;
  if (urlA + "/" === urlB) return true;
  if (urlB + "/" === urlA) return true;
  return false;
}

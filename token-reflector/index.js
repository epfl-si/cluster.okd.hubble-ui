const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const app = express();
app.use(cookieParser());
app.use(morgan('combined'));

const servingURL = "/api/token-reflector/token";
const cookieName = "openshift-session-token";

/**
 * This is a CORS-*only* microservice, that doesn't use or require preflighting.
 *
 * We do *not* care about attackers armed with WhateverMonkey or curl,
 * since we aren't disclosing anything but what they already know
 * (i.e. the cookie header from their own request / from the trove of
 * decrypted traffic that they harvested with their l33t skillz). We
 * *do* care about confused-deputy attacks against “honest” browsers,
 * which are the bread and butter of the CORS specification (or more
 * precisely, fine mist of CORS obiter dicta scattered across a
 * ridiculous number of RFCs and other normative documents all over
 * the Internet. If you want a consolidated, if inscrutable, overview
 * of the situation, feel free to take a look at the “living document”
 * at https://fetch.spec.whatwg.org/ which they updated *literally
 * yesterday.*).
 *
 * Basically, the CORS spec is on the case of JavaScript already like
 * nobody's business, meaning that there isn't much risk of an
 * accidental disclosure there; in other words, the bigger risk is
 * that the browser will pretend that the response failed if it
 * doesn't contain enough shibboleths (in the form of
 * `Access-Control-` response headers). To plug the other pathways for
 * accidental disclosure, we send the token through a channel that
 * will never appear anywhere (like, say, as garbled pixels on screen
 * because Internet Explorer 3 sniffed it as a GIF; or in some cache),
 * *except* to JavaScript: an X- response header.
 */
app.get(servingURL, (req, res) => {
  const cookie = req.cookies[cookieName];

  if (! cookie) {
    res.status(401).send("No cookie.");
  } else if (isPermittedOrigin(req.headers)) {
    // Note : Origin is a forbidden header name as per
    // https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name
    // Therefore, JavaScript in an “honest” browser cannot spoof it.
    res.set('Access-Control-Allow-Origin', req.headers.origin);
    // Vary? What Vary? This is a 304 response, which is uncacheable.
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Expose-Headers', 'X-Token');
    res.set('X-Token', cookie);
    res.status(304).end();
  } else {
    res.status(404).send(`Unknown Origin: ${req.headers.origin}`);
  }
});

function isPermittedOrigin (headers) {
  if (headers['sec-fetch-site'] === 'same-origin') return true;
  for (let permitted of (process.env.PERMITTED_ORIGINS || "").split(",")) {
    permitted = permitted.trim();
    if (! permitted) continue;

    if (headers.origin === permitted) return true;
  }
  return false;
}

app.listen(3000, () => {
  console.log('Token reflector microservice listening on port 3000');
});

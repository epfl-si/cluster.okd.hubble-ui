const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const NodeCache = require('node-cache');
const fs = require('fs/promises');

const app = express();
app.use(cookieParser());
app.use(cors({ credentials: true }));

const tokenResolver = new TokenResolver();
app.use(createProxyMiddleware({
  target: process.env.TEST_PROXY_TARGET || "http://hubble-api-epfl:81/",
  changeOrigin: true,
  async pathRewrite (path, req) {
    const token = req.cookies["openshift-session-token"];
    if (! await tokenResolver.validate(token)) {
      throw new Error("Permission denied");
    }
  },
  on: {
    error (err, req, res) {
      console.error(err);
      res.writeHead(500, {
        'Content-Type': 'text/plain',
      });
      res.end('Error.');
    }
  }
}));

app.listen(3000, () => {
  console.log('Reverse proxy server listening on port 3000');
});


function TokenResolver (opts) {
  opts = {
    positiveTTL: 30,
    negativeTTL: 5,
    apiServerUrl: "https://kubernetes.default.svc",
    ...(opts || {}) };

  const cache = new NodeCache();

  let ownTokenPromise;
  async function getOwnToken () {
    if (! ownTokenPromise) {
      ownTokenPromise =  fs.readFile("/var/run/secrets/kubernetes.io/serviceaccount/token");
    }

    return await ownTokenPromise;
  }

  async function k8sAPICall (kind, spec) {
    const apiPathsByKind = {
      TokenReview: "authentication.k8s.io/v1/tokenreviews",
      SubjectAccessReview: "authorization.k8s.io/v1/subjectaccessreviews"
    }

    const apiPath = apiPathsByKind[kind];
    if (! apiPath) {
      throw new Error(`Unknown Kind: ${kind}`);
    }

    const apiVersion = apiPath.split(',').slice(0, -1).join(',');

    const res = await fetch(`${opts.apiServerUrl}/${apiPath}`,
      {
        method: "POST",
        headers: [ ['Content-Type', 'application/json'],
                   ['Authorization', `Bearer ${await getOwnToken()}`] ],
        body: JSON.stringify({
          apiVersion,
          kind,
          spec
        })
      });

    return await res.json();
  }

  async function hasAccess (token) {
    const tokenStruct = await k8sAPICall("TokenReview", {
      spec: { token }
    });
    if (! (tokenStruct && tokenStruct.status && tokenStruct.status.authenticated)) {
      return false;
    }

    const accessStruct = await k8sAPICall("SubjectAccessReview", {
      spec: {
        user: tokenStatus.user.username,
        groups: tokenStatus.user.groups,
        nonResourceAttributes: {
          // Dovetails ../charts/okd-epfl-hubble-ui/templates/hubble/api-access-clusterrole.yaml
          verb: "GET",
          path: "/api/hubble-ui"
        }
      }
    });
    return accessStruct.status && accessStruct.status.allowed;
  }

  return {
    async validate (token) {
      if (! cache.get(token)) {
        validated = await hasAccess(token);
        cache.set(token, { validated }, validated ? opts.positiveTTL : opts.negativeTTL);
      }

      return cache.get(token).validated;
    }
  }
}

const express = require('express');
const scramjet = require('@mercuryworkshop/scramjet');
const BareServer = require('@tomphttp/bare-server-node');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Mount Bare Server for transport (required for Scramjet interception, low-latency)
const bare = new BareServer('/bare/');
app.use((req, res, next) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
    return;
  }
  next();
});

// Mount Scramjet middleware (fast config from docs: xor codec for low latency)
app.use(
  scramjet.middleware({
    prefix: '/sj/',  // Short prefix for faster URLs
    host: (req) => req.headers.host,
    protocol: (req) => req.headers['x-forwarded-proto'] || req.protocol,
    codec: 'xor',  // Fastest codec per docs (low CPU/overhead)
    bare: '/bare/',  // Ties to Bare Server
    wisp: 'wss://wisp.mercurywork.shop/'  // Public Wisp for WS proxying (low-latency, no self-hosting)
  })
);

// Serve static files (your HTML/CSS/JS) from root or 'static' dir
app.use(express.static(path.join(__dirname, '.')));  // Adjust to 'static' if you move files there

// Simple server-side proxy endpoint used as a fallback when Browser.js is not available.
// Route: /proxy/:encodedUrl where encodedUrl is encodeURIComponent(remoteUrl)
app.get('/proxy/:encoded', async (req, res) => {
  try {
    const encoded = req.params.encoded;
    const url = decodeURIComponent(encoded);
    // Use global fetch (Node 18+). If unavailable, the server must be run in an environment with fetch support.
    const remote = await fetch(url, { redirect: 'follow' });
    const contentType = remote.headers.get('content-type') || 'application/octet-stream';

    // For HTML, inject a <base> tag so relative URLs resolve against the remote origin
    if (contentType.includes('text/html')) {
      let body = await remote.text();
      try {
        const origin = new URL(url).origin;
        if (!/\<base\s/i.test(body)) {
          body = body.replace(/<head(.*?)>/i, `<head$1><base href="${origin}">`);
        }
      } catch (e) {
        // ignore URL parse errors
      }
      res.set('Content-Type', contentType);
      res.send(body);
      return;
    }

    // For non-HTML, stream the raw body
    res.set('Content-Type', contentType);
    const buffer = await remote.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).send('Proxy error: ' + String(err.message || err));
  }
});

// Fallback for SPA-like behavior (optional, but speeds up navigation)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
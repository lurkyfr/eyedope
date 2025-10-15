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

// Fallback for SPA-like behavior (optional, but speeds up navigation)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
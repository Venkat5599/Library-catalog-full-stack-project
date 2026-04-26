const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3000;

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  logLevel: 'silent'
}));

// Serve static files from build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle React Router - catch all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying /api requests to http://localhost:5000`);
});
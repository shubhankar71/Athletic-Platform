// Local/traditional-server entry point (Render, Railway, your own machine, etc).
// Not used on Vercel — Vercel invokes api/index.js instead, since serverless
// functions don't call app.listen().
const app = require('./app.js');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

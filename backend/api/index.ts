// Vercel serverless entry point.
// `vercel-build` runs `nest build` first, producing dist/src/serverless.js with
// decorator metadata intact (tsc). We require it lazily so the heavy Nest graph
// is evaluated on first invocation rather than at import time.
export default async function handler(req: any, res: any) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../dist/src/serverless');
    return (mod.default || mod)(req, res);
  } catch (err) {
    console.error('Serverless handler error', err);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ statusCode: 500, message: 'Internal server error' }));
  }
}

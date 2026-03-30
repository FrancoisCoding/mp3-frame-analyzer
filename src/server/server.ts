import { serve } from '@hono/node-server';

import { app } from './index';

const port = Number(process.env.PORT) || 3001;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`MP3 Frame Analyzer API running on http://localhost:${info.port}`);
});

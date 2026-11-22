import sources from './sources.json' with { type: 'json' };

const tool = {
  name: 'list_job_search_sources',
  description: 'List the job boards and employer career sites supplied for Job Search SAM. The result is a source directory, not live job listings.',
  inputSchema: { type: 'object', properties: { category: { type: 'string', enum: ['primary', 'employer', 'supplemental'], description: 'Optional source category.' } }, additionalProperties: false },
  annotations: { title: 'List job search sources', readOnlyHint: true, destructiveHint: false, openWorldHint: false, idempotentHint: true }
};

export default {
  async fetch(request) {
    if (new URL(request.url).pathname !== '/mcp') return new Response('Not found', { status: 404 });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
    let body;
    try { body = await request.json(); } catch { return new Response('Invalid JSON', { status: 400 }); }
    const reply = (result, error) => Response.json({ jsonrpc: '2.0', id: body.id ?? null, ...(error ? { error } : { result }) });
    if (body.jsonrpc !== '2.0' || typeof body.method !== 'string') return reply(null, { code: -32600, message: 'Invalid Request' });
    if (body.method.startsWith('notifications/')) return new Response(null, { status: 202 });
    if (body.method === 'initialize') return reply({ protocolVersion: '2025-03-26', capabilities: { tools: {} }, serverInfo: { name: 'job-search-sam-sources', version: '0.1.0' } });
    if (body.method === 'ping') return reply({});
    if (body.method === 'tools/list') return reply({ tools: [tool] });
    if (body.method === 'tools/call' && body.params?.name === tool.name) {
      const args = body.params.arguments ?? {};
      if (Object.keys(args).some(key => key !== 'category') || (args.category && !['primary', 'employer', 'supplemental'].includes(args.category))) return reply({ isError: true, content: [{ type: 'text', text: 'Invalid category.' }] });
      const selected = sources.filter(s => !args.category || s.category === args.category);
      return reply({ content: [{ type: 'text', text: JSON.stringify(selected) }] });
    }
    return reply(null, { code: -32601, message: 'Method not found' });
  }
};


import assert from 'node:assert/strict';
import server from './index.mjs';
async function call(method, params = {}) {
  const res = await server.fetch(new Request('https://example.test/mcp', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) }));
  assert.equal(res.status, 200);
  return (await res.json()).result;
}
assert.equal((await call('initialize')).serverInfo.name, 'job-search-sam-sources');
assert.equal((await call('tools/list')).tools[0].name, 'list_job_search_sources');
for (const [category, count] of [['primary', 38], ['employer', 8], ['supplemental', 30]]) {
  const output = await call('tools/call', { name: 'list_job_search_sources', arguments: { category } });
  assert.equal(JSON.parse(output.content[0].text).length, count);
}
assert.equal((await call('tools/call', { name: 'list_job_search_sources', arguments: { category: 'invalid' } })).isError, true);
console.log('MCP source directory checks passed');


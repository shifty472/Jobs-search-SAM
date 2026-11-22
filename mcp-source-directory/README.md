# Job Search SAM source-directory MCP

This experimental, stateless MCP server exposes one read-only tool, `list_job_search_sources`. It returns the creator's 38 primary job boards, eight employer sites, and 30 supplemental sources. It does not search listings, submit applications, access GitHub accounts, store profiles, or process private user data.

`index.mjs` exports a Fetch handler for a JavaScript runtime supporting ES modules and JSON imports. It implements JSON-RPC over POST `/mcp`. Run `node test.mjs` with Node.js 22 or newer to check the directory and protocol handlers. To regenerate the source directory, run `node generate-sources.mjs PATH_TO_JOB_SOURCES_MD` against the authoritative skill reference.

This code is not deployed. GitHub stores the source but does not provide the HTTPS MCP endpoint required for a public plugin. Production needs compatible hosting, protocol and security verification, a publicly accessible HTTPS endpoint, domain verification and OpenAI's review requirements. Do not send resumes or sensitive information to this unauthenticated directory service.


# Job Search SAM MCP review preparation

## Current scope

The Cloudflare-hosted source-directory tool lists public job-search source links. It does not search job listings, save profiles, or submit applications. The job-search skill can guide other activities only when suitable tools are available and authorized.

The server responded to a tool discovery request and returned the employer source list during a Cloudflare dashboard test. This does not establish that ChatGPT can connect to it. The five positive and three negative reviewer cases are in [mcp-review-cases.json](../editions/mcp-review-cases.json); they have not yet been run as ChatGPT review cases.

## Demonstration outline

After connecting the private development edition in ChatGPT, use sample data and show:
1. Ask for the primary job-board sources; show the returned names and links.
2. Ask for the employer career sites; show the eight returned names and links.
3. Ask for the Netflix career link; show that it matches the directory.
4. Ask the source tool to submit an application; show that it cannot perform that action.

Record real interactions in the intended host. Keep private information and credentials off-screen. Check that the recording plays and is accessible to the review team before adding its real URL to the submission metadata.

## Outstanding

- Update the master Admin edition and its build process so both editions retain the MCP connection on future updates.\n- Verify the private development edition can connect to the live server in ChatGPT, and run the review cases in that host.
- Complete a real demo recording and provide a reviewer-accessible URL.
- Prepare the MCP-backed submission bundle, confirm listing text matches the service, and review the published privacy disclosure for Cloudflare hosting.
- Complete OpenAI's domain verification, server scan, review information and required policy attestations.
- Submit for review and, if approved, publish. The existing skills-only draft is not a published MCP-backed plugin.

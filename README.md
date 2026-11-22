# Jobs-search-SAM
ChatGPT job search agent

## User Agreement and AI Disclosure

Job Search SAM can produce inaccurate, incomplete, outdated, or biased information. Review job postings, application materials, recipients, and attachments before relying on or submitting them. Connected services may receive information you choose to share, and no system can guarantee perfect security.

The [AI Use Statement and Terms of Use](editions/subscriber-terms-draft.md) explains these risks, the proposed user agreement, third-party services and fees, privacy and security considerations, and limitations of liability. It is a draft for review, not an operative or accepted agreement.

Before public launch, the provider must finalize and publish appropriate terms and a privacy policy, arrange legal review, and implement any required agreement-acceptance and security processes. The public-use edition is free and remains private until it is approved and published.

## Admin master and public edition

The [admin plugin master](master/job-search-sam-admin/SKILL.md) is the source for both editions. Run `node scripts/build-editions.mjs` to prepare the private admin and free public-use packages. The build strips admin-only instructions from the public edition. Creating packages does not install, deploy, or publish either plugin; each release must be updated separately and verified. The original `skills/job-search-sam` workflow remains as a legacy reference and contains the shared source list.

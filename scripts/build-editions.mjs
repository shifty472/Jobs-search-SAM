import { readFile, mkdir, writeFile, copyFile } from "node:fs/promises";
import { join } from "node:path";

// The admin plugin is the canonical master. Admin-only sections are marked and
// stripped from the public edition. Publishing remains a separate action.
const master = await readFile("master/job-search-sam-admin/SKILL.md", "utf8");
const source = JSON.parse(await readFile("plugin.json", "utf8"));
const sources = await readFile("skills/job-search-sam/references/job-sources.md", "utf8");
const publicOverlay = await readFile("editions/subscriber-instructions.md", "utf8");
const markers = /<!-- SAM_ADMIN_ONLY_START -->[\s\S]*?<!-- SAM_ADMIN_ONLY_END -->\s*/g;
const found = [...master.matchAll(markers)];
if (found.length !== 2 || !master.includes("name: job-search-sam-admin\n") || !master.includes("# Job Search SAM Admin\n")) {
  throw new Error("Admin master format changed; review release generation.");
}
const publicCore = master.replace(markers, "")
  .replace("name: job-search-sam-admin\n", "name: job-search-sam-subscriber\n")
  .replace("# Job Search SAM Admin\n", "# Job Search SAM Public\n\n" + publicOverlay + "\n");
if (publicCore.includes("SAM_ADMIN_ONLY") || publicCore.includes("When the owner requests a master update")) {
  throw new Error("Admin-only material remained in public edition.");
}
const editions = [
  { id: "job-search-sam-admin", title: "Job Search SAM Admin", short: "Administer Job Search SAM", version: "0.1.2", description: "Private owner workflow for maintaining the Job Search SAM master and coordinating releases.", skill: master },
  { id: "job-search-sam-subscriber", title: "Job Search SAM Public", short: "Guided job search", version: "0.1.6", description: "Guided job search and application preparation using available tools.", skill: publicCore }
];
for (const edition of editions) {
  const manifest = structuredClone(source);
  manifest.name = edition.id; manifest.version = edition.version; manifest.description = edition.description;
  if (manifest.author) delete manifest.author.email;
  if (edition.id === "job-search-sam-subscriber") manifest.extensions["com.openai"].onboardingSkill = "./skills/job-search-sam-subscriber/SKILL.md";
  const ui = manifest.extensions["com.openai"].interface;
  ui.displayName = edition.title; ui.shortDescription = edition.short;
  ui.longDescription = edition.id === "job-search-sam-admin"
    ? edition.description + " Works with tools available in the current session."
    : "Guides job seekers through preferences, job research, tailored application materials, approval, and tracking using tools available in their session.";
  const output = join("build", edition.id);
  await mkdir(join(output, "skills", edition.id, "references"), { recursive: true });
  await mkdir(join(output, "assets"), { recursive: true });
  await writeFile(join(output, "plugin.json"), JSON.stringify(manifest, null, 2) + "\n");
  await writeFile(join(output, "skills", edition.id, "SKILL.md"), edition.skill);
  await writeFile(join(output, "skills", edition.id, "references", "job-sources.md"), sources);
  if (edition.id === "job-search-sam-subscriber") {
    await copyFile("editions/subscriber-terms-draft.md", join(output, "skills", edition.id, "references", "ai-terms-draft.md"));
  }
  await copyFile("assets/icon.svg", join(output, "assets", "icon.svg"));
  console.log("Built " + output);
}

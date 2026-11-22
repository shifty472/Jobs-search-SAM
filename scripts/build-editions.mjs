import { readFile, mkdir, writeFile, copyFile } from "node:fs/promises";
import { join } from "node:path";

const source = JSON.parse(await readFile("plugin.json", "utf8"));
const master = await readFile("skills/job-search-sam/SKILL.md", "utf8");
const sources = await readFile("skills/job-search-sam/references/job-sources.md", "utf8");
const versions = [
  { id:"job-search-sam-admin", title:"Job Search SAM Admin", short:"Administer Job Search SAM", overlay:"admin-instructions.md", description:"Private owner workflow for maintaining the Job Search SAM master and coordinating releases." },
  { id:"job-search-sam-subscriber", title:"Job Search SAM Subscriber", short:"Guided job search", overlay:"subscriber-instructions.md", description:"Subscriber edition draft of the Job Search SAM job search workflow." }
];
if (!master.includes("name: job-search-sam\n") || !master.includes("# Job Search SAM\n")) throw new Error("Master skill format changed; review before building.");
for (const v of versions) {
  const manifest = structuredClone(source);
  manifest.name = v.id;
  manifest.description = v.description;
  delete manifest.author?.email;
  const ui = manifest.extensions["com.openai"].interface;
  ui.displayName = v.title; ui.shortDescription = v.short; ui.longDescription = v.description + " Works with tools available in the current session.";
  const overlay = await readFile(join("editions", v.overlay), "utf8");
  const skill = master.replace("name: job-search-sam\n", "name: " + v.id + "\n").replace("# Job Search SAM\n", "# " + v.title + "\n\n" + overlay + "\n");
  const output = join("build", v.id);
  await mkdir(join(output, "skills", v.id, "references"), {recursive:true});
  await mkdir(join(output, "assets"), {recursive:true});
  await writeFile(join(output, "plugin.json"), JSON.stringify(manifest, null, 2) + "\n");
  await writeFile(join(output, "skills", v.id, "SKILL.md"), skill);
  await writeFile(join(output, "skills", v.id, "references", "job-sources.md"), sources);
  if (v.id === "job-search-sam-subscriber") await copyFile("editions/subscriber-terms-draft.md", join(output, "skills", v.id, "references", "ai-terms-draft.md"));
  await copyFile("assets/icon.svg", join(output, "assets", "icon.svg"));
  console.log("Built " + output);
}

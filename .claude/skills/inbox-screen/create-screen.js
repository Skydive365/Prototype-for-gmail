// Run with figma_execute (Figma Console MCP). Replace SPEC; leave the rest unchanged.
// Duplicates the inbox template screen into the "Generated screens" Section with an empty slot,
// ready for ../email-list/create-list.js (target { type: "slot", nodeId: <screenId> }). The template is never changed.
const SPEC = {
  name: "Friday afternoon", // screen name: "Inbox / <name>"
  unread: 1, // number of Unread rows in the approved list: shown on the Mail badge (hidden when 0)
};

const TEMPLATE_ID = "78:4769"; // Examples/Reviews-Mobile
const SECTION_NAME = "Generated screens";
const SLOT_COMPONENT = "Shared Building Blocks/Slot-component";
const report = { ok: false };
let screen = null;

try {
  const template = (await figma.getNodeByIdAsync(TEMPLATE_ID)) ?? figma.currentPage.findOne((n) => n.type === "FRAME" && n.name === "Examples/Reviews-Mobile");
  if (!template) throw new Error("Template screen Examples/Reviews-Mobile not found");
  const page = figma.currentPage;

  // Section: created once, 200 px below everything on the page
  let section = page.children.find((n) => n.type === "SECTION" && n.name === SECTION_NAME);
  const PAD = 40, GAP = 80;
  if (!section) {
    const left = Math.min(...page.children.map((n) => n.x));
    const bottom = Math.max(...page.children.map((n) => n.y + n.height));
    section = figma.createSection();
    section.name = SECTION_NAME;
    section.x = left;
    section.y = bottom + 200;
    section.resizeWithoutConstraints(template.width + PAD * 2, template.height + PAD * 2);
    report.sectionCreated = true;
  }
  if (section.children.some((n) => n.name === `Inbox / ${SPEC.name}`)) throw new Error(`A screen named "Inbox / ${SPEC.name}" already exists. Choose another name.`);

  // Copy the template; screens line up left to right
  screen = template.clone();
  section.appendChild(screen);
  screen.name = `Inbox / ${SPEC.name}`;
  const others = section.children.filter((n) => n !== screen);
  screen.x = others.length ? Math.max(...others.map((n) => n.x + n.width)) + GAP : PAD + 8; // 8 = outside bezel
  screen.y = PAD + 8;

  // Empty the slot: remove any list copied from the template and show the placeholder again.
  // The screen hugs its content, so a visible placeholder keeps it at full height (nothing moves);
  // create-list.js hides it when it inserts the list.
  let placeholder = null;
  for (const c of screen.children) {
    if (c.type === "INSTANCE" && (await c.getMainComponentAsync())?.name === SLOT_COMPONENT) placeholder = c;
  }
  if (!placeholder) throw new Error("The template has no slot placeholder");
  for (const c of [...screen.children]) if (c.type === "FRAME" && c.name.startsWith("Email list /")) c.remove();
  placeholder.visible = true;
  // Mail badge = unread count (an override on the M3 nav bar instance)
  const badge = screen.findOne((n) => n.type === "INSTANCE" && n.name === "Badges");
  const badgeLabel = badge?.findOne((n) => n.type === "TEXT");
  if (badge && badgeLabel) {
    badge.visible = SPEC.unread > 0;
    if (SPEC.unread > 0) {
      await figma.loadFontAsync(badgeLabel.fontName);
      badgeLabel.characters = String(SPEC.unread);
    }
    report.badge = SPEC.unread > 0 ? String(SPEC.unread) : "hidden";
  } else {
    report.badge = "not found";
  }

  // Hidden "original" layers kept in the template for reverting are not needed in a generated screen
  for (const c of [...screen.children]) if (c.visible === false && c !== placeholder && c.name.includes("(original, hidden)")) c.remove();

  // Grow the Section to fit
  const right = Math.max(...section.children.map((n) => n.x + n.width)) + PAD + 8;
  const bottom = Math.max(...section.children.map((n) => n.y + n.height)) + PAD + 8;
  section.resizeWithoutConstraints(Math.max(section.width, right), Math.max(section.height, bottom));

  report.ok = true;
  report.screenId = screen.id;
  report.sectionId = section.id;
  report.screenName = screen.name;
  report.templateUnchanged = template.name === "Examples/Reviews-Mobile";
} catch (error) {
  if (screen && !screen.removed) screen.remove();
  const section = figma.currentPage.children.find((n) => n.type === "SECTION" && n.name === SECTION_NAME);
  if (report.sectionCreated && section && section.children.length === 0) section.remove();
  report.error = error.message;
}
return report;

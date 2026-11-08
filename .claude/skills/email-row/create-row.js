// Run with figma_execute (Figma Console MCP). Replace SPEC with the confirmed values; leave the rest unchanged.
// Creates one instance of the "Email row" master, applies text + overrides, validates, and returns a JSON report.
const SPEC = {
  variant: { State: "Enabled", Status: "Read", Starred: "False", Selected: "False", Content: "Default", Avatar: "Letter", Swipe: "None" },
  text: {
    sender: "Square",
    subject: "Your Square account has been deactivated",
    snippet: "Your Square account has been deactivated. If you believe this is a mistake…",
    time: "5:43 PM",
    letter: "S", // Letter avatar only
    avatarColor: "green", // green | orange | default (Letter avatar only)
    messageCount: null, // Content = Message count
    label: null, // Content = Label chip
    trackingText: null, // Content = Tracking
    attachmentName: null, // Content = Attachment
    moreFiles: null, // Content = Attachment, e.g. "+1"
  },
};

const SET_ID = "97:29397";
const SECTION_NAME = "Generated email rows";
const report = { ok: false, overrides: [], warnings: [] };
let instance = null;

try {
  // ---------- Look-ups ----------
  const set = (await figma.getNodeByIdAsync(SET_ID)) ?? figma.root.findOne((n) => n.type === "COMPONENT_SET" && n.name === "Email row");
  if (!set) throw new Error("Email row component set not found");

  const vars = await figma.variables.getLocalVariablesAsync();
  const semanticId = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.name === "Semantic").id;
  const token = (name) => {
    const v = vars.find((x) => x.name === name && x.variableCollectionId === semanticId);
    if (!v) throw new Error("Missing token " + name);
    return v;
  };
  const styles = Object.fromEntries((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
  const propKey = (node, prefix) => Object.keys(node.componentProperties).find((k) => k === prefix || k.startsWith(prefix + "#"));
  const setFill = (node, tokenName) => {
    const fills = node.fills.map((p) => ({ ...p }));
    const i = fills.findIndex((p) => p.type === "SOLID" && p.visible !== false);
    if (i < 0) return;
    fills[i] = figma.variables.setBoundVariableForPaint(fills[i], "color", token(tokenName));
    node.fills = fills;
  };
  for (const style of ["Regular", "Medium", "SemiBold"]) await figma.loadFontAsync({ family: "Roboto", style });

  // ---------- Choose the base variant ----------
  const want = SPEC.variant;
  const variants = set.children.map((c) => ({ node: c, props: c.variantProperties }));
  const structural = variants.filter((v) => v.props.Content === want.Content && v.props.Swipe === want.Swipe && v.props.State === want.State);
  if (!structural.length) {
    throw new Error(`No Figma variant has Content=${want.Content}, Swipe=${want.Swipe}, State=${want.State} together, so it can't be made faithfully`);
  }
  const soft = ["Status", "Starred", "Selected", "Avatar"];
  const best = structural
    .map((v) => ({ ...v, score: soft.filter((k) => v.props[k] === want[k]).length }))
    .sort((a, b) => b.score - a.score)[0];
  report.baseVariant = best.node.name;

  // ---------- Placement: find or create the Section ----------
  const page = figma.currentPage;
  let section = page.children.find((n) => n.type === "SECTION" && n.name === SECTION_NAME);
  if (!section) {
    const others = page.children;
    const right = Math.max(...others.map((n) => n.x + n.width));
    const top = Math.min(...others.map((n) => n.y));
    section = figma.createSection();
    section.name = SECTION_NAME;
    section.x = right + 200;
    section.y = top;
    section.resizeWithoutConstraints(492, 200);
    report.sectionCreated = true;
  }
  const PAD = 40, GAP = 24;
  const rows = section.children;
  const nextY = rows.length ? Math.max(...rows.map((n) => n.y + n.height)) + GAP : PAD;

  instance = best.node.createInstance();
  section.appendChild(instance);
  instance.x = PAD;
  instance.y = nextY;
  instance.name = `Email row / ${SPEC.text.sender ?? "Draft"}`;

  // ---------- Text properties ----------
  const t = SPEC.text;
  const textProps = {};
  if (t.sender != null) textProps[propKey(instance, "Sender")] = t.sender;
  if (t.subject != null) textProps[propKey(instance, "Subject")] = t.subject;
  if (t.snippet != null) textProps[propKey(instance, "Snippet")] = t.snippet;
  instance.setProperties(textProps);

  const find = (name, type) => instance.findOne((n) => n.name === name && (!type || n.type === type));
  const timeStamp = find("Time stamp", "INSTANCE");
  const star = find("Star button", "INSTANCE");
  let avatar = find("Avatar", "INSTANCE");

  // ---------- Overrides for differences from the base variant ----------
  const base = best.props;
  if (want.Avatar !== base.Avatar && want.Selected !== "True") {
    avatar.setProperties({ Type: want.Avatar });
    report.overrides.push(`Avatar type → ${want.Avatar}`);
  }
  if (want.Starred !== base.Starred) {
    star.setProperties({ Starred: want.Starred });
    report.overrides.push(`Star → ${want.Starred === "True" ? "filled" : "outline"}`);
  }
  const sender = find("Sender", "TEXT");
  const subject = find("Subject", "TEXT");
  const snippet = find("Snippet", "TEXT") ?? find("Tracking text", "TEXT");
  const selected = want.Selected === "True";
  if (want.Status !== base.Status) {
    const unread = want.Status === "Unread";
    if (sender) await sender.setTextStyleIdAsync(styles[unread ? "body/large-emphasized" : "body/large"].id);
    await subject.setTextStyleIdAsync(styles[unread ? "body/medium-emphasized" : "body/medium"].id);
    setFill(subject, selected ? "color/text/on-selected" : unread ? "color/text/primary" : "color/text/secondary");
    timeStamp.setProperties({ Emphasis: unread ? "Emphasized" : "Regular" });
    report.overrides.push(`Status → ${want.Status} (text weights + time emphasis)`);
  }
  if (want.Selected !== base.Selected) {
    if (selected) {
      setFill(instance, "color/surface/selected");
      for (const node of [sender, subject, snippet, timeStamp.findOne((n) => n.type === "TEXT")]) if (node) setFill(node, "color/text/on-selected");
      const starIcon = star.findOne((n) => n.type === "VECTOR");
      if (starIcon && want.Starred !== "True") setFill(starIcon, "color/icon/on-selected");
      avatar.setProperties({ Type: "Checked" });
      report.overrides.push("Selected → background, text colours, Checked avatar");
    } else {
      report.warnings.push("Base variant is Selected but Selected=False was requested; no variant without selection matched");
    }
  }
  if ((want.Content === "Snoozed" || want.Content === "Scheduled") && timeStamp.componentProperties.Type?.value !== want.Content) {
    timeStamp.setProperties({ Type: want.Content });
  }

  // ---------- Nested texts and avatar colour ----------
  if (t.time != null) timeStamp.setProperties({ [propKey(timeStamp, "Time")]: t.time });
  avatar = find("Avatar", "INSTANCE");
  const kit = avatar.findOne((n) => n.type === "INSTANCE" && propKey(n, "Letter"));
  if (kit && t.letter) kit.setProperties({ [propKey(kit, "Letter")]: t.letter.slice(0, 1).toUpperCase() });
  if (kit && t.avatarColor) {
    const bg = kit.findOne((n) => n.name === "Background");
    if (bg) setFill(bg, `color/avatar/${t.avatarColor}`);
      // The violet (default) background needs the dark violet letter: white on it is ~1.3:1 contrast
      const initial = kit.findOne((n) => n.type === "TEXT");
      if (initial && t.avatarColor === "default") {
        setFill(initial, "color/avatar/on-default");
        report.overrides.push("Avatar letter → color/avatar/on-default (contrast)");
      }
  }
  const setText = async (node, value) => {
    if (!node || value == null) return;
    for (const f of node.getRangeAllFontNames(0, node.characters.length)) await figma.loadFontAsync(f);
    node.characters = String(value);
  };
  if (want.Content === "Message count") await setText(find("Message count", "TEXT"), t.messageCount);
  if (want.Content === "Tracking") await setText(find("Tracking text", "TEXT"), t.trackingText);
  if (want.Content === "Attachment") {
    await setText(find("Attachment chip", "INSTANCE")?.findOne((n) => n.name === "label-text"), t.attachmentName);
    await setText(find("More files", "TEXT"), t.moreFiles);
  }
  if (want.Content === "Label chip" && t.label != null) {
    const chip = find("Label chip", "INSTANCE");
    chip.setProperties({ [propKey(chip, "Label")]: t.label });
  }

  // ---------- Grow the Section to fit ----------
  const bottom = Math.max(...section.children.map((n) => n.y + n.height)) + PAD;
  const width = Math.max(section.width, instance.width + PAD * 2);
  section.resizeWithoutConstraints(width, Math.max(section.height, bottom));

  // ---------- Validate ----------
  const main = await instance.getMainComponentAsync();
  const sb = section.absoluteBoundingBox;
  const overlaps = page.children
    .filter((n) => n.id !== section.id && n.absoluteBoundingBox)
    .filter((n) => {
      const b = n.absoluteBoundingBox;
      return b.x < sb.x + sb.width && b.x + b.width > sb.x && b.y < sb.y + sb.height && b.y + b.height > sb.y;
    })
    .map((n) => n.name);
  const kitAfter = find("Avatar", "INSTANCE").findOne((n) => n.type === "INSTANCE" && propKey(n, "Letter"));
  report.readBack = {
    variant: main.variantProperties,
    sender: sender?.characters ?? "(Draft: sender hidden)",
    subject: subject.characters,
    snippetOrTracking: snippet?.characters,
    time: timeStamp.findOne((n) => n.type === "TEXT").characters,
    timeEmphasis: timeStamp.componentProperties.Emphasis?.value,
    starred: star.componentProperties.Starred?.value,
    avatarType: find("Avatar", "INSTANCE").componentProperties.Type?.value,
    letter: kitAfter ? kitAfter.componentProperties[propKey(kitAfter, "Letter")]?.value : null,
    senderStyle: sender ? (await figma.getStyleByIdAsync(sender.textStyleId))?.name : null,
    subjectStyle: (await figma.getStyleByIdAsync(subject.textStyleId))?.name,
  };
  report.checks = {
    linkedToMaster: Boolean(main && main.parent && main.parent.id === set.id),
    size: `${Math.round(instance.width)} × ${Math.round(instance.height)}`,
    overlaps,
  };
  report.instanceId = instance.id;
  report.sectionId = section.id;
  report.proposedExtension = report.overrides.length > 0;
  report.ok = true;
} catch (error) {
  // Never leave a half-made row (or a Section created only for it) behind
  if (instance && !instance.removed) instance.remove();
  const section = figma.currentPage.children.find((n) => n.type === "SECTION" && n.name === SECTION_NAME);
  if (report.sectionCreated && section && section.children.length === 0) section.remove();
  report.error = error.message;
}
return report;

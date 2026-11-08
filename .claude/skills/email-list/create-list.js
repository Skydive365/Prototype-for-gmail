// Run with figma_execute (Figma Console MCP). Replace SPEC with the approved list; leave the rest unchanged.
// Builds one Auto Layout list of email row instances (optionally with group headers), validates it, returns a JSON report.
// Row rules (variant choice + overrides) are the same as ../email-row/create-row.js.
const SPEC = {
  name: "Example",
  // Where the list goes (the user is always asked):
  //   { type: "slot", nodeId: "78:4769" }  a screen frame, or the M3 slot placeholder itself
  //   { type: "section" }                  the "Generated email rows" Section
  // replaceExisting: true only after the user agreed to replace a list already in that slot.
  target: { type: "slot", nodeId: "78:4769", replaceExisting: false },
  items: [
    { header: "Today" }, // optional group header
    {
      variant: { State: "Enabled", Status: "Unread", Starred: "False", Selected: "False", Content: "Default", Avatar: "Letter", Swipe: "None" },
      text: { sender: "Square", subject: "Payment received", snippet: "You received $42.00 from Alex", time: "9:41 AM", letter: "S", avatarColor: "green" },
    },
  ],
};

const SET_ID = "97:29397";
const SECTION_NAME = "Generated email rows";
const SLOT_COMPONENT = "Shared Building Blocks/Slot-component"; // M3 kit placeholder
const LIST_WIDTH = 412;
const MAX_ROWS = 20;
const report = { ok: false, rows: [], headers: 0, proposedExtensions: [], warnings: [] };
let list = null;
let placeholder = null;
let placeholderWasVisible = null;
let removedList = null; // a previous list replaced in the slot (restored on failure)

try {
  // ---------- Look-ups ----------
  const set = (await figma.getNodeByIdAsync(SET_ID)) ?? figma.root.findOne((n) => n.type === "COMPONENT_SET" && n.name === "Email row");
  if (!set) throw new Error("Email row component set not found");
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await figma.variables.getLocalVariablesAsync();
  const inCollection = (name, collection) => {
    const id = collections.find((c) => c.name === collection).id;
    const v = vars.find((x) => x.name === name && x.variableCollectionId === id);
    if (!v) throw new Error(`Missing token ${name}`);
    return v;
  };
  const token = (name) => inCollection(name, "Semantic");
  const space = (name) => inCollection(name, "Primitives");
  const styles = Object.fromEntries((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
  const propKey = (node, prefix) => Object.keys(node.componentProperties).find((k) => k === prefix || k.startsWith(prefix + "#"));
  const setFill = (node, tokenName) => {
    const fills = node.fills.map((p) => ({ ...p }));
    const i = fills.findIndex((p) => p.type === "SOLID" && p.visible !== false);
    if (i < 0) return;
    fills[i] = figma.variables.setBoundVariableForPaint(fills[i], "color", token(tokenName));
    node.fills = fills;
  };
  const solidToken = (tokenName) => figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 1, g: 1, b: 1 } }, "color", token(tokenName));
  for (const style of ["Regular", "Medium", "SemiBold"]) await figma.loadFontAsync({ family: "Roboto", style });

  // ---------- Check every row before creating anything ----------
  const rowsSpec = SPEC.items.filter((item) => !item.header);
  if (!rowsSpec.length) throw new Error("The list has no rows");
  if (rowsSpec.length > MAX_ROWS) throw new Error(`The list has ${rowsSpec.length} rows; the limit is ${MAX_ROWS}. Split it into several lists.`);
  const variants = set.children.map((c) => ({ node: c, props: c.variantProperties }));
  const soft = ["Status", "Starred", "Selected", "Avatar"];
  const chooseVariant = (want) => {
    const structural = variants.filter((v) => v.props.Content === want.Content && v.props.Swipe === want.Swipe && v.props.State === want.State);
    if (!structural.length) return null;
    return structural.map((v) => ({ ...v, score: soft.filter((k) => v.props[k] === want[k]).length })).sort((a, b) => b.score - a.score)[0];
  };
  const impossible = rowsSpec
    .map((r, i) => ({ i: i + 1, r }))
    .filter(({ r }) => !chooseVariant(r.variant))
    .map(({ i, r }) => `row ${i} (Content=${r.variant.Content}, Swipe=${r.variant.Swipe}, State=${r.variant.State})`);
  if (impossible.length) throw new Error(`These rows can't be made from existing variants: ${impossible.join("; ")}`);

  // ---------- Placement ----------
  const page = figma.currentPage;
  const PAD = 40, GAP = 24;
  const inSlot = SPEC.target?.type === "slot";
  let section = null;
  let screen = null;
  let slotHeight = null;
  const screenBefore = {};

  list = figma.createFrame();
  list.name = `Email list / ${SPEC.name}`;
  list.layoutMode = "VERTICAL";
  list.itemSpacing = 0;
  list.counterAxisSizingMode = "FIXED";
  list.resize(LIST_WIDTH, 100);
  list.fills = [solidToken("color/surface/default")];
  list.clipsContent = true;

  if (inSlot) {
    // Slot: the M3 "Slot-component" placeholder inside a screen. The list takes its exact place.
    const isPlaceholder = async (n) => n.type === "INSTANCE" && (await n.getMainComponentAsync())?.name === SLOT_COMPONENT;
    const target = await figma.getNodeByIdAsync(SPEC.target.nodeId);
    if (!target) throw new Error(`Target ${SPEC.target.nodeId} not found`);
    if (await isPlaceholder(target)) placeholder = target;
    else if ("children" in target) {
      for (const c of target.children) if (await isPlaceholder(c)) { placeholder = c; break; }
    }
    if (!placeholder) throw new Error(`No "${SLOT_COMPONENT}" placeholder found in "${target.name}"`);
    screen = placeholder.parent;
    if (screen.layoutMode !== "VERTICAL") throw new Error(`"${screen.name}" is not a vertical Auto Layout screen`);
    for (const c of screen.children) screenBefore[c.id] = { y: c.y, h: c.height };
    screenBefore.screenHeight = screen.height;
    slotHeight = placeholder.height;

    // A list from an earlier run sits right after the hidden placeholder
    const index = screen.children.indexOf(placeholder);
    const next = screen.children[index + 1];
    if (next && next.type === "FRAME" && next.name.startsWith("Email list /")) {
      if (!SPEC.target.replaceExisting) throw new Error(`The slot already holds "${next.name}". Ask the user, then set target.replaceExisting = true to replace it.`);
      removedList = next;
      removedList.visible = false; // deleted only after the new list is built and checked
    }

    placeholderWasVisible = placeholder.visible;
    screen.insertChild(index + 1, list);
    placeholder.visible = false; // hidden, not deleted, so it can be restored
    list.layoutSizingHorizontal = "FILL";
    list.primaryAxisSizingMode = "FIXED";
    list.resize(list.width, slotHeight); // fixed like a phone screen: extra rows are clipped
  } else {
    section = page.children.find((n) => n.type === "SECTION" && n.name === SECTION_NAME);
    if (!section) {
      const right = Math.max(...page.children.map((n) => n.x + n.width));
      const top = Math.min(...page.children.map((n) => n.y));
      section = figma.createSection();
      section.name = SECTION_NAME;
      section.x = right + 200;
      section.y = top;
      section.resizeWithoutConstraints(LIST_WIDTH + 80, 200);
      report.sectionCreated = true;
    }
    const existing = section.children;
    const nextY = existing.length ? Math.max(...existing.map((n) => n.y + n.height)) + GAP : PAD;
    section.appendChild(list);
    list.x = PAD;
    list.y = nextY;
    list.primaryAxisSizingMode = "AUTO"; // height hugs the rows
  }

  // ---------- Header (proposed extension: no header component in Figma) ----------
  const makeHeader = async (title) => {
    const header = figma.createFrame();
    header.name = `Section header / ${title}`;
    header.layoutMode = "HORIZONTAL";
    header.primaryAxisSizingMode = "FIXED";
    header.counterAxisSizingMode = "AUTO";
    header.fills = [solidToken("color/surface/default")];
    header.setBoundVariable("paddingTop", space("space/400"));
    header.setBoundVariable("paddingBottom", space("space/200"));
    header.setBoundVariable("paddingLeft", space("space/400"));
    header.setBoundVariable("paddingRight", space("space/400"));
    const label = figma.createText();
    label.name = "Title";
    await label.setTextStyleIdAsync(styles["label/small"].id);
    label.characters = title;
    label.fills = [solidToken("color/text/secondary")];
    header.appendChild(label);
    list.appendChild(header);
    header.layoutSizingHorizontal = "FILL";
    return header;
  };

  // ---------- Row (same rules as email-row) ----------
  const makeRow = async (spec, index) => {
    const want = spec.variant;
    const t = spec.text;
    const best = chooseVariant(want);
    const instance = best.node.createInstance();
    list.appendChild(instance);
    instance.layoutSizingHorizontal = "FILL";
    instance.name = `Email row / ${t.sender ?? "Draft"}`;
    const overrides = [];

    const textProps = {};
    if (t.sender != null) textProps[propKey(instance, "Sender")] = t.sender;
    if (t.subject != null) textProps[propKey(instance, "Subject")] = t.subject;
    if (t.snippet != null) textProps[propKey(instance, "Snippet")] = t.snippet;
    instance.setProperties(textProps);

    const find = (name, type) => instance.findOne((n) => n.name === name && (!type || n.type === type));
    const timeStamp = find("Time stamp", "INSTANCE");
    const star = find("Star button", "INSTANCE");
    let avatar = find("Avatar", "INSTANCE");
    const base = best.props;
    const selected = want.Selected === "True";

    if (want.Avatar !== base.Avatar && !selected) {
      avatar.setProperties({ Type: want.Avatar });
      overrides.push(`Avatar type → ${want.Avatar}`);
    }
    if (want.Starred !== base.Starred) {
      star.setProperties({ Starred: want.Starred });
      overrides.push(`Star → ${want.Starred === "True" ? "filled" : "outline"}`);
    }
    const sender = find("Sender", "TEXT");
    const subject = find("Subject", "TEXT");
    const snippet = find("Snippet", "TEXT") ?? find("Tracking text", "TEXT");
    if (want.Status !== base.Status) {
      const unread = want.Status === "Unread";
      if (sender) await sender.setTextStyleIdAsync(styles[unread ? "body/large-emphasized" : "body/large"].id);
      await subject.setTextStyleIdAsync(styles[unread ? "body/medium-emphasized" : "body/medium"].id);
      setFill(subject, selected ? "color/text/on-selected" : unread ? "color/text/primary" : "color/text/secondary");
      timeStamp.setProperties({ Emphasis: unread ? "Emphasized" : "Regular" });
      overrides.push(`Status → ${want.Status}`);
    }
    if (want.Selected !== base.Selected && selected) {
      setFill(instance, "color/surface/selected");
      for (const node of [sender, subject, snippet, timeStamp.findOne((n) => n.type === "TEXT")]) if (node) setFill(node, "color/text/on-selected");
      const starIcon = star.findOne((n) => n.type === "VECTOR");
      if (starIcon && want.Starred !== "True") setFill(starIcon, "color/icon/on-selected");
      avatar.setProperties({ Type: "Checked" });
      overrides.push("Selected");
    }
    if ((want.Content === "Snoozed" || want.Content === "Scheduled") && timeStamp.componentProperties.Type?.value !== want.Content) {
      timeStamp.setProperties({ Type: want.Content });
    }

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
        overrides.push("Avatar letter → color/avatar/on-default (contrast)");
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

    // Read back for validation
    const main = await instance.getMainComponentAsync();
    const kitAfter = find("Avatar", "INSTANCE").findOne((n) => n.type === "INSTANCE" && propKey(n, "Letter"));
    if (overrides.length) report.proposedExtensions.push(`row ${index} (${t.sender ?? "Draft"}): ${overrides.join(", ")}`);
    return {
      index,
      id: instance.id,
      baseVariant: Object.entries(base).map(([k, v]) => `${k}=${v}`).join(", "),
      overrides,
      linkedToMaster: Boolean(main && main.parent && main.parent.id === set.id),
      size: `${Math.round(instance.width)} × ${Math.round(instance.height)}`,
      readBack: {
        sender: sender?.characters ?? "(Draft)",
        subject: subject.characters,
        snippet: snippet?.characters,
        time: timeStamp.findOne((n) => n.type === "TEXT").characters,
        unread: timeStamp.componentProperties.Emphasis?.value === "Emphasized",
        starred: star.componentProperties.Starred?.value === "True",
        avatar: find("Avatar", "INSTANCE").componentProperties.Type?.value,
        letter: kitAfter ? kitAfter.componentProperties[propKey(kitAfter, "Letter")]?.value : null,
      },
    };
  };

  // ---------- Build in order ----------
  let rowIndex = 0;
  for (const item of SPEC.items) {
    if (item.header) {
      await makeHeader(item.header);
      report.headers++;
      report.proposedExtensions.push(`header "${item.header}" (no header component in Figma)`);
    } else {
      report.rows.push(await makeRow(item, ++rowIndex));
    }
  }

  // ---------- List-level checks ----------
  const childrenHeight = list.children.reduce((sum, n) => sum + n.height, 0);
  report.checks = {
    list: {
      layout: list.layoutMode,
      gap: list.itemSpacing,
      width: Math.round(list.width),
      height: Math.round(list.height),
      childrenHeight: Math.round(childrenHeight),
    },
    allRowsLinked: report.rows.every((r) => r.linkedToMaster),
  };

  if (inSlot) {
    // Rows that end below the slot are clipped, like content below the fold
    const hidden = list.children.filter((n) => n.y + n.height > slotHeight + 0.5).map((n) => n.name);
    const moved = screen.children
      .filter((c) => c !== list && c !== placeholder && screenBefore[c.id])
      .filter((c) => Math.abs(c.y - screenBefore[c.id].y) > 0.5 || Math.abs(c.height - screenBefore[c.id].h) > 0.5)
      .map((c) => c.name);
    report.checks.slot = {
      screen: screen.name,
      listMatchesSlot: Math.abs(list.y - screenBefore[placeholder.id].y) < 0.5 && Math.abs(list.height - slotHeight) < 0.5,
      screenHeightUnchanged: Math.abs(screen.height - screenBefore.screenHeight) < 0.5,
      otherLayersMoved: moved,
      placeholderHidden: placeholder.visible === false,
      clippedItems: hidden,
    };
    if (hidden.length) report.warnings.push(`${hidden.length} item(s) are below the ${Math.round(slotHeight)} px fold and clipped: ${hidden.join(", ")}`);
    if (removedList) {
      report.replaced = removedList.name;
      removedList.remove();
    }
    report.screenId = screen.id;
  } else {
    const bottom = Math.max(...section.children.map((n) => n.y + n.height)) + PAD;
    section.resizeWithoutConstraints(Math.max(section.width, LIST_WIDTH + PAD * 2), Math.max(section.height, bottom));
    const sb = section.absoluteBoundingBox;
    report.checks.overlaps = page.children
      .filter((n) => n.id !== section.id && n.absoluteBoundingBox)
      .filter((n) => {
        const b = n.absoluteBoundingBox;
        return b.x < sb.x + sb.width && b.x + b.width > sb.x && b.y < sb.y + sb.height && b.y + b.height > sb.y;
      })
      .map((n) => n.name);
    report.checks.list.heightMatchesChildren = Math.abs(list.height - childrenHeight) < 0.5;
    report.sectionId = section.id;
  }
  report.listId = list.id;
  report.ok = true;
} catch (error) {
  // Never leave a half-made list behind; put the slot back exactly as it was
  if (list && !list.removed) list.remove();
  if (placeholder && placeholderWasVisible !== null) placeholder.visible = placeholderWasVisible;
  if (removedList && !removedList.removed) removedList.visible = true;
  const section = figma.currentPage.children.find((n) => n.type === "SECTION" && n.name === SECTION_NAME);
  if (report.sectionCreated && section && section.children.length === 0) section.remove();
  report.rows = [];
  report.error = error.message;
}
return report;

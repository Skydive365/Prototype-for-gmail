---
name: inbox-screen
description: Create a complete Gmail mobile inbox screen in Figma (status bar, search bar, "Primary" label, email list in the slot, Compose button, navigation bar) from a short plain-language brief, by duplicating the inbox template screen in the "Learn AI workflow" file and filling its slot with email rows. Use when the user asks for an inbox screen, a full mobile screen, or runs /inbox-screen. For a list only use email-list; for one row use email-row.
argument-hint: "<brief, e.g. Friday afternoon inbox, 5 emails, one draft, one delivery>"
---

# Create an inbox screen in Figma

You create **one new screen** by copying the inbox template and filling its slot with a list of email rows. You never change the template, the master components or detach instances.

Before you start, read:
- `../email-list/SKILL.md`: drafting, table review and validation rules for the list. **Follow them for the list part.**
- `../email-row/reference.md`: the row component, variants and override rules.
- `create-screen.js` (this folder) and `../email-list/create-list.js`: the two scripts you run.

## Rules agreed with the user

| Topic | Rule |
|---|---|
| Template | **Examples/Reviews-Mobile** (`78:4769`): status bar, Search bar component, "Primary" label, slot (652 px), Compose FAB (proposed extension), navigation bar, gesture bar. Never modified. |
| New screens | Copies named "Inbox / <name>" in the **"Generated screens"** Section, side by side (80 px apart). |
| List | Drafted from the brief and approved by the user, exactly as in email-list. Placed in the new screen's slot at fixed height; rows below the fold are clipped and reported. |
| Tool | Figma Console MCP only. |
| Validation | email-list's checks, plus: screen is a copy (template unchanged), slot filled, other layers unmoved, one screenshot of the whole screen. |

## Steps

1. **Connection:** `figma_get_status` with `probe: true`; continue only if connected to **Learn AI workflow**.
2. **Draft:** a short screen name (e.g. "Friday afternoon") and the list, following email-list Step 2. Aim for what fits: about 6–7 rows without headers, fewer with headers (652 px slot).
3. **Review:** show the table (email-list Step 3, items 1 and 3) and the screen name. The destination is always a **new screen**, so don't ask where. Get a clear yes.
4. **Create the screen:** put the name and the number of **Unread** rows (`unread`, for the Mail badge; 0 hides it) into `SPEC` in `create-screen.js` and run it with `figma_execute` (timeout 60000). If `ok` is false, stop and report; nothing is left behind. The copy keeps the slot placeholder visible so the screen stays full height until the list goes in.
5. **Fill the slot:** run `../email-list/create-list.js` with the approved list and `target: { type: "slot", nodeId: "<screenId from step 4>", replaceExisting: false }` (timeout 120000).
   - If it fails, remove the new screen so nothing half-made is left: `figma_execute` with `(await figma.getNodeByIdAsync("<screenId>")).remove()`. Only ever remove the screen this run created.
6. **Validate:** email-list Step 5 checks (slot variant) plus `templateUnchanged` from step 4. Screenshot the new screen (`screenId`, scale 1) and look at it: bars intact, list in the slot, Compose button floating bottom-right, nothing overlapping.
7. **Report:** screen name and where it is, rows and headers, rows clipped below the fold, every override, header and the Compose button as **proposed extensions**, validation results and the screenshot.

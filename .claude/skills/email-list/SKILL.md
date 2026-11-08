---
name: email-list
description: Create a list of several Gmail mobile email rows (optionally grouped under headers like "Today") in Figma from a short plain-language brief, using instances of the existing "Email row" master in the "Learn AI workflow" file. The list goes into a mobile screen's slot (the Material 3 slot placeholder) or the "Generated email rows" Section — always ask which. Use when the user asks for multiple email rows, an inbox list, or runs /email-list. For a single row use the email-row skill instead.
argument-hint: "<brief, e.g. 6 emails for a Monday morning, 2 unread, one starred from my manager>"
---

# Create a list of email rows in Figma

You build **one list** of 1–20 email rows as an Auto Layout frame, using instances of the existing master. You never redraw rows, edit the master or detach instances.

Before you start, read:
- `../email-row/reference.md` for the component's properties, the 23 existing variants, the plain-language mapping and the override rules. **The same rules apply to every row in the list.**
- `create-list.js` (this folder): the script you run in Figma.

## Rules agreed with the user

| Topic | Rule |
|---|---|
| Input | A plain-language brief. |
| Content | **Draft it, then the user edits.** Write realistic, clearly fictional content (no real people's private details). Nothing goes to Figma until the user approves the table. |
| Groups | Headers only when the user asks (e.g. "Today / Yesterday", "Pinned / Everything else"). Figma has no header component, so the script makes a simple token-styled text header and reports it as a **proposed extension**. |
| Where it goes | **Always ask** (Step 3): a screen's **slot**, or the **Section**. |
| Slot | A mobile screen built with the Material 3 slot placeholder (`Shared Building Blocks/Slot-component`). Default screen: **Examples/Reviews-Mobile** (`78:4769`); the user can paste a link to another screen. The placeholder is **hidden** (never deleted) and the list is inserted in its exact position, at the slot's **fixed height** (652 px in Reviews-Mobile). Rows beyond it are clipped below the fold and reported. If the slot already holds a list, ask before replacing it. |
| Section | An Auto Layout frame in the **"Generated email rows"** Section, below anything already there; height hugs the rows. |
| List frame | "Email list / <name>": 412 px wide, vertical, 0 gap. |
| Combinations not in Figma | Closest variant + instance overrides, per row, reported as proposed extensions (same as email-row). Rows that can't be made are flagged in the table before creating anything. |
| Size | 1–20 rows. For more, ask the user to split it into several lists. |
| Tool | Figma Console MCP only. |
| Validation | Read back every row, check the list frame and its placement, one screenshot. |

## Step 1: Check the connection

`figma_get_status` with `probe: true`. Continue only if it is connected to **Learn AI workflow** (`jgw8Iiwb7rKZjZj8pBDWB7`).

## Step 2: Draft the list

1. Work out from the brief: how many rows, which states and content types, any groups, and a short list name (e.g. "Monday morning").
2. If the brief is too vague to draft sensibly (no count and no clear purpose), ask one short question first.
3. Draft every row with all values the script needs: sender, subject, snippet, time, avatar (type, plus letter colour for Letter avatars), the variant properties, and content-specific text (attachment name and "+N", message count, label, tracking text).
4. Keep it believable: times run newest first within a group, letter avatars use the sender's first letter, and colours vary (prefer green and orange).

## Step 3: Show the table, ask where it goes, let the user edit

1. Show one table, one line per row, with columns: #, Group, Sender, Subject, Preview, Time, States (Unread / Starred / Selected / Content / Avatar), Notes. In **Notes**, mark:
   - **override**: the combination isn't in Figma, so overrides will be used (say which)
   - **can't make**: Content, Swipe or State combination that doesn't exist (e.g. Hovered + Attachment); suggest the nearest option
   - **header**: a group header will be created (proposed extension)
2. **Ask where the list should go** (use AskUserQuestion): the **Reviews-Mobile slot**, **another screen's slot** (they paste a Figma link; take the `node-id`, replacing `-` with `:`), or the **Section**.
3. For a slot, estimate the height (headers ≈ 32 px, rows 88 px, attachment rows 128 px). If it exceeds the slot (652 px in Reviews-Mobile), say which rows will be below the fold.
4. For a slot, check whether it already holds a list (a frame named "Email list / …" right after the hidden placeholder). If so, ask whether to replace it.
5. Ask the user to approve or change everything. Apply changes and show the table again if anything changed. Do not continue without a clear yes, and never with a "can't make" row left in.

## Step 4: Build the list

1. Read `create-list.js`. Replace the `SPEC` object at the top with the approved list and `target`:
   - slot: `{ type: "slot", nodeId: "<screen or placeholder id>", replaceExisting: <true only if the user agreed> }`
   - section: `{ type: "section" }`
2. Run it with `figma_execute` (timeout 120000). Leave the rest of the script unchanged.
3. If `ok` is false, the script has already undone everything (list removed, placeholder and any previous list restored). Tell the user what failed and stop.

## Step 5: Validate

1. Check the report:
   - `checks.list.layout` is "VERTICAL", gap 0, width 412
   - every row: `linkedToMaster` true, size 412 × 88 (412 × 128 for Attachment), and `readBack` matching the approved table
   - **slot**: `checks.slot.listMatchesSlot` and `screenHeightUnchanged` are true, `otherLayersMoved` is empty, `placeholderHidden` is true; note any `clippedItems`
   - **section**: `checks.list.heightMatchesChildren` is true and `checks.overlaps` is empty
2. Screenshot with `figma_take_screenshot` (scale 1.5): the `screenId` for a slot (the whole phone screen), otherwise the `listId`. Look at it: order, groups, unread weights, stars, avatars, and that the status bar, search bar and navigation bar are untouched.
3. Fix problems on the instances (never the master), at most twice. Report honestly.

## Step 6: Report

Briefly: list name and where it is (screen + slot, or Section), the number of rows and headers, rows clipped below the fold, every override and header as a **proposed extension**, anything that couldn't be made, the validation results and the screenshot.

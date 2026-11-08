---
name: email-row
description: Create one Gmail mobile email row in Figma from a plain-language description, as an instance of the existing "Email row" master component in the "Learn AI workflow" file. Use when the user asks to add, generate or place an email row (sender, subject, unread, starred, attachment, etc.) in Figma, or runs /email-row.
argument-hint: "<describe the email, e.g. unread starred email from Square at 9:41 AM>"
---

# Create an email row in Figma

You create **one** email row in Figma by instancing the existing master component and setting its properties. You never redraw the row, edit the master or its variants, or detach the instance.

Read `reference.md` (in this folder) before you start: it holds the component's properties, the plain-language mapping, the override rules and the placement rules. `create-row.js` is the script you run in Figma.

## Rules agreed with the user

| Topic | Rule |
|---|---|
| Input | Plain language. Map it to properties yourself (see reference.md → "Reading the request"). |
| Missing information | **Ask for each gap.** Never invent content. See "Step 2". |
| Combination not in Figma | Use the **closest variant + instance overrides**. Report every override and call the result a **proposed extension**. |
| Placement | A Section named **"Generated email rows"** on the current page, to the right of existing content. New rows stack below earlier ones. Never overlap anything. |
| Tool | **Figma Console MCP only** (`figma_get_status`, `figma_execute`, `figma_take_screenshot`). Do not use the official Figma MCP. |
| Validation | Read back properties and texts **and** show a screenshot. |

## Step 1: Check the connection

Call `figma_get_status` with `probe: true`. Continue only if it is connected to **Learn AI workflow** (file key `jgw8Iiwb7rKZjZj8pBDWB7`). Otherwise stop and tell the user to open that file in Figma Desktop and run the Desktop Bridge plugin.

## Step 2: Understand the request and ask for gaps

1. Turn the description into a spec using reference.md → "Reading the request".
2. **Required content.** If any of these are not in the request, ask the user for them in one message (a short numbered list), then wait:
   - Sender, Subject, Snippet (preview text), Time
   - Avatar look: photo-less letter (and its colour: green, orange or violet), "No photo", "Logo"
   - Content-specific text, only when that content is requested: message count number, label chip text, tracking text, attachment file name and the "+N more files" count
3. Things the user didn't mention are **not** gaps. They stay at Figma's normal state (Read, not starred, not selected, Enabled, no swipe, Default content). The avatar letter is the first letter of the sender unless the user gives one.
4. If something is ambiguous ("highlight it", "make it important-looking"), ask what they mean rather than guessing.

## Step 3: Confirm before writing to Figma

Show a short summary and ask the user to confirm:

- The requested properties and texts
- The base variant you will use, and any overrides (reference.md → "Choosing the variant")
- Anything that **cannot** be made (e.g. Hovered + Attachment) and why
- Where it goes: the "Generated email rows" Section

Do not continue without a clear yes.

## Step 4: Create the row

1. Read `create-row.js`. Replace the `SPEC` object at the top with the confirmed values. Leave the rest unchanged.
2. Run it with `figma_execute` (timeout 60000).
3. The script returns a JSON report. If `ok` is false, it has already removed anything partial: tell the user what failed and stop.

## Step 5: Validate

1. Check the report:
   - `checks.linkedToMaster` is true (not detached)
   - `checks.size` is 412 × 88 (412 × 128 for Attachment)
   - every value in `readBack` matches the spec (texts, variant properties, nested Time, Letter, Starred, avatar Type)
   - `checks.overlaps` is empty
2. Call `figma_take_screenshot` with the `instanceId` from the report (scale 2) and look at it: right texts, right star, avatar, unread weight, no clipping.
3. If anything is wrong, fix it on the instance (never the master), re-check, at most twice. Then report honestly.

## Step 6: Report

Tell the user, in plain language:

- What was created and where (Section name, the instance's node id)
- The base variant, and each override, labelled **proposed extension** if any
- What could not be made, if anything
- The validation results, with the screenshot

Keep it short.

# AI-Powered Gmail Mobile Design Workflow — Plan

## Context

You have a Gmail mobile **Email row** component set and its atoms in Figma (`Learn AI workflow`, file key `jgw8Iiwb7rKZjZj8pBDWB7`, page `Design to code Skill`). The goal is a repeatable workflow: clean Figma tokens → React component + playground → Claude Code skills that generate rows, lists and finally a full inbox back into Figma.

Plan approved 2026-11-08. Phase 1 audit completed 2026-11-08 (read-only — nothing in Figma was changed). This file is the single checklist for the project.

**Where we are:** Phases 1–4 complete (2026-11-08). Phase 2 report in **section 2.11**, Phase 3 in **section 3.1**, Phase 4 under its checklist. Phase 5 (multiple rows) is next, after you've tried the `/email-row` skill yourself.

---

## 0. Tool check

| Tool | Status | Use it for |
|---|---|---|
| **Figma Console MCP** (Desktop Bridge plugin, local) | ✅ Connected to `Learn AI workflow`. Read + write via plugin API. | All audits, variable creation, binding, renaming, screenshots. Primary tool. |
| Figma Console REST token | ⚠️ Expired (`figma_get_styles` → 401) | Not needed — plugin tools cover everything. Optional: renew. |
| **Official Figma MCP** | ✅ Authenticated (Starter plan — tight rate limits) | Phase 3 design context / Code Connect, used sparingly. |

---

## 1. What exists today

### Component inventory
- **Email row** — `COMPONENT_SET` `97:29397`, **23 variants**, 412 × 88 (Attachment 412 × 128).
  - Variant props: `State` (Enabled/Hovered/Focused/Pressed), `Status` (Read/Unread), `Starred` (False/True), `Selected` (False/True), `Content` (Default/Attachment/Draft/Message count/Label chip/Tracking/Important/Snoozed/Scheduled/Long text), `Avatar` (Letter/No photo/Logo/Checked), `Swipe` (None/Archive/Delete).
  - Text props: `Sender`, `Subject`, `Snippet`.
  - Structure: `Avatar` · `Content` (Sender line / Subject line / Snippet line, + `Attachments` or `Tracking line`) · `Trailing` (Time stamp / Star button). Hover/Pressed add `State layer`; Focused adds `State layer` + `Focus ring` (both absolute-positioned overlays). Swipe variants: `Swipe action` · `Swiped row`.
- **Atoms** frame `85:12193`: 10 icons (8 wrap remote M3 kit icons; `local_shipping`, `label_important` are local) · `Avatar` (Letter/Logo/No photo/Checked, text prop `Initial`) · `Star button` (Starred × State) · `Attachment chip` · `Label chip` (`Label`) · `Time stamp` (Type × Emphasis, `Time`) · `State layer` (Hovered/Focused/Pressed) · `Focus ring` · `Swipe action` (Archive/Delete).
- Several atoms wrap **remote M3 Design Kit components** (Icon button, Assistive chip, Generic avatar, Focus indicator, state-layer blocks). Their masters live in another file: we can override their colours/sizes on the instance, but not edit inside them.
- No Figma annotations. Usage notes live in component descriptions (e.g. Star button: "visual 40×40, touch target 48×48").

---

## 2. Phase 1 deliverable — design system audit

### 2.1 Audit summary (plain language)

| # | Finding | Severity | Why it matters |
|---|---|---|---|
| A | Your local token collection **`Email row tokens` was deleted**, but **~800 properties (796)** (spacing, sizes, radii, 2 colours) still point to its 13 variables. | 🔴 Critical | These "ghost" tokens can't be edited, exported to code, or seen in the Variables panel. Figma could drop them at any time. |
| B | All other colours use **18 remote M3 Design Kit variables** with M3 names (`Schemes/On Surface Variant`). The M3 library isn't enabled for your team, so we can't extend it. | 🟠 High | Names aren't generic, and code export would depend on an external file. |
| C | **7 colours are hard-coded** (avatar green/orange, avatar letter white, star blue, attachment red, 2 timestamp greys). | 🟠 High | They won't change with dark mode or a theme update. |
| D | Typography is **doubled up**: text layers have an M3 text style *and* separate M3 typescale variables bound on the same layer. 4 local Momo Trust Sans styles are unused. | 🟡 Medium | Two sources of truth for the same text — confusing to maintain and to export. |
| E | 2 stroke widths (chip outline 1 px, focus ring 3 px) are hard-coded. | 🟢 Low | Easy to tokenise. |
| F | Layer naming and Auto Layout are **already clean**: no "Frame 12"-style names, Auto Layout everywhere, absolute positioning only on the two overlays. | ✅ Good | Little renaming needed. |
| G | Nested atoms (Avatar letter, Time stamp text, Label chip text…) are **not exposed** on the Email row, so changing them means digging into layers. | 🟡 Medium | Matters for the Phase 4 skill and for code props. |

Counts: 765 layers scanned across the Email row (23 variants) and all atoms. 0 text layers without a style.

### 2.2 Existing variables, styles and naming issues

**Ghost local variables (collection `Email row tokens`, 0 variables left):**

| Variable | Value | Bound to | Uses | Naming issue |
|---|---|---|---|---|
| spacing/4 | 4 | gap, padding | 56 | value in the name — renaming the value breaks the name |
| spacing/8 | 8 | gap, padding | 50 | 〃 |
| spacing/12 | 12 | padding | 98 | 〃 |
| spacing/16 | 16 | gap, padding | 66 | 〃 |
| spacing/24 | 24 | gap, padding | 13 | 〃 |
| size/24 | 24 | width/height (icons) | 195 | 〃, no purpose |
| size/40 | 40 | width/height (avatar, star button) | 164 | 〃 |
| size/48 | 48 | width/height (touch target) | 62 | 〃 |
| radius/2 | 2 | focus ring corners | 8 | 〃 |
| radius/4 | 4 | label chip corners | 8 | 〃 |
| radius/8 | 8 | attachment chip corners | 12 | 〃 |
| color/surface/default | #FFFFFF | row background | 60 | ✅ good semantic name — keep |
| color/action/archive | #059808 | archive swipe bg | 4 | ✅ good semantic name — keep |

**Remote M3 colour variables — where they're actually used:**

| M3 variable | Light | Dark (M3) | Actually used for |
|---|---|---|---|
| Schemes/On Surface | #1D1B20 | #E6E0E9 | Sender, emphasized time, star outline, icons, chip label |
| Schemes/On Surface Variant | #49454F | #CAC4D0 | Subject, snippet, label chip text, tracking, avatar person icon |
| Schemes/Secondary Container | #E8DEF8 | #4A4458 | Selected row background |
| Schemes/On Secondary Container | #4A4459 | #E8DEF8 | Text + icons on selected row |
| Schemes/Primary Container | #EADDFF | #4F378B | Avatar default background (atom) |
| Schemes/On Primary Container | #4F378A | #EADDFF | Avatar placeholder letter / icon |
| Schemes/Surface Container | #F3EDF7 | #211F26 | Label chip background |
| Schemes/Surface Container Highest | #E6E0E9 | #36343B | "No photo" avatar background |
| Schemes/Outline Variant | #CAC4D0 | #49454F | Attachment chip outline |
| Schemes/Secondary | #625B71 | #CCC2DC | Focus ring stroke |
| Schemes/Error | #B3261E | #F2B8B5 | "Draft" text, delete swipe bg |
| Schemes/Tertiary | #7D5260 | #EFB8C8 | Important marker icon (+ hidden root fill of Swipe=Archive variant) |
| Schemes/On Error, On Tertiary | #FFFFFF | #601410 / #492532 | Swipe action icons |
| State Layers/On Surface/Opacity-08, -10 | #1D1B20 @ 8/10% | #E6E0E9 @ 8/10% | Row hover / pressed overlay |
| State Layers/On Surface Variant/Opacity-08, -10 | #49454F @ 8/10% | #CAC4D0 @ 8/10% | Star button hover / pressed |
| Shape/Corner/Full | 1000 | — | Avatar circle |

Naming issues: product-specific scheme names (`On Secondary Container` doesn't say "selected row text"); `Static/Weight/Bold` actually contains **SemiBold** (M3 kit quirk).

**Text styles:**

| Style | Source | Value | Uses | Issue |
|---|---|---|---|---|
| M3/body/large | remote | Roboto Regular 16/24, +0.5 | 19 | + duplicate per-layer variables |
| M3/body/large-emphasized | remote | Roboto Medium 16/24, +0.5 | 4 | 〃 |
| M3/body/medium | remote | Roboto Regular 14/20, +0.25 | 45 | 〃 |
| M3/body/medium-emphasized | remote | Roboto Medium 14/20, +0.25 | 4 | 〃 |
| M3/body/small | remote | Roboto Regular 12/16, +0.4 | 10 | 〃 |
| M3/title/medium | remote | Roboto Medium 16/24, +0.15 | 9 | 〃 |
| M3/label/small | remote | Roboto Medium 11/16, +0.5 | 1 | 〃 |
| M3/label/small-emphasized | remote | Roboto SemiBold 11/16, +0.5 | 3 | 〃 |
| M3/headline/medium-emphasized | remote | Roboto Medium 28/36, 0 | 1 | docs heading only |
| label/sm/regular | local | Roboto Regular 11/16, +0.5 | 3 | different naming pattern (`sm`) — used by regular timestamps |
| body/md/regular, body/md/medium, body/sm/medium, title/md/semibold | local | Momo Trust Sans | **0** | unused, wrong font |

### 2.3 Final primitive tokens — collection `Primitives` (1 mode)

Rule: primitives are raw values, **never bound directly on component layers**. Scale naming: `100 = 4 px` for space/size/radius, so a new value slots in (e.g. `space/250` = 10) without renaming anything.

**Dimensions**

| Token | Value | Figma scope |
|---|---|---|
| `space/100` | 4 | gap, padding |
| `space/200` | 8 | gap, padding |
| `space/300` | 12 | gap, padding |
| `space/400` | 16 | gap, padding |
| `space/600` | 24 | gap, padding |
| `size/600` | 24 | width/height |
| `size/1000` | 40 | width/height |
| `size/1200` | 48 | width/height |
| `radius/50` | 2 | corner radius |
| `radius/100` | 4 | corner radius |
| `radius/200` | 8 | corner radius |
| `radius/full` | 1000 | corner radius |
| `border-width/thin` | 1 | stroke |
| `border-width/thick` | 3 | stroke |

**Colour — light values (exactly what's in the file today) + dark-only values**

| Token | Hex | Light use today | Dark use |
|---|---|---|---|
| `color/neutral/0` | #FFFFFF | surface, avatar letter, swipe icons | swipe icons, avatar letter |
| `color/neutral/50` | #F3EDF7 | label chip bg | — |
| `color/neutral/100` | #E6E0E9 | no-photo avatar bg | primary text |
| `color/neutral/200` | #CAC4D0 | chip outline | secondary text |
| `color/neutral/400` | #A6A8A9 | — | timestamps *(proposed, D3)* |
| `color/neutral/600` | #636566 | timestamps | — |
| `color/neutral/700` | #49454F | secondary text | chip outline |
| `color/neutral/800` | #36343B | — | no-photo avatar bg |
| `color/neutral/850` | #211F26 | — | label chip bg |
| `color/neutral/900` | #1D1B20 | primary text | — |
| `color/neutral/950` | #141218 | — | row surface |
| `color/accent/violet/100` | #EADDFF | avatar default bg | avatar letter |
| `color/accent/violet/150` | #E8DEF8 | selected row bg | text on selected |
| `color/accent/violet/300` | #CCC2DC | — | focus ring |
| `color/accent/violet/600` | #625B71 | focus ring | — |
| `color/accent/violet/700` | #4A4459 | text on selected | selected row bg (M3 #4A4458, merged) |
| `color/accent/violet/800` | #4F378A | avatar letter | avatar default bg (M3 #4F378B, merged) |
| `color/accent/blue/300` | #A8A0FF | — | starred icon *(proposed, D3)* |
| `color/accent/blue/600` | #3717ED | starred icon | — |
| `color/accent/green/600` | #059808 | archive swipe | archive swipe |
| `color/accent/green/700` | #068515 | avatar bg | avatar bg |
| `color/accent/orange/700` | #B64E03 | avatar bg | avatar bg |
| `color/accent/red/200` | #F2B8B5 | — | "Draft" text |
| `color/accent/red/600` | #FF000F | attachment icon | attachment icon |
| `color/accent/red/700` | #B3261E | "Draft", delete swipe | delete swipe |
| `color/accent/rose/200` | #EFB8C8 | — | important marker |
| `color/accent/rose/600` | #7D5260 | important marker | — |
| `color/alpha/neutral-900-08` | #1D1B20 @ 8% | row hover | — |
| `color/alpha/neutral-900-10` | #1D1B20 @ 10% | row pressed | — |
| `color/alpha/neutral-700-08` | #49454F @ 8% | star hover | — |
| `color/alpha/neutral-700-10` | #49454F @ 10% | star pressed | — |
| `color/alpha/neutral-100-08` | #E6E0E9 @ 8% | — | row hover |
| `color/alpha/neutral-100-10` | #E6E0E9 @ 10% | — | row pressed |
| `color/alpha/neutral-200-08` | #CAC4D0 @ 8% | — | star hover |
| `color/alpha/neutral-200-10` | #CAC4D0 @ 10% | — | star pressed |

Why alpha primitives: in Figma an alias can't add opacity, so translucent colours need their own primitive. This keeps every semantic token traceable to a primitive.

**Dark-mode values:** wherever a token came from M3, its dark value is M3's own Dark-mode value (no guessing). Gmail-only colours: avatar and swipe colours stay the same in dark (as in Gmail); star blue and timestamp grey fail contrast on the dark surface, so lighter values are proposed:

| Colour | On dark surface #141218 | Needed | Proposal |
|---|---|---|---|
| Star #3717ED | 2.2 : 1 ❌ | 3 : 1 (icon) | #A8A0FF → 8.1 : 1 |
| Timestamp #636566 | 3.2 : 1 ❌ | 4.5 : 1 (text) | #A6A8A9 → 7.8 : 1 |
| Attachment #FF000F | 4.7 : 1 ✅ | 3 : 1 (icon) | keep |

Light-mode note (no change proposed — just flagging): attachment red #FF000F on white is 4.0 : 1 (fine for an icon); archive swipe icon white on #059808 is 3.8 : 1 (fine for an icon).

### 2.4 Final semantic tokens — collection `Semantic` (Light) + `Semantic Dark`

> **Changed during Phase 2:** the Figma Starter plan allows only 1 mode per collection. By your decision, Light lives in `Semantic` (bound to components) and Dark lives in a separate **`Semantic Dark`** collection with the same names — **reference only** (no picker scopes, hidden from publishing, never bound). Each Light token's description also notes its dark alias. If you upgrade to Professional, Dark becomes a real mode of `Semantic` in one step.

Components bind **only** to these (plus `space/*` and `radius/*`, see note).

| Semantic token | Light → | Dark → | Bound to |
|---|---|---|---|
| `color/surface/default` | neutral/0 | neutral/950 | row background |
| `color/surface/selected` | violet/150 | violet/700 | selected row background |
| `color/surface/container` | neutral/50 | neutral/850 | label chip |
| `color/surface/container-high` | neutral/100 | neutral/800 | no-photo avatar |
| `color/text/primary` | neutral/900 | neutral/100 | sender, emphasized time, chip label |
| `color/text/secondary` | neutral/700 | neutral/200 | subject, snippet, label chip, tracking |
| `color/text/tertiary` | neutral/600 | neutral/400 | regular timestamps |
| `color/text/on-selected` | violet/700 | violet/150 | all text on selected row |
| `color/text/error` | red/700 | red/200 | "Draft" |
| `color/icon/primary` | neutral/900 | neutral/100 | star outline, icons |
| `color/icon/secondary` | neutral/700 | neutral/200 | avatar person icon, delivery icon |
| `color/icon/tertiary` | neutral/600 | neutral/400 | snooze / schedule icon in timestamp |
| `color/icon/on-selected` | violet/700 | violet/150 | star on selected row |
| `color/icon/starred` | blue/600 | blue/300 | filled star (+ its ripple) |
| `color/icon/important` | rose/600 | rose/200 | important marker |
| `color/icon/attachment` | red/600 | red/600 | file-type icon in chip |
| `color/icon/on-action` | neutral/0 | neutral/0 | swipe archive / delete icons |
| `color/border/subtle` | neutral/200 | neutral/700 | attachment chip outline |
| `color/border/focus` | violet/600 | violet/300 | focus ring |
| `color/avatar/default` | violet/100 | violet/800 | avatar bg (atom default) |
| `color/avatar/on-default` | violet/800 | violet/100 | avatar letter / icon on default |
| `color/avatar/green` | green/700 | green/700 | avatar bg (rows) |
| `color/avatar/orange` | orange/700 | orange/700 | avatar bg (Draft, "G", "M" rows) |
| `color/avatar/on-color` | neutral/0 | neutral/0 | avatar letter on green/orange |
| `color/action/archive` | green/600 | green/600 | archive swipe bg |
| `color/action/delete` | red/700 | red/700 | delete swipe bg |
| `color/state/hover` | alpha/neutral-900-08 | alpha/neutral-100-08 | row state layer (hover, focus) |
| `color/state/pressed` | alpha/neutral-900-10 | alpha/neutral-100-10 | row state layer (pressed) |
| `color/state/hover-subtle` | alpha/neutral-700-08 | alpha/neutral-200-08 | star button hover/focus |
| `color/state/pressed-subtle` | alpha/neutral-700-10 | alpha/neutral-200-10 | star button pressed |
| `size/icon/md` | size/600 | size/600 | 24 px icons |
| `size/avatar/md` | size/1000 | size/1000 | avatar |
| `size/icon-button/md` | size/1000 | size/1000 | star button visual size |
| `size/target/min` | size/1200 | size/1200 | 48 px touch target |
| `border-width/default` | border-width/thin | 〃 | chip outline |
| `border-width/focus` | border-width/thick | 〃 | focus ring |

Note on spacing and radius: `space/*` and `radius/*` are bound straight from Primitives. A semantic layer like `space/row-padding` would add names without adding meaning at this size; it can be added later if a second component needs different meaning for the same value.

Note on `text/*` vs `icon/*`: they resolve to the same primitives today, but are separate so text and icons can be tuned independently (common in dark mode), and so code gets clear names (`--color-icon-starred`).

### 2.5 Typography — collection `Typography` (1 mode) + local text styles

Figma lets **variables** hold font family, weight (as a font-style string), size, line height and letter spacing, and lets **text styles** bind those variables. So: variables = the scale, text styles = the reusable combinations, text layers use only the text style.

| Variable | Type | Value |
|---|---|---|
| `font/family/plain` | string | Roboto |
| `font/weight/regular` | string | Regular |
| `font/weight/medium` | string | Medium |
| `font/weight/semibold` | string | SemiBold (fixes M3's mislabelled "Bold") |
| `font/size/100` | number | 11 |
| `font/size/200` | number | 12 |
| `font/size/300` | number | 14 |
| `font/size/400` | number | 16 |
| `font/size/700` | number | 28 |
| `font/line-height/100` | number | 16 |
| `font/line-height/200` | number | 20 |
| `font/line-height/300` | number | 24 |
| `font/line-height/600` | number | 36 |
| `font/tracking/none` | number | 0 |
| `font/tracking/tight` | number | 0.1 |
| `font/tracking/snug` | number | 0.15 |
| `font/tracking/normal` | number | 0.25 |
| `font/tracking/relaxed` | number | 0.4 |
| `font/tracking/wide` | number | 0.5 |

Letter spacing is stored in pixels (Figma variables can't hold %), matching current values.

**Local text styles** — naming convention `<role>/<size>[-<emphasis>]`, reusable by any component:

| New style | Built from | Replaces |
|---|---|---|
| `body/large` | Roboto Regular 16/24, 0.5 | M3/body/large |
| `body/large-emphasized` | Roboto Medium 16/24, 0.5 | M3/body/large-emphasized |
| `body/medium` | Roboto Regular 14/20, 0.25 | M3/body/medium |
| `body/medium-emphasized` | Roboto Medium 14/20, 0.25 | M3/body/medium-emphasized |
| `body/small` | Roboto Regular 12/16, 0.4 | M3/body/small |
| `title/medium` | Roboto Medium 16/24, 0.15 | M3/title/medium |
| `label/small` | Roboto Medium 11/16, 0.5 | M3/label/small |
| `label/small-regular` | Roboto Regular 11/16, 0.5 | local label/sm/regular |
| `label/small-emphasized` | Roboto SemiBold 11/16, 0.5 | M3/label/small-emphasized |
| `label/large` | Roboto Medium 14/20, 0.1 | (attachment chip text — today only per-layer variables, no style) |
| `headline/medium-emphasized` | Roboto Medium 28/36, 0 | M3/headline/medium-emphasized (atoms board heading) |

Text colour stays a separate fill binding (`color/text/*`) — Figma text styles don't carry colour variables cleanly across variants.

### 2.6 Old → new mapping

| Old | New |
|---|---|
| 👻 spacing/4, 8, 12, 16, 24 | `space/100`, `200`, `300`, `400`, `600` |
| 👻 size/24 | `size/icon/md` |
| 👻 size/40 | `size/avatar/md` (on Avatar) · `size/icon-button/md` (on Star button) |
| 👻 size/48 | `size/target/min` |
| 👻 radius/2, 4, 8 | `radius/50`, `100`, `200` |
| 👻 color/surface/default | `color/surface/default` (same name, now real) |
| 👻 color/action/archive | `color/action/archive` (same name, now real) |
| M3 Shape/Corner/Full · hard radius 100 (Logo avatar) | `radius/full` |
| M3 On Surface | `color/text/primary` (text) · `color/icon/primary` (icons) |
| M3 On Surface Variant | `color/text/secondary` (text) · `color/icon/secondary` (icons) |
| M3 Secondary Container | `color/surface/selected` |
| M3 On Secondary Container | `color/text/on-selected` · `color/icon/on-selected` |
| M3 Primary Container | `color/avatar/default` |
| M3 On Primary Container | `color/avatar/on-default` |
| M3 Surface Container | `color/surface/container` |
| M3 Surface Container Highest | `color/surface/container-high` |
| M3 Outline Variant | `color/border/subtle` |
| M3 Secondary (stroke) | `color/border/focus` |
| M3 Error | `color/text/error` (Draft) · `color/action/delete` (swipe) |
| M3 Tertiary | `color/icon/important` · Swipe=Archive hidden root fill → `color/action/archive` |
| M3 On Error, On Tertiary | `color/icon/on-action` |
| M3 State Layers/On Surface/08, 10 | `color/state/hover`, `color/state/pressed` |
| M3 State Layers/On Surface Variant/08, 10 | `color/state/hover-subtle`, `color/state/pressed-subtle` |
| hard #068515 / #B64E03 (avatar bg) | `color/avatar/green` / `color/avatar/orange` |
| hard #FFFFFF (avatar letter) | `color/avatar/on-color` |
| hard #3717ED (star + ripple) | `color/icon/starred` |
| hard #FF000F (attachment icon) | `color/icon/attachment` |
| hard #636566 (time text) | `color/text/tertiary` |
| hard #606264 (snoozed/scheduled time + icon) | `color/text/tertiary` · `color/icon/tertiary` *(D1)* |
| hard stroke 1 / 3 | `border-width/default` / `border-width/focus` |
| M3 text styles + per-layer Typescale variables | local text styles from 2.5 (per-layer bindings removed) |
| local label/sm/regular | `label/small-regular` |
| local Momo Trust Sans styles (unused) | delete |

### 2.7 Missing and duplicate items

**Missing (to create):** all 3 collections; every token in 2.3–2.5; text style `label/large` (attachment chip text currently styled only by loose variables); stroke-width tokens; dark values.

**Duplicates / near-duplicates:**
| Items | Difference | Resolution |
|---|---|---|
| #636566 vs #606264 (timestamp greys) | 3 units of RGB — invisible | merge to #636566 *(D1)* |
| M3 #4A4459 (light) vs #4A4458 (dark) | 1 unit | merge to `violet/700` |
| M3 #4F378A (light) vs #4F378B (dark) | 1 unit | merge to `violet/800` |
| `label/sm/regular` vs `M3/label/small` | Regular vs Medium weight — both intentional (regular timestamps vs label chip) | keep both as `label/small-regular` and `label/small` |
| Text style + per-layer typography variables on the same layer | same values, two sources | keep the style only |
| #FFFFFF in 4 roles (surface, avatar letter, 2 swipe icons) | different purposes | one primitive, separate semantics |

**Dead / unused:** 4 Momo Trust Sans styles; the empty `Email row tokens` collection; Avatar's `Initial` text property is defined but **not connected to any layer** (the letter is edited on the nested kit avatar instead).

### 2.8 Layer naming, structure and component properties

**Layer naming — minimal changes recommended:**
| Current | Proposed | Why |
|---|---|---|
| `Person icon` (Avatar) | `Icon` | consistent with other icon slots |
| `Background` (avatar, inside instance) | keep | inside remote kit — can't rename the master |
| `Rectangle 1/2/3`, `Ripple`, `State-layer` | keep | inside remote M3 state-layer component — not editable here |

Everything else (`Sender line`, `Trailing`, `Attachments`, `Tracking line`, `Important marker`…) already reads well and maps cleanly to code.

**Auto Layout:** ✅ every frame with more than one child uses Auto Layout; `State layer` and `Focus ring` are absolute overlays by design. Variant width 412 is fixed (device width) — leave as is; code will use 100% width.

**Component properties — proposals (only #1 is recommended for Phase 2; the rest are for later discussion):**
1. **Expose nested instances** on the Email row: `Avatar`, `Time stamp`, `Label chip`, `Attachment chip`. This shows their properties (letter, time text, label text) directly in the Email row's properties panel. No visual change; big win for the Phase 4 skill. *(D5)*
2. Connect or remove Avatar's unused `Initial` text property. *(D5)*
3. *(Later)* `Starred` and `Selected` are variant properties, so only 23 of thousands of combinations exist; picking e.g. Starred + Unread + Attachment snaps to the nearest variant. A future refactor could use the nested Star button's own `Starred` variant instead. Not now — it changes component behaviour.
4. *(Later)* `Content` mixes independent features (attachment, label chip, important, snoozed…). In code these become separate props; in Figma it stays as-is for now.

### 2.9 Decisions needed from you (approve or change)

All decisions confirmed by you on 2026-11-08.

| # | Decision | Your answer |
|---|---|---|
| **D1** | Merge timestamp grey #606264 into #636566? | ✅ Merge to #636566 |
| **D2** | Label small weight | ✅ No decision needed — both weights intentional, both kept |
| **D3** | Dark values: star #A8A0FF, timestamp #A6A8A9; avatar and swipe colours unchanged in dark | ✅ Use proposed values |
| **D4** | M3 kit components | ✅ Keep as remote instances, recolour with our tokens via overrides |
| **D5** | Nested instances + Avatar `Initial` property | ✅ Expose Avatar, Time stamp, Label chip, Attachment chip; remove unused `Initial` |
| **D6** | Unused Momo Trust Sans styles + empty ghost collection | ✅ Delete at the end of Phase 2, only after all checks pass |
| **D7** | Documentation text on the atoms board | ✅ Update to new tokens too |
| **D8** | Backup of the Figma file | ✅ Done by you before Phase 2 |

### 2.10 Cleanup plan (Phase 2 order of operations)

1. Backup (D8) → before screenshots of all 23 variants + all atoms → save a JSON snapshot of every binding (scratch folder).
2. Create `Primitives` → `Semantic` (Light/Dark) → `Typography` collections, with scopes set so pickers only offer relevant tokens.
3. Create local text styles with Typography variables bound.
4. **Atoms first** (Icons → Avatar → Star button → Time stamp → chips → State layer → Focus ring → Swipe action): rebind ghost → new, M3 → semantic, hard-coded → semantic; swap text styles and clear per-layer typography bindings. Screenshot + compare after each atom.
5. **Email row** master variants: same steps, then nested instance overrides inside each variant (avatar colours, star, timestamps).
6. Expose nested instances (D5), rename `Person icon`.
7. Verify (section 4, Phase 2 checks) → after screenshots → report.
8. Delete unused styles + empty collection (D6) only after all checks pass.

### 2.11 Phase 2 report (completed 2026-11-08)

**What was created in Figma**
| Item | Count |
|---|---|
| `Primitives` collection (mode "Value") | 49 tokens (14 dimensions, 27 colours, 8 alpha colours) |
| `Semantic` collection (mode "Light") — bound to components | 36 tokens (30 colours, 4 sizes, 2 border widths) |
| `Semantic Dark` collection — reference only | 30 colour tokens |
| `Typography` collection | 19 tokens |
| Local text styles, each with 5 Typography tokens bound | 11 (`label/sm/regular` renamed in place to `label/small-regular`) |
| CSS code syntax on every token (e.g. `var(--space-400)`) | ready for Phase 3 |

**What was changed**
- 226 edits on atoms, 527 on Email row variants (+ 9 hidden fills found during cleanup): ghost tokens → new tokens, M3 variables → semantic tokens, hard-coded colours → semantic tokens, M3 text styles → local text styles, duplicate per-layer M3 typography variables removed.
- Nested instances exposed on Email row: `Avatar` (23 variants), `Time stamp` (23), `Attachment chip` (2), `Label chip` (1). An Email row instance now shows the avatar **Letter** and **Time** text in its properties panel.
- Avatar: unused `Initial` property removed; `Person icon` renamed `Icon`.
- Deleted (D6, after checks): 4 Momo Trust Sans text styles (0 uses) and the empty `Email row tokens` collection.

**Verification results**
| Check | Result |
|---|---|
| Bindings to deleted ghost tokens (whole page, incl. hidden paints) | **0** |
| Bindings to remote M3 variables (Email row + atoms) | **0** |
| Hard-coded colours (Email row + atoms) | **0** |
| Remote M3 text styles (Email row + atoms) | **0** |
| Layers using local tokens | 1,835 bindings |
| Render fingerprint vs before (59 components) | **55 pixel-identical**; 4 changed = Snoozed/Scheduled Regular timestamps (atom + row), the approved D1 grey merge |
| Sizes of all components | unchanged |
| Functional test (temp instance): variant switch, Sender text, exposed Time text, Attachment height 128 | all pass (instance deleted) |
| Semantic Dark values resolve to approved hexes | pass |

Before snapshot (bindings JSON) kept in the session scratchpad, not the repo.

**Could not be bound / intentionally left**
| What | Why |
|---|---|
| Typography of the avatar letter (`Initial`, 19 layers) | Lives inside the remote M3 "Generic avatar"; its text has mixed font ranges. Colour **is** bound (`color/avatar/on-color`). |
| Dark mode switching on components | Starter plan: 1 mode per collection. Dark values exist in `Semantic Dark` for reference and for code. |
| Variant width 412 | Device preview width; code uses 100%. |
| Icon glyph vector sizes (16–22 px) | Vector geometry, not a layout value. |
| Board / component-set frame layout (radius 5, gaps & padding 24/32/48/56) | Documentation layout, not part of components. |
| Internals of remote M3 kit components | Can't be edited, only overridden on the instance — all overrides now use our tokens. |
| `Examples/Reviews-Mobile` frame and `Gmail (iOS)` image | Outside this scope; still uses M3 variables (72 references). |

**Things to know**
- Exposing `Avatar` also shows the atom's own `Type` variant inside the row panel, next to the row's `Avatar` variant. Use the row's `Avatar` property; the nested one is for the Letter.
- New tokens have scopes: e.g. the spacing picker only offers `space/*`, text-colour picker only `color/text/*`. Primitive colours are hidden from pickers on purpose — always pick a semantic token.

---

## 3. Phase checklists

Status keys: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

### Phase 0 — Setup
- [x] Check Figma Console MCP and official Figma MCP
- [x] Read-only inspection of Email row + atoms
- [x] Save this plan as `plan.md` in the repo
- [x] Update memory: both Figma MCPs allowed

### Phase 1 — Audit & token proposal (no Figma changes)
- [x] Full binding inventory per variant and atom
- [x] Read M3 Dark-mode values for every mapped M3 colour
- [x] Final primitive + semantic tables (incl. dark values)
- [x] Old → new mapping table
- [x] Missing / duplicate list
- [x] Layer-naming review
- [x] Component-property review (proposals only)
- [x] Cleanup plan with order of operations
- [x] **Your approval of section 2.9 (D1–D8)** — confirmed 2026-11-08

### Phase 2 — Create tokens & apply (Figma writes, after approval)
1. [x] Before screenshots; binding snapshot (backup ✅ done by you)
2. [x] Create `Primitives`, `Semantic` (Light), `Semantic Dark` (reference), `Typography` with scopes — Dark as a mode was [!] blocked by Starter plan
3. [x] Create local text styles bound to Typography variables
4. [x] Atoms: rebind ghost / M3 / hard-coded values; swap text styles (pilot: Time stamp)
5. [x] Email row variants + nested instance overrides
6. [x] Expose nested instances; remove `Initial`; rename `Person icon`
7. [x] After screenshots + comparison + verification script
8. [x] Delete unused styles + empty collection (after checks pass)
9. [ ] **Your review of the result in Figma**

**Verification (must all pass before calling Phase 2 done):**
- Script: **0** bindings to deleted variables; **0** remote M3 colour/typescale bindings on our own layers (anything inside remote masters listed separately); **0** unlisted hard-coded fills/strokes.
- Every variant keeps identical width and height (before/after numbers compared by script).
- Before/after screenshots per variant (pixel diff if available, otherwise side-by-side review).
- Switching the Semantic mode to Dark on a test frame renders sensibly.
- Variant switching + text properties still work on a test instance (scratch frame, deleted afterwards).
- Report of anything that couldn't be bound, with the reason.

### Phase 3 — React component + playground (completed 2026-11-08, report in section 3.1)
- [x] Next.js 16.4.5 (App Router, TypeScript) app in the repo root; CSS Modules + CSS custom properties (token names match Figma)
- [x] Export tokens from Figma → `tokens/tokens.json` → `app/tokens.css` (light + dark) via `npm run tokens`
- [x] Atoms: `Avatar`, `StarButton`, `TimeStamp`, `AttachmentChip`, `LabelChip`, `StateLayer`, `FocusRing`, `SwipeAction`, `Icon`
- [x] `EmailRow` with props mirroring the Figma properties
- [x] Playground: controls from those props, width presets (360/390/412/430), code + token inspector, Figma reference side-by-side + overlay, light/dark toggle
- [x] Browser vs Figma comparison loop (`npm run compare`); unresolved differences logged in 3.1
- [x] Combinations Figma doesn't have marked as "proposed extension"
- [ ] **Your review of the playground**

### 3.1 Phase 3 report (completed 2026-11-08)

**How to run**
| Command | What it does |
|---|---|
| `npm run dev` | Starts the app at http://localhost:3000 (opens the playground) |
| `npm run tokens` | Regenerates `app/tokens.css` from `tokens/tokens.json` |
| `npm run compare` | With the app running: screenshots all 23 variants in headless Chrome and diffs them against the Figma PNGs (output in `.compare/`, git-ignored) |
| `npm run build` | Production build (also type-checks) |

**Project structure**
| Path | Purpose |
|---|---|
| `tokens/tokens.json` | Token export from Figma (single source of truth for code) |
| `scripts/build-tokens.mjs` | tokens.json → `app/tokens.css` (134 CSS variables + 11 `.text-*` text-style classes, Light on `:root`, Dark on `[data-theme="dark"]`) |
| `components/` | One file + CSS module per Figma atom, plus `EmailRow` |
| `lib/figma-variants.ts` | The 23 Figma variants as EmailRow props (incl. each variant's overrides) |
| `lib/token-lookup.ts` | Resolves CSS variables back to Figma token names for the inspector |
| `data/figma-variants.json`, `public/figma-ref/*.png` | Variant manifest and 2× reference images exported from Figma |
| `app/playground/` | Playground page; `variant/[slug]` renders one variant alone for comparison |
| `scripts/compare-figma.mjs` | Visual regression check against Figma |

**EmailRow props = Figma properties**
`state`, `status`, `starred`, `selected`, `content`, `avatar`, `swipe` (variants) · `sender`, `subject`, `snippet` (text props) · `time`, `avatarLetter`, `avatarColor` (exposed nested instances) · `attachmentName`, `moreFiles`, `messageCount`, `label`, `trackingText` (text inside specific Content variants — not Figma properties, labelled as such in the playground) · `interactive`, `onTap`, `onLongPress`, `onSwipe`, `onToggleStar` (code-only interaction, see the rules below).

**Validation results**
| Check | Result |
|---|---|
| Layout geometry vs Figma (all 23 variants: avatar, text lines, trailing column, star) | within **0.5 px** everywhere |
| Pixel diff vs Figma PNG (`npm run compare`) | **0.29 %–0.72 %** of pixels differ per variant; all differences are text anti-aliasing (see below) |
| Dark mode colours (computed in browser) | match `Semantic Dark` exactly |
| Types, lint, production build | pass; all 26 routes prerendered as static |

Fixes made during the comparison loop: attachment chip border drew outside the box (CSS border) while Figma's stroke is inside → switched to an inset shadow (chip went from 174.98 px to Figma's 174 px; diff 0.83 % → 0.46 %). Removed a stray `undefined` class on the time text.

**Unresolved differences (accepted)**
| Difference | Size | Why |
|---|---|---|
| Glyph edges of all text, most visible on the 11 px timestamp | sub-pixel | Figma and Chrome rasterise Roboto differently. Positions and widths match. |
| Attachment label measures 117.5 px in Chrome vs 118 px in Figma | 0.5 px | Font metrics; shifts the chip edge and "+1" by half a pixel |
| Avatar letter uses typography tokens directly (Roboto Medium 16/24, 0.1) | — | No text style exists for it in Figma (it lives inside the remote M3 avatar) |
| Hard-coded geometry kept from Figma: chip height 32 and padding 6, swipe offset 120, M3 ripple/check/placeholder shapes and positions | — | Not tokenised in Figma (M3 kit internals or one-off layout values) |

**Interaction rules (proposed extensions, decided by you on 2026-11-08)**

Figma defines only how each state *looks* (static variants; the only prototype interactions in the file are hover/press on the M3 kit's Icon button and chip). These behaviours were chosen by you and live in `components/useRowGestures.ts`:

| Interaction | Behaviour |
|---|---|
| Select | **Long press only** (0.5 s) toggles selected. Selecting shows the check-mark avatar (as in Figma's Selected variants); deselecting restores the previous avatar. |
| Press / hover / focus | **Always on** in the live preview, using the Figma Pressed (with ripple), Hovered and Focused looks. Comparison panels and `/playground/variant/*` stay static. |
| Swipe | **Drag** left (Delete) or right (Archive); the action colour shows behind the row. Release past **60 px** → snaps to Figma's **±120 px**; otherwise springs back. Mostly-vertical drags scroll the page instead. |
| Un-swipe | **Tap** the swiped row or **drag it back** past 60 px → returns to normal. |
| Row tap | **Marks an unread row as read** (like opening it in Gmail); Enter / Space do the same. |
| Star | Tap toggles starred; never triggers tap, select or swipe. |

Tested in the browser with pointer events (all pass); the static Figma comparison is unchanged (0.29 %–0.72 %).

Known gap: selection has **no keyboard equivalent** (long press only, by decision). Worth adding later for accessibility.

**Things to know**
- Next.js 16 rules that shaped the code: components with click handlers need `"use client"` (`StarButton`); route params must be read inside `<Suspense>` (`variant/[slug]`).
- Combinations that don't exist in Figma (e.g. Hovered + Unread) still render, with a "Proposed extension" warning in the playground.
- Dark mode works in code via the theme toggle; in Figma it only exists as the reference collection (Starter plan).
- The Next.js dev indicator is turned off (`next.config.ts`) so it doesn't cover previews and comparison screenshots.

### Phase 4 — Skill: create one email row in Figma (completed 2026-11-08)
- [x] Requirements agreed (table below)
- [x] Skill written: `.claude/skills/email-row/` (`SKILL.md`, `reference.md`, `create-row.js`)
- [x] Test 1, existing combination: Unread + Starred, Figma sender, orange avatar → no overrides, all checks pass
- [x] Test 2, missing combination: Unread + Attachment + Starred, Dropbox → base Unread + Attachment, override "Star → filled" (proposed extension), all checks pass
- [x] Tested by you with `/email-row`: worked (2026-11-08)

**Requirements (decided by you)**
| # | Topic | Decision |
|---|---|---|
| 1 | Input | Plain language, e.g. `/email-row unread starred email from Square at 9:41 AM` |
| 2 | Placement | Section "Generated email rows" on the current page, 200 px right of all content; rows stack with 24 px gap, 40 px padding; never overlap |
| 3 | Combination not in Figma | Closest variant (Content, Swipe and State must match exactly) + instance overrides (star, unread weights, selected colours, avatar type/colour, time type), reported as a proposed extension. Impossible combos (e.g. Hovered + Attachment) are refused with an explanation |
| 4 | Missing information | Ask for each gap: sender, subject, snippet, time, avatar look, and content-specific text. Unmentioned states stay at Figma defaults. Then a short confirmation before writing to Figma |
| 5 | Tool | Figma Console MCP only |
| 6 | Validation | Read back variant, texts, nested Time/Letter/Starred/avatar Type and text styles; check linked to master, size (412 × 88 / 128), no overlaps; screenshot |

**How it works**
- `SKILL.md`: the step-by-step workflow Claude follows (connect → understand + ask gaps → confirm → create → validate → report).
- `reference.md`: the component's properties, the 23 existing variants, the plain-language mapping and the override recipes.
- `create-row.js`: the script run in Figma. Looks everything up by name (property keys, tokens, text styles), so it survives id changes; removes any partial result on failure; never edits the master or detaches.
- The skill becomes available as `/email-row` in a **new** Claude Code session in this project (skills load at session start).

### Phase 5 — Multiple rows (after Phase 4 tested)
- [ ] Batch input, section headers, Auto Layout list, same master.

### Phase 6 — Full inbox (future)
- [ ] Top app bar, search, groups, rows, bottom nav, states — Figma screen + browser prototype, same tokens.

---

## 4. Dependencies & risks
- Figma Desktop must be open with the Desktop Bridge plugin running in `Learn AI workflow` for every Figma step.
- Remote M3 kit components can't be edited, only overridden. If the kit is updated, overrides may need re-checking.
- Official Figma MCP on Starter plan: limited calls.
- Scripted bulk changes are hard to undo → backup + atom-first rollout + binding snapshot.
- Ghost variables could be purged by Figma at any time → Phase 2 fixes them first.

## 5. Files this project creates (kept minimal)
- `plan.md` — this file
- Phase 3: Next.js files, `tokens/`, `components/`, `lib/`, `data/`, `scripts/`, `public/figma-ref/`, `app/playground/` (see 3.1)
- Phase 4: `.claude/skills/email-row/` (SKILL.md + reference.md + create-row.js)
- Phase 5+: `.claude/skills/<skill-name>/` (reusing email-row's reference and script where possible)
- Screenshots and JSON snapshots stay in the session scratchpad, not the repo.

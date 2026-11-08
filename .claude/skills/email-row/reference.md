# Email row: Figma reference

Source of truth: Figma file **Learn AI workflow** (`jgw8Iiwb7rKZjZj8pBDWB7`), page **Design to code Skill**, component set **Email row** (`97:29397`). Property keys carry `#id` suffixes; the script looks them up by name prefix, so they keep working if ids change.

## Component properties

| Property | Type | Values (Figma default first) |
|---|---|---|
| State | variant | Enabled, Hovered, Focused, Pressed |
| Status | variant | Read, Unread |
| Starred | variant | False, True |
| Selected | variant | False, True |
| Content | variant | Default, Attachment, Draft, Message count, Label chip, Tracking, Important, Snoozed, Scheduled, Long text |
| Avatar | variant | Letter, No photo, Logo, Checked |
| Swipe | variant | None, Archive, Delete |
| Sender | text | "Square" |
| Subject | text | "Your Square account has been deactivated" |
| Snippet | text | "Your Square account has been deactivated. If you believe this is a mistake…" |

Exposed nested instances (edit them on the instance, never on the master):

| Nested instance | Property | Notes |
|---|---|---|
| Time stamp | `Time` (text), `Type` (Time / Snoozed / Scheduled), `Emphasis` (Regular / Emphasized) | Emphasized = unread |
| Avatar | `Type` (Letter / No photo / Logo / Checked) | |
| Avatar → kit avatar | `Letter` (text) | Letter type only. Background colour = fill of the `Background` ellipse |
| Star button (not exposed, still editable) | `Starred` (False / True), `State` | |
| Label chip (Label chip content) | `Label` (text) | |

Text that lives inside a Content variant (set as layer text on the instance):

| Content | Layer name | Example |
|---|---|---|
| Message count | `Message count` | "2" |
| Tracking | `Tracking text` | "Expected by Tue, Jan 14" |
| Attachment | `label-text` inside `Attachment chip` · `More files` | "sora-sagano-8s9…" · "+1" |
| Draft | `Draft label` (fixed "Draft"; Sender is not shown) | |

## The 23 variants that exist

`Status=Read, Starred=False, Selected=False, Avatar=Letter, Swipe=None, State=Enabled` unless listed:

| Content | Variants |
|---|---|
| Default | Enabled · **Hovered** · **Focused** · **Pressed** · Unread · Starred · Unread+Starred · Avatar=Logo · Avatar=No photo · Selected+Checked · Unread+Selected+Checked · **Swipe=Archive** · **Swipe=Delete** |
| Attachment | Read · Unread |
| Draft, Message count, Label chip, Important, Snoozed, Scheduled, Long text | Read only |
| Tracking | Read, Avatar=No photo |

## Reading the request

| The user says | Property |
|---|---|
| unread, new, bold, not opened | Status = Unread |
| read, opened | Status = Read |
| starred, favourite, ⭐ | Starred = True |
| selected, checked, ticked | Selected = True (Avatar becomes Checked, as in Figma) |
| hovered / focused / pressed (as a state) | State |
| attachment, file, photo attached | Content = Attachment |
| draft | Content = Draft |
| thread, N messages, conversation of N | Content = Message count (count = N) |
| label, tag, in "Inbox" / "Work" | Content = Label chip |
| delivery, package, shipping, tracking | Content = Tracking (Avatar = No photo in Figma) |
| important, priority marker | Content = Important |
| snoozed (until …) | Content = Snoozed (Time = snooze time, e.g. "Tue, 8:00 AM") |
| scheduled (send at …) | Content = Scheduled |
| long subject / long preview | Content = Long text |
| swiped right / archive | Swipe = Archive |
| swiped left / delete | Swipe = Delete |
| no photo, unknown sender | Avatar = No photo |
| company logo | Avatar = Logo |
| letter avatar, green / orange / violet | Avatar = Letter, colour = green / orange / default |

Only one Content value fits a row. If the user asks for two (e.g. attachment **and** label), ask which one.

## Choosing the variant

The script does this; explain it in the confirmation step.

1. **Content and Swipe must match exactly.** They change the row's structure, which overrides can't recreate.
2. **State must match exactly.** Hovered/Focused/Pressed add overlay layers that only exist in those variants.
3. Among the variants left, pick the one matching the most of Status, Starred, Selected, Avatar.
4. Fix the remaining differences with **instance overrides**:

| Difference | Override on the instance |
|---|---|
| Starred | Star button → `Starred` |
| Unread on a Read variant | Sender → text style `body/large-emphasized`; Subject → `body/medium-emphasized` + fill `color/text/primary`; Time stamp → `Emphasis = Emphasized` |
| Read on an Unread variant | Sender → `body/large`; Subject → `body/medium` + fill `color/text/secondary`; Time stamp → `Emphasis = Regular` |
| Selected | Row fill → `color/surface/selected`; Sender, Subject, Snippet, time text → `color/text/on-selected`; star icon → `color/icon/on-selected`; Avatar → `Type = Checked` |
| Avatar type | Avatar → `Type` |
| Avatar colour | kit avatar `Background` fill → `color/avatar/green` / `orange` / `default`. With `default` (violet), the letter also switches to `color/avatar/on-default`, because the atom's white letter on violet is ~1.3 : 1 contrast (unreadable). Prefer green or orange when drafting. |
| Snoozed / Scheduled time icon | Time stamp → `Type` |

If step 1 or 2 leaves no variant (e.g. Hovered + Attachment, Swipe + Unread), the row **cannot** be made faithfully: say so in the confirmation and offer the nearest options.

Every override makes the result a **proposed extension**: say so in the report.

## Placement

- Section name: **Generated email rows**, on the current page.
- First time: create it 200 px to the right of everything on the page, top-aligned with the top-most item.
- Rows go inside, 40 px padding, stacked with a 24 px gap, below the last row. The Section grows to fit.
- Never move or resize anything outside this Section.

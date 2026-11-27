# PRD: Reed MVP (v1.0 + v1.0.x)

> Source: `docs/specs/init_app/intent.md` (Draft v0.9, decisions D1–D16).
> Release plan: **v1.0** = core reading loop + "I have X min" picker + highlights. **v1.0.x** = AI pipeline + AI summary + Listen mode (TTS) + highlight resurfacing. This answers Q-SC-1.
> Wherever the intent doc gave a "Proposed:" answer, that answer is treated as a decision here. Questions that had no proposal are listed in [Open Questions](#9-open-questions).

---

## 1. Introduction / Overview

Reed is a "read later" app for iOS, Android and Web. It turns saved articles into a small daily reading habit.

People save articles in one second, but reading takes 10+ minutes that never get scheduled. The backlog becomes a flat, growing list with no help choosing what to read and no feedback on progress. Reed tackles this in three ways:

1. **Capture + import:** save from anywhere, and bring in an existing Raindrop.io / Instapaper library.
2. **Remove the decision:** a daily "Today" queue sized to an adaptive goal in minutes, plus an "I have X min" picker.
3. **Feedback loop:** analytics on active reading time and an adaptive daily goal that the user confirms each week.

v1.0.x then adds AI summaries (to help triage), Listen mode (to turn commute time into reading time) and highlight resurfacing (to keep what was learned).

The visual design is minimalist black & white, content first (D14). The logo is the "Reading glasses" bot (D15).

## 2. Goals

- A user can save an article in ≤ 2 taps from the iOS/Android share sheet, or in 1 click from the Chrome extension.
- A user can import a full Raindrop.io or Instapaper export in one step, with tags and archived status kept.
- Every article has clean, stored text that can be read offline on mobile and survives link rot.
- Reading progress syncs across devices, so the user can start on the phone and finish on the web.
- Active reading time is measured accurately (idle time excluded) and shown against a daily goal in minutes.
- The daily goal adapts weekly and the user confirms every change (D4).
- (v1.0.x) Each article can show a 3-bullet AI summary on demand, be listened to with TTS in the background, and its highlights come back on a spaced schedule.

## 3. User Stories

Stories are grouped by release and area. "User" means a signed-in Reed user. UI stories that only exist on native mobile (share sheet, background audio) are verified on the iOS simulator instead of the browser.

---

### v1.0 — Foundation

#### US-001: Project scaffold ([#1](https://github.com/yannibenoit/reed/issues/1))
**Description:** As a developer, I need one codebase for iOS, Android and Web so that features are built once.

**Acceptance Criteria:**
- [ ] Expo (React Native) app with React Native Web runs on iOS simulator, Android emulator and in a desktop browser
- [x] TypeScript strict mode is on; a shared `packages/core` package holds types and logic used by the app, the backend functions and the Chrome extension
- [ ] Supabase project connected (dev + prod environments, keys from env vars, never committed)
- [x] Lint, typecheck and unit tests run in CI on every push
- [x] Typecheck/lint passes

#### US-002: Sign up and sign in ([#2](https://github.com/yannibenoit/reed/issues/2))
**Description:** As a user, I want an account so that my library and progress sync across devices.

**Acceptance Criteria:**
- [ ] Sign in with email (magic link or password), Apple and Google, using Supabase Auth
- [ ] Apple sign-in is shown on iOS and web; Google on all platforms
- [ ] Session persists after closing the app; sign out clears local data
- [ ] Row-level security: a user can only read/write their own rows (tested with two accounts)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-003: Core data model ([#3](https://github.com/yannibenoit/reed/issues/3))
**Description:** As a developer, I need tables for articles, tags, reading events and goals so that every feature shares one source of truth.

**Acceptance Criteria:**
- [ ] Tables: `articles`, `tags`, `article_tags`, `reading_sessions`, `reading_progress`, `highlights`, `goals`, `goal_reviews`, `daily_stats`
- [ ] `articles` has: `id`, `user_id`, `url`, `canonical_url`, `title`, `source_domain`, `author`, `content_html`, `content_text`, `word_count`, `estimated_minutes`, `status` (`unread` | `in_progress` | `read` | `archived`), `content_state` (`pending` | `ready` | `unavailable`), `saved_at`, `read_at`, `archived_at`
- [ ] Unique index on (`user_id`, `canonical_url`)
- [ ] Migrations run cleanly from an empty database
- [ ] Typecheck/lint passes

---

### v1.0 — Capture & import

#### US-004: Save a URL from inside the app ([#4](https://github.com/yannibenoit/reed/issues/4))
**Description:** As a user, I want to paste a URL into Reed so that I can save an article from any device.

**Acceptance Criteria:**
- [ ] "Add" button on the homepage opens a field; pasting a valid URL and confirming saves it
- [ ] If the clipboard holds a URL when the field opens, it is pre-filled
- [ ] Invalid URL shows an inline error "This doesn't look like a link"
- [ ] The new article appears at the top of the backlog immediately with a "Fetching…" state
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-005: Content extraction at save time ([#5](https://github.com/yannibenoit/reed/issues/5))
**Description:** As a user, I want the article text stored when I save it so that I can read it offline and it survives the original page disappearing.

**Acceptance Criteria:**
- [ ] On save, a backend job fetches the page, resolves the canonical URL, extracts title, author, source domain and clean article HTML/text
- [ ] `word_count` and `estimated_minutes` are stored (`ceil(word_count / 230)`, minimum 1)
- [ ] On success `content_state = ready`; on paywall/empty extraction `content_state = unavailable` and the link is still saved
- [ ] URLs pointing to a PDF or video are saved as links with `content_state = unavailable` and the label "PDFs and videos aren't supported yet"
- [ ] Extraction failures are retried up to 3 times with backoff
- [ ] Typecheck/lint passes

#### US-006: Duplicate detection ([#6](https://github.com/yannibenoit/reed/issues/6))
**Description:** As a user, I want saving the same article twice to not create a duplicate.

**Acceptance Criteria:**
- [ ] If an article with the same `canonical_url` exists, no new row is created
- [ ] The user sees "Already in your library" and the existing article moves to the top of the backlog (`saved_at` is not changed; a `resaved_at` timestamp is set)
- [ ] Typecheck/lint passes

#### US-007: iOS share extension ([#7](https://github.com/yannibenoit/reed/issues/7))
**Description:** As an iOS user, I want to save from the share sheet of Safari or any app so that capture takes one tap.

**Acceptance Criteria:**
- [ ] "Reed" appears in the iOS share sheet for URLs and web pages
- [ ] Tapping it saves the URL and shows "Saved to Reed" for ~1.5s, then closes
- [ ] An optional "Add tags" button lets the user pick or type tags before closing (Q-TAG-3); not using it still saves
- [ ] Works when the main app is not running; requires a signed-in session (otherwise prompts to open Reed)
- [ ] Typecheck/lint passes
- [ ] Verify on iOS simulator

#### US-008: Android share intent ([#8](https://github.com/yannibenoit/reed/issues/8))
**Description:** As an Android user, I want to save from the Android share menu.

**Acceptance Criteria:**
- [ ] Reed registers for `ACTION_SEND` with `text/plain` containing a URL
- [ ] Same behaviour as US-007 (confirmation, optional tags, works without opening the app)
- [ ] Typecheck/lint passes
- [ ] Verify on Android emulator

#### US-009: Chrome extension ([#9](https://github.com/yannibenoit/reed/issues/9))
**Description:** As a desktop user, I want a browser button to save the page I'm on.

**Acceptance Criteria:**
- [ ] Manifest V3 extension with a toolbar button; clicking saves the current tab URL
- [ ] Popup shows "Saved" and an optional tag field
- [ ] Extension uses the same Supabase session (sign-in from the popup if not signed in)
- [ ] Keyboard shortcut `Alt+Shift+S` saves the current tab
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-010: Import from Raindrop.io ([#10](https://github.com/yannibenoit/reed/issues/10))
**Description:** As a Raindrop user, I want to import my bookmarks so that I start Reed with my real backlog.

**Acceptance Criteria:**
- [ ] Settings → Import accepts a Raindrop CSV or HTML export file
- [ ] Each bookmark becomes an article; Raindrop collections and tags become Reed tags (1:1)
- [ ] Items without a URL are skipped and counted in the summary
- [ ] Duplicates are merged with US-006 rules (tags are combined)
- [ ] Extraction (US-005) runs in the background in batches; import does not block the UI
- [ ] Progress screen shows "Imported X of Y", then a summary: imported, duplicates, skipped
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-011: Import from Instapaper ([#11](https://github.com/yannibenoit/reed/issues/11))
**Description:** As an Instapaper user, I want to import my saved articles.

**Acceptance Criteria:**
- [ ] Settings → Import accepts an Instapaper CSV export
- [ ] Instapaper folders become Reed tags (1:1)
- [ ] Items in Instapaper's "Archive" folder are imported with `status = archived` (Q-BM-2c) and do not count as "read" in analytics
- [ ] Same duplicate, background extraction and summary behaviour as US-010
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-012: Merge and rename tags after import ([#12](https://github.com/yannibenoit/reed/issues/12))
**Description:** As a user, I want to rename and merge tags so that imported tags match how I think.

**Acceptance Criteria:**
- [ ] Tags screen lists all tags with article counts
- [ ] Rename a tag; renaming to an existing tag name asks "Merge into X?" and merges on confirm
- [ ] Delete a tag (articles keep their other tags)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### v1.0 — Tags

#### US-013: Add and remove tags on an article ([#13](https://github.com/yannibenoit/reed/issues/13))
**Description:** As a user, I want to tag articles so that I can organize and filter my backlog.

**Acceptance Criteria:**
- [ ] Tags are flat (no nesting) and an article can have many tags (Q-TAG-2)
- [ ] From the article menu (homepage card or reader), the user can add an existing tag, create a new one by typing, or remove a tag
- [ ] Tag names are trimmed, case-insensitive unique per user, max 40 characters
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### v1.0 — Homepage

#### US-014: Backlog list with article cards ([#14](https://github.com/yannibenoit/reed/issues/14))
**Description:** As a user, I want to see my saved articles as a clean text list.

**Acceptance Criteria:**
- [ ] Each card shows: title (serif, bold), source domain + estimated reading time (grey, small), tags, thin progress line (only when `in_progress`)
- [ ] No thumbnails by default (Q-DS-3); Settings → "Show thumbnails" shows them in greyscale
- [ ] Articles with `content_state = unavailable` show "Content unavailable" in grey and open the original page
- [ ] List is paginated / virtualized and stays smooth with 5,000 articles
- [ ] Empty state shows the logo bot and "Save your first article" with the capture options
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-015: Filter and sort the backlog ([#15](https://github.com/yannibenoit/reed/issues/15))
**Description:** As a user, I want to filter by tag and status and sort the list so that I find the right article.

**Acceptance Criteria:**
- [ ] Filter by status: Unread, In progress, Read, Archived (default: Unread + In progress)
- [ ] Filter by one or more tags
- [ ] Sort by date saved (newest/oldest) or reading time (shortest/longest)
- [ ] On web, filter and sort are kept in URL query params
- [ ] Empty filter result shows "No articles match these filters" + "Clear filters"
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-016: "Continue reading" row ([#16](https://github.com/yannibenoit/reed/issues/16))
**Description:** As a user, I want my unfinished articles shown first so that I finish what I started.

**Acceptance Criteria:**
- [ ] When at least one article is `in_progress`, a "Continue reading" row appears at the top of the homepage
- [ ] Shows up to 3 articles, most recently read first, with % read and minutes remaining
- [ ] Hidden when no article is in progress
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-017: "Today" queue ([#17](https://github.com/yannibenoit/reed/issues/17))
**Description:** As a user, I want Reed to pick today's articles to match my goal so that I don't have to decide.

**Acceptance Criteria:**
- [ ] A "Today" section sits below "Continue reading" and above the backlog
- [ ] The queue is built once per day at the user's local midnight (or first app open of the day) and stays stable during the day
- [ ] Algorithm: add articles until their total remaining minutes ≥ goal minutes, in this order: (1) in-progress articles, (2) unread articles saved 7–28 days ago, (3) other unread articles, newest first; max 2 articles per tag; prefer a mix of one short (≤ 5 min) and longer articles when possible
- [ ] Only articles with `content_state = ready` are picked
- [ ] Header shows "Today · 15 min ≈ 2 articles" and a thin line for today's progress toward the goal
- [ ] User can remove an article from Today ("Not today"); it is replaced by the next candidate
- [ ] Reading an article from Today marks it ✓ in place (it does not disappear)
- [ ] Unit tests cover the algorithm (empty backlog, only long articles, tag limit)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-018: Archive and delete articles ([#18](https://github.com/yannibenoit/reed/issues/18))
**Description:** As a user, I want to archive or delete articles so that my backlog stays honest.

**Acceptance Criteria:**
- [ ] Swipe (mobile) or menu (web) actions: Archive, Delete
- [ ] Archive sets `status = archived`; can be undone from a 5s toast and restored from the Archived filter
- [ ] Delete asks for confirmation, removes the article, its tags links, highlights and progress (reading sessions are kept, anonymized from the article, so past analytics don't change)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### v1.0 — Reader

#### US-019: Reader mode ([#19](https://github.com/yannibenoit/reed/issues/19))
**Description:** As a user, I want a clean, distraction-free reader so that the text is the only thing on screen.

**Acceptance Criteria:**
- [ ] Opens the stored `content_html`, sanitized (no scripts, no external trackers)
- [ ] Serif body text, ~65 characters line width, large margins; images shown in greyscale-friendly layout (original images allowed, no ads)
- [ ] Header: title, source, author, estimated time
- [ ] Toolbar hides while scrolling down and returns on scroll up or tap
- [ ] "Open original" action opens the source URL (in-app browser on mobile, new tab on web)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-020: Reading comfort settings ([#20](https://github.com/yannibenoit/reed/issues/20))
**Description:** As a user, I want to adjust text size, theme and line width so that reading is comfortable.

**Acceptance Criteria:**
- [ ] Font size: 5 steps; also follows iOS Dynamic Type / Android font scale
- [ ] Theme: Light, Dark, System (default System). No sepia (Q-DS-2)
- [ ] Line width: Narrow / Medium / Wide
- [ ] Settings are saved per user and synced across devices
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-021: Save and sync reading progress ([#21](https://github.com/yannibenoit/reed/issues/21))
**Description:** As a user, I want to continue where I stopped on any device.

**Acceptance Criteria:**
- [ ] Scroll position (as % of article body) is saved locally every 5s and on leaving the reader
- [ ] Progress is synced to the server; on open, the reader scrolls to the furthest synced position across devices (last-write-wins on position, max-wins on `max_scroll_pct`)
- [ ] Opening an `unread` article for ≥ 5s sets `status = in_progress`
- [ ] Test: read 40% on mobile, open on web → web opens at 40%
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-022: Offline reading on mobile ([#22](https://github.com/yannibenoit/reed/issues/22))
**Description:** As a mobile user, I want to read saved articles without a connection (e.g. on the metro).

**Acceptance Criteria:**
- [ ] iOS/Android cache article content for: all Today articles, all in-progress articles and the 50 most recently saved unread articles
- [ ] Opening a cached article in airplane mode works
- [ ] Reading sessions, progress and highlights made offline are queued and synced when back online
- [ ] Uncached articles show "Not available offline" when opened without a connection
- [ ] Typecheck/lint passes
- [ ] Verify on iOS simulator

#### US-023: Mark as read / unread manually ([#23](https://github.com/yannibenoit/reed/issues/23))
**Description:** As a user, I want to mark an article as read or unread myself, for example when I read it elsewhere.

**Acceptance Criteria:**
- [ ] Menu action "Mark as read" sets `status = read` but does **not** add reading time or count as "read" in analytics (flag `manual_read = true`)
- [ ] "Mark as unread" resets status and progress to 0
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### v1.0 — Highlights

#### US-024: Create highlights in the reader ([#24](https://github.com/yannibenoit/reed/issues/24))
**Description:** As a user, I want to highlight passages so that I keep what matters.

**Acceptance Criteria:**
- [ ] Selecting text shows a "Highlight" action; tapping it saves the highlight
- [ ] Highlight is stored with article id, text, start/end position anchors (text offset + surrounding text, so it survives re-rendering) and `created_at`
- [ ] Highlights render as a grey underline/background in both themes
- [ ] Tapping a highlight offers "Remove" and "Copy"
- [ ] Highlights sync across devices and work offline (queued)
- [ ] No notes on highlights in v1.0 (v1.1)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-025: Highlights list ([#25](https://github.com/yannibenoit/reed/issues/25))
**Description:** As a user, I want to see all my highlights in one place.

**Acceptance Criteria:**
- [ ] "Highlights" screen lists highlights newest first, grouped by article
- [ ] Tapping a highlight opens the reader scrolled to that passage
- [ ] Filter by tag
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### v1.0 — "I have X min" picker

#### US-026: Pick articles for available time ([#26](https://github.com/yannibenoit/reed/issues/26))
**Description:** As a user with a short gap (commute, break), I want articles that fit my free time.

**Acceptance Criteria:**
- [ ] A "I have…" button on the homepage offers 5 / 10 / 20 min
- [ ] Shows up to 5 articles whose **remaining** minutes ≤ chosen time (in-progress articles use remaining time, Q-PK-1), in-progress first, then unread
- [ ] Prefers articles in Today, then the rest of the backlog
- [ ] If nothing fits, shows "Nothing fits in X min. Here's the shortest:" + the shortest article
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### v1.0 — Analytics

#### US-027: Track active reading time ([#27](https://github.com/yannibenoit/reed/issues/27))
**Description:** As a developer, I need accurate active reading time so that the goal and analytics are honest.

**Acceptance Criteria:**
- [ ] A reading session starts when the reader is in the foreground
- [ ] Time counts as active only while the reader is in the foreground **and** the user scrolled/tapped within the last 60s; idle time beyond 60s is excluded
- [ ] Sessions are stored with `article_id`, `started_at`, `ended_at`, `active_seconds`, `mode = read` (and later `listen`), device
- [ ] Unit tests: 5 min with scrolling every 20s → ~5 min; 5 min with no interaction after 1 min → 1 min
- [ ] Typecheck/lint passes

#### US-028: "Article opened" and "article read" rules ([#28](https://github.com/yannibenoit/reed/issues/28))
**Description:** As a developer, I need clear rules for opened and read so that metrics are consistent.

**Acceptance Criteria:**
- [ ] Opened = reader open ≥ 5 seconds
- [ ] % read = max scroll depth of the article body (0–100)
- [ ] Read = `max_scroll_pct ≥ 80` **and** total active reading time on the article ≥ 30% of `estimated_minutes` (Q-AN-1). When met, `status = read` and `read_at` is set automatically
- [ ] Rules live in `packages/core` and are unit-tested
- [ ] Typecheck/lint passes

#### US-029: Daily stats aggregation ([#29](https://github.com/yannibenoit/reed/issues/29))
**Description:** As a developer, I need per-day aggregates in the user's time zone so that charts and the goal are fast.

**Acceptance Criteria:**
- [ ] `daily_stats` per user per local date: `read_minutes`, `listen_minutes` (0 until v1.0.x), `articles_opened`, `articles_read`, `articles_saved`, `articles_archived`, `goal_minutes`, `goal_hit` (bool)
- [ ] `goal_hit` uses read + listen minutes (D1, Q-NS-2)
- [ ] Updated within 1 minute of a session sync; recomputed nightly for safety
- [ ] User time zone stored in profile and updated when the device time zone changes
- [ ] Typecheck/lint passes

#### US-030: Analytics screen ([#30](https://github.com/yannibenoit/reed/issues/30))
**Description:** As a user, I want to see my reading habits so that I know if I'm improving.

**Acceptance Criteria:**
- [ ] Range selector: 7 days, 30 days, All time
- [ ] Top cards (one large number each): average active minutes/day (north star), articles read, average % read, read vs. saved
- [ ] Charts in black/grey only: daily reading time bars with dashed goal line (read and listened stacked in two greys), goal hit/miss calendar heatmap, per-tag breakdown (read count and read rate = read / saved), backlog trend (unread count over time)
- [ ] Weekly goal streak shown as "5 of 7 days" (no daily streak, Q-GL-4)
- [ ] Personal only; no sharing (Q-AN-4)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### v1.0 — Adaptive daily goal

#### US-031: Starting goal ([#31](https://github.com/yannibenoit/reed/issues/31))
**Description:** As a new user, I want a reasonable starting goal so that I can start without configuring anything.

**Acceptance Criteria:**
- [ ] New users start at 10 min/day
- [ ] After an import of ≥ 20 articles, the goal is set to the median `estimated_minutes` of the imported unread articles, rounded to the nearest 5, bounded 5–60, and the user sees "Your goal is now X min/day based on your library" with Undo
- [ ] Goal is always displayed as "X min ≈ N articles", N based on the length of articles in Today (fallback: average article length in the library)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-032: Weekly goal review ([#32](https://github.com/yannibenoit/reed/issues/32))
**Description:** As a user, I want the goal to adapt to my real reading so that it stays challenging but achievable.

**Acceptance Criteria:**
- [ ] Runs every Monday (or the user's chosen day) at 08:00 local time on the previous 7 days, excluding rest days (US-034)
- [ ] Increase: goal hit on ≥ 5 of 7 days → proposed goal = max(goal + 5, 7-day average rounded **up** to next 5)
- [ ] Decrease: 7-day average < 50% of goal → proposed goal = goal − 5
- [ ] Otherwise no proposal (the card says "Goal stays at X min")
- [ ] Bounds 5–60 min
- [ ] Skipped if goal is locked
- [ ] Logic in `packages/core`, unit-tested for each branch and for bounds
- [ ] Typecheck/lint passes

#### US-033: Goal review card ([#33](https://github.com/yannibenoit/reed/issues/33))
**Description:** As a user, I want to confirm any goal change so that I stay in control (D4).

**Acceptance Criteria:**
- [ ] Card on the homepage: "You read 14 min/day on average this week. New goal: 15 min/day ≈ 2 articles?"
- [ ] Buttons: Accept / Keep current / Lock goal
- [ ] Lock goal stops weekly proposals until unlocked in Settings
- [ ] No answer within 48h → current goal is kept and the card disappears
- [ ] Each review and the user's answer are stored in `goal_reviews`
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-034: Rest days ([#34](https://github.com/yannibenoit/reed/issues/34))
**Description:** As a user, I want to mark rest days so that weekends off don't lower my goal or break my streak.

**Acceptance Criteria:**
- [ ] Settings → Rest days: select weekdays (none by default)
- [ ] Rest days are excluded from the goal review average, the "X of 7 days" streak and goal hit/miss (shown as neutral in the heatmap)
- [ ] Reading on a rest day still counts toward totals
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### v1.0 — Design & brand

#### US-035: Design system foundation ([#35](https://github.com/yannibenoit/reed/issues/35))
**Description:** As a developer, I need shared B&W tokens and components so that every screen follows D14.

**Acceptance Criteria:**
- [ ] Tokens: black, white, 4 greys; light and dark themes; no other colors
- [ ] Fonts: one free-license serif for article body and one sans-serif for UI, bundled on all platforms
- [ ] All text/background pairs meet WCAG AA (automated contrast check in tests)
- [ ] Components: text list item, thin progress line, outline icon set, buttons, toast, card, bottom sheet
- [ ] No shadows, gradients, badges or confetti
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-036: Logo and app icons ([#36](https://github.com/yannibenoit/reed/issues/36))
**Description:** As a user, I want a recognizable icon so that I can find Reed on my phone and in browser tabs.

**Acceptance Criteria:**
- [ ] Option D "Reading glasses" logo as SVG: symbol, symbol + "Reed" wordmark
- [ ] iOS app icon, Android adaptive icon (inside the safe zone), web favicon (16 px simplified version: no antenna, no eye dots, thicker stroke), splash screen
- [ ] Icon works on black and white backgrounds
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### v1.0.x — Shared AI pipeline

#### US-037: AI categorization at save time ([#37](https://github.com/yannibenoit/reed/issues/37))
**Description:** As a developer, I need each article classified at save time so that tag suggestions, and later the digest and knowledge graph, share the same output.

**Acceptance Criteria:**
- [ ] After extraction, a job assigns 1–3 categories in a max 3-level hierarchy (Category → Sub-category → Topic), stored in `article_categories`
- [ ] New articles are placed in existing category nodes when possible; a new node is created only when ≥ 3 articles don't fit any existing node
- [ ] Imported libraries are classified in background batches; the initial tree is built from the whole imported library (Q-KG-2b)
- [ ] User tags are passed to the model as hints (Q-KG-1a)
- [ ] No category UI in v1.0.x (graph view is v1.1)
- [ ] Typecheck/lint passes

#### US-038: Embeddings at save time ([#38](https://github.com/yannibenoit/reed/issues/38))
**Description:** As a developer, I need article chunks embedded and stored so that the v2 AI agent can be added without reprocessing.

**Acceptance Criteria:**
- [ ] Article text is split into ~300–500 token chunks with small overlap, following headings/paragraphs
- [ ] Each chunk stores metadata: article id, position, title, source, saved date, tags, categories
- [ ] Embeddings via a hosted API, stored in pgvector, isolated per user by RLS
- [ ] Deleting an article deletes its chunks
- [ ] Pipeline is idempotent and can re-index all articles in the background when the model changes
- [ ] Typecheck/lint passes

#### US-039: Suggested tags ([#39](https://github.com/yannibenoit/reed/issues/39))
**Description:** As a user, I want Reed to suggest tags so that untagged (e.g. imported) articles get organized.

**Acceptance Criteria:**
- [ ] Up to 3 suggested tags per article, preferring the user's existing tags
- [ ] Shown as grey outline chips on the article card menu and in the reader header, with ✓ to accept and × to dismiss
- [ ] Suggestions are never applied without confirmation (Q-TAG-1)
- [ ] Dismissed suggestions are not shown again for that article
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### v1.0.x — AI summary first

#### US-040: Generate summary on demand ([#40](https://github.com/yannibenoit/reed/issues/40))
**Description:** As a user, I want a short summary before opening an article so that I can decide whether to read it, keep the summary, or archive.

**Acceptance Criteria:**
- [ ] "Summary" action on the card and at the top of the reader
- [ ] Generated on first request, then cached in `article_summaries` (Q-AI-1); never regenerated unless content changes
- [ ] Format: 3 bullets + "Worth a full read?" verdict (Yes / Skim / Skip, one sentence why) + 2–4 key topics (Q-AI-2)
- [ ] Shows a loading state; generation target < 8s p90
- [ ] Not available when `content_state = unavailable` (button hidden)
- [ ] Errors show "Couldn't summarize this article. Try again." with a retry
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-041: Act from the summary ([#41](https://github.com/yannibenoit/reed/issues/41))
**Description:** As a user, I want to act directly from the summary so that triage is quick.

**Acceptance Criteria:**
- [ ] Summary sheet has: Read now, Listen (US-042), Add to Today, Archive
- [ ] Viewing a summary does not count as reading time
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### v1.0.x — Listen mode (TTS)

#### US-042: Listen to an article ([#42](https://github.com/yannibenoit/reed/issues/42))
**Description:** As a user, I want to listen to an article so that commute or gym time becomes reading time.

**Acceptance Criteria:**
- [ ] "Listen" action in the reader and on the card
- [ ] Uses the device's native voices (Q-TTS-1): iOS AVSpeechSynthesizer, Android TextToSpeech, Web Speech API on web
- [ ] Player: play/pause, skip ±30s (or ± one paragraph), speed 1x / 1.25x / 1.5x / 1.75x / 2x
- [ ] The current paragraph is shown in the reader and the reader auto-scrolls to it
- [ ] Listening position syncs like reading progress (resume where stopped)
- [ ] Works offline for cached articles
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

#### US-043: Background and lock-screen playback ([#43](https://github.com/yannibenoit/reed/issues/43))
**Description:** As a mobile user, I want audio to keep playing when my screen is locked or I switch apps.

**Acceptance Criteria:**
- [ ] iOS background audio mode and Android foreground media service enabled
- [ ] Lock-screen / notification controls: play/pause, skip, title and source
- [ ] Pauses on headphone unplug and on incoming calls
- [ ] Typecheck/lint passes
- [ ] Verify on iOS simulator

#### US-044: Count listening time ([#44](https://github.com/yannibenoit/reed/issues/44))
**Description:** As a user, I want listening to count toward my goal so that audio reading is recognized (Q-NS-2).

**Acceptance Criteria:**
- [ ] Listening creates reading sessions with `mode = listen`; active time = time audio is actually playing
- [ ] Listening minutes count toward the daily goal and `goal_hit`
- [ ] Analytics show read vs. listened minutes separately (stacked bars, separate totals)
- [ ] An article counts as "read" when ≥ 80% of it has been played, or by the US-028 reading rule, or by a combination where the furthest position reached (read or listened) ≥ 80% and combined active time ≥ 30% of estimate
- [ ] Typecheck/lint passes

---

### v1.0.x — Highlight resurfacing

#### US-045: Spaced resurfacing schedule ([#45](https://github.com/yannibenoit/reed/issues/45))
**Description:** As a developer, I need each highlight scheduled for review so that the user keeps what they read.

**Acceptance Criteria:**
- [ ] Each highlight gets review dates at 1, 3, 7, 21 and 60 days after creation (Q-HL-1)
- [ ] Highlights from deleted articles are removed from the schedule
- [ ] Each review is stored (`highlight_reviews`: highlight id, shown_at, action)
- [ ] Typecheck/lint passes

#### US-046: "Daily review" card ([#46](https://github.com/yannibenoit/reed/issues/46))
**Description:** As a user, I want a few past highlights shown each day so that I remember what I learned.

**Acceptance Criteria:**
- [ ] A "Daily review" card on the homepage shows 3–5 highlights due today (oldest due first)
- [ ] Each highlight shows its text, article title and source; tap → opens reader at the passage
- [ ] Actions per highlight: "Got it" (advance to next interval), "Show again soon" (reset to the 1-day interval), "Stop showing"
- [ ] The card is hidden when nothing is due; it disappears after all items are handled
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

## 4. Functional Requirements

### Accounts & platforms
- FR-1: Reed must run on iOS, Android and Web from one React Native + Expo codebase. iOS and Web launch first; Android ships a few weeks later.
- FR-2: Users must sign in with email, Apple or Google. An account is required.
- FR-3: All user data must be isolated per user through Supabase row-level security.

### Capture & import
- FR-4: Users must be able to save a URL by pasting it in the app, from the iOS share sheet, the Android share intent, and the Chrome extension.
- FR-5: Adding tags at capture time must be optional; saving without tags must take one action.
- FR-6: On save, the system must fetch and store clean article content, title, author, source, word count and estimated reading time (`ceil(words / 230)` min, minimum 1).
- FR-7: Articles must be deduplicated by canonical URL per user.
- FR-8: Paywalled, empty, PDF and video pages must be saved as links with `content_state = unavailable`.
- FR-9: Users must be able to import a one-time export file from Raindrop.io (CSV/HTML) and Instapaper (CSV). Collections/folders/tags map 1:1 to Reed tags. Archived items import as `archived`.

### Tags
- FR-10: Tags must be flat, free-form, and many-per-article. Users can create, rename, merge and delete tags.
- FR-11 (v1.0.x): The system must suggest up to 3 tags per article; suggestions are applied only after user confirmation.

### Homepage
- FR-12: The homepage must show, in order: goal review card (when pending), Daily review card (v1.0.x, when due), Continue reading, Today, Backlog.
- FR-13: The Today queue must be built once per local day using the algorithm in US-017, sized to the daily goal in minutes.
- FR-14: The backlog must support filtering by status and tags, and sorting by date saved or reading time.
- FR-15: The "I have X min" picker must offer 5/10/20 min and return articles whose remaining time fits.

### Reader
- FR-16: The reader must show sanitized stored content in reader mode, with an "Open original" fallback.
- FR-17: The reader must offer font size (5 steps + OS scaling), Light/Dark/System theme, and 3 line widths.
- FR-18: Reading progress must be saved and synced across devices.
- FR-19: Mobile apps must cache Today, in-progress and the 50 newest unread articles for offline reading, and sync offline activity when back online.
- FR-20: Users must be able to create, view and remove highlights; highlights sync across devices.

### Analytics & goal
- FR-21: Active reading time must count only foreground time with a user interaction in the last 60 seconds.
- FR-22: "Opened" = reader open ≥ 5s. "Read" = max scroll ≥ 80% and active time ≥ 30% of estimated time.
- FR-23: Daily stats must be computed per calendar day in the user's time zone.
- FR-24: The analytics screen must offer 7-day, 30-day and all-time ranges, with the cards and charts listed in US-030.
- FR-25: The daily goal must be in minutes, start at 10 min, and be displayed as "X min ≈ N articles".
- FR-26: The goal must be reviewed weekly with the rules in US-032 (bounds 5–60), and changes must only apply after the user accepts. No answer within 48h keeps the current goal.
- FR-27: Users must be able to lock the goal and set rest days.
- FR-28: Streaks must be weekly ("X of 7 days"), not daily.

### v1.0.x — AI, TTS, resurfacing
- FR-29: At save time, each article must be categorized (1–3 categories, max 3 levels) and chunk-embedded into pgvector.
- FR-30: AI summaries must be generated on demand, cached, and follow the 3 bullets + verdict + topics format.
- FR-31: Listen mode must use native device voices, support background/lock-screen playback and 1x–2x speed.
- FR-32: Listening time must count toward the daily goal and be reported separately from reading time.
- FR-33: Highlights must be resurfaced at 1, 3, 7, 21 and 60 days in a homepage "Daily review" card.

## 5. Non-Goals (Out of Scope)

- Continuous sync with Raindrop/Instapaper APIs (v1.1). Import is a one-time file upload.
- Email-to-Reed capture, Firefox/Safari extensions.
- Notes on highlights, export to Notion/Obsidian/Markdown (v1.1 / v2).
- Reminders/notifications, auto-expire, swipe triage, priority flag (v1.1).
- Weekly/daily digest (push + email) and the knowledge graph view (v1.1). Categories are computed in v1.0.x but not shown.
- AI agent / chat over the library (v2). Embeddings are stored but not queried by users.
- Takeaways, quizzes.
- Cloud neural TTS voices.
- Sepia theme, color accents, gamification (badges, confetti, daily streaks).
- Social features, public profiles, leaderboards, shared analytics.
- Discovery of new articles from the web.
- PDF, video and podcast content.
- Monetization, paywall, subscriptions.
- Home-screen widgets and PWA install.

## 6. Design Considerations

- **Principles (D14):** content first, black & white only, typography does the work, few thin elements, calm progress display.
- **Homepage:** pure text list. Title in bold serif; source and time in small grey sans; thin progress line.
- **Reader:** serif body, ~65 characters per line, large margins, toolbar hides on scroll.
- **Analytics:** one large number per card; charts in black/grey; dashed goal line.
- **Highlights:** grey background or underline; never color.
- **Mascot (Q-DS-4):** the "Reading glasses" bot appears in empty states, the import summary and the goal-reached state (quietly, no animation burst).
- **Accessibility (Q-DS-5):** dark mode follows system by default; Dynamic Type / font scale supported; WCAG AA contrast, with special care for light greys.
- **Wireframes needed before build:** Homepage (with all sections), Reader (+ settings sheet, highlight menu, TTS player), Analytics, Goal review card, Import flow.

## 7. Technical Considerations

- **Stack:** React Native + Expo + React Native Web; TypeScript everywhere; shared `packages/core` for types, metric rules, goal algorithm and Today algorithm (pure functions, unit-tested).
- **Backend:** Supabase — Postgres (+ pgvector), Auth (email, Apple, Google), Storage (import files), Edge Functions / background workers for extraction, import, AI pipeline and nightly stats.
- **Native modules:** iOS share extension and Android share intent need Expo config plugins / a development build (not Expo Go). Background audio needs native configuration on both platforms.
- **Chrome extension:** Manifest V3, built from the same monorepo, reusing `packages/core` and the Supabase client.
- **Content extraction:** runs server-side at save time; sanitize HTML before storing and again before rendering. Build vs. third-party API is still open (see Q-TC-3).
- **Offline:** local database on mobile (e.g. SQLite) for cached articles and an outbox queue for sessions, progress and highlights. Conflict rule: max-wins for scroll depth and status progression; last-write-wins for settings.
- **Analytics events:** reading sessions are the raw truth; `daily_stats` is a derived table that can be rebuilt.
- **AI (v1.0.x):** hosted LLM API for categories and summaries, hosted embedding API, vectors in pgvector. Article text and reading data are sent to the providers; this must be stated in the privacy policy.
- **Performance targets:** save → visible in list < 1s; extraction ready < 10s p90; homepage first render < 1.5s on mid-range phone; smooth scrolling with 5,000 articles; import of 5,000 items completes in the background without blocking the app.
- **Cost:** summaries on demand + cached, native TTS, and one-time classification/embedding per article keep per-article AI cost bounded.

## 8. Success Metrics

For the first 3 months, with the author as user #1:
- North star: average active reading (+ listening) time ≥ 15 min/day (rolling 7 days).
- Backlog stops growing: read + archived ≥ saved, every week.
- Daily goal reached on ≥ 4 days/week.
- Supporting: articles opened, average % read, read vs. saved per tag, articles read per day, backlog trend.
- Feature health: % of reading time coming from Today or the X-min picker; % of articles triaged after viewing a summary (v1.0.x); share of listening time (v1.0.x); % of due highlights reviewed (v1.0.x).

## 9. Open Questions

These had no proposed answer in the intent doc:

- **Q-TC-3:** content extraction: build it (Readability-type library) or use a third-party API?
- **Q-TC-4:** privacy: data residency for Supabase (EU vs US), and whether any AI should run on device.
- **Q-TC-5:** business model (free / freemium / paid). Affects whether AI features stay free.
- **Q-GL-2:** can the user set the goal manually and turn adaptation off entirely (beyond "Lock goal")?
- **Q-DS-1 (detail):** which exact serif and sans-serif fonts (e.g. Literata vs. Source Serif vs. Charter)?
- **Q-TC-1b (detail):** exact Android launch date after iOS + Web.
- **AI providers:** which hosted LLM and embedding model to use for categories, summaries and embeddings.

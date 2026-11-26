# Reed — Product Intent

> Input document for writing the PRD. It records **why** we're building Reed, **what** v1 must do, the **open questions** to answer before the PRD is final, and **other ideas** to consider.
> Status: Draft v0.9 · Platforms: iOS, Android, Web

---

## 0. Decisions log

| # | Decision | Answers |
|---|---|---|
| D1 | The daily goal is measured in **minutes of active reading**, so it matches the north star. It's shown as "≈ N articles". | Q-GL-1, Q-NS-1 |
| D2 | v1 import supports **Raindrop.io** and **Instapaper**. | Q-BM-2 |
| D3 | The MVP also includes **Listen mode (TTS)**, **AI summary first**, **Highlights + resurfacing** and the **"I have X min" picker**. | Scope |
| D4 | The goal is recalculated **weekly**, and the **user confirms** each change (or locks the goal). | Section 5 |
| D5 | Digest recommendations come **only from the backlog** (no web discovery). | Q-DG-1 |
| D6 | Digest frequency is the **user's choice**, **weekly by default**. | Q-DG-2 |
| D7 | Digest is delivered by **push notification** and **email**. | Q-DG-3 |
| D8 | Recommendations are driven by **read** subjects. Saved-but-unread subjects only appear as an insight. | Q-DG-5 |
| D9 | **Tags and categories are separate.** Tags stay free and flat. Categories are an AI-managed hierarchy that powers the graph. | Q-KG-1, Q-TAG-2 |
| D10 | The category tree is **fully AI-generated** from the user's articles. | Q-KG-2 |
| D11 | The AI agent uses **all saved articles** and flags sources the user hasn't read yet. | Q-AG-1 |
| D12 | The agent can use **general knowledge, clearly labelled** "not from your articles". No web search. | Q-AG-2 |
| D13 | The AI agent is built on **RAG** (retrieval-augmented generation) over the user's library. | 4.8 |
| D14 | Visual design is **minimalist, black & white**, in the spirit of Instapaper: content first, no decoration. | 4.9 |
| D15 | The logo is a **bot reading a book**. Chosen concept: **Option D, "Reading glasses"** (bot wearing round reading glasses, open book below). | 4.9 |
| D16 | Reed ships as **iOS, Android and Web** applications. | Q-TC-1 |

---

## 1. Problem statement

I save articles every day in a bookmarking app, but I almost never read them. The backlog keeps growing, the knowledge I meant to get never arrives, and the list becomes a source of guilt instead of learning.

**The real problem has three parts:**
1. **Capture is easy, but reading isn't.** Saving takes 1 second, while reading takes 10+ minutes that never get scheduled.
2. **Nothing helps me pick what to read.** The backlog is a flat list, so it's hard to know which article is worth my time *now*.
3. **There's no feedback loop.** I can't see if I'm improving, so there's nothing that builds a habit.

## 2. Vision & north star

**Vision:** Turn "saved for later" into "actually learned", by making reading a small daily habit that adapts to the user.

**North star metric (proposed):** *Average active reading time per day* (minutes/day, rolling 7 days).

**Supporting metrics:**
- Articles opened
- Average % of article read (completion rate)
- Articles read vs. articles saved, overall and per tag
- Average articles read per day
- Backlog trend (is the "to read" pile shrinking or growing?)

> ✅ **Resolved (D1):** the goal is in minutes, the same unit as the north star. Articles read per day is still tracked as a supporting metric.
> **Open — Q-NS-2:** does listening time (TTS) count toward reading time? *Proposed: yes, counted separately in analytics (read vs. listened).*

## 3. Target user

- **Primary:** me. I'm a knowledge worker who saves lots of articles (newsletters, blogs, tech/business news) and has fragmented free time (commute, breaks, evenings).
- **Secondary (later):** anyone with a "read later" backlog, such as students, researchers or former Pocket users.

## 4. v1 scope: core features

### 4.1 Bookmark articles
Save an article URL into Reed from any device.

**Open questions**
- **Q-BM-1:** Which capture channels does v1 need? *Proposed: iOS/Android share sheet + paste URL in app + browser extension (Chrome). Email-to-Reed comes later.*
- ✅ **Q-BM-2 (D2):** import from **Raindrop.io** and **Instapaper**, as a v1 must-have.
  - **Q-BM-2a:** one-time import (export file: Raindrop CSV/HTML, Instapaper CSV) or a continuous sync through their APIs, so that I keep saving in my current app for a while? *Proposed: one-time file import in v1. Continuous sync in v1.1 if I keep using both apps.*
  - **Q-BM-2b:** should Raindrop collections/tags and Instapaper folders become Reed tags? *Proposed: yes, mapped 1:1, and the user can merge or rename them after import.*
  - **Q-BM-2c:** should already-read/archived items be imported too? *Proposed: import them as "archived", so the analytics history starts clean.*
- **Q-BM-3:** Should the article content be fetched and stored at save time (works offline, and survives link rot), or fetched when the article is opened? *Proposed: fetch and store at save time.*
- **Q-BM-4:** What should happen with duplicates, paywalled articles, PDFs or videos? *Proposed: dedupe by canonical URL. For paywalled articles, save the link with a "content unavailable" state. PDFs and videos are out of v1.*

### 4.2 Tags
Organize articles with tags.

**Open questions**
- **Q-TAG-1:** Should tags be manual only, or should Reed suggest them automatically (topic detection)? *Proposed: manual + suggested, and the user confirms suggestions.*
- **Q-TAG-2:** Can an article have multiple tags? Should tags be nested (e.g. `tech/ai`)? *Proposed: multiple tags, flat (no nesting) in v1.*
- **Q-TAG-3:** Can tags be added at capture time from the share sheet, or only later in the app? *Proposed: optional at capture, so saving stays a 1-tap action.*

### 4.3 Homepage
A list of articles to read.

**Open questions**
- **Q-HP-1:** What's the default view? A chronological list, or a curated "Today" selection that matches my daily goal? *Proposed: a "Today" section (N articles = daily goal) at the top, and the full backlog below.*
- **Q-HP-2:** Which filters and sorts are needed? *Proposed: filter by tag and status (unread / in progress / read / archived). Sort by date saved or reading time.*
- **Q-HP-3:** What does each card show? *Proposed: title, source, thumbnail, estimated reading time, tags, progress bar.*
- **Q-HP-4:** Should "in progress" articles be surfaced first? *Proposed: yes, as a "Continue reading" row.*

### 4.4 Reader
A clean reader that renders the article content.

**Open questions**
- **Q-RD-1:** Should the reader show a clean reader mode (extracted text), the original web page, or offer a toggle between them? *Proposed: reader mode by default, with a fallback to the original page.*
- **Q-RD-2:** What reading comfort options are needed? *Proposed: font size, light/dark themes (black & white, see Q-DS-2), line width.*
- **Q-RD-3:** Should progress be saved and synced across devices (start on phone, finish on laptop)? *Proposed: yes, this is a must-have.*
- **Q-RD-4:** Are highlights and notes in v1? *Proposed: highlights only in v1. Highlights are what connect reading to "getting the info" (see 6.3).*
- **Q-RD-5:** Is offline reading required? *Proposed: yes on mobile, using the stored content.*

### 4.5 Analytics
Basic analytics to measure reading behavior.

**Metric definitions (to validate)**

| Metric | Proposed definition |
|---|---|
| Active reading time | Time the reader screen is in the foreground **and** the user interacted (scroll/tap) within the last 60s. Idle time is excluded. |
| Article opened | Reader opened for ≥ 5 seconds |
| % read | Max scroll depth reached in the article body (0–100%) |
| Article read | ≥ 80% scrolled **and** active time ≥ 30% of estimated reading time (so skimming doesn't count) |
| Articles read per day | Count of "read" articles per calendar day (user's time zone), averaged over the last 7 / 30 days |
| Reads per tag | Read count and read rate (read / saved) per tag |

**Open questions**
- **Q-AN-1:** Are these definitions right? In particular, does "read" mean 80% scrolled or 100%?
- **Q-AN-2:** Which time ranges are needed? *Proposed: 7 days, 30 days, all time.*
- **Q-AN-3:** Which charts? *Proposed: daily reading time (bar), goal hit/miss calendar (heatmap), per-tag breakdown, backlog trend.*
- **Q-AN-4:** Is this for me only, or should analytics ever be shared or compared (friends, leaderboard)? *Proposed: personal only in v1.*

### 4.6 Digest (daily / weekly) with recommendations
A regular digest that shows what I've been saving and reading, grouped by the subjects, tags and categories that come up most, and recommends which articles to read next.

**Why it helps the core problem:** it brings the backlog to me instead of waiting for me to open it, and it ranks articles by *my own* interests, which cuts the "what should I read?" decision.

**Proposed digest content**
1. **Your recap:** reading time vs. goal, articles read, streak (weekly: day-by-day bars).
2. **Your top subjects:** the 3 tags/topics I saved or read most in the period, with a trend ("AI ↑ 40% vs last week").
3. **Recommended for you:** 3–5 articles, each with estimated reading time, AI summary (D3), and the reason it was picked ("You read 4 articles on Product this week" / "Saved 3 weeks ago, still unread").
4. **Highlights to review:** 2–3 resurfaced highlights (connects to Q-HL-1).
5. **Backlog health:** saved vs. read vs. archived, plus "5 articles will auto-expire soon" (if auto-expire ships).

**Proposed recommendation logic (v1, no ML needed)**
Score each unread article in the backlog:
- **Interest match (40%):** overlap between the article's tags/topics and the tags I *read* most (reading counts more than saving, because it shows real interest).
- **Freshness / risk of being forgotten (20%):** articles saved 1–4 weeks ago get a boost before they go stale.
- **Fit (20%):** reading time that fits my daily goal.
- **Variety (20%):** no more than 2 picks from the same tag, plus 1 "explore" pick from a tag I save but rarely read.
- **Exclude:** articles already read, archived, or shown in the last 2 digests without being opened.

**Open questions**
- ✅ **Q-DG-1 (D5):** backlog only.
- ✅ **Q-DG-2 (D6):** the user chooses, weekly by default.
  - **Q-DG-2a:** which day and time for the weekly digest? *Proposed: Sunday 18:00 local time, editable, and sent together with the weekly goal review card.*
  - **Q-DG-2b:** the daily version is short ("Today's 3 picks") and overlaps with the homepage Today queue. Should they share the same picks? *Proposed: yes, one source of truth.*
- ✅ **Q-DG-3 (D7):** push notification + email.
  - **Q-DG-3a:** where does tapping the push notification lead? With no dedicated digest screen, it could open the homepage with the picks pinned at the top, or a lightweight digest view. *Proposed: a lightweight digest view (the same content as the email), since a push alone can only show 1–2 lines.*
  - **Q-DG-3b:** should links in the email open the Reed app/web reader (deep links), so that reading time is tracked? *Proposed: yes. Opening the original site would lose the analytics.*
  - **Q-DG-3c:** should email be on by default or opt-in? Is it weekly only, or also daily? *Proposed: on by default for weekly, opt-in for daily, with one-click unsubscribe.*
- **Q-DG-4:** what counts as a "subject"? Only user tags, or also **AI-detected topics** (works even for untagged articles)? *Proposed: both. User tags first, and AI topics as a fallback, since many imported Raindrop/Instapaper articles may have no tags.*
- ✅ **Q-DG-5 (D8):** read subjects drive the picks. Saved-but-unread subjects show up as an insight ("You saved 12 Finance articles but read 1. Want to try one?").
  - **Q-DG-5a:** cold start: in the first weeks there's little reading history. *Proposed: until 5 articles are read, use saved subjects + recently saved articles, then switch to read subjects.*
- **Q-DG-6:** can I act directly from the digest (read now, listen, add to Today, archive, "not interested")? *Proposed: yes. "Not interested" feedback lowers that topic's score next time.*
- **Q-DG-7:** should the digest be in the MVP or later? *Proposed: the weekly in-app digest is cheap if the analytics and tags exist already, so it could join v1.1. Email and daily digests later.*

**Metrics for this feature**
- Digest open rate
- Click-through rate on recommended articles
- % of recommended articles read in the 7 days after the digest
- Effect on the north star (reading time in the week after vs. before)

### 4.7 Knowledge graph
Every time I read an article, a personal knowledge graph is updated. **Nodes are categories and sub-categories** (e.g. `Technology → AI → LLM agents`), so I can see what I actually know and how my knowledge is growing.

**Why it helps the core problem:** it turns "articles read" into a visible map of knowledge. Reading feels like progress, and gaps become obvious.

**Proposed model**
- **Nodes:** categories and sub-categories, 2–3 levels deep. Each node stores: number of articles read, total reading time, last read date, number of highlights.
- **Edges:**
  - *Hierarchy:* parent → child (`AI → LLM agents`).
  - *Relatedness:* two categories are linked when articles cover both (e.g. `AI ↔ Product management`). Edge weight = number of shared articles.
- **Articles:** not nodes in the main view. They're attached to the categories they belong to, and listed when I tap a node.
- **Update trigger:** an article updates the graph when it reaches **"read"** status (section 4.5 definition). Saved-only articles don't count. They could show as faded "to explore" nodes (see Q-KG-3).
- **Classification:** AI assigns each article 1–3 categories/sub-categories when it's saved (also used for tag suggestions, Q-TAG-1, and digest topics, Q-DG-4). The user can correct it.
- **Visual:** node size = reading volume, grey intensity = recency (knowledge that hasn't been revisited fades). Black & white only (D14).

> ⚠️ **Conflict with Q-TAG-2:** tags were proposed as flat, but the graph needs a hierarchy. **Q-KG-1** decides how tags and categories relate.

**Open questions**
- ✅ **Q-KG-1 (D9):** separate. Tags stay free and flat. Categories are an AI-managed hierarchy.
  - **Q-KG-1a:** should tags influence the categories (e.g. a tag used on many articles in one category becomes a hint for the AI)? *Proposed: yes, as a hint only.*
- ✅ **Q-KG-2 (D10):** fully AI-generated tree. This choice brings risks that need guardrails:
  - **Stability:** the tree shouldn't reshuffle every time an article is added. *Proposed: new articles are placed in existing nodes when possible. A new node is created only when ≥ 3 articles don't fit anywhere. Restructuring (splitting/merging nodes) happens in a periodic job, e.g. weekly, never live.*
  - **Q-KG-2a:** can the user still rename, merge or move nodes, and are those edits kept when the AI restructures? *Proposed: yes, and user edits are locked: the AI never overrides them.*
  - **Q-KG-2b:** cold start: with 1–2 articles the tree is nearly empty. Should the Raindrop/Instapaper import (D2) be used to build the first tree, even from unread articles? *Proposed: yes. Build the initial structure from the whole imported library, then node weights come from read articles only.*
  - **Q-KG-2c:** should the user see when the tree changes ("New sub-category: LLM agents, 4 articles")? *Proposed: yes, in the weekly digest.*
- **Q-KG-3:** should unread (saved) articles appear in the graph? *Proposed: yes, as faded "to explore" nodes, which makes the backlog visible as unexplored knowledge.*
- **Q-KG-4:** how deep should the hierarchy go? *Proposed: max 3 levels (Category → Sub-category → Topic).*
- **Q-KG-5:** does partial reading count (e.g. 50% read gives half weight)? *Proposed: no, only "read" articles in v1. Simpler to explain.*
- **Q-KG-6:** what can I do from the graph? *Proposed: tap a node to see its articles (read + unread), "Read next in this topic", and ask the AI agent about this topic (4.8).*
- **Q-KG-7:** which phase? *Proposed: classification at save time in MVP (cheap, and needed by digest and tags). Graph view in v1.1 or v2.*

**Metrics for this feature:** graph views per week, taps from a node to an article, number of categories with ≥ 3 articles read (breadth of knowledge).

### 4.8 AI agent: insights on my articles (later phase)
An AI assistant that answers questions and gives insights **based on the articles I saved and read**.

**Example uses**
- "What have I learned about pricing strategies this month?"
- "Summarize the 5 articles I read on LLM agents and how they disagree."
- "Which saved articles should I read before my meeting on X?"
- "What are the gaps in what I know about AI?" (uses the knowledge graph)
- "Quiz me on what I read last week." (links to 6.3)
- From inside the reader: "Explain this paragraph" / "How does this relate to what I read before?"

**Proposed approach**
- **Retrieval-based (RAG) over my library:** articles are split into chunks and indexed with embeddings when saved. The agent searches my library and answers from it.
- **Every answer cites its sources** (article + passage), with links that open the reader at the right place. This counts as reading time and keeps the agent honest.
- **Uses the knowledge graph** for questions about topics, coverage and gaps.
- **Tools the agent can use:** search library, get article, get highlights, get reading stats, get graph, and (with confirmation) actions like add to Today, tag, archive.

**Open questions**
- ✅ **Q-AG-1 (D11):** all saved articles, flagging unread ones ("2 of these sources are still in your backlog. Add them to Today?"). This turns the agent into a way to bring backlog articles back.
- ✅ **Q-AG-2 (D12):** library first. General knowledge allowed, visually labelled "not from your articles". No web search.
  - **Q-AG-2a:** when the library has nothing on a topic, should the agent say so first ("You have no articles on X. Here's general context…")? *Proposed: yes, always. It also points to a gap in the knowledge graph.*
- **Q-AG-3:** where does it live? A chat screen, inside the reader, on graph nodes, or all of these? *Proposed: a chat screen + "Ask about this article" in the reader. Graph entry point later.*
- **Q-AG-4:** should it be proactive (e.g. insights pushed into the digest: "3 articles you read this week contradict each other on X")? *Proposed: later. Start with on-demand questions.*
- **Q-AG-5:** should it keep memory across conversations? *Proposed: no in the first version. Conversations are saved, but the agent doesn't remember them.*
- **Q-AG-6:** cost and privacy: the full text of articles and my reading data go to an LLM provider. Is that acceptable? Should it be a premium feature? (See Q-TC-4, Q-TC-5.)

**RAG design (D13)**

*Indexing (at save time, part of the shared AI pipeline)*
1. Extract the clean article text (Q-BM-3).
2. Split it into chunks of ~300–500 tokens with a small overlap, following the article's structure (headings, paragraphs).
3. Attach metadata to each chunk: article id, title, source, date saved, read status, % read, tags, AI categories, position in the article.
4. Create an embedding for each chunk and store it in a vector index (per user, isolated).
5. Index highlights and notes too, as separate high-priority chunks.

*Retrieval (at question time)*
1. Rewrite the question if needed (e.g. "what did I read last month about X" → topic + date filter).
2. **Hybrid search:** vector similarity + keyword search (BM25), so exact names and terms are found too.
3. **Metadata filters:** date range, read/unread, tag, category (from the knowledge graph).
4. **Re-ranking** of the top ~30 chunks down to ~8, with a boost for highlights and read articles.
5. Group chunks by article, so the answer can say "from 3 articles".

*Generation*
- The LLM answers using only the retrieved chunks, plus labelled general knowledge (D12).
- Each statement cites its article + passage. A tap opens the reader at that position.
- Unread sources are flagged (D11).
- When retrieval finds nothing relevant, the agent says so before answering (Q-AG-2a).

*Quality & ops*
- **Evaluation set:** ~50 real questions over my own library, with the expected source articles, to measure retrieval quality (did the right articles come back?) and answer faithfulness (no claims without sources).
- **Re-indexing:** when the chunking or embedding model changes, re-index in the background.
- **Deletion:** deleting an article removes its chunks from the index.

**Open RAG questions**
- **Q-RAG-1:** vector store: Postgres with pgvector (simple, one database) or a dedicated vector database? *Proposed: pgvector. A personal library (thousands of articles) is well within its range.*
- **Q-RAG-2:** embedding model: hosted API or self-hosted open model? *Proposed: hosted API to start. Revisit for cost/privacy (Q-TC-4).*
- **Q-RAG-3:** should the knowledge graph also be used in retrieval (GraphRAG: expand a question to related categories)? *Proposed: later. Start with metadata filters by category, and add graph expansion if answers miss related articles.*

**Groundwork to put in place early (so the agent is easy to add later)**
- Store clean article text at save time (already planned, Q-BM-3).
- Generate embeddings + AI categories at save time (shared with summaries, tags, digest and graph).
- Keep highlights and reading events with timestamps.

### 4.9 Design direction & brand

**Principles (D14)**
- **Content first:** the article text is the hero. The interface disappears while reading.
- **Black & white only:** black text on white, white on black in dark mode. Shades of grey for hierarchy (secondary text, dividers, disabled states). No brand color.
- **Typography does the work:** hierarchy comes from font size, weight and spacing, not from color, boxes or icons.
- **Few, thin elements:** thin lines, simple outline icons, generous white space, no gradients or shadows.
- **Calm, no gamification noise:** goal progress and streaks are shown quietly (a thin progress line, a number), not with badges or confetti.
- **Reference:** Instapaper's reading-first minimalism is the *spirit*, not something to copy. Reed needs its own layout, type choices and logo.

**How the principles apply to each area**

| Area | Black & white treatment |
|---|---|
| Homepage | Text list: title (serif, bold), source + reading time (grey, small), thin progress line. Thumbnails optional (Q-DS-3). |
| Reader | Serif body text, comfortable line width (~65 characters), large margins. Toolbar hides while scrolling. |
| Analytics | Charts in black/grey only. Goal line dashed. One number per card, large. |
| Knowledge graph | Black outlines + grey fills. Node size = volume, grey intensity = recency (replaces the color intensity from 4.7). |
| AI agent | Plain chat. Citations as numbered footnotes that open the reader. General knowledge in grey italic ("not from your articles"). |
| Digest email | Plain-text style email, single column, no images except the logo. |

**Logo brief (D15)**
- **Subject:** a small, friendly bot reading an open book.
- **Style:** line art, single color (black on white, and works inverted), geometric and simple.
- **Must work at all sizes:** app icon (iOS/Android), browser favicon (16 px), and splash screen. At 16 px a simplified version (e.g. bot head + book only) may be needed.
- **Deliverables:** symbol, symbol + "Reed" wordmark, app icon versions (iOS rounded square, Android adaptive icon), favicon.
- ✅ **Chosen: Option D, "Reading glasses"** (from 4 drafts on the "Reed logo options" canvas). Rounded-square bot head with antenna, round reading glasses with eyes looking down, open book below. 3-unit stroke on a 64 grid. The 16 px version drops the antenna and eye dots and uses a thicker stroke.
  - **Why it fits:** it has the most character, so it works as the AI agent's avatar and in empty states (see Q-DS-4).
  - **Next:** final vector files (SVG), Android adaptive icon (safe zone), and optional expressions for the mascot (reading, thinking, happy for a goal reached).

**Open questions**
- **Q-DS-1:** reading font: a classic serif (e.g. Charter, Literata, Source Serif) for articles, and a simple sans-serif for the interface? *Proposed: yes, serif body + sans UI. Both free licenses, available on all 3 platforms.*
- **Q-DS-2:** reader themes: earlier I proposed light/dark/sepia (Q-RD-2). Does strict black & white rule out sepia? *Proposed: light + dark only, to stay true to D14. Sepia could be an accessibility option later.*
- **Q-DS-3:** article thumbnails on the homepage? They bring color into a B&W interface. *Proposed: no thumbnails by default (pure text list). Optional setting, shown in greyscale.*
- **Q-DS-4:** should the bot have a name or personality, and appear in the app (e.g. as the AI agent's avatar, empty states, digest)? *Proposed: yes, as a small mascot. The agent "is" the bot, which gives a consistent identity.*
- **Q-DS-5:** accessibility: dark mode follows the system setting, dynamic text sizes (iOS Dynamic Type / Android font scale) supported, contrast at least WCAG AA (easy with B&W, but watch light greys).

## 5. Adaptive daily goal

**Requirement:** the goal starts at the equivalent of **1 article/day** and adapts automatically to the user's average active reading time per day.

**Decided:** the unit is minutes (D1), and the goal is recalculated weekly with user confirmation (D4).

**Proposed algorithm (to validate)**
- **Starting goal:** 10 min/day (≈ 1 average article). Once the user's library is imported, this could instead be set to the median estimated reading time of their own articles.
- **Weekly review**, every Monday (or on the user's chosen day):
  - **Increase:** goal hit on ≥ 5 of the last 7 days → propose +5 min (or the 7-day average rounded up to the next 5 min, whichever is higher).
  - **Decrease:** 7-day average < 50% of the goal → propose −5 min.
  - **Otherwise:** keep the goal.
- **Bounds:** minimum 5 min, maximum 60 min (configurable).
- **User confirms:** a weekly card ("You read 14 min/day on average this week. New goal: 15 min/day ≈ 2 articles?") with **Accept / Keep current / Lock goal** buttons. If the user doesn't answer within 48h, the current goal is kept.
- **Display:** "15 min ≈ 2 articles", where the article count is based on the length of the articles in the Today queue.

**Open questions**
- ✅ **Q-GL-1 (D1):** minutes.
- **Q-GL-2:** Can the user override the goal manually, or turn off adaptation?
- **Q-GL-3:** Should rest days count (weekends off, vacation mode)? *Proposed: an optional "rest days" setting that excludes those days from the average.*
- **Q-GL-4:** Do we use streaks? They're motivating, but breaking one can make people drop the app. *Proposed: a weekly goal streak ("5 of 7 days") rather than a strict daily streak.*

## 6. Other features that address the core problem

The real problem is **"I don't have time, and I don't get the knowledge"**. Bookmarking + reader + analytics treats the symptom. These ideas go at the cause, roughly by impact:

### 6.1 Make reading fit into available time
- **Estimated reading time on every article**, plus a **"I have X minutes" picker**: choose 5 / 10 / 20 min and get the articles that fit.
- **Daily "Today" queue:** Reed picks N articles matching the goal (mixing tags, short + long), so there's no decision fatigue.
- **Listen mode (text-to-speech):** turns commute, gym or cooking time into reading time. This is probably the biggest lever on "no time". Listening time could count toward the north star.
- **Reading reminders** at a time the user chooses (or one Reed learns from their habits).

### 6.2 Triage the backlog
- **Summary first (AI TL;DR):** a 3-bullet summary before opening, so the user can decide whether to read in full, keep the summary, or archive.
- **Swipe triage:** a Tinder-style session to quickly sort the backlog into "Read soon / Later / Archive".
- **Auto-expire:** articles untouched for 30/60 days are archived automatically (and can be recovered). This keeps the backlog honest.
- **Priority flag** when saving ("must read" vs "maybe").

### 6.3 Actually keep the knowledge
- **Highlights & notes**, with an export to Notion / Obsidian / Markdown.
- **Key takeaways:** after finishing, the user writes 1 sentence (or accepts an AI-suggested one) about what they learned.
- **Spaced repetition:** Reed resurfaces highlights or takeaways a few days and weeks later (like Readwise).
- **Quick quiz** (2–3 AI-generated questions) after a long read.
- **Weekly digest:** now a full feature, see **4.6 Digest**.

### 6.4 Insights from the data
- **Saved vs. read per tag:** shows the user where their intentions and their actual interests diverge (e.g. "you save lots of finance articles but read only 10%").
- **Best reading time of day**, used for reminders.
- **Source quality:** which sites/authors the user actually finishes.

### 6.5 Possible north star alternatives
- *Active reading time per day* (current proposal): simple, and directly measures habit.
- *Articles completed per week*: a clearer outcome, but biased by article length.
- *Knowledge retained* (highlights reviewed, takeaways written): closest to the real goal ("get the info"), but harder to measure.
- **Suggestion:** keep reading time as the north star for v1, and track "takeaways captured" as a secondary metric from v2.

## 7. Proposed scope split

| Phase | Features |
|---|---|
| **MVP (v1)** | Capture (share sheet, URL, extension), Raindrop + Instapaper import, content extraction, tags, homepage with "Today" + backlog, reader with synced progress, offline, analytics (4 core metrics), adaptive goal (minutes, weekly, user-confirmed), **"I have X min" picker**, **AI summary first**, **Listen mode (TTS)**, **Highlights + resurfacing** |
| **v1.1** | Reminders, auto-expire, swipe triage, continuous Raindrop/Instapaper sync, notes on highlights, **weekly digest (push + email) with backlog recommendations** (see Q-DG-7), **knowledge graph view** (Q-KG-7) |
| **v2** | Takeaways + quiz, daily digest option, export to Notion/Obsidian, **AI agent on my library** (4.8) |

> **Shared AI pipeline (MVP groundwork):** at save time, each article goes through one pipeline: clean text extraction → AI categories/topics → embeddings → (on demand) summary. Tags, digest, knowledge graph and the AI agent all reuse this output, so it's worth building once in the MVP.

> ⚠️ **Scope warning:** with D3, the MVP is significantly bigger (AI + TTS + resurfacing add backend cost and complexity). **Q-SC-1:** ship them all in v1, or release in two steps: **v1.0** = core + X-min picker + highlights, then **v1.0.x** = AI summary + TTS + resurfacing? AI summaries and TTS also have running costs per article (see Q-TC-5).

**New open questions (from D3)**
- **Q-TTS-1:** use the device's native voices (free, works offline, robotic) or cloud neural voices (natural, cost per article)? *Proposed: native voices in MVP, neural voices as a premium option later.*
- **Q-TTS-2:** keep playing in the background or on the lock screen, with speed control (1x–2x)? *Proposed: yes, both. These are basic expectations for audio.*
- **Q-AI-1:** when are summaries generated? At save time (instant when opening, but costs money for articles never opened) or on demand? *Proposed: on demand, with caching.*
- **Q-AI-2:** what format should a summary have? *Proposed: 3 bullets + "Worth a full read?" + key topics, which can also feed tag suggestions (Q-TAG-1).*
- **Q-HL-1:** how should highlights be resurfaced: daily review in the app, push notification, or email? *Proposed: a "Daily review" card on the homepage (3–5 highlights) with spaced intervals (1d, 3d, 7d, 21d, 60d).*
- **Q-PK-1:** should the "I have X min" picker include partially read articles (time remaining only)? *Proposed: yes, using the remaining time.*
| **Later** | Social/sharing, newsletters inbox, PDFs/video |

## 8. Out of scope (v1)
- Social features and public profiles
- Content discovery/recommendation of *new* articles (Reed only works on what the user saved). The digest's recommendations come from the backlog only (D5).
- PDFs, videos, podcasts
- Monetization

## 9. Constraints & technical questions
- ✅ **D16:** iOS, Android and Web applications.
- **Q-TC-1:** how to build them: one cross-platform codebase, or separate native apps? *Proposed: one codebase for all three. Options:*
  - *React Native + Expo (with React Native Web): strong for web, large ecosystem, TypeScript shared with the backend.*
  - *Flutter: very consistent UI on all platforms, but web output is less suited to long reading pages (text selection, SEO, browser extension).*
  - *Leaning: React Native + Expo, because the web app and the Chrome extension both benefit from sharing TypeScript code.*
- **Q-TC-1a:** what does each platform need beyond the shared app?
  - *iOS: share extension, background audio for TTS, widgets (Today queue / goal progress) later.*
  - *Android: share intent, background audio service, home-screen widget later.*
  - *Web: responsive layout (desktop + mobile browser), Chrome extension for capture, installable as PWA (optional).*
- **Q-TC-1b:** should all three launch at the same time? *Proposed: iOS + Web first (capture from desktop, read on phone), Android a few weeks later. To confirm.*
- **Q-TC-2:** Is an account required (needed for sync)? Which sign-in options? *Proposed: email + Apple + Google sign-in.*
- **Q-TC-3:** Content extraction: build it (Readability-type library) or use a third-party API?
- **Q-TC-4:** Privacy: reading data is personal. Where is it stored, and does AI processing happen on device or in the cloud?
- **Q-TC-5:** Business model (free, freemium, paid)? This affects whether AI features are viable.

## 10. Success criteria (first 3 months, for me as user #1)
- Reading time ≥ 15 min/day on average
- Backlog stops growing (read + archived ≥ saved, weekly)
- Goal reached on ≥ 4 days/week
- ≥ 1 takeaway captured per article read (once 6.3 ships)

## 11. Next steps
1. Answer the open questions (Q-xx) above.
2. Validate the metric definitions and goal algorithm.
3. Lock the MVP scope.
4. Write the PRD: user stories, acceptance criteria, wireframes for Homepage / Reader / Analytics.
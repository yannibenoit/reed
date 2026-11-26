/** Shared domain types used by the app, backend functions and the Chrome extension. */
import type { Database } from './database.types';

export type { Database, Json } from './database.types';

type Tables = Database['public']['Tables'];
type Enums = Database['public']['Enums'];

export type ArticleStatus = Enums['article_status'];
export type ContentState = Enums['content_state'];
export type ReadingMode = Enums['reading_mode'];
export type GoalReviewDecision = Enums['goal_review_decision'];

export type Article = Tables['articles']['Row'];
export type Tag = Tables['tags']['Row'];
export type ArticleTag = Tables['article_tags']['Row'];
export type ReadingSession = Tables['reading_sessions']['Row'];
export type ReadingProgress = Tables['reading_progress']['Row'];
export type Highlight = Tables['highlights']['Row'];
export type Goal = Tables['goals']['Row'];
export type GoalReview = Tables['goal_reviews']['Row'];
export type DailyStats = Tables['daily_stats']['Row'];
export type Profile = Tables['profiles']['Row'];

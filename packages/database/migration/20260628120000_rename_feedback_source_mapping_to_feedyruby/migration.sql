-- Finish the FeedyRuby rename of the feedback-source → survey mapping domain.
--
-- The Prisma schema was renamed (model FeedbackSourceSalamRubyMapping ->
-- FeedbackSourceFeedyRubyMapping, and enum value 'salamruby_survey' ->
-- 'feedyruby_survey') as part of the salamruby→feedyruby rebrand. This renames
-- the matching physical database objects so the schema and DB stay in sync
-- without an @@map shim.
--
-- This renames the enum value, the table, and the table's primary key, foreign
-- keys and indexes in place. All data is preserved. "SalamRuby" and "FeedyRuby"
-- are the same length, so the 63-char-truncated constraint/index names map 1:1.

-- Enum value (FeedbackSourceType): 'salamruby_survey' -> 'feedyruby_survey'
ALTER TYPE "FeedbackSourceType" RENAME VALUE 'salamruby_survey' TO 'feedyruby_survey';

-- Table
ALTER TABLE "FeedbackSourceSalamRubyMapping" RENAME TO "FeedbackSourceFeedyRubyMapping";

-- Primary key (renames the backing index of the same name too)
ALTER TABLE "FeedbackSourceFeedyRubyMapping"
  RENAME CONSTRAINT "FeedbackSourceSalamRubyMapping_pkey"
  TO "FeedbackSourceFeedyRubyMapping_pkey";

-- Foreign keys
ALTER TABLE "FeedbackSourceFeedyRubyMapping"
  RENAME CONSTRAINT "FeedbackSourceSalamRubyMapping_feedbackSourceId_workspaceId_fke"
  TO "FeedbackSourceFeedyRubyMapping_feedbackSourceId_workspaceId_fke";
ALTER TABLE "FeedbackSourceFeedyRubyMapping"
  RENAME CONSTRAINT "FeedbackSourceSalamRubyMapping_surveyId_workspaceId_fkey"
  TO "FeedbackSourceFeedyRubyMapping_surveyId_workspaceId_fkey";

-- Indexes (the unique index backing @@unique, plus the two @@index entries)
ALTER INDEX "FeedbackSourceSalamRubyMapping_workspaceId_feedbackSourceId_sur"
  RENAME TO "FeedbackSourceFeedyRubyMapping_workspaceId_feedbackSourceId_sur";
ALTER INDEX "FeedbackSourceSalamRubyMapping_surveyId_idx"
  RENAME TO "FeedbackSourceFeedyRubyMapping_surveyId_idx";
ALTER INDEX "FeedbackSourceSalamRubyMapping_workspaceId_surveyId_idx"
  RENAME TO "FeedbackSourceFeedyRubyMapping_workspaceId_surveyId_idx";

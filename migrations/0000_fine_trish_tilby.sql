CREATE TABLE "achievements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"category" varchar NOT NULL,
	"icon" varchar,
	"points" integer DEFAULT 10 NOT NULL,
	"tier" varchar DEFAULT 'bronze' NOT NULL,
	"requirement" jsonb,
	"is_secret" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "achievements_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "activity_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"event_type" text NOT NULL,
	"module" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"metadata" jsonb,
	"entity_type" text,
	"entity_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_campaigns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"vendor_id" varchar,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"placement" text NOT NULL,
	"target_industry" text,
	"target_audience" jsonb,
	"budget" numeric(10, 2) NOT NULL,
	"spent" numeric(10, 2) DEFAULT '0' NOT NULL,
	"bid_amount" numeric(10, 2),
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"banner_url" text,
	"click_url" text NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"conversions" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending',
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_activity_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar NOT NULL,
	"description" text NOT NULL,
	"user_id" varchar,
	"email" varchar,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "advertisements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" varchar,
	"user_id" varchar,
	"company_name" text NOT NULL,
	"company_website" text,
	"contact_email" text,
	"logo_url" text,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"placement" text NOT NULL,
	"image_url" text,
	"link_url" text NOT NULL,
	"alt_text" text,
	"template_id" text,
	"template_data" jsonb,
	"html_content" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"priority" integer DEFAULT 1 NOT NULL,
	"cost_per_day" numeric(10, 2),
	"total_cost" numeric(10, 2),
	"meta_title" text,
	"meta_description" text,
	"og_image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "advertising_products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"price_monthly" numeric(10, 2),
	"price_one_time" numeric(10, 2),
	"pricing_type" varchar NOT NULL,
	"stripe_price_id_monthly" varchar,
	"stripe_price_id_one_time" varchar,
	"stripe_product_id" varchar,
	"features" jsonb,
	"popular" boolean DEFAULT false,
	"display_order" integer DEFAULT 0,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "advertising_products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "aeo_optimization" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"keyword" text NOT NULL,
	"url" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"answer_format" text,
	"voice_search_optimized" boolean DEFAULT false,
	"conversational_keywords" text[],
	"question_words" text[],
	"targeting_featured_snippet" boolean DEFAULT true,
	"featured_snippet_type" text,
	"currently_featured" boolean DEFAULT false,
	"primary_entity" text,
	"related_entities" text[],
	"entity_salience_score" numeric(5, 2),
	"has_knowledge_graph_entry" boolean DEFAULT false,
	"knowledge_graph_data" jsonb,
	"related_paa_questions" jsonb,
	"optimization_suggestions" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aeo_performance" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engine" text NOT NULL,
	"query" text NOT NULL,
	"language" varchar(5) NOT NULL,
	"country_code" varchar(2),
	"is_cited" boolean DEFAULT false NOT NULL,
	"citation_position" integer,
	"cited_url" text,
	"citation_text" text,
	"answer_contains_cleanbi" boolean DEFAULT false NOT NULL,
	"answer_sentiment" text,
	"full_response" text,
	"metadata" jsonb,
	"checked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_clicks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"affiliate_id" varchar,
	"content_id" varchar,
	"affiliate_tag" text NOT NULL,
	"target_url" text NOT NULL,
	"referrer_url" text,
	"ip_address" text,
	"user_agent" text,
	"country" text,
	"device" text,
	"converted_to_sale" boolean DEFAULT false NOT NULL,
	"sale_id" varchar,
	"clicked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_commissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"affiliate_id" varchar,
	"period" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"total_clicks" integer NOT NULL,
	"total_sales" integer NOT NULL,
	"total_revenue" numeric(12, 2) NOT NULL,
	"total_profit" numeric(12, 2) NOT NULL,
	"total_commission" numeric(12, 2) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"affiliate_id" varchar,
	"content_type" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text,
	"excerpt" text,
	"video_url" text,
	"video_thumbnail" text,
	"video_duration" integer,
	"meta_description" text,
	"keywords" text[],
	"related_products" text[],
	"affiliate_links" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"moderator_notes" text,
	"views" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"conversions" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_content_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "affiliate_payouts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"affiliate_id" varchar,
	"commission_id" varchar,
	"amount" numeric(10, 2) NOT NULL,
	"method" text NOT NULL,
	"payment_reference" text,
	"recipient_email" text,
	"recipient_account" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"failure_reason" text,
	"requested_at" timestamp NOT NULL,
	"processed_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_sales" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"affiliate_id" varchar,
	"click_id" varchar,
	"product_type" text NOT NULL,
	"product_id" varchar NOT NULL,
	"product_name" text NOT NULL,
	"sale_price" numeric(10, 2) NOT NULL,
	"cost" numeric(10, 2) NOT NULL,
	"profit" numeric(10, 2) NOT NULL,
	"commission_rate" numeric(5, 2) DEFAULT '20' NOT NULL,
	"commission_amount" numeric(10, 2) NOT NULL,
	"customer_id" varchar,
	"customer_email" text,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"stripe_payment_id" text,
	"commission_status" text DEFAULT 'pending' NOT NULL,
	"payout_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"refunded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "affiliates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"affiliate_code" text NOT NULL,
	"display_name" text,
	"bio" text,
	"website" text,
	"social_links" jsonb,
	"affiliate_tag" text,
	"vendor_id" varchar,
	"commission_rate" numeric(5, 2) DEFAULT '20' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_at" timestamp,
	"total_clicks" integer DEFAULT 0 NOT NULL,
	"total_sales" integer DEFAULT 0 NOT NULL,
	"total_revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_commission" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_paid_out" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_earnings" numeric(10, 2) DEFAULT '0' NOT NULL,
	"paypal_email" text,
	"venmo_username" text,
	"bank_account_last4" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "affiliates_affiliate_code_unique" UNIQUE("affiliate_code"),
	CONSTRAINT "affiliates_affiliate_tag_unique" UNIQUE("affiliate_tag")
);
--> statement-breakpoint
CREATE TABLE "agent_conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" varchar NOT NULL,
	"visitor_id" text,
	"user_id" varchar,
	"messages" jsonb NOT NULL,
	"user_email" text,
	"user_name" text,
	"user_phone" text,
	"message_count" integer DEFAULT 0 NOT NULL,
	"rating" integer,
	"feedback" text,
	"is_resolved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_flows" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"nodes" jsonb NOT NULL,
	"edges" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_knowledge_sources" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" varchar NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"url" text,
	"is_processed" boolean DEFAULT false,
	"chunk_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"industry" text NOT NULL,
	"category" text NOT NULL,
	"system_prompt" text NOT NULL,
	"sample_questions" jsonb NOT NULL,
	"knowledge_base_template" text,
	"preview_image" text,
	"is_pro" boolean DEFAULT false,
	"use_count" integer DEFAULT 0 NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_agent_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"business_profile_id" varchar,
	"name" varchar DEFAULT 'Store Assistant',
	"personality" varchar DEFAULT 'friendly',
	"avatar_url" text,
	"knowledge_base" text,
	"business_context" text,
	"can_take_orders" boolean DEFAULT false,
	"can_schedule_pickups" boolean DEFAULT false,
	"can_answer_pricing" boolean DEFAULT true,
	"can_provide_faq" boolean DEFAULT true,
	"welcome_message" text DEFAULT 'Hi! How can I help you today?',
	"away_message" text DEFAULT 'We''re currently closed. Leave a message and we''ll get back to you!',
	"common_questions" jsonb DEFAULT '[]'::jsonb,
	"primary_color" varchar DEFAULT '#C8A661',
	"position" varchar DEFAULT 'bottom-right',
	"is_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_agent_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"name" varchar NOT NULL,
	"role" varchar NOT NULL,
	"description" text,
	"provider" varchar NOT NULL,
	"model" varchar NOT NULL,
	"supported_tiers" jsonb DEFAULT '["economy", "standard", "premium", "ultra"]',
	"input_cost_per_1k" numeric(10, 6) DEFAULT '0.001',
	"output_cost_per_1k" numeric(10, 6) DEFAULT '0.003',
	"max_tokens" integer DEFAULT 4096,
	"temperature" numeric(3, 2) DEFAULT '0.7',
	"system_prompt" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_agents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"industry" text DEFAULT 'laundromat',
	"primary_model" text NOT NULL,
	"system_prompt" text NOT NULL,
	"temperature" numeric(3, 2) DEFAULT '0.7',
	"widget_title" text DEFAULT 'Chat with us',
	"widget_color" text DEFAULT '#C8A661',
	"widget_position" text DEFAULT 'bottom-right',
	"knowledge_base" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_conversations" integer DEFAULT 0 NOT NULL,
	"total_messages" integer DEFAULT 0 NOT NULL,
	"average_rating" numeric(3, 2) DEFAULT '0',
	"is_published" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_blog_tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"topic" text NOT NULL,
	"keywords" jsonb NOT NULL,
	"providers" jsonb NOT NULL,
	"status" text NOT NULL,
	"drafts" jsonb,
	"selected_draft" text,
	"seo_score" integer,
	"metadata" jsonb,
	"published_post_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ai_companion_chats" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" varchar,
	"session_id" varchar NOT NULL,
	"topic" varchar,
	"role" varchar NOT NULL,
	"content" text NOT NULL,
	"ai_model" varchar,
	"prompt_tokens" integer,
	"completion_tokens" integer,
	"user_sentiment" varchar,
	"response_type" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_companion_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" varchar,
	"communication_style" varchar DEFAULT 'encouraging',
	"check_in_time" varchar DEFAULT '09:00',
	"check_in_enabled" boolean DEFAULT true,
	"phone_number" varchar,
	"email_address" varchar,
	"preferred_method" varchar DEFAULT 'email',
	"focus_areas" text,
	"share_progress" boolean DEFAULT false,
	"anonymous_sharing" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_companion_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "ai_content_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"conversation_id" varchar,
	"type" text NOT NULL,
	"prompt" text NOT NULL,
	"response" text,
	"model" text DEFAULT 'gemini-2.0-flash',
	"input_tokens" integer,
	"output_tokens" integer,
	"total_tokens" integer,
	"status" text DEFAULT 'pending',
	"error" text,
	"processing_time_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"title" text DEFAULT 'New Conversation',
	"type" text DEFAULT 'general',
	"project_id" varchar,
	"messages" jsonb DEFAULT '[]'::jsonb,
	"system_prompt" text,
	"memory_context" jsonb,
	"total_tokens_used" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_pinned" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" varchar,
	"title" varchar NOT NULL,
	"type" varchar NOT NULL,
	"provider_name" varchar,
	"location" text,
	"appointment_date" timestamp NOT NULL,
	"duration" integer DEFAULT 60,
	"reminder_enabled" boolean DEFAULT true,
	"reminder_before" integer DEFAULT 24,
	"reminder_method" varchar DEFAULT 'email',
	"notes" text,
	"completed" boolean DEFAULT false,
	"cancelled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_issues" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"page_id" varchar,
	"rule_id" varchar NOT NULL,
	"severity" text NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"affected_url" text,
	"affected_element" text,
	"estimated_impact" text,
	"impact_score" integer,
	"how_to_fix" text,
	"auto_fixable" boolean DEFAULT false NOT NULL,
	"fix_code" text,
	"status" text DEFAULT 'open',
	"fixed_at" timestamp,
	"ignored_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "backlink_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_url" text NOT NULL,
	"source_url" text NOT NULL,
	"anchor_text" text,
	"link_type" text,
	"link_placement" text,
	"is_image_link" boolean DEFAULT false,
	"source_domain_authority" integer,
	"source_page_authority" integer,
	"source_trust_flow" integer,
	"source_citation_flow" integer,
	"link_quality_score" integer,
	"is_spam" boolean DEFAULT false,
	"is_toxic" boolean DEFAULT false,
	"first_seen_date" timestamp,
	"last_seen_date" timestamp,
	"is_live" boolean DEFAULT true,
	"lost_date" timestamp,
	"source_page_title" text,
	"source_page_content" text,
	"analyzed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badge_awards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"badge_id" varchar NOT NULL,
	"awarded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text,
	"tier" text NOT NULL,
	"category" text NOT NULL,
	"requirement" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banner_projects" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"size" text NOT NULL,
	"format" text DEFAULT 'static',
	"design" jsonb NOT NULL,
	"click_url" text,
	"export_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banner_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"industry" text NOT NULL,
	"size" text NOT NULL,
	"design" jsonb NOT NULL,
	"preview_image" text NOT NULL,
	"is_animated" boolean DEFAULT false,
	"is_pro" boolean DEFAULT false,
	"use_count" integer DEFAULT 0 NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_post_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"structure" jsonb NOT NULL,
	"sample_content" text NOT NULL,
	"seo_title_template" text,
	"seo_description_template" text,
	"is_pro" boolean DEFAULT false,
	"use_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text NOT NULL,
	"slug" text NOT NULL,
	"canonical_url" text,
	"meta_title" text NOT NULL,
	"meta_description" text NOT NULL,
	"meta_keywords" jsonb,
	"focus_keyphrases" jsonb NOT NULL,
	"og_title" text,
	"og_description" text,
	"og_image" text,
	"og_type" text DEFAULT 'article',
	"twitter_card" text DEFAULT 'summary_large_image',
	"twitter_title" text,
	"twitter_description" text,
	"twitter_image" text,
	"schema_markup" jsonb,
	"author_name" text DEFAULT 'WashBizHub Research Team',
	"author_image" text,
	"date_published" timestamp DEFAULT now() NOT NULL,
	"date_modified" timestamp DEFAULT now() NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"market" text NOT NULL,
	"language" varchar(5) DEFAULT 'en' NOT NULL,
	"ai_providers" jsonb,
	"ai_prompt" text,
	"ai_quality_score" integer,
	"seo_score" integer,
	"readability_score" integer,
	"featured_image" text,
	"featured_image_alt" text,
	"image_gallery" jsonb,
	"related_posts" jsonb,
	"link_to_cleanbi" boolean DEFAULT true NOT NULL,
	"cleanbi_anchor_text" text DEFAULT 'Try our free property analysis tool',
	"internal_links" jsonb,
	"pdf_generated" boolean DEFAULT false NOT NULL,
	"pdf_url" text,
	"pdf_downloads" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"scheduled_for" timestamp,
	"published" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"avg_time_on_page" integer,
	"bounce_rate" numeric(5, 2),
	"conversions" integer DEFAULT 0 NOT NULL,
	"organic_traffic" integer DEFAULT 0 NOT NULL,
	"target_keyword_id" varchar,
	"current_ranking" integer,
	"last_ranking_check" timestamp,
	"source_listing_id" varchar,
	"tenant_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_series" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"slug" text NOT NULL,
	"cover_image" text,
	"is_published" boolean DEFAULT false,
	"post_count" integer DEFAULT 0 NOT NULL,
	"total_views" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_series_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_series_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"series_id" varchar NOT NULL,
	"post_id" varchar NOT NULL,
	"order" integer NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_access" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"stripe_payment_id" text,
	"purchased_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_annotations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"chapter_id" varchar NOT NULL,
	"type" text NOT NULL,
	"position" integer NOT NULL,
	"selected_text" text,
	"note_content" text,
	"color" text DEFAULT 'yellow',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_case_studies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sponsor_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"business_name" varchar NOT NULL,
	"industry" varchar,
	"location" varchar,
	"challenge" text,
	"solution" text,
	"results" text,
	"testimonial" text,
	"photos" jsonb,
	"video_url" varchar,
	"book_id" varchar,
	"chapter_placement" varchar,
	"sponsorship_id" varchar,
	"fee_paid" numeric(10, 2),
	"status" varchar DEFAULT 'draft',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "book_chapters" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"order" integer NOT NULL,
	"content" text NOT NULL,
	"embed_widgets" jsonb,
	"is_free" boolean DEFAULT false NOT NULL,
	"estimated_read_time" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_citations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"chapter_id" varchar,
	"user_id" varchar NOT NULL,
	"citation_type" varchar NOT NULL,
	"citation_style" varchar DEFAULT 'ama',
	"title" text NOT NULL,
	"authors" jsonb,
	"publication_date" varchar,
	"journal" varchar,
	"volume" varchar,
	"issue" varchar,
	"pages" varchar,
	"doi" varchar,
	"pmid" varchar,
	"url" text,
	"publisher" varchar,
	"access_date" varchar,
	"formatted_citation" text,
	"in_text_citation" varchar,
	"citation_number" integer,
	"anchor_text" text,
	"is_verified" boolean DEFAULT false,
	"verification_source" varchar,
	"verified_at" timestamp,
	"medical_accuracy_score" integer,
	"evidence_level" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_content_analyses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter_id" varchar,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"analysis_scope" varchar DEFAULT 'chapter',
	"content_sample" text,
	"tone_score" integer,
	"emotional_intensity" integer,
	"formality_level" integer,
	"primary_tone" varchar,
	"secondary_tones" jsonb,
	"pacing_score" integer,
	"narrative_tension" integer,
	"scene_variety" integer,
	"pacing_issues" jsonb,
	"readability_score" integer,
	"flesch_kincaid" numeric(5, 2),
	"avg_sentence_length" numeric(5, 2),
	"avg_word_length" numeric(5, 2),
	"grade_level" varchar,
	"style_consistency" integer,
	"voice_strength" integer,
	"dialogue_balance" integer,
	"overall_quality" integer,
	"publish_readiness" integer,
	"suggestions" jsonb,
	"highlighted_issues" jsonb,
	"strength_areas" jsonb,
	"analyzed_by" varchar,
	"analysis_version" varchar DEFAULT '1.0',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_production_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"name" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"target_word_count" integer DEFAULT 50000,
	"chapter_count" integer DEFAULT 10,
	"chapter_structure" jsonb,
	"tone_guidelines" text,
	"style_guidelines" text,
	"audience_description" text,
	"include_images" boolean DEFAULT true,
	"image_style" varchar DEFAULT 'realistic',
	"images_per_chapter" integer DEFAULT 2,
	"image_placement" varchar DEFAULT 'auto',
	"include_charts" boolean DEFAULT false,
	"include_graphs" boolean DEFAULT false,
	"include_tables" boolean DEFAULT false,
	"include_bullet_points" boolean DEFAULT true,
	"require_citations" boolean DEFAULT false,
	"citation_style" varchar DEFAULT 'ama',
	"min_citations_per_chapter" integer DEFAULT 0,
	"agent_pipeline" jsonb,
	"base_cost" numeric(10, 2) DEFAULT '50.00',
	"per_word_cost" numeric(10, 6) DEFAULT '0.001',
	"is_active" boolean DEFAULT true,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"name" varchar NOT NULL,
	"description" text,
	"genre" varchar DEFAULT 'memoir',
	"chapter_count" integer DEFAULT 10,
	"chapter_templates" jsonb,
	"front_matter_template" jsonb,
	"back_matter_template" jsonb,
	"trim_size" varchar DEFAULT '6x9',
	"target_word_count" integer DEFAULT 50000,
	"based_on" varchar,
	"author_credit" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "broker_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"company_name" text NOT NULL,
	"license_number" text,
	"website" text,
	"phone" text,
	"email" text,
	"bio" text,
	"specializations" text[],
	"years_experience" integer,
	"countries" text[],
	"regions" text[],
	"total_listings" integer DEFAULT 0,
	"active_listings" integer DEFAULT 0,
	"sold_listings" integer DEFAULT 0,
	"average_days_to_sell" integer,
	"verified" boolean DEFAULT false,
	"verification_document" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "browse_abandonment" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"email" varchar,
	"product_asins" text NOT NULL,
	"last_viewed_at" timestamp DEFAULT now() NOT NULL,
	"reminder_sent" boolean DEFAULT false,
	"reminder_sent_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "business_listing_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"views" integer DEFAULT 0,
	"unique_visitors" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"inquiries" integer DEFAULT 0,
	"source" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_listing_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"parent_id" varchar,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "business_listing_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "business_listing_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "business_listing_inquiries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" varchar NOT NULL,
	"name" text NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"company" text,
	"subject" text,
	"message" text NOT NULL,
	"source" text,
	"status" text DEFAULT 'new',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_listings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar,
	"owner_email" varchar NOT NULL,
	"business_name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"short_description" varchar(160),
	"category_id" varchar,
	"subcategories" text[],
	"email" varchar,
	"phone" varchar,
	"website" text,
	"address" text,
	"city" text,
	"state" text,
	"zip" varchar,
	"country" text DEFAULT 'US',
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"service_area" text,
	"logo" text,
	"cover_image" text,
	"gallery" text[],
	"year_established" integer,
	"employee_count" text,
	"services_offered" text[],
	"brands_carried" text[],
	"certifications" text[],
	"facebook" text,
	"instagram" text,
	"linkedin" text,
	"twitter" text,
	"youtube" text,
	"tier" text DEFAULT 'free' NOT NULL,
	"tier_expires_at" timestamp,
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"is_featured" boolean DEFAULT false,
	"is_homepage_hero" boolean DEFAULT false,
	"is_priority_search" boolean DEFAULT false,
	"show_analytics" boolean DEFAULT false,
	"has_verified_badge" boolean DEFAULT false,
	"meta_title" text,
	"meta_description" text,
	"focus_keyphrases" text[],
	"view_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"inquiry_count" integer DEFAULT 0,
	"status" text DEFAULT 'pending' NOT NULL,
	"is_verified" boolean DEFAULT false,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	CONSTRAINT "business_listings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "business_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"business_name" varchar NOT NULL,
	"tagline" varchar,
	"description" text,
	"logo_url" text,
	"favicon_url" text,
	"primary_color" varchar DEFAULT '#C8A661',
	"secondary_color" varchar DEFAULT '#1a2332',
	"accent_color" varchar DEFAULT '#ffffff',
	"font_family" varchar DEFAULT 'Inter',
	"phone" varchar,
	"email" varchar,
	"address" text,
	"city" varchar,
	"state" varchar,
	"zip_code" varchar,
	"country" varchar DEFAULT 'USA',
	"business_hours" jsonb,
	"timezone" varchar DEFAULT 'America/New_York',
	"facebook_url" text,
	"instagram_url" text,
	"google_maps_url" text,
	"yelp_url" text,
	"services" jsonb DEFAULT '[]'::jsonb,
	"pricing_mode" varchar DEFAULT 'per_pound',
	"price_per_pound" numeric(10, 2) DEFAULT '1.75',
	"minimum_weight" integer DEFAULT 10,
	"rush_surcharge" integer DEFAULT 50,
	"flat_rate_prices" jsonb,
	"pickup_delivery_fee" numeric(10, 2) DEFAULT '5.00',
	"is_verified" boolean DEFAULT false,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buyer_listing_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"listing_id" varchar NOT NULL,
	"view_count" integer DEFAULT 1 NOT NULL,
	"first_viewed_at" timestamp DEFAULT now() NOT NULL,
	"last_viewed_at" timestamp DEFAULT now() NOT NULL,
	"total_time_spent" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "buyer_message_threads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" varchar NOT NULL,
	"buyer_id" varchar NOT NULL,
	"seller_id" varchar NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"subject" text,
	"buyer_unread_count" integer DEFAULT 0 NOT NULL,
	"seller_unread_count" integer DEFAULT 0 NOT NULL,
	"last_message_at" timestamp,
	"last_message_preview" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buyer_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" varchar NOT NULL,
	"sender_id" varchar NOT NULL,
	"body" text NOT NULL,
	"attachments" jsonb,
	"read_at" timestamp,
	"is_system_message" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calculator_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"industry" text DEFAULT 'laundromat',
	"inputs" jsonb NOT NULL,
	"formulas" jsonb NOT NULL,
	"outputs" jsonb NOT NULL,
	"icon" text,
	"color" text DEFAULT '#C8A661',
	"is_embeddable" boolean DEFAULT true,
	"embed_code" text,
	"is_public" boolean DEFAULT true,
	"is_pro" boolean DEFAULT false,
	"use_count" integer DEFAULT 0 NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calculator_instances" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"config_id" varchar NOT NULL,
	"user_id" varchar,
	"name" text,
	"inputs" jsonb NOT NULL,
	"results" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calculator_purchases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculator_id" varchar NOT NULL,
	"buyer_id" varchar NOT NULL,
	"creator_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"platform_fee" numeric(10, 2) NOT NULL,
	"creator_earnings" numeric(10, 2) NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"stripe_payment_intent_id" varchar,
	"stripe_session_id" varchar,
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "calculator_reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculator_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar,
	"content" text,
	"helpful_count" integer DEFAULT 0,
	"status" varchar DEFAULT 'published',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calculator_scenarios" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"name" text NOT NULL,
	"washers" integer NOT NULL,
	"dryers" integer NOT NULL,
	"avg_wash_price" numeric(10, 2) NOT NULL,
	"avg_dry_price" numeric(10, 2) NOT NULL,
	"turns_per_day" numeric(5, 2) NOT NULL,
	"utilization" numeric(5, 2) NOT NULL,
	"monthly_expenses" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calculator_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"short_description" varchar,
	"category" varchar NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"thumbnail_url" varchar,
	"icon_name" varchar,
	"primary_color" varchar DEFAULT '#00A699',
	"input_fields" jsonb NOT NULL,
	"formulas" jsonb NOT NULL,
	"output_cards" jsonb NOT NULL,
	"charts" jsonb DEFAULT '[]'::jsonb,
	"tips" jsonb DEFAULT '[]'::jsonb,
	"pricing_type" varchar DEFAULT 'free',
	"price" numeric(10, 2) DEFAULT '0',
	"stripe_price_id" varchar,
	"view_count" integer DEFAULT 0,
	"use_count" integer DEFAULT 0,
	"purchase_count" integer DEFAULT 0,
	"avg_rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"status" varchar DEFAULT 'draft',
	"featured" boolean DEFAULT false,
	"version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"published_at" timestamp,
	CONSTRAINT "calculator_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "calculator_themes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"calculator_id" varchar,
	"business_profile_id" varchar,
	"name" varchar NOT NULL,
	"logo_url" text,
	"primary_color" varchar DEFAULT '#C8A661',
	"secondary_color" varchar DEFAULT '#1a2332',
	"background_color" varchar DEFAULT '#ffffff',
	"text_color" varchar DEFAULT '#1a2332',
	"font_family" varchar DEFAULT 'Inter',
	"heading_font" varchar DEFAULT 'Inter',
	"custom_css" text,
	"show_powered_by" boolean DEFAULT true,
	"embed_token" varchar,
	"allowed_domains" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "calculator_themes_embed_token_unique" UNIQUE("embed_token")
);
--> statement-breakpoint
CREATE TABLE "calculator_usage_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculator_id" varchar NOT NULL,
	"user_id" varchar,
	"event_type" varchar NOT NULL,
	"input_values" jsonb,
	"output_values" jsonb,
	"session_id" varchar,
	"user_agent" varchar,
	"ip_country" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"certificate_number" text NOT NULL,
	"student_name" text NOT NULL,
	"course_title" text NOT NULL,
	"completion_date" timestamp NOT NULL,
	"final_score" integer,
	"verification_url" text,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "certificates_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
CREATE TABLE "chapter_artifacts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter_id" varchar NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"title" varchar,
	"description" text,
	"alt_text" text,
	"caption" text,
	"image_url" text,
	"image_prompt" text,
	"image_style" varchar,
	"chart_type" varchar,
	"chart_data" jsonb,
	"chart_config" jsonb,
	"table_data" jsonb,
	"table_headers" jsonb,
	"table_style" varchar,
	"placement_mode" varchar DEFAULT 'auto',
	"position" jsonb,
	"anchor_text" text,
	"generation_status" varchar DEFAULT 'pending',
	"generated_by" varchar,
	"quality_score" integer,
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatbot_conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"location_id" varchar,
	"customer_name" text,
	"customer_email" text,
	"customer_phone" text,
	"conversation_type" text NOT NULL,
	"intent" text,
	"sentiment" text,
	"messages" jsonb NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"handoff_to_human" boolean DEFAULT false NOT NULL,
	"assigned_agent_id" varchar,
	"appointment_booked" boolean DEFAULT false NOT NULL,
	"lead_generated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cleanbi_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"address" text NOT NULL,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"cleanbi_score" integer,
	"cleanbi_grade" varchar,
	"report_type" varchar DEFAULT 'standard',
	"report_data" jsonb,
	"vision_analysis" jsonb,
	"competitor_data" jsonb,
	"demographic_data" jsonb,
	"pdf_url" text,
	"status" varchar DEFAULT 'pending',
	"price" integer,
	"stripe_payment_id" text,
	"stripe_session_id" text,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "cleanbi_scores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"laundromat_name" text NOT NULL,
	"customer_score" integer NOT NULL,
	"location_score" integer NOT NULL,
	"equipment_score" integer NOT NULL,
	"adaptability_score" integer NOT NULL,
	"numbers_score" integer NOT NULL,
	"intelligence_score" integer NOT NULL,
	"brand_score" integer NOT NULL,
	"total_score" integer NOT NULL,
	"grade" text NOT NULL,
	"ai_insights" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cleanbi_usage" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"report_type" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"month" varchar NOT NULL,
	"address_scored" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cohort_analysis" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"cohort_month" timestamp NOT NULL,
	"cohort_size" integer NOT NULL,
	"month_offset" integer NOT NULL,
	"active_customers" integer DEFAULT 0,
	"retention_rate" numeric(5, 2),
	"cohort_revenue" numeric(10, 2) DEFAULT '0.00',
	"cumulative_revenue" numeric(10, 2) DEFAULT '0.00',
	"avg_revenue_per_customer" numeric(10, 2),
	"total_orders" integer DEFAULT 0,
	"avg_orders_per_customer" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_ledger" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"vendor_id" varchar,
	"affiliate_id" varchar,
	"amount" numeric(10, 2) NOT NULL,
	"commission_rate" numeric(5, 2) NOT NULL,
	"commission_amount" numeric(10, 2) NOT NULL,
	"platform_fee" numeric(10, 2) NOT NULL,
	"reference_type" text,
	"reference_id" varchar,
	"is_paid" boolean DEFAULT false,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competition_intelligence" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"radius_miles" numeric(4, 2) DEFAULT '3.00',
	"competitor_count" integer,
	"nearest_competitor" numeric(5, 2),
	"avg_pricing" jsonb,
	"market_saturation" text,
	"population" integer,
	"median_income" numeric(10, 2),
	"household_count" integer,
	"renter_percentage" numeric(5, 2),
	"opportunity_score" integer,
	"recommended_pricing" jsonb,
	"strengths" jsonb,
	"concerns" jsonb,
	"ai_insights" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "competitor_analysis" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competitor_url" text NOT NULL,
	"keyword" text NOT NULL,
	"serp_position" integer,
	"page_title" text,
	"meta_description" text,
	"content_length" integer,
	"backlinks" integer,
	"domain_authority" integer,
	"content_gaps" jsonb,
	"analyzed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultant_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"display_name" text NOT NULL,
	"title" text,
	"bio" text NOT NULL,
	"profile_image" text,
	"specializations" text[],
	"experience_years" integer,
	"certifications" text[],
	"services_offered" jsonb,
	"hourly_rate" numeric(10, 2),
	"package_prices" jsonb,
	"available_hours" jsonb,
	"timezone" text DEFAULT 'America/New_York',
	"max_bookings_per_week" integer DEFAULT 10,
	"total_consultations" integer DEFAULT 0,
	"total_revenue" numeric(10, 2) DEFAULT '0.00',
	"avg_rating" numeric(3, 2) DEFAULT '0.00',
	"total_reviews" integer DEFAULT 0,
	"status" text DEFAULT 'pending',
	"verified" boolean DEFAULT false,
	"featured" boolean DEFAULT false,
	"website_url" text,
	"linkedin_url" text,
	"video_intro" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"consultation_type" text NOT NULL,
	"business_stage" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"location" text,
	"budget" text,
	"timeline" text,
	"message" text NOT NULL,
	"preferred_date" timestamp,
	"scheduled_date" timestamp,
	"status" text DEFAULT 'new' NOT NULL,
	"assigned_to" varchar,
	"priority" text DEFAULT 'normal',
	"consultation_fee" numeric(10, 2),
	"paid" boolean DEFAULT false NOT NULL,
	"stripe_payment_id" text,
	"internal_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "content_analyses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"content" text NOT NULL,
	"primary_keyword" text NOT NULL,
	"secondary_keywords" text[],
	"overall_score" integer NOT NULL,
	"keyword_optimization" integer,
	"readability_score" integer,
	"technical_seo_score" integer,
	"content_quality_score" integer,
	"eeat_score" integer,
	"word_count" integer,
	"reading_time" integer,
	"keyword_density" numeric(5, 2),
	"heading_structure" jsonb,
	"meta_title" text,
	"meta_title_length" integer,
	"meta_description" text,
	"meta_description_length" integer,
	"canonical_url" text,
	"open_graph_tags" jsonb,
	"twitter_card_tags" jsonb,
	"schema_markup" jsonb,
	"total_images" integer,
	"images_with_alt" integer,
	"image_optimization_score" integer,
	"internal_links" integer,
	"external_links" integer,
	"broken_links" integer,
	"linking_score" integer,
	"ai_suggestions" jsonb,
	"content_gaps" jsonb,
	"lsi_keywords" text[],
	"top_competitors" jsonb,
	"competitive_advantage" text[],
	"analyzed_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_calendar" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text,
	"content_type" text NOT NULL,
	"primary_keyword" text NOT NULL,
	"secondary_keywords" text[],
	"scheduled_publish_date" timestamp,
	"actual_publish_date" timestamp,
	"status" text DEFAULT 'idea',
	"assigned_to" varchar,
	"author" varchar,
	"editor" varchar,
	"ai_generated" boolean DEFAULT false,
	"ai_model" text,
	"content_brief" text,
	"target_search_volume" integer,
	"target_difficulty" integer,
	"estimated_traffic" integer,
	"actual_views" integer DEFAULT 0,
	"actual_rank" integer,
	"conversion_rate" numeric(5, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_pipelines" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"pipeline_name" varchar NOT NULL,
	"pipeline_type" varchar NOT NULL,
	"target_format" varchar NOT NULL,
	"target_word_count" integer,
	"target_chapters" integer,
	"voice_profile_id" varchar,
	"industry_id" varchar,
	"agent_pipeline" jsonb,
	"intelligence_tier" varchar DEFAULT 'standard',
	"include_images" boolean DEFAULT true,
	"include_citations" boolean DEFAULT false,
	"include_charts" boolean DEFAULT false,
	"estimated_cost" numeric(10, 2),
	"actual_cost" numeric(10, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_projects" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"title" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'draft',
	"content" jsonb,
	"kdp_settings" jsonb,
	"cover_image_url" text,
	"word_count" integer DEFAULT 0,
	"chapter_count" integer DEFAULT 0,
	"last_edited_at" timestamp,
	"version" integer DEFAULT 1,
	"previous_versions" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversion_funnels" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"funnel_type" text NOT NULL,
	"stage1_count" integer DEFAULT 0,
	"stage2_count" integer DEFAULT 0,
	"stage3_count" integer DEFAULT 0,
	"stage4_count" integer DEFAULT 0,
	"stage5_count" integer DEFAULT 0,
	"stage1_to2_rate" numeric(5, 2),
	"stage2_to3_rate" numeric(5, 2),
	"stage3_to4_rate" numeric(5, 2),
	"stage4_to5_rate" numeric(5, 2),
	"overall_conversion_rate" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_modules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"order_index" integer NOT NULL,
	"lesson_count" integer DEFAULT 0,
	"duration_minutes" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"instructor_name" text NOT NULL,
	"thumbnail_url" text,
	"price" numeric(10, 2) NOT NULL,
	"stripe_price_id" text,
	"level" text NOT NULL,
	"category" text NOT NULL,
	"duration" integer NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"total_enrollments" integer DEFAULT 0 NOT NULL,
	"average_rating" numeric(3, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"tier_level" integer,
	"prerequisite_course_id" varchar,
	"bundle_group_id" text,
	"is_free" boolean DEFAULT false NOT NULL,
	"auto_enroll" boolean DEFAULT false NOT NULL,
	"certificate_enabled" boolean DEFAULT false NOT NULL,
	"certificate_title" text
);
--> statement-breakpoint
CREATE TABLE "crawled_pages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"url" text NOT NULL,
	"canonical_url" text,
	"status" integer,
	"redirect_url" text,
	"title" text,
	"meta_description" text,
	"h1" text,
	"word_count" integer,
	"headings" jsonb,
	"meta" jsonb,
	"vitals" jsonb,
	"images_without_alt" integer DEFAULT 0,
	"total_images" integer DEFAULT 0,
	"internal_links_count" integer DEFAULT 0,
	"external_links_count" integer DEFAULT 0,
	"broken_links_count" integer DEFAULT 0,
	"depth" integer DEFAULT 0,
	"crawl_time" integer,
	"last_crawled_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_payouts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"stripe_transfer_id" varchar,
	"stripe_payout_id" varchar,
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "creator_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"bio" text,
	"avatar_url" varchar,
	"website_url" varchar,
	"linkedin_url" varchar,
	"expertise" jsonb DEFAULT '[]'::jsonb,
	"years_experience" integer,
	"total_calculators" integer DEFAULT 0,
	"total_sales" integer DEFAULT 0,
	"total_earnings" numeric(12, 2) DEFAULT '0',
	"pending_earnings" numeric(12, 2) DEFAULT '0',
	"avg_rating" numeric(3, 2) DEFAULT '0',
	"stripe_connect_account_id" varchar,
	"payout_enabled" boolean DEFAULT false,
	"verified" boolean DEFAULT false,
	"featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "creator_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "customer_ltv_fact" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"as_of_date" timestamp NOT NULL,
	"first_order_date" timestamp NOT NULL,
	"last_order_date" timestamp NOT NULL,
	"days_since_first_order" integer NOT NULL,
	"days_since_last_order" integer NOT NULL,
	"total_orders" integer DEFAULT 0,
	"total_revenue" numeric(10, 2) NOT NULL,
	"total_pounds" numeric(10, 2) DEFAULT '0.00',
	"avg_order_value" numeric(10, 2),
	"avg_order_frequency" numeric(10, 2),
	"projected_ltv" numeric(10, 2),
	"churn_probability" numeric(5, 2),
	"customer_segment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_portal_accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_account_id" varchar,
	"laundromat_id" varchar NOT NULL,
	"email" varchar NOT NULL,
	"password_hash" text,
	"email_verified" boolean DEFAULT false,
	"email_verification_token" text,
	"email_verification_expires" timestamp,
	"password_reset_token" text,
	"password_reset_expires" timestamp,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"phone" varchar,
	"profile_image" text,
	"address" text,
	"city" text,
	"state" text,
	"zip" varchar,
	"delivery_instructions" text,
	"loyalty_points" integer DEFAULT 0,
	"loyalty_tier" text DEFAULT 'bronze',
	"lifetime_points" integer DEFAULT 0,
	"lifetime_spend" numeric(12, 2) DEFAULT '0.00',
	"has_subscription" boolean DEFAULT false,
	"subscription_plan_id" varchar,
	"subscription_start_date" timestamp,
	"subscription_end_date" timestamp,
	"stripe_customer_id" text,
	"default_payment_method_id" text,
	"status" text DEFAULT 'active',
	"last_login_at" timestamp,
	"login_count" integer DEFAULT 0,
	"referral_code" varchar,
	"referred_by" varchar,
	"referral_count" integer DEFAULT 0,
	"sms_notifications" boolean DEFAULT true,
	"email_notifications" boolean DEFAULT true,
	"marketing_emails" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_portal_accounts_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "customer_preferences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_portal_id" varchar NOT NULL,
	"detergent_type" text DEFAULT 'standard',
	"detergent_brand" text,
	"fabric_softener" boolean DEFAULT true,
	"fabric_softener_type" text,
	"water_temperature" text DEFAULT 'warm',
	"dryer_heat" text DEFAULT 'medium',
	"folding_style" text DEFAULT 'standard',
	"hang_delicates" boolean DEFAULT true,
	"separate_colors" boolean DEFAULT true,
	"allergies" text[],
	"special_instructions" text,
	"starch_shirts" boolean DEFAULT false,
	"starch_level" text DEFAULT 'light',
	"packaging_preference" text DEFAULT 'folded_in_bag',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_websites" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"template_id" varchar,
	"business_name" text NOT NULL,
	"slug" text NOT NULL,
	"custom_domain" text,
	"pages" jsonb NOT NULL,
	"theme" jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"pageviews" integer DEFAULT 0 NOT NULL,
	"last_visited_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_websites_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "daily_checkins" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" varchar,
	"checkin_date" timestamp DEFAULT now() NOT NULL,
	"pain_level" integer,
	"energy_level" integer,
	"sleep_quality" integer,
	"mood" varchar,
	"motivation" integer,
	"progress_today" text,
	"challenges_today" text,
	"goals_for_tomorrow" text,
	"ai_response" text,
	"ai_sentiment" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_revenue_fact" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"week" integer NOT NULL,
	"quarter" integer NOT NULL,
	"total_revenue" numeric(10, 2) NOT NULL,
	"cash_revenue" numeric(10, 2) DEFAULT '0.00',
	"card_revenue" numeric(10, 2) DEFAULT '0.00',
	"account_revenue" numeric(10, 2) DEFAULT '0.00',
	"wdf_revenue" numeric(10, 2) DEFAULT '0.00',
	"dryclean_revenue" numeric(10, 2) DEFAULT '0.00',
	"alterations_revenue" numeric(10, 2) DEFAULT '0.00',
	"delivery_revenue" numeric(10, 2) DEFAULT '0.00',
	"total_orders" integer DEFAULT 0,
	"total_pounds" numeric(10, 2) DEFAULT '0.00',
	"avg_order_value" numeric(10, 2) DEFAULT '0.00',
	"avg_price_per_pound" numeric(10, 2) DEFAULT '0.00',
	"new_customers" integer DEFAULT 0,
	"returning_customers" integer DEFAULT 0,
	"unique_customers" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deal_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"email" varchar NOT NULL,
	"min_discount" numeric(5, 2) DEFAULT '10.00',
	"categories" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deal_scout_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scout_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"listing_id" varchar,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp,
	"clicked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "delivery_windows" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"window_name" text NOT NULL,
	"day_of_week" integer,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"max_capacity" integer NOT NULL,
	"current_bookings" integer DEFAULT 0,
	"surcharge" numeric(10, 2) DEFAULT '0.00',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "designs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"dimensions" jsonb NOT NULL,
	"equipment" jsonb NOT NULL,
	"total_cost" numeric(10, 2) NOT NULL,
	"tpd" integer NOT NULL,
	"ai_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diagnostic_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"manufacturer" text NOT NULL,
	"machine_type" text,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"possible_causes" text[],
	"troubleshooting_steps" text[],
	"required_parts" text[],
	"parts_with_pricing" jsonb,
	"estimated_repair_time" integer,
	"skill_level" text,
	"quick_fix" text,
	"era_compatibility" text,
	"model_series" text,
	"severity" text DEFAULT 'medium',
	"manual_reference" text,
	"video_url" text,
	"test_mode_entry" text,
	"meta_title" text,
	"meta_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "diagnostic_codes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "digital_product_listings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"product_type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"subtitle" varchar,
	"description" text,
	"project_id" varchar,
	"book_id" varchar,
	"course_id" varchar,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"compare_at_price" numeric(10, 2),
	"stripe_product_id" varchar,
	"stripe_price_id" varchar,
	"delivery_type" varchar DEFAULT 'download',
	"download_files" jsonb,
	"access_url" text,
	"cover_image_url" text,
	"preview_url" text,
	"sample_chapters" jsonb,
	"slug" varchar,
	"meta_title" varchar,
	"meta_description" text,
	"category" varchar,
	"tags" text[],
	"sales_count" integer DEFAULT 0,
	"total_revenue" numeric(10, 2) DEFAULT '0.00',
	"rating" numeric(3, 2),
	"review_count" integer DEFAULT 0,
	"status" varchar DEFAULT 'draft',
	"published_at" timestamp,
	"is_indexed" boolean DEFAULT false,
	"indexed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "digital_product_listings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "distributor_inquiries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"distributor_id" varchar,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text NOT NULL,
	"business_name" text,
	"equipment_interest" text[],
	"message" text,
	"urgency" text DEFAULT 'normal' NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"converted_to_sale" boolean DEFAULT false NOT NULL,
	"sale_amount" numeric(10, 2),
	"commission_earned" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"contacted_at" timestamp,
	"converted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "distributors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_name" text NOT NULL,
	"distributor_name" text NOT NULL,
	"regions" text[] NOT NULL,
	"states" text[] NOT NULL,
	"equipment_types" text[] NOT NULL,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text NOT NULL,
	"website" text,
	"commission_rate" numeric(5, 2),
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"seo_project_id" varchar,
	"domain_name" text NOT NULL,
	"tld" text NOT NULL,
	"registration_price" numeric(10, 2) NOT NULL,
	"renewal_price" numeric(10, 2) NOT NULL,
	"washbizhub_fee" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"provider" text NOT NULL,
	"provider_order_id" text,
	"years" integer DEFAULT 1,
	"expires_at" timestamp,
	"stripe_payment_intent_id" text,
	"status" text DEFAULT 'pending',
	"error_message" text,
	"ordered_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "driver_route_fact" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" varchar NOT NULL,
	"driver_id" varchar NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"total_stops" integer DEFAULT 0,
	"completed_stops" integer DEFAULT 0,
	"failed_stops" integer DEFAULT 0,
	"on_time_stops" integer DEFAULT 0,
	"total_distance" numeric(10, 2),
	"total_duration" integer,
	"avg_stop_duration" integer,
	"route_revenue" numeric(10, 2),
	"revenue_per_mile" numeric(10, 2),
	"revenue_per_stop" numeric(10, 2),
	"avg_customer_rating" numeric(3, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"driver_id" varchar NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"session_date" timestamp DEFAULT now() NOT NULL,
	"clock_in" timestamp NOT NULL,
	"clock_out" timestamp,
	"route_ids" text[],
	"total_miles" numeric(10, 2) DEFAULT '0.00',
	"total_stops" integer DEFAULT 0,
	"on_time_rate" numeric(5, 2),
	"customer_rating" numeric(3, 2),
	"vehicle_id" text,
	"starting_mileage" numeric(10, 1),
	"ending_mileage" numeric(10, 1),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "due_diligence_tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nda_request_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"status" text DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp,
	"notes" text,
	"documents" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_campaigns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"preheader" text,
	"html_content" text NOT NULL,
	"text_content" text,
	"target_industries" jsonb NOT NULL,
	"target_countries" jsonb,
	"target_languages" jsonb,
	"min_lead_score" integer,
	"featured_blog_ids" jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"total_recipients" integer DEFAULT 0 NOT NULL,
	"total_sent" integer DEFAULT 0 NOT NULL,
	"total_delivered" integer DEFAULT 0 NOT NULL,
	"total_opened" integer DEFAULT 0 NOT NULL,
	"total_clicked" integer DEFAULT 0 NOT NULL,
	"total_bounced" integer DEFAULT 0 NOT NULL,
	"total_unsubscribed" integer DEFAULT 0 NOT NULL,
	"open_rate" numeric(5, 2),
	"click_rate" numeric(5, 2),
	"conversion_rate" numeric(5, 2),
	"resend_batch_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_contacts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"source" text,
	"tags" text[],
	"segment" text,
	"status" text DEFAULT 'subscribed',
	"subscribed_at" timestamp DEFAULT now(),
	"unsubscribed_at" timestamp,
	"last_opened_at" timestamp,
	"last_clicked_at" timestamp,
	"open_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"lead_score" integer DEFAULT 0,
	"custom_fields" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscriber_id" varchar NOT NULL,
	"campaign_id" varchar,
	"event_type" text NOT NULL,
	"clicked_url" text,
	"bounce_type" text,
	"bounce_reason" text,
	"user_agent" text,
	"ip_address" text,
	"resend_event_id" text,
	"webhook_payload" jsonb,
	"occurred_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_subscribers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"source" text NOT NULL,
	"referrer_url" text,
	"tags" text[],
	"interests" text[],
	"status" text DEFAULT 'subscribed',
	"confirmed_at" timestamp,
	"unsubscribed_at" timestamp,
	"emails_sent" integer DEFAULT 0,
	"emails_opened" integer DEFAULT 0,
	"links_clicked" integer DEFAULT 0,
	"last_engaged_at" timestamp,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"token" varchar NOT NULL,
	"alert_type" varchar NOT NULL,
	"alert_data" jsonb NOT NULL,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "email_verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"stripe_payment_id" text,
	"progress" integer DEFAULT 0 NOT NULL,
	"current_lesson_id" varchar,
	"completed_lessons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_accessed_at" timestamp,
	"enrolled_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_inquiries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"company" text,
	"equipment_type" text NOT NULL,
	"brand" text,
	"model" text,
	"quantity" integer NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip" text,
	"timeline" text,
	"budget" text,
	"message" text,
	"preferred_distributor" text,
	"source" text,
	"affiliate_code" text,
	"estimated_value" numeric(12, 2),
	"commission_rate" numeric(5, 2) DEFAULT '10.00',
	"commission_amount" numeric(10, 2),
	"commission_status" text DEFAULT 'pending',
	"status" text DEFAULT 'new',
	"assigned_to" text DEFAULT 'nick@washbizhub.com',
	"notes" text,
	"follow_up_date" timestamp,
	"converted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_listings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"brand" text,
	"model" text,
	"serial_number" text,
	"year_manufactured" integer,
	"condition" text NOT NULL,
	"capacity" text,
	"fuel_type" text,
	"voltage" text,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"negotiable" boolean DEFAULT true,
	"city" text,
	"state" text,
	"country" text DEFAULT 'US',
	"zip_code" text,
	"images" text[],
	"videos" text[],
	"featured_image" text,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"preferred_contact" text DEFAULT 'email',
	"status" text DEFAULT 'active',
	"views" integer DEFAULT 0,
	"inquiries" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"sets_completed" integer,
	"reps_completed" integer,
	"duration_completed" integer,
	"difficulty" varchar,
	"pain_level" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" varchar,
	"name" varchar NOT NULL,
	"type" varchar NOT NULL,
	"description" text,
	"instructions" text,
	"sets" integer,
	"reps" integer,
	"duration" integer,
	"frequency" varchar NOT NULL,
	"scheduled_days" text,
	"scheduled_time" varchar,
	"reminder_enabled" boolean DEFAULT true,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "external_connections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"project_id" varchar,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"base_url" text NOT NULL,
	"auth_type" text,
	"auth" jsonb,
	"status" text DEFAULT 'active',
	"last_connected_at" timestamp,
	"last_error" text,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorite_listings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"listing_id" varchar NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_bookmarks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" varchar NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text,
	"slug" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"color" text DEFAULT '#C8A661',
	"parent_id" varchar,
	"total_topics" integer DEFAULT 0 NOT NULL,
	"total_posts" integer DEFAULT 0 NOT NULL,
	"requires_auth" boolean DEFAULT false,
	"is_pro" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "forum_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "forum_follows" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" varchar NOT NULL,
	"notify_on_activity" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_mentions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mentioned_user_id" varchar NOT NULL,
	"mentioned_by_user_id" varchar NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" varchar NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_reactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" varchar NOT NULL,
	"reaction_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_replies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"parent_id" varchar,
	"content" text NOT NULL,
	"images" text[],
	"videos" text[],
	"upvotes" integer DEFAULT 0 NOT NULL,
	"downvotes" integer DEFAULT 0 NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"is_best_answer" boolean DEFAULT false,
	"is_edited" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_topics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"slug" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"images" text[],
	"videos" text[],
	"featured_image" text,
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text[],
	"canonical_url" text,
	"views" integer DEFAULT 0 NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"downvotes" integer DEFAULT 0 NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"is_pinned" boolean DEFAULT false,
	"is_locked" boolean DEFAULT false,
	"is_solved" boolean DEFAULT false,
	"best_answer_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_activity_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_votes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" varchar NOT NULL,
	"vote_type" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "founding_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"member_number" integer NOT NULL,
	"tier" varchar DEFAULT 'founding' NOT NULL,
	"perks" jsonb,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "founding_members_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "generated_assets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"project_id" varchar,
	"conversation_id" varchar,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"mime_type" text,
	"url" text,
	"base64_data" text,
	"file_size" integer,
	"prompt" text,
	"model" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "geofence_zones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"zone_name" text NOT NULL,
	"zone_type" text NOT NULL,
	"geometry" jsonb NOT NULL,
	"center_point" jsonb,
	"delivery_fee" numeric(10, 2),
	"minimum_order" numeric(10, 2),
	"estimated_delivery_time" integer,
	"service_hours" jsonb,
	"is_active" boolean DEFAULT true,
	"priority" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ghostwriting_chapters" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"chapter_number" integer NOT NULL,
	"title" varchar NOT NULL,
	"theme" text,
	"canon_principle" text,
	"content" text,
	"word_count" integer DEFAULT 0,
	"target_word_count" integer DEFAULT 3000,
	"sections" jsonb,
	"key_moments" jsonb,
	"supporting_characters" jsonb,
	"before_after_moments" jsonb,
	"status" varchar DEFAULT 'outline',
	"draft_version" integer DEFAULT 1,
	"ai_prompts" jsonb,
	"ai_suggestions" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ghostwriting_projects" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" varchar,
	"title" varchar NOT NULL,
	"subtitle" text,
	"author_name" varchar NOT NULL,
	"genre" varchar DEFAULT 'memoir',
	"status" varchar DEFAULT 'draft',
	"current_chapter" integer DEFAULT 1,
	"total_chapters" integer DEFAULT 10,
	"word_count" integer DEFAULT 0,
	"target_word_count" integer DEFAULT 50000,
	"outline" jsonb,
	"front_matter" jsonb,
	"back_matter" jsonb,
	"isbn" varchar,
	"asin" varchar,
	"kdp_status" varchar DEFAULT 'not_submitted',
	"published_at" timestamp,
	"amazon_url" text,
	"cover_image_url" text,
	"trim_size" varchar DEFAULT '6x9',
	"interior_type" varchar DEFAULT 'black_white',
	"ai_assistance_level" varchar DEFAULT 'guided',
	"ai_suggestions_used" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gsc_properties" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"site_url" text NOT NULL,
	"property_type" varchar DEFAULT 'domain',
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"last_sync_at" timestamp,
	"sync_status" varchar DEFAULT 'pending',
	"sync_error" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gsc_query_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" varchar NOT NULL,
	"query" text NOT NULL,
	"page" text,
	"country" varchar,
	"device" varchar,
	"clicks" integer DEFAULT 0,
	"impressions" integer DEFAULT 0,
	"ctr" numeric(5, 4),
	"position" numeric(5, 2),
	"date" varchar NOT NULL,
	"position_change" numeric(5, 2),
	"clicks_change" integer,
	"impressions_change" integer,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "household_accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"account_number" text NOT NULL,
	"account_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"phone" varchar NOT NULL,
	"email" varchar,
	"address" text,
	"city" text,
	"state" text,
	"zip" varchar,
	"billing_cycle" text DEFAULT 'monthly',
	"payment_terms" integer DEFAULT 30,
	"credit_limit" numeric(10, 2),
	"current_balance" numeric(10, 2) DEFAULT '0.00',
	"status" text DEFAULT 'active',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "household_accounts_account_number_unique" UNIQUE("account_number")
);
--> statement-breakpoint
CREATE TABLE "hydration_goals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" varchar,
	"daily_goal" integer DEFAULT 64 NOT NULL,
	"reminder_enabled" boolean DEFAULT true,
	"reminder_interval" integer DEFAULT 2,
	"reminder_start_time" varchar DEFAULT '08:00',
	"reminder_end_time" varchar DEFAULT '20:00',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hydration_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" varchar,
	"logged_at" timestamp DEFAULT now() NOT NULL,
	"amount" integer NOT NULL,
	"type" varchar DEFAULT 'water',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "indexing_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"url" text NOT NULL,
	"url_type" varchar,
	"index_now_status" varchar DEFAULT 'pending',
	"index_now_submitted_at" timestamp,
	"index_now_response" jsonb,
	"google_index_status" varchar DEFAULT 'pending',
	"google_index_submitted_at" timestamp,
	"google_index_response" jsonb,
	"bing_notified" boolean DEFAULT false,
	"yandex_notified" boolean DEFAULT false,
	"duck_duck_go_notified" boolean DEFAULT false,
	"is_indexed" boolean DEFAULT false,
	"indexed_at" timestamp,
	"last_checked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industry_benchmarks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"metric" text NOT NULL,
	"country" text DEFAULT 'US',
	"region" text,
	"business_type" text DEFAULT 'laundromat',
	"store_size" text,
	"sample_size" integer NOT NULL,
	"median" numeric(12, 4) NOT NULL,
	"average" numeric(12, 4) NOT NULL,
	"percentile_25" numeric(12, 4),
	"percentile_75" numeric(12, 4),
	"minimum" numeric(12, 4),
	"maximum" numeric(12, 4),
	"unit" text NOT NULL,
	"description" text NOT NULL,
	"period_type" text NOT NULL,
	"year" integer NOT NULL,
	"quarter" integer,
	"data_source" text,
	"published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industry_knowledge_bases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"industry_slug" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"description" text,
	"core_knowledge" text,
	"terminology" jsonb,
	"statistics" jsonb,
	"best_practices" jsonb,
	"common_mistakes" jsonb,
	"book_templates" jsonb,
	"chapter_templates" jsonb,
	"content_prompts" jsonb,
	"primary_keywords" text[],
	"long_tail_keywords" text[],
	"question_keywords" text[],
	"related_industries" text[],
	"pivot_suggestions" jsonb,
	"knowledge_embedding" jsonb,
	"embedding_model" varchar DEFAULT 'gemini',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "industry_knowledge_bases_industry_slug_unique" UNIQUE("industry_slug")
);
--> statement-breakpoint
CREATE TABLE "industry_pulse" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"period" varchar NOT NULL,
	"new_listings" integer DEFAULT 0,
	"listings_sold" integer DEFAULT 0,
	"average_asking_price" integer,
	"average_sale_price" integer,
	"average_multiple" numeric(4, 2),
	"analyses_run" integer DEFAULT 0,
	"average_cleanbi_score" integer,
	"new_users" integer DEFAULT 0,
	"active_users" integer DEFAULT 0,
	"hot_markets" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journey_milestones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar NOT NULL,
	"stage" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"order" integer NOT NULL,
	"points" integer DEFAULT 25 NOT NULL,
	"action" varchar,
	"action_target" varchar,
	CONSTRAINT "journey_milestones_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "keyword_rankings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"keyword_id" varchar NOT NULL,
	"position" integer,
	"previous_position" integer,
	"url" text,
	"title" text,
	"snippet" text,
	"has_featured_snippet" boolean DEFAULT false NOT NULL,
	"has_people_also_ask" boolean DEFAULT false NOT NULL,
	"has_local_pack" boolean DEFAULT false NOT NULL,
	"has_knowledge_graph" boolean DEFAULT false NOT NULL,
	"top_competitors" jsonb,
	"serp_api_data" jsonb,
	"checked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "keyword_research_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"seed_keywords" text[] NOT NULL,
	"industry_id" varchar,
	"location" varchar DEFAULT 'United States',
	"language" varchar DEFAULT 'en',
	"depth" integer DEFAULT 2,
	"status" varchar DEFAULT 'pending',
	"progress" integer DEFAULT 0,
	"keywords_found" integer DEFAULT 0,
	"questions_found" integer DEFAULT 0,
	"related_searches_found" integer DEFAULT 0,
	"api_provider" varchar DEFAULT 'serpapi',
	"api_calls_made" integer DEFAULT 0,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "laundromats" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"phone" text,
	"hours" jsonb,
	"featured" boolean DEFAULT false NOT NULL,
	"verified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"lesson_id" varchar NOT NULL,
	"completed" boolean DEFAULT false,
	"progress_percent" integer DEFAULT 0,
	"time_spent_seconds" integer DEFAULT 0,
	"quiz_attempts" integer DEFAULT 0,
	"quiz_score" integer,
	"quiz_passed" boolean,
	"last_accessed_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"order" integer NOT NULL,
	"duration" integer NOT NULL,
	"video_url" text,
	"content" text,
	"resources" jsonb,
	"quiz_data" jsonb,
	"is_free" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "link_graph" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"from_url" text NOT NULL,
	"to_url" text NOT NULL,
	"anchor_text" text,
	"rel" text,
	"is_internal" boolean DEFAULT true NOT NULL,
	"context" text,
	"surrounding_text" text,
	"discovered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_comparisons" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text,
	"listing_ids" text[] NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_equipment" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" varchar,
	"equipment_type" text NOT NULL,
	"brand" text NOT NULL,
	"model" text,
	"capacity" integer,
	"quantity" integer NOT NULL,
	"condition" text NOT NULL,
	"year_installed" integer,
	"age_years" integer,
	"estimated_value" numeric(10, 2),
	"replacement_cost" numeric(10, 2),
	"turns_per_day" integer,
	"efficiency" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_financials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" varchar,
	"gross_revenue_original" numeric(12, 2),
	"net_revenue_original" numeric(12, 2),
	"average_monthly_revenue_original" numeric(12, 2),
	"gross_revenue_usd" numeric(12, 2),
	"net_revenue_usd" numeric(12, 2),
	"average_monthly_revenue_usd" numeric(12, 2),
	"rent_original" numeric(10, 2),
	"utilities_original" numeric(10, 2),
	"labor_original" numeric(10, 2),
	"maintenance_original" numeric(10, 2),
	"insurance_original" numeric(10, 2),
	"other_expenses_original" numeric(10, 2),
	"total_expenses_original" numeric(10, 2),
	"rent_usd" numeric(10, 2),
	"utilities_usd" numeric(10, 2),
	"labor_usd" numeric(10, 2),
	"maintenance_usd" numeric(10, 2),
	"insurance_usd" numeric(10, 2),
	"other_expenses_usd" numeric(10, 2),
	"total_expenses_usd" numeric(10, 2),
	"net_income_original" numeric(12, 2),
	"ebitda_original" numeric(12, 2),
	"cash_flow_original" numeric(12, 2),
	"net_income_usd" numeric(12, 2),
	"ebitda_usd" numeric(12, 2),
	"cash_flow_usd" numeric(12, 2),
	"profit_margin" numeric(5, 2),
	"roi" numeric(5, 2),
	"payback_period_months" integer,
	"financial_year" integer,
	"currency" text DEFAULT 'USD' NOT NULL,
	"exchange_rate_to_usd" numeric(10, 6),
	"verified" boolean DEFAULT false,
	"verification_document" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_inquiries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" varchar,
	"user_id" varchar,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"message" text NOT NULL,
	"investment_budget" numeric(12, 2),
	"financing_pre_approved" boolean DEFAULT false,
	"timeline" text,
	"status" text DEFAULT 'new' NOT NULL,
	"response" text,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_media" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" varchar,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"filename" text,
	"title" text,
	"description" text,
	"sort_order" integer DEFAULT 0,
	"requires_nda" boolean DEFAULT false,
	"width" integer,
	"height" integer,
	"thumbnail" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_premium_purchases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" varchar,
	"package_id" varchar,
	"user_id" varchar,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text NOT NULL,
	"stripe_payment_id" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"status" text DEFAULT 'active' NOT NULL,
	"purchased_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_views" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" varchar,
	"user_id" varchar,
	"session_id" text,
	"ip_address" text,
	"user_agent" text,
	"referrer" text,
	"country" text,
	"region" text,
	"city" text,
	"time_on_page" integer,
	"scroll_depth" integer,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"business_type" text NOT NULL,
	"listing_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"tagline" text,
	"price_original" numeric(12, 2),
	"currency" text DEFAULT 'USD' NOT NULL,
	"price_in_usd" numeric(12, 2),
	"price_visibility" text DEFAULT 'public' NOT NULL,
	"includes_real_estate" boolean DEFAULT false NOT NULL,
	"real_estate_value" numeric(12, 2),
	"owner_financing" boolean DEFAULT false NOT NULL,
	"down_payment_percent" integer,
	"interest_rate" numeric(5, 2),
	"financing_term_months" integer,
	"country" text DEFAULT 'US' NOT NULL,
	"region" text,
	"city" text,
	"general_location" text,
	"exact_address" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"address_visibility" text DEFAULT 'public' NOT NULL,
	"featured_image" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"priority_search" boolean DEFAULT false NOT NULL,
	"visibility_boost" integer DEFAULT 0,
	"subscription_tier" text DEFAULT 'free' NOT NULL,
	"stripe_subscription_id" text,
	"subscription_start_date" timestamp,
	"subscription_end_date" timestamp,
	"media_limit" integer DEFAULT 5 NOT NULL,
	"video_limit" integer DEFAULT 0 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text[],
	"slug" text,
	"requires_nda" boolean DEFAULT false NOT NULL,
	"nda_document" text,
	"broker_name" text,
	"broker_phone" text,
	"broker_email" text,
	"broker_license" text,
	"broker_company" text,
	"cleanbi_report_id" varchar,
	"has_valuation_report" boolean DEFAULT false,
	"larry_verified" boolean DEFAULT false,
	"larry_verified_at" timestamp,
	"larry_verification_notes" text,
	"detail_level" text DEFAULT 'quick' NOT NULL,
	"completeness_score" integer DEFAULT 0,
	"carousel_featured" boolean DEFAULT false,
	"carousel_featured_at" timestamp,
	"carousel_expires_at" timestamp,
	"auto_blog_enabled" boolean DEFAULT false,
	"auto_blog_post_id" varchar,
	"auto_blog_generated_at" timestamp,
	"index_now_submitted" boolean DEFAULT false,
	"index_now_submitted_at" timestamp,
	"google_indexing_submitted" boolean DEFAULT false,
	"google_indexing_submitted_at" timestamp,
	"google_indexing_status" text,
	"social_cards_generated" boolean DEFAULT false,
	"social_cards_generated_at" timestamp,
	"social_cards_data" text,
	"og_image_url" text,
	"visibility_package" text,
	"visibility_purchased_at" timestamp,
	"visibility_stripe_payment_id" text,
	"view_count" integer DEFAULT 0 NOT NULL,
	"inquiry_count" integer DEFAULT 0 NOT NULL,
	"nda_request_count" integer DEFAULT 0 NOT NULL,
	"listed_at" timestamp,
	"expires_at" timestamp,
	"sold_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "listings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "logo_projects" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"business_name" text NOT NULL,
	"tagline" text,
	"industry" text DEFAULT 'laundromat',
	"design" jsonb NOT NULL,
	"background_color" text DEFAULT '#FFFFFF',
	"export_formats" jsonb DEFAULT '["png","svg"]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "logo_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"industry" text NOT NULL,
	"style" text NOT NULL,
	"design" jsonb NOT NULL,
	"preview_image" text NOT NULL,
	"customizable_elements" jsonb NOT NULL,
	"color_schemes" jsonb NOT NULL,
	"is_pro" boolean DEFAULT false,
	"use_count" integer DEFAULT 0 NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_portal_id" varchar NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"transaction_type" text NOT NULL,
	"points" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"reference_type" text,
	"reference_id" varchar,
	"description" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "machine_assets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"machine_number" text NOT NULL,
	"machine_name" text,
	"machine_type" text NOT NULL,
	"manufacturer" text,
	"model" text,
	"serial_number" text,
	"capacity" numeric(10, 2),
	"install_date" timestamp,
	"iot_device_id" text,
	"mqtt_topic" text,
	"ip_address" varchar,
	"status" text DEFAULT 'active',
	"last_online_at" timestamp,
	"warranty_expiration" timestamp,
	"last_maintenance_date" timestamp,
	"next_maintenance_date" timestamp,
	"total_cycles" integer DEFAULT 0,
	"total_runtime_hours" numeric(10, 2) DEFAULT '0.00',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "machine_lifecycle_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"machine_id" varchar NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"purchase_price" numeric(12, 2),
	"purchase_date" timestamp,
	"financing_type" text,
	"monthly_payment" numeric(10, 2),
	"financing_term_months" integer,
	"depreciation_method" text DEFAULT 'straight_line',
	"useful_life_years" integer DEFAULT 10,
	"salvage_value" numeric(10, 2),
	"current_book_value" numeric(12, 2),
	"accumulated_depreciation" numeric(12, 2),
	"total_revenue" numeric(12, 2) DEFAULT '0.00',
	"average_revenue_per_month" numeric(10, 2),
	"revenue_per_cycle" numeric(6, 2),
	"total_repair_costs" numeric(12, 2) DEFAULT '0.00',
	"total_maintenance_costs" numeric(12, 2) DEFAULT '0.00',
	"total_parts_costs" numeric(12, 2) DEFAULT '0.00',
	"estimated_utility_cost" numeric(10, 2),
	"insurance_cost" numeric(10, 2),
	"tco_to_date" numeric(14, 2) DEFAULT '0.00',
	"projected_tco" numeric(14, 2),
	"cost_per_cycle" numeric(6, 2),
	"roi" numeric(8, 2),
	"payback_period_months" integer,
	"net_present_value" numeric(12, 2),
	"estimated_kwh_per_cycle" numeric(6, 2),
	"estimated_water_gallons_per_cycle" numeric(6, 2),
	"energy_star_rating" integer,
	"recommended_replacement_date" timestamp,
	"replacement_reason" text,
	"estimated_replacement_cost" numeric(12, 2),
	"trade_in_value" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "machine_predictive_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"machine_id" varchar NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"overall_health_score" integer DEFAULT 100,
	"mechanical_score" integer DEFAULT 100,
	"electrical_score" integer DEFAULT 100,
	"component_score" integer DEFAULT 100,
	"predicted_failure_date" timestamp,
	"failure_probability" numeric(5, 2),
	"most_likely_failure_type" text,
	"predicted_repair_cost" numeric(10, 2),
	"recommended_maintenance_date" timestamp,
	"maintenance_priority" text DEFAULT 'normal',
	"recommended_actions" text[],
	"avg_cycles_per_day" numeric(8, 2),
	"cycles_till_maintenance" integer,
	"usage_pattern" text,
	"bearing_wear_level" numeric(5, 2),
	"belt_condition" text DEFAULT 'good',
	"motor_condition" text DEFAULT 'good',
	"pump_condition" text DEFAULT 'good',
	"drain_condition" text DEFAULT 'good',
	"energy_efficiency_score" integer DEFAULT 100,
	"water_efficiency_score" integer DEFAULT 100,
	"estimated_monthly_cost" numeric(10, 2),
	"downtime_risk" text DEFAULT 'low',
	"estimated_revenue_loss" numeric(10, 2),
	"last_analyzed_at" timestamp DEFAULT now(),
	"model_version" text DEFAULT 'v1.0',
	"confidence_level" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "machine_sensor_data" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"machine_id" varchar,
	"temperature" numeric(5, 2),
	"vibration" numeric(7, 4),
	"humidity" numeric(5, 2),
	"water_pressure" numeric(6, 2),
	"power_consumption" numeric(8, 2),
	"cycle_time" integer,
	"water_usage" numeric(6, 2),
	"error_codes" jsonb,
	"anomaly_score" numeric(5, 4),
	"predicted_failure" text,
	"days_to_failure" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "machine_turn_fact" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"machine_id" varchar NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"total_cycles" integer DEFAULT 0,
	"avg_cycle_duration" integer,
	"total_runtime" integer,
	"utilization_rate" numeric(5, 2),
	"revenue_generated" numeric(10, 2) DEFAULT '0.00',
	"revenue_per_cycle" numeric(10, 2),
	"avg_load_weight" numeric(10, 2),
	"avg_energy_per_cycle" numeric(10, 2),
	"avg_water_per_cycle" numeric(10, 2),
	"downtime_minutes" integer DEFAULT 0,
	"error_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "machines" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"location_id" varchar,
	"machine_type" text NOT NULL,
	"manufacturer" text,
	"model" text,
	"serial_number" text,
	"capacity" numeric(5, 2),
	"iot_device_id" text,
	"connection_status" text DEFAULT 'offline',
	"firmware_version" text,
	"last_ping" timestamp,
	"price_per_cycle" numeric(6, 2),
	"current_price" numeric(6, 2),
	"total_cycles" integer DEFAULT 0 NOT NULL,
	"total_revenue" numeric(10, 2) DEFAULT '0' NOT NULL,
	"avg_turns_per_day" numeric(5, 2),
	"operational_status" text DEFAULT 'operational',
	"last_service_date" timestamp,
	"next_service_date" timestamp,
	"purchase_price" numeric(10, 2),
	"install_date" timestamp,
	"warranty_expiration" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "machines_iot_device_id_unique" UNIQUE("iot_device_id")
);
--> statement-breakpoint
CREATE TABLE "maintenance_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"machine_id" varchar NOT NULL,
	"plan_name" text NOT NULL,
	"description" text,
	"task_type" text NOT NULL,
	"frequency" integer NOT NULL,
	"frequency_unit" text NOT NULL,
	"last_completed_date" timestamp,
	"next_due_date" timestamp,
	"checklist_items" text[],
	"required_parts" text[],
	"estimated_duration" integer,
	"assigned_to" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_schedules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"machine_id" varchar,
	"maintenance_type" text NOT NULL,
	"predicted_issue" text,
	"severity" text NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"estimated_duration" integer,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"required_parts" jsonb,
	"estimated_cost" numeric(10, 2),
	"actual_cost" numeric(10, 2),
	"technician_id" varchar,
	"ai_confidence" numeric(5, 4),
	"ai_recommendations" text,
	"prevented_downtime" integer,
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_campaigns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"location_id" varchar,
	"name" text NOT NULL,
	"campaign_type" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"subject" text,
	"content" text,
	"cta_text" text,
	"cta_url" text,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"ai_provider" text,
	"target_audience" jsonb,
	"scheduled_date" timestamp,
	"end_date" timestamp,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"conversions" integer DEFAULT 0 NOT NULL,
	"revenue" numeric(10, 2) DEFAULT '0' NOT NULL,
	"cost" numeric(10, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_inquiries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" varchar,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'new',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_listings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"seller_name" text NOT NULL,
	"seller_email" text NOT NULL,
	"seller_phone" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"price" numeric(12, 2),
	"price_type" text DEFAULT 'fixed',
	"currency" text DEFAULT 'USD',
	"city" text,
	"state" text,
	"country" text DEFAULT 'USA',
	"zip_code" text,
	"manufacturer" text,
	"model" text,
	"year_made" integer,
	"quantity" integer DEFAULT 1,
	"condition" text,
	"images" text[],
	"status" text DEFAULT 'pending' NOT NULL,
	"approval_token" text,
	"denial_reason" text,
	"featured" boolean DEFAULT false,
	"listing_tier" text DEFAULT 'free',
	"views" integer DEFAULT 0 NOT NULL,
	"inquiries" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"expires_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"price" numeric(10, 2) NOT NULL,
	"compare_at_price" numeric(10, 2),
	"currency" text DEFAULT 'USD',
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"specifications" jsonb,
	"sku" text,
	"stock" integer DEFAULT 0,
	"is_in_stock" boolean DEFAULT true,
	"slug" text NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"views" integer DEFAULT 0 NOT NULL,
	"sales" integer DEFAULT 0 NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"project_id" varchar,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"url" text NOT NULL,
	"width" integer,
	"height" integer,
	"alt_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medication_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"medication_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"scheduled_time" timestamp NOT NULL,
	"taken_at" timestamp,
	"status" varchar NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" varchar,
	"name" varchar NOT NULL,
	"dosage" varchar NOT NULL,
	"frequency" varchar NOT NULL,
	"time_of_day" text,
	"purpose" text,
	"prescribed_by" varchar,
	"reminder_enabled" boolean DEFAULT true,
	"reminder_method" varchar DEFAULT 'email',
	"is_active" boolean DEFAULT true NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mileage_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"driver_id" varchar NOT NULL,
	"session_id" varchar,
	"trip_date" timestamp DEFAULT now() NOT NULL,
	"start_location" text,
	"end_location" text,
	"purpose" text,
	"start_odometer" numeric(10, 1),
	"end_odometer" numeric(10, 1),
	"total_miles" numeric(10, 2) NOT NULL,
	"reimbursement_rate" numeric(10, 2),
	"reimbursement_amount" numeric(10, 2),
	"reimbursement_status" text DEFAULT 'pending',
	"vehicle_id" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "module_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"module" text NOT NULL,
	"metric_type" text NOT NULL,
	"date" timestamp NOT NULL,
	"period" text NOT NULL,
	"value" numeric(12, 2) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nda_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" varchar,
	"user_id" varchar,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company_name" text,
	"nda_document" text,
	"ip_address" text,
	"user_agent" text,
	"signature" text,
	"signed_at" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_by" varchar,
	"approved_at" timestamp,
	"rejection_reason" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "new_product_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"email" varchar NOT NULL,
	"category" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_campaigns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"content" text NOT NULL,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"recipient_filter" jsonb,
	"recipient_count" integer DEFAULT 0,
	"total_sent" integer DEFAULT 0,
	"total_delivered" integer DEFAULT 0,
	"total_failed" integer DEFAULT 0,
	"total_opened" integer DEFAULT 0,
	"total_clicked" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"primary_industry" text NOT NULL,
	"industries" jsonb NOT NULL,
	"country_code" varchar(2),
	"language" varchar(5) DEFAULT 'en' NOT NULL,
	"timezone" text,
	"source" text NOT NULL,
	"source_url" text,
	"source_blog_id" varchar,
	"source_keyword" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"status" text DEFAULT 'active' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"frequency" text DEFAULT 'weekly',
	"content_preferences" jsonb,
	"email_format" text DEFAULT 'html',
	"total_emails_sent" integer DEFAULT 0 NOT NULL,
	"total_emails_opened" integer DEFAULT 0 NOT NULL,
	"total_links_clicked" integer DEFAULT 0 NOT NULL,
	"last_email_sent" timestamp,
	"last_email_opened" timestamp,
	"last_link_clicked" timestamp,
	"engagement_score" integer DEFAULT 0 NOT NULL,
	"lead_score" integer DEFAULT 0 NOT NULL,
	"lead_status" text DEFAULT 'cold',
	"cleanbi_reports_generated" integer DEFAULT 0 NOT NULL,
	"pdf_downloads" integer DEFAULT 0 NOT NULL,
	"unsubscribed_at" timestamp,
	"unsubscribe_reason" text,
	"resend_contact_id" text,
	"resend_audience_id" text,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "onboarding_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"overall_progress" integer DEFAULT 0,
	"current_step" integer DEFAULT 1,
	"total_steps" integer DEFAULT 10,
	"business_profile_complete" boolean DEFAULT false,
	"stripe_connected" boolean DEFAULT false,
	"machines_added" boolean DEFAULT false,
	"pricing_configured" boolean DEFAULT false,
	"staff_added" boolean DEFAULT false,
	"customers_imported" boolean DEFAULT false,
	"routes_configured" boolean DEFAULT false,
	"inventory_setup" boolean DEFAULT false,
	"branding_customized" boolean DEFAULT false,
	"test_order_completed" boolean DEFAULT false,
	"steps_completed_at" jsonb,
	"step_notes" jsonb,
	"training_videos_watched" text[],
	"quiz_scores" jsonb,
	"support_ticket_ids" text[],
	"onboarding_call_scheduled" boolean DEFAULT false,
	"onboarding_call_date" timestamp,
	"status" text DEFAULT 'in_progress',
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "online_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"business_profile_id" varchar NOT NULL,
	"order_number" varchar NOT NULL,
	"order_type" varchar NOT NULL,
	"status" varchar DEFAULT 'pending',
	"customer_name" varchar NOT NULL,
	"customer_email" varchar,
	"customer_phone" varchar,
	"service_type" varchar,
	"items" jsonb DEFAULT '[]'::jsonb,
	"subtotal" numeric(10, 2),
	"tax" numeric(10, 2),
	"delivery_fee" numeric(10, 2),
	"discount" numeric(10, 2),
	"total" numeric(10, 2) NOT NULL,
	"pickup_date" timestamp,
	"pickup_time_slot" varchar,
	"delivery_date" timestamp,
	"delivery_time_slot" varchar,
	"pickup_address" text,
	"delivery_address" text,
	"special_instructions" text,
	"internal_notes" text,
	"order_source" varchar DEFAULT 'website',
	"payment_status" varchar DEFAULT 'unpaid',
	"stripe_payment_intent_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_order_id" varchar NOT NULL,
	"pos_transaction_id" varchar,
	"description" text NOT NULL,
	"quantity" integer DEFAULT 1,
	"weight" numeric(10, 2),
	"price_per_pound" numeric(10, 2),
	"amount" numeric(10, 2) NOT NULL,
	"service_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_traffic" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"language" varchar(5) NOT NULL,
	"date" timestamp NOT NULL,
	"sessions" integer DEFAULT 0 NOT NULL,
	"pageviews" integer DEFAULT 0 NOT NULL,
	"unique_visitors" integer DEFAULT 0 NOT NULL,
	"avg_session_duration" integer,
	"bounce_rate" numeric(5, 2),
	"top_landing_page" text,
	"landing_page_breakdown" jsonb,
	"cleanbi_scores_generated" integer DEFAULT 0 NOT NULL,
	"reports_purchased" integer DEFAULT 0 NOT NULL,
	"conversion_rate" numeric(5, 2),
	"revenue" numeric(12, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_sections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" varchar NOT NULL,
	"type" text NOT NULL,
	"order" integer NOT NULL,
	"layout" text DEFAULT 'default',
	"background_color" text,
	"background_image" text,
	"content" jsonb NOT NULL,
	"padding" text DEFAULT 'normal',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_seo_metadata" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_path" varchar NOT NULL,
	"page_type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"keywords" jsonb NOT NULL,
	"faqs" jsonb NOT NULL,
	"features" jsonb NOT NULL,
	"reviews" jsonb NOT NULL,
	"og_title" varchar,
	"og_description" text,
	"twitter_title" varchar,
	"twitter_description" text,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"ai_model" varchar DEFAULT 'gemini-2.0-flash-exp' NOT NULL,
	"regenerate_count" integer DEFAULT 0 NOT NULL,
	"is_manually_edited" boolean DEFAULT false NOT NULL,
	"last_edited_by" varchar,
	"last_edited_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "page_seo_metadata_page_path_unique" UNIQUE("page_path")
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" varchar,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"part_number" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"category" text NOT NULL,
	"compatibility" jsonb NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "parts_inventory" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"part_number" text NOT NULL,
	"part_name" text NOT NULL,
	"description" text,
	"category" text,
	"manufacturer" text,
	"machine_models" text[],
	"quantity_on_hand" integer DEFAULT 0,
	"quantity_reserved" integer DEFAULT 0,
	"reorder_point" integer DEFAULT 2,
	"reorder_quantity" integer DEFAULT 5,
	"unit_cost" numeric(10, 2),
	"retail_price" numeric(10, 2),
	"bin_location" text,
	"preferred_vendor_id" varchar,
	"vendor_part_number" text,
	"is_active" boolean DEFAULT true,
	"discontinued_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parts_vendors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar,
	"vendor_name" text NOT NULL,
	"vendor_code" text,
	"contact_name" text,
	"email" varchar,
	"phone" varchar,
	"website" text,
	"address" text,
	"city" text,
	"state" text,
	"zip" varchar,
	"country" text DEFAULT 'US',
	"specializations" text[],
	"brands_carried" text[],
	"payment_terms" text,
	"shipping_terms" text,
	"minimum_order" numeric(10, 2),
	"average_delivery_days" integer,
	"reliability_score" integer,
	"account_number" text,
	"tax_id" text,
	"is_preferred" boolean DEFAULT false,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_settlements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"settlement_date" timestamp NOT NULL,
	"stripe_payout_id" text,
	"gross_amount" numeric(10, 2) NOT NULL,
	"fees" numeric(10, 2) NOT NULL,
	"net_amount" numeric(10, 2) NOT NULL,
	"transaction_ids" text[],
	"transaction_count" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_runs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pipeline_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"input_prompt" text,
	"input_data" jsonb,
	"status" varchar DEFAULT 'queued',
	"current_stage" varchar,
	"progress" integer DEFAULT 0,
	"agent_log" jsonb,
	"output_artifacts" jsonb,
	"generated_content" text,
	"total_tokens_used" integer DEFAULT 0,
	"total_cost" numeric(10, 4) DEFAULT '0.0000',
	"generation_time_seconds" integer,
	"quality_score" integer,
	"human_review_status" varchar DEFAULT 'pending',
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" varchar NOT NULL,
	"key" varchar NOT NULL,
	"value" jsonb NOT NULL,
	"data_type" varchar NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" varchar,
	CONSTRAINT "platform_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "pos_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" varchar NOT NULL,
	"item_type" text NOT NULL,
	"description" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"weight" numeric(10, 2),
	"price_per_pound" numeric(10, 2),
	"unit_price" numeric(10, 2),
	"subtotal" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pos_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"customer_id" varchar,
	"customer_name" text,
	"customer_phone" varchar,
	"customer_email" varchar,
	"transaction_number" text NOT NULL,
	"order_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"total_weight" numeric(10, 2),
	"price_per_pound" numeric(10, 2),
	"subtotal" numeric(10, 2) NOT NULL,
	"tax" numeric(10, 2) DEFAULT '0.00',
	"discount" numeric(10, 2) DEFAULT '0.00',
	"total" numeric(10, 2) NOT NULL,
	"payment_method" text,
	"payment_status" text DEFAULT 'unpaid',
	"stripe_payment_intent_id" text,
	"assigned_to" varchar,
	"machine_ids" text[],
	"dropoff_time" timestamp,
	"promised_time" timestamp,
	"completed_time" timestamp,
	"pickedup_time" timestamp,
	"special_instructions" text,
	"internal_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pos_transactions_transaction_number_unique" UNIQUE("transaction_number")
);
--> statement-breakpoint
CREATE TABLE "premium_packages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"features" text[],
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"billing_period" text NOT NULL,
	"featured_homepage" boolean DEFAULT false,
	"priority_search" boolean DEFAULT false,
	"visibility_boost_level" integer DEFAULT 0,
	"cleanbi_reports_included" integer DEFAULT 0,
	"valuation_reports_included" integer DEFAULT 0,
	"active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"email" varchar NOT NULL,
	"product_asin" varchar NOT NULL,
	"product_title" varchar NOT NULL,
	"target_price" numeric(10, 2) NOT NULL,
	"current_price" numeric(10, 2),
	"alert_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_checked" timestamp
);
--> statement-breakpoint
CREATE TABLE "pricing_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"location_id" varchar,
	"name" text NOT NULL,
	"rule_type" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"conditions" jsonb NOT NULL,
	"adjustment_type" text NOT NULL,
	"adjustment_value" numeric(6, 2) NOT NULL,
	"min_price" numeric(6, 2),
	"max_price" numeric(6, 2),
	"ai_suggested" boolean DEFAULT false NOT NULL,
	"estimated_revenue_impact" numeric(10, 2),
	"total_applications" integer DEFAULT 0 NOT NULL,
	"revenue_generated" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" varchar,
	"project_id" varchar,
	"job_name" varchar NOT NULL,
	"book_type" varchar NOT NULL,
	"intelligence_tier" varchar DEFAULT 'standard',
	"target_word_count" integer DEFAULT 50000,
	"status" varchar DEFAULT 'queued',
	"current_stage" integer DEFAULT 0,
	"progress" integer DEFAULT 0,
	"research_completed_at" timestamp,
	"outline_completed_at" timestamp,
	"writing_completed_at" timestamp,
	"analysis_completed_at" timestamp,
	"imaging_completed_at" timestamp,
	"review_completed_at" timestamp,
	"export_completed_at" timestamp,
	"estimated_cost" numeric(10, 2),
	"actual_cost" numeric(10, 2),
	"tokens_used" integer DEFAULT 0,
	"config" jsonb,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"workflow_mode" varchar DEFAULT 'auto',
	"requires_approval" boolean DEFAULT false,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production_queue" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" varchar,
	"queue_name" varchar NOT NULL,
	"books_per_day" integer DEFAULT 10,
	"intelligence_tier" varchar DEFAULT 'standard',
	"status" varchar DEFAULT 'active',
	"total_books" integer DEFAULT 0,
	"completed_books" integer DEFAULT 0,
	"failed_books" integer DEFAULT 0,
	"start_date" timestamp,
	"end_date" timestamp,
	"next_run_at" timestamp,
	"book_templates" jsonb,
	"total_estimated_cost" numeric(12, 2),
	"total_actual_cost" numeric(12, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress_milestones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" varchar,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"category" varchar NOT NULL,
	"achieved_at" timestamp DEFAULT now() NOT NULL,
	"celebration_message" text,
	"photo_url" text,
	"notes" text,
	"shared" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_code_redemptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"promo_code_id" varchar NOT NULL,
	"user_id" varchar,
	"email" varchar NOT NULL,
	"product_type" varchar NOT NULL,
	"original_amount" integer NOT NULL,
	"discount_amount" integer NOT NULL,
	"final_amount" integer NOT NULL,
	"stripe_checkout_session_id" varchar,
	"stripe_payment_intent_id" varchar,
	"redeemed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar NOT NULL,
	"description" text,
	"discount_type" varchar NOT NULL,
	"discount_amount" integer NOT NULL,
	"stripe_coupon_id" varchar,
	"stripe_promotion_code_id" varchar,
	"max_redemptions" integer,
	"max_redemptions_per_user" integer DEFAULT 1,
	"current_redemptions" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"applicable_products" text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "proof_of_delivery" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_id" varchar NOT NULL,
	"transaction_id" varchar NOT NULL,
	"delivered_at" timestamp NOT NULL,
	"delivered_by" varchar NOT NULL,
	"recipient_name" text,
	"recipient_relation" text,
	"signature_url" text,
	"photo_urls" text[],
	"gps_coordinates" jsonb,
	"delivery_method" text,
	"delivery_location" text,
	"customer_rating" integer,
	"customer_feedback" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"lesson_id" varchar NOT NULL,
	"score" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"correct_answers" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"passed" boolean NOT NULL,
	"time_spent" integer,
	"attempt_number" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" varchar NOT NULL,
	"question" text NOT NULL,
	"question_type" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_answer" text,
	"explanation" text,
	"points" integer DEFAULT 1,
	"order_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" varchar NOT NULL,
	"endpoint" varchar NOT NULL,
	"request_count" integer DEFAULT 1 NOT NULL,
	"window_start" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"chapter_id" varchar NOT NULL,
	"progress_percent" integer DEFAULT 0,
	"completed" boolean DEFAULT false,
	"time_spent_seconds" integer DEFAULT 0,
	"last_position" integer,
	"bookmarked" boolean DEFAULT false,
	"highlights" jsonb,
	"notes" text,
	"last_read_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "recovery_goals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" varchar,
	"title" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"goal_type" varchar NOT NULL,
	"target_date" timestamp,
	"status" varchar DEFAULT 'in_progress',
	"completed_at" timestamp,
	"milestone_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regional_pricing" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"country_name" text NOT NULL,
	"region" text NOT NULL,
	"currency" varchar(3) NOT NULL,
	"currency_symbol" varchar(5) NOT NULL,
	"basic_report_price" integer NOT NULL,
	"standard_report_price" integer NOT NULL,
	"premium_report_price" integer NOT NULL,
	"monthly_subscription_price" integer NOT NULL,
	"ppp_multiplier" numeric(5, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"stripe_basic_price_id" text,
	"stripe_standard_price_id" text,
	"stripe_premium_price_id" text,
	"stripe_subscription_price_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repair_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"machine_id" varchar NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"repair_number" text NOT NULL,
	"repair_type" text NOT NULL,
	"issue_category" text NOT NULL,
	"issue_title" text NOT NULL,
	"issue_description" text,
	"symptoms_reported" text[],
	"error_codes" text[],
	"severity" text DEFAULT 'medium',
	"priority" integer DEFAULT 5,
	"resolution_description" text,
	"root_cause" text,
	"work_performed" text[],
	"technician_id" varchar,
	"technician_name" text,
	"technician_company" text,
	"reported_at" timestamp DEFAULT now() NOT NULL,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"labor_hours" numeric(6, 2),
	"labor_rate" numeric(8, 2),
	"labor_cost" numeric(10, 2),
	"travel_time" numeric(4, 2),
	"travel_cost" numeric(8, 2),
	"parts_cost" numeric(10, 2) DEFAULT '0.00',
	"total_cost" numeric(12, 2) DEFAULT '0.00',
	"warranty_repair" boolean DEFAULT false,
	"warranty_claim_number" text,
	"warranty_provider" text,
	"status" text DEFAULT 'open',
	"follow_up_required" boolean DEFAULT false,
	"follow_up_date" timestamp,
	"follow_up_notes" text,
	"photos" text[],
	"documents" text[],
	"cycle_count_at_repair" integer,
	"machine_age_days" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "repair_logs_repair_number_unique" UNIQUE("repair_number")
);
--> statement-breakpoint
CREATE TABLE "repair_parts_used" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repair_log_id" varchar NOT NULL,
	"part_inventory_id" varchar,
	"part_name" text NOT NULL,
	"part_number" text,
	"manufacturer" text,
	"quantity" integer DEFAULT 1,
	"unit_cost" numeric(10, 2),
	"total_cost" numeric(10, 2),
	"source" text DEFAULT 'inventory',
	"vendor_id" varchar,
	"vendor_name" text,
	"part_warranty_months" integer,
	"part_warranty_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repair_tickets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"machine_id" varchar NOT NULL,
	"ticket_number" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"priority" text DEFAULT 'medium',
	"problem_type" text,
	"diagnostic_code" text,
	"symptoms" text[],
	"reported_by" varchar,
	"assigned_to" varchar,
	"vendor_id" varchar,
	"status" text DEFAULT 'open',
	"reported_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"resolution_notes" text,
	"parts_used" jsonb,
	"labor_hours" numeric(10, 2),
	"labor_cost" numeric(10, 2),
	"parts_cost" numeric(10, 2),
	"total_cost" numeric(10, 2),
	"photo_urls" text[],
	"attachments" text[],
	"warranty_applied" boolean DEFAULT false,
	"follow_up_required" boolean DEFAULT false,
	"follow_up_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "repair_tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "reputation_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"points" integer NOT NULL,
	"reason" text NOT NULL,
	"entity_type" text,
	"entity_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "residential_scores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"address" text NOT NULL,
	"property_value_trend" integer NOT NULL,
	"neighborhood_quality" integer NOT NULL,
	"school_rating" integer NOT NULL,
	"crime_score" integer NOT NULL,
	"walkability" integer NOT NULL,
	"total_score" integer NOT NULL,
	"grade" text NOT NULL,
	"property_type" text,
	"estimated_value" numeric(12, 2),
	"year_built" integer,
	"square_feet" integer,
	"bedrooms" integer,
	"bathrooms" numeric(3, 1),
	"lot_size" numeric(10, 2),
	"median_income" numeric(10, 2),
	"population_density" integer,
	"avg_school_rating" numeric(3, 1),
	"walk_score" integer,
	"rental_potential" text,
	"appreciation_rate" numeric(5, 2),
	"ai_insights" text,
	"recommendations" jsonb,
	"breakdown" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_usage" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_id" varchar NOT NULL,
	"user_id" varchar,
	"action_type" text NOT NULL,
	"input_data" jsonb,
	"result_data" jsonb,
	"session_id" text,
	"ip_address" text,
	"user_agent" text,
	"used_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"slug" text NOT NULL,
	"resource_type" text NOT NULL,
	"category" text NOT NULL,
	"target_audience" text[] NOT NULL,
	"business_stage" text[],
	"content" text,
	"embed_url" text,
	"preview_image" text,
	"calculator_inputs" jsonb,
	"calculator_formulas" jsonb,
	"is_premium" boolean DEFAULT false NOT NULL,
	"required_tier" text,
	"price" numeric(10, 2),
	"tags" text[],
	"difficulty" text,
	"estimated_time" integer,
	"featured" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"use_count" integer DEFAULT 0 NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"rating" numeric(3, 2),
	"review_count" integer DEFAULT 0 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "resources_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"target_type" text NOT NULL,
	"target_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"helpful_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_stops" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" varchar NOT NULL,
	"transaction_id" varchar,
	"stop_number" integer NOT NULL,
	"stop_type" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" varchar,
	"address" text NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"special_instructions" text,
	"scheduled_arrival" timestamp,
	"actual_arrival" timestamp,
	"completed_at" timestamp,
	"status" text DEFAULT 'pending',
	"signature_url" text,
	"photo_urls" text[],
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"route_name" text NOT NULL,
	"route_type" text NOT NULL,
	"route_date" timestamp NOT NULL,
	"driver_id" varchar,
	"vehicle_id" text,
	"optimized_sequence" jsonb,
	"total_distance" numeric(10, 2),
	"estimated_duration" integer,
	"status" text DEFAULT 'planned',
	"start_time" timestamp,
	"end_time" timestamp,
	"actual_distance" numeric(10, 2),
	"actual_duration" integer,
	"on_time_stops" integer DEFAULT 0,
	"late_stops" integer DEFAULT 0,
	"total_stops" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_search_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"saved_search_id" varchar NOT NULL,
	"listing_id" varchar NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_searches" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"filters" jsonb NOT NULL,
	"alert_frequency" text DEFAULT 'daily' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_notified_at" timestamp,
	"last_match_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scale_calibrations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"scale_id" text NOT NULL,
	"scale_name" text,
	"calibration_date" timestamp NOT NULL,
	"calibrated_by" varchar NOT NULL,
	"test_weight" numeric(10, 2) NOT NULL,
	"measured_weight" numeric(10, 2) NOT NULL,
	"variance" numeric(10, 2) NOT NULL,
	"passed" boolean NOT NULL,
	"notes" text,
	"next_calibration_due" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schema_markup_library" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"schema_type" text NOT NULL,
	"schema_data" jsonb NOT NULL,
	"is_valid" boolean DEFAULT true,
	"validation_errors" jsonb,
	"is_deployed" boolean DEFAULT false,
	"deployed_at" timestamp,
	"eligible_for_rich_results" boolean DEFAULT false,
	"rich_result_types" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query" text NOT NULL,
	"results_count" integer DEFAULT 0,
	"clicked_result" varchar,
	"click_position" integer,
	"user_id" varchar,
	"session_id" text,
	"searched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_index" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"content_id" varchar,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"keywords" text[],
	"searchable_content" text,
	"category" text,
	"search_rank" integer DEFAULT 0,
	"popularity" integer DEFAULT 0,
	"image_url" text,
	"price" numeric(10, 2),
	"metadata" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sensor_thresholds" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"machine_id" varchar NOT NULL,
	"sensor_type" text NOT NULL,
	"min_value" numeric(10, 2),
	"max_value" numeric(10, 2),
	"critical_min" numeric(10, 2),
	"critical_max" numeric(10, 2),
	"alert_enabled" boolean DEFAULT true,
	"alert_recipients" text[],
	"alert_severity" text DEFAULT 'warning',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_agent_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"icon" text,
	"system_prompt" text NOT NULL,
	"capabilities" text[] DEFAULT ARRAY[]::text[],
	"tools" text[] DEFAULT ARRAY[]::text[],
	"provider" text DEFAULT 'openai',
	"model" text DEFAULT 'gpt-4',
	"is_premium" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"rating" numeric(3, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_agents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"project_id" varchar,
	"template_id" varchar,
	"name" text NOT NULL,
	"description" text,
	"system_prompt" text NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"tools" text[] DEFAULT ARRAY[]::text[],
	"capabilities" text[] DEFAULT ARRAY[]::text[],
	"conversation_history" jsonb DEFAULT '[]'::jsonb,
	"learning_data" jsonb DEFAULT '{}'::jsonb,
	"tasks_completed" integer DEFAULT 0,
	"success_rate" numeric(5, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_audits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"total_score" integer NOT NULL,
	"percentage" integer NOT NULL,
	"grade" text NOT NULL,
	"base_seo_score" integer NOT NULL,
	"eeat_score" integer NOT NULL,
	"core_web_vitals_score" integer NOT NULL,
	"backlinks_score" integer NOT NULL,
	"local_seo_score" integer NOT NULL,
	"mobile_score" integer NOT NULL,
	"security_score" integer NOT NULL,
	"accessibility_score" integer NOT NULL,
	"engagement_score" integer NOT NULL,
	"freshness_score" integer NOT NULL,
	"international_score" integer NOT NULL,
	"aeo_score" integer NOT NULL,
	"technical_score" integer NOT NULL,
	"brand_score" integer NOT NULL,
	"ux_score" integer NOT NULL,
	"conversion_score" integer NOT NULL,
	"video_score" integer NOT NULL,
	"rich_results_score" integer NOT NULL,
	"competitive_score" integer NOT NULL,
	"content_depth_score" integer NOT NULL,
	"breakdown" jsonb NOT NULL,
	"recommendations" jsonb NOT NULL,
	"competitive_analysis" jsonb,
	"audited_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_automation_tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_type" text NOT NULL,
	"task_name" text NOT NULL,
	"description" text,
	"target_url" text,
	"target_keyword" text,
	"frequency" text,
	"next_run_at" timestamp,
	"last_run_at" timestamp,
	"status" text DEFAULT 'pending',
	"priority" integer DEFAULT 5,
	"ai_model" text,
	"agent_prompt" text,
	"agent_config" jsonb,
	"execution_results" jsonb,
	"error_message" text,
	"user_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_backlinks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"source_url" text NOT NULL,
	"source_domain" text NOT NULL,
	"target_url" text NOT NULL,
	"anchor_text" text,
	"rel" text,
	"is_nofollow" boolean DEFAULT false NOT NULL,
	"link_type" text,
	"domain_authority" integer,
	"page_authority" integer,
	"spam_score" integer,
	"link_quality" text,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"is_live" boolean DEFAULT true NOT NULL,
	"discovery_source" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_competitors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"domain" text NOT NULL,
	"name" text,
	"estimated_traffic" integer,
	"domain_authority" integer,
	"backlinks_count" integer,
	"keywords_ranking" integer,
	"visibility_score" integer,
	"last_analyzed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_indexing_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"url" text NOT NULL,
	"url_type" text NOT NULL,
	"google_status" text DEFAULT 'pending',
	"bing_status" text DEFAULT 'pending',
	"google_indexed_at" timestamp,
	"bing_indexed_at" timestamp,
	"google_error" text,
	"bing_error" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_keywords" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"keyword" text NOT NULL,
	"language" varchar(5) NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"intent" text NOT NULL,
	"category" text NOT NULL,
	"priority" integer DEFAULT 5 NOT NULL,
	"target_position" integer DEFAULT 1 NOT NULL,
	"monthly_search_volume" integer,
	"competition_level" text,
	"cpc_estimate" numeric(6, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_tracking" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"total_score" integer NOT NULL,
	"organic_traffic" integer DEFAULT 0,
	"avg_position" numeric(5, 2),
	"backlinks" integer DEFAULT 0,
	"indexed_pages" integer DEFAULT 0,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_projects" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"primary_keywords" text[] DEFAULT ARRAY[]::text[],
	"secondary_keywords" text[] DEFAULT ARRAY[]::text[],
	"competitors" text[] DEFAULT ARRAY[]::text[],
	"current_score" integer DEFAULT 0,
	"target_score" integer DEFAULT 250,
	"enable_local_seo" boolean DEFAULT false,
	"enable_backlink_tracking" boolean DEFAULT true,
	"enable_auto_indexing" boolean DEFAULT true,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_publications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"connection_id" varchar NOT NULL,
	"blog_post_id" varchar,
	"project_id" varchar,
	"external_post_id" text,
	"external_url" text,
	"title" text NOT NULL,
	"slug" text,
	"status" text DEFAULT 'pending',
	"published_at" timestamp,
	"last_synced_at" timestamp,
	"error" text,
	"retry_count" integer DEFAULT 0,
	"views" integer DEFAULT 0,
	"engagement" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_recommendations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"page_id" varchar,
	"type" text NOT NULL,
	"priority" integer DEFAULT 5,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"rationale" text,
	"estimated_impact" text,
	"estimated_effort" text,
	"action_items" jsonb,
	"resources_needed" jsonb,
	"status" text DEFAULT 'pending',
	"completed_at" timestamp,
	"ai_generated" boolean DEFAULT true NOT NULL,
	"ai_provider" text,
	"confidence" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"audit_id" varchar,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"priority" text NOT NULL,
	"impact" integer NOT NULL,
	"effort" text NOT NULL,
	"estimated_time" text NOT NULL,
	"status" text DEFAULT 'pending',
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "serp_results_cache" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar,
	"keyword" text NOT NULL,
	"query_type" varchar DEFAULT 'search',
	"location" varchar,
	"organic_results" jsonb,
	"related_searches" jsonb,
	"people_also_ask" jsonb,
	"serp_features" jsonb,
	"search_volume" integer,
	"difficulty" integer,
	"cpc" numeric(10, 2),
	"opportunity_score" integer,
	"content_suggestions" jsonb,
	"expires_at" timestamp,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "serp_snapshots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"keyword_id" varchar NOT NULL,
	"location_name" text,
	"latitude" numeric(10, 6),
	"longitude" numeric(10, 6),
	"country_code" varchar(2),
	"position" integer,
	"url" text,
	"title" text,
	"snippet" text,
	"features" jsonb,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "serp_tracking" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"keyword" text NOT NULL,
	"target_url" text NOT NULL,
	"current_position" integer,
	"previous_position" integer,
	"position_change" integer,
	"has_featured_snippet" boolean DEFAULT false,
	"has_local_pack" boolean DEFAULT false,
	"has_people_also_ask" boolean DEFAULT false,
	"has_knowledge_panel" boolean DEFAULT false,
	"has_video_carousel" boolean DEFAULT false,
	"has_image_pack" boolean DEFAULT false,
	"featured_snippet_opportunity" boolean DEFAULT false,
	"quick_win_opportunity" boolean DEFAULT false,
	"serp_features" jsonb,
	"top_competitors" jsonb,
	"search_intent" text,
	"intent_confidence" numeric(5, 2),
	"search_volume" integer,
	"cpc" numeric(10, 2),
	"difficulty" integer,
	"location" text DEFAULT 'US',
	"device" text DEFAULT 'desktop',
	"checked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_cards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"project_id" varchar,
	"business_profile_id" varchar,
	"title" varchar NOT NULL,
	"description" text,
	"icon" varchar,
	"image_url" text,
	"price" varchar,
	"pricing_note" varchar,
	"cta_text" varchar DEFAULT 'Learn More',
	"cta_link" varchar,
	"order" integer DEFAULT 0,
	"is_highlighted" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_guy_ai_conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"technician_id" varchar,
	"laundromat_id" varchar,
	"machine_id" varchar,
	"repair_log_id" varchar,
	"session_id" varchar NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"error_codes" text[],
	"machine_type" text,
	"manufacturer" text,
	"model" text,
	"suggested_parts" text[],
	"suggested_actions" text[],
	"video_links" text[],
	"document_links" text[],
	"estimated_repair_time" numeric(4, 2),
	"confidence_score" numeric(5, 2),
	"was_helpful" boolean,
	"feedback_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"customer_id" varchar,
	"order_number" text NOT NULL,
	"service_type" text NOT NULL,
	"frequency" text,
	"recurring_amount" numeric(10, 2),
	"next_service_date" timestamp,
	"last_service_date" timestamp,
	"status" text DEFAULT 'active',
	"route_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_audits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain" text NOT NULL,
	"total_pages" integer,
	"crawled_pages" integer,
	"error_pages" integer,
	"redirect_pages" integer,
	"broken_links" integer,
	"missing_titles" integer,
	"duplicate_titles" integer,
	"missing_descriptions" integer,
	"duplicate_descriptions" integer,
	"missing_h1" integer,
	"multiple_h1" integer,
	"missing_alt_tags" integer,
	"avg_page_speed" integer,
	"avg_first_contentful_paint" integer,
	"avg_largest_contentful_paint" integer,
	"avg_cumulative_layout_shift" numeric(5, 3),
	"avg_time_to_interactive" integer,
	"core_web_vitals_score" integer,
	"mobile_friendly" boolean DEFAULT true,
	"https_enabled" boolean DEFAULT true,
	"has_security_headers" boolean DEFAULT false,
	"has_sitemap" boolean DEFAULT false,
	"has_robots_txt" boolean DEFAULT false,
	"indexable_pages" integer,
	"blocked_by_robots" integer,
	"noindex_pages" integer,
	"canonical_issues" integer,
	"overall_health_score" integer,
	"critical_issues" integer,
	"warning_issues" integer,
	"issue_breakdown" jsonb,
	"recommendations" jsonb,
	"audited_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_pages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"seo_mode" text DEFAULT 'auto',
	"meta_title" text,
	"meta_description" text,
	"meta_keywords" jsonb,
	"canonical_url" text,
	"og_title" text,
	"og_description" text,
	"og_image" text,
	"og_type" text DEFAULT 'website',
	"twitter_card" text DEFAULT 'summary_large_image',
	"twitter_title" text,
	"twitter_description" text,
	"twitter_image" text,
	"last_ai_generated" timestamp,
	"manual_overrides" jsonb,
	"seo_score" integer DEFAULT 0,
	"seo_issues" jsonb,
	"is_published" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_projects" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"industry" text DEFAULT 'laundromat',
	"custom_domain" text,
	"subdomain" text,
	"theme" text DEFAULT 'modern',
	"primary_color" text DEFAULT '#C8A661',
	"secondary_color" text DEFAULT '#1a2332',
	"font_family" text DEFAULT 'Inter',
	"site_title" text,
	"site_description" text,
	"seo_keywords" jsonb,
	"is_published" boolean DEFAULT false,
	"published_url" text,
	"total_views" integer DEFAULT 0 NOT NULL,
	"total_leads" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	CONSTRAINT "site_projects_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
CREATE TABLE "social_shares" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"content_type" text NOT NULL,
	"content_id" varchar NOT NULL,
	"content_url" text NOT NULL,
	"platform" text NOT NULL,
	"share_url" text NOT NULL,
	"affiliate_code" text,
	"clicks" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"shared_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"company_name" varchar NOT NULL,
	"contact_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"website" varchar,
	"logo_url" varchar,
	"tagline" varchar,
	"description" text,
	"stripe_customer_id" varchar,
	"status" varchar DEFAULT 'pending',
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sponsorships" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sponsor_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"stripe_subscription_id" varchar,
	"stripe_payment_intent_id" varchar,
	"billing_cycle" varchar,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"status" varchar DEFAULT 'pending',
	"start_date" timestamp,
	"end_date" timestamp,
	"next_billing_date" timestamp,
	"custom_content" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"email" varchar NOT NULL,
	"product_asin" varchar NOT NULL,
	"product_title" varchar NOT NULL,
	"alert_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "style_training_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"voice_profile_id" varchar,
	"session_type" varchar NOT NULL,
	"status" varchar DEFAULT 'active',
	"messages" jsonb,
	"writing_samples" jsonb,
	"analysis_results" jsonb,
	"style_insights" jsonb,
	"samples_analyzed" integer DEFAULT 0,
	"words_analyzed" integer DEFAULT 0,
	"questions_asked" integer DEFAULT 0,
	"questions_answered" integer DEFAULT 0,
	"ai_provider" varchar DEFAULT 'gemini',
	"tokens_used" integer DEFAULT 0,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"customer_id" varchar,
	"plan_name" text NOT NULL,
	"plan_type" text NOT NULL,
	"pound_limit" integer,
	"pounds_used" integer DEFAULT 0,
	"monthly_price" numeric(10, 2) NOT NULL,
	"overage_rate" numeric(10, 2),
	"stripe_subscription_id" text,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supply_listings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"brand" text,
	"sku" text,
	"quantity" integer DEFAULT 1,
	"unit" text DEFAULT 'each',
	"price" numeric(10, 2) NOT NULL,
	"price_type" text DEFAULT 'each',
	"currency" text DEFAULT 'USD',
	"minimum_order" integer DEFAULT 1,
	"condition" text DEFAULT 'new',
	"expiration_date" timestamp,
	"city" text,
	"state" text,
	"country" text DEFAULT 'US',
	"ships_nationally" boolean DEFAULT true,
	"local_pickup_only" boolean DEFAULT false,
	"images" text[],
	"videos" text[],
	"featured_image" text,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"status" text DEFAULT 'active',
	"views" integer DEFAULT 0,
	"inquiries" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technician_dispatches" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repair_log_id" varchar NOT NULL,
	"technician_id" varchar NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"scheduled_time_slot" text,
	"estimated_duration" numeric(4, 2),
	"status" text DEFAULT 'scheduled',
	"dispatched_at" timestamp,
	"en_route_at" timestamp,
	"arrived_at" timestamp,
	"completed_at" timestamp,
	"current_latitude" numeric(10, 7),
	"current_longitude" numeric(10, 7),
	"estimated_arrival" timestamp,
	"dispatch_notes" text,
	"technician_notes" text,
	"customer_rating" integer,
	"customer_feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technicians" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar,
	"phone" varchar NOT NULL,
	"profile_image" text,
	"company_name" text,
	"is_internal" boolean DEFAULT false,
	"certifications" text[],
	"specializations" text[],
	"average_rating" numeric(3, 2),
	"total_repairs" integer DEFAULT 0,
	"hourly_rate" numeric(8, 2),
	"callout_fee" numeric(8, 2),
	"is_available" boolean DEFAULT true,
	"service_radius_miles" integer DEFAULT 50,
	"base_address" text,
	"base_city" text,
	"base_state" text,
	"base_zip" varchar,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telemetry_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"machine_id" varchar NOT NULL,
	"event_type" text NOT NULL,
	"temperature" numeric(10, 2),
	"vibration" numeric(10, 2),
	"water_flow" numeric(10, 2),
	"water_pressure" numeric(10, 2),
	"energy_usage" numeric(10, 2),
	"door_status" text,
	"cycle_phase" text,
	"cycle_id" varchar,
	"cycle_start_time" timestamp,
	"cycle_end_time" timestamp,
	"cycle_duration" integer,
	"error_code" text,
	"error_message" text,
	"raw_payload" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_downloads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"amount" numeric(10, 2),
	"stripe_payment_id" text,
	"downloaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"preview" text,
	"content" jsonb NOT NULL,
	"is_premium" boolean DEFAULT true NOT NULL,
	"price" numeric(10, 2),
	"stripe_product_id" text,
	"tags" text[],
	"featured" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"rating" numeric(3, 2),
	"review_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar DEFAULT 'user',
	"is_pro" boolean DEFAULT false,
	"subscription_tier" text DEFAULT 'free',
	"stripe_subscription_id" text,
	"ai_consultant_tier" text DEFAULT 'free',
	"ai_monthly_quota" integer DEFAULT 10,
	"ai_messages_used" integer DEFAULT 0,
	"ai_quota_reset_date" timestamp DEFAULT NOW() + INTERVAL '1 month',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar NOT NULL,
	"name" varchar NOT NULL,
	"domain" varchar NOT NULL,
	"logo_url" text,
	"primary_color" varchar DEFAULT '#C8A661',
	"accent_color" varchar DEFAULT '#1a2332',
	"hero_title" text NOT NULL,
	"hero_subtitle" text NOT NULL,
	"tagline" text,
	"meta_title" text NOT NULL,
	"meta_description" text NOT NULL,
	"og_image" text,
	"ai_knowledge_base_path" text NOT NULL,
	"ai_welcome_message" text NOT NULL,
	"ai_system_prompt_override" text,
	"amazon_catalog_type" varchar NOT NULL,
	"enable_courses" boolean DEFAULT true,
	"enable_marketplace" boolean DEFAULT true,
	"enable_white_label" boolean DEFAULT false,
	"enable_community" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tenants_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "upgrade_recommendations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"user_id" varchar,
	"recommendation_type" text NOT NULL,
	"current_tier" text,
	"current_features" text[],
	"recommended_tier" text,
	"recommended_feature" text,
	"trigger_reason" text NOT NULL,
	"reasoning_details" text,
	"estimated_monthly_savings" numeric(10, 2),
	"estimated_roi" numeric(8, 2),
	"benefits_list" text[],
	"upgrade_cost" numeric(10, 2),
	"stripe_price_id" text,
	"status" text DEFAULT 'pending',
	"viewed_at" timestamp,
	"action_taken_at" timestamp,
	"action_taken" text,
	"priority" integer DEFAULT 5,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"achievement_id" varchar NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL,
	"notified" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "user_activity_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"activity_type" varchar NOT NULL,
	"activity_target" varchar,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"badge_type" text NOT NULL,
	"badge_name" text NOT NULL,
	"badge_description" text,
	"badge_icon" text,
	"badge_color" text,
	"progress" integer DEFAULT 0,
	"max_progress" integer,
	"awarded_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"content_type" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"featured_image" text,
	"video_url" text,
	"video_embed_code" text,
	"gallery_images" text[],
	"target_type" text,
	"target_id" varchar,
	"meta_title" text,
	"meta_description" text,
	"keywords" text[],
	"internal_links" text[],
	"external_links" text[],
	"affiliate_links_enabled" boolean DEFAULT true,
	"affiliate_code" text,
	"views" integer DEFAULT 0,
	"likes" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"seo_score" integer,
	"readability_score" integer,
	"content_quality" integer,
	"status" text DEFAULT 'draft',
	"moderated_by" varchar,
	"moderation_notes" text,
	"published_at" timestamp,
	"featured" boolean DEFAULT false,
	"featured_order" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_content_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_deal_scout" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"alert_type" varchar NOT NULL,
	"locations" jsonb,
	"radius_miles" integer DEFAULT 50,
	"min_price" integer,
	"max_price" integer,
	"min_cleanbi_score" integer,
	"frequency" varchar DEFAULT 'instant',
	"is_active" boolean DEFAULT true,
	"alerts_sent" integer DEFAULT 0,
	"last_alert_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_integrations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"business_profile_id" varchar,
	"integration_type" varchar NOT NULL,
	"integration_name" varchar,
	"is_connected" boolean DEFAULT false,
	"last_synced_at" timestamp,
	"connection_error" text,
	"secret_key_ref" varchar,
	"access_token_ref" varchar,
	"refresh_token_ref" varchar,
	"external_account_id" varchar,
	"external_account_name" varchar,
	"metadata" jsonb,
	"scopes" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_journey" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"stage" varchar DEFAULT 'exploring' NOT NULL,
	"stage_progress" integer DEFAULT 0 NOT NULL,
	"completed_milestones" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"last_active_date" timestamp,
	"preferred_location_radius" integer,
	"preferred_price_range" jsonb,
	"preferred_markets" jsonb,
	"saved_listings" integer DEFAULT 0,
	"saved_calculations" integer DEFAULT 0,
	"saved_reports" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_journey_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"email_notifications" boolean DEFAULT true,
	"email_digest" text DEFAULT 'daily',
	"notify_on_reply" boolean DEFAULT true,
	"notify_on_mention" boolean DEFAULT true,
	"notify_on_follow" boolean DEFAULT true,
	"notify_on_reaction" boolean DEFAULT false,
	"notify_on_new_topic" boolean DEFAULT false,
	"show_email" boolean DEFAULT false,
	"show_phone" boolean DEFAULT false,
	"show_activity" boolean DEFAULT true,
	"show_online_status" boolean DEFAULT true,
	"allow_direct_messages" boolean DEFAULT true,
	"profile_visibility" text DEFAULT 'public',
	"theme" text DEFAULT 'system',
	"font_size" text DEFAULT 'medium',
	"compact_mode" boolean DEFAULT false,
	"show_avatars" boolean DEFAULT true,
	"animations_enabled" boolean DEFAULT true,
	"default_sort_order" text DEFAULT 'recent',
	"posts_per_page" integer DEFAULT 20,
	"auto_play_gifs" boolean DEFAULT true,
	"auto_play_videos" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"username" varchar,
	"password_hash" text,
	"email_verified" boolean DEFAULT false,
	"email_verification_token" text,
	"email_verification_expires" timestamp,
	"password_reset_token" text,
	"password_reset_expires" timestamp,
	"phone" varchar,
	"bio" text,
	"tagline" varchar,
	"timezone" varchar DEFAULT 'America/New_York',
	"company_name" varchar,
	"role" varchar,
	"industry" varchar,
	"number_of_locations" integer DEFAULT 1,
	"preferred_currency" varchar DEFAULT 'USD',
	"preferred_language" varchar DEFAULT 'en',
	"is_pro" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"subscription_tier" text DEFAULT 'free',
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"trial_end_date" timestamp,
	"ai_consultant_tier" text DEFAULT 'free',
	"ai_monthly_quota" integer DEFAULT 10,
	"ai_messages_used" integer DEFAULT 0 NOT NULL,
	"ai_quota_reset_date" timestamp DEFAULT NOW() + INTERVAL '1 month',
	"cleanbi_tier" text DEFAULT 'free',
	"cleanbi_subscription_id" text,
	"cleanbi_subscription_status" text,
	"cleanbi_quota_reset_date" timestamp DEFAULT NOW() + INTERVAL '1 month',
	"onboarding_completed" boolean DEFAULT false,
	"onboarding_step" integer DEFAULT 0,
	"onboarding_checklist" jsonb DEFAULT '{"profileComplete":false,"locationAdded":false,"machinesAdded":false,"firstSaleComplete":false,"teamInvited":false}'::jsonb,
	"referral_code" varchar,
	"referred_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "utility_bill_analyses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"bill_type" varchar NOT NULL,
	"bill_date" timestamp,
	"bill_period_start" timestamp,
	"bill_period_end" timestamp,
	"electric_kwh" numeric(10, 2),
	"electric_cost" numeric(10, 2),
	"electric_rate_per_kwh" numeric(6, 4),
	"water_gallons" numeric(12, 2),
	"water_cost" numeric(10, 2),
	"water_rate_per_gallon" numeric(8, 6),
	"gas_therms" numeric(10, 2),
	"gas_cost" numeric(10, 2),
	"gas_rate_per_therm" numeric(6, 4),
	"total_cost" numeric(10, 2),
	"gross_revenue" numeric(12, 2),
	"upg_ratio" numeric(5, 2),
	"cost_per_washer_load" numeric(6, 4),
	"cost_per_dryer_load" numeric(6, 4),
	"anomalies" jsonb DEFAULT '[]'::jsonb,
	"recommendations" jsonb DEFAULT '[]'::jsonb,
	"raw_extracted_data" jsonb,
	"image_url" text,
	"confidence_score" numeric(3, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_directory" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"primary_category" text NOT NULL,
	"services" text[] NOT NULL,
	"brands" text[],
	"website" text,
	"email" text,
	"phone" text,
	"address" text,
	"service_areas" text[],
	"nationwide" boolean DEFAULT false,
	"logo" text,
	"images" jsonb,
	"verified" boolean DEFAULT false NOT NULL,
	"certifications" text[],
	"years_in_business" integer,
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0 NOT NULL,
	"response_rate" numeric(5, 2),
	"avg_response_time" integer,
	"view_count" integer DEFAULT 0 NOT NULL,
	"inquiry_count" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false,
	"premium_tier" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vendor_directory_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "vendor_licenses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sponsor_id" varchar NOT NULL,
	"license_type" varchar NOT NULL,
	"territory" varchar,
	"exclusivity" boolean DEFAULT false,
	"product_name" varchar NOT NULL,
	"product_category" varchar,
	"product_description" text,
	"license_fee" numeric(10, 2),
	"royalty_percent" numeric(5, 2),
	"term_months" integer,
	"stripe_subscription_id" varchar,
	"status" varchar DEFAULT 'pending',
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" varchar NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"short_description" text,
	"category" text NOT NULL,
	"subcategory" text,
	"tags" text[],
	"price" numeric(10, 2) NOT NULL,
	"compare_at_price" numeric(10, 2),
	"cost" numeric(10, 2),
	"images" text[],
	"featured_image" text,
	"video_url" text,
	"sku" text,
	"stock" integer,
	"track_inventory" boolean DEFAULT false,
	"is_digital" boolean DEFAULT false,
	"download_url" text,
	"download_limit" integer,
	"views" integer DEFAULT 0,
	"sales" integer DEFAULT 0,
	"avg_rating" numeric(3, 2),
	"review_count" integer DEFAULT 0,
	"meta_title" text,
	"meta_description" text,
	"keywords" text[],
	"status" text DEFAULT 'draft',
	"featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "vendor_purchase_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laundromat_id" varchar NOT NULL,
	"vendor_id" varchar,
	"po_number" text NOT NULL,
	"order_date" timestamp DEFAULT now() NOT NULL,
	"items" jsonb NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax" numeric(10, 2) DEFAULT '0.00',
	"shipping" numeric(10, 2) DEFAULT '0.00',
	"total" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending',
	"ordered_by" varchar NOT NULL,
	"expected_delivery_date" timestamp,
	"actual_delivery_date" timestamp,
	"tracking_number" text,
	"payment_status" text DEFAULT 'unpaid',
	"payment_method" text,
	"paid_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vendor_purchase_orders_po_number_unique" UNIQUE("po_number")
);
--> statement-breakpoint
CREATE TABLE "vendor_reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"quality_rating" integer,
	"value_rating" integer,
	"service_rating" integer,
	"responsiveness" integer,
	"service_used" text,
	"project_cost" numeric(10, 2),
	"would_recommend" boolean NOT NULL,
	"verified" boolean DEFAULT false,
	"helpful_count" integer DEFAULT 0 NOT NULL,
	"not_helpful_count" integer DEFAULT 0 NOT NULL,
	"vendor_response" text,
	"vendor_responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_storefronts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"company_name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"banner_image" text,
	"description" text,
	"email" text NOT NULL,
	"phone" text,
	"website" text,
	"address" text,
	"categories" jsonb NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" jsonb,
	"featured" boolean DEFAULT false NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"product_count" integer DEFAULT 0 NOT NULL,
	"rating" numeric(3, 2),
	"review_count" integer DEFAULT 0 NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"subscription_tier" text DEFAULT 'basic',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vendor_storefronts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "vendor_stores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar NOT NULL,
	"store_name" text NOT NULL,
	"store_slug" text NOT NULL,
	"description" text,
	"logo" text,
	"banner" text,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"city" text,
	"state" text,
	"zip" text,
	"country" text DEFAULT 'US',
	"commission_rate" numeric(5, 2) DEFAULT '15.00',
	"total_products" integer DEFAULT 0,
	"total_sales" numeric(12, 2) DEFAULT '0.00',
	"total_orders" integer DEFAULT 0,
	"avg_rating" numeric(3, 2),
	"review_count" integer DEFAULT 0,
	"status" text DEFAULT 'pending',
	"verified" boolean DEFAULT false,
	"featured" boolean DEFAULT false,
	"stripe_account_id" text,
	"payout_schedule" text DEFAULT 'monthly',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vendor_stores_store_slug_unique" UNIQUE("store_slug")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"company_name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"logo_url" text,
	"rating" numeric(3, 2) DEFAULT '0' NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visibility_add_ons" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"price_usd" numeric(10, 2) NOT NULL,
	"stripe_price_id" text,
	"stripe_product_id" text,
	"duration_days" integer DEFAULT 30,
	"is_one_time" boolean DEFAULT true,
	"includes_carousel" boolean DEFAULT false,
	"includes_auto_blog" boolean DEFAULT false,
	"includes_index_now" boolean DEFAULT false,
	"includes_google_indexing" boolean DEFAULT false,
	"includes_social_cards" boolean DEFAULT false,
	"visibility_boost_level" integer DEFAULT 0,
	"active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "visibility_add_ons_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "visibility_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"listing_id" varchar NOT NULL,
	"job_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0,
	"max_attempts" integer DEFAULT 3,
	"result" jsonb,
	"error" text,
	"scheduled_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visibility_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"add_on_id" varchar NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_checkout_session_id" text,
	"amount_paid" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'pending' NOT NULL,
	"fulfilled_at" timestamp,
	"fulfillment_details" jsonb,
	"activated_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voice_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"profile_name" varchar NOT NULL,
	"is_default" boolean DEFAULT false,
	"vocabulary_level" varchar,
	"sentence_complexity" varchar,
	"tone_profile" jsonb,
	"emotional_range" jsonb,
	"formality_level" integer,
	"avg_sentence_length" numeric(5, 2),
	"avg_paragraph_length" numeric(5, 2),
	"dialogue_frequency" integer,
	"metaphor_usage" integer,
	"humor_level" integer,
	"favorite_words" text[],
	"favorite_phrases" text[],
	"avoid_words" text[],
	"style_markers" jsonb,
	"voice_embedding" jsonb,
	"embedding_model" varchar DEFAULT 'gemini',
	"sample_count" integer DEFAULT 0,
	"total_words_analyzed" integer DEFAULT 0,
	"last_trained_at" timestamp,
	"confidence_score" integer,
	"consistency_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vr_recovery_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" varchar,
	"session_type" varchar NOT NULL,
	"exercise_name" varchar NOT NULL,
	"difficulty" varchar DEFAULT 'beginner',
	"duration" integer,
	"repetitions" integer,
	"accuracy" numeric(5, 2),
	"score" integer,
	"motion_data" jsonb,
	"improvement" numeric(5, 2),
	"personal_best" boolean DEFAULT false,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warranty_records" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"machine_id" varchar NOT NULL,
	"warranty_type" text NOT NULL,
	"warranty_provider" text NOT NULL,
	"policy_number" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"coverage_type" text,
	"coverage_description" text,
	"exclusions" text[],
	"cost" numeric(10, 2),
	"contact_name" text,
	"contact_phone" varchar,
	"contact_email" varchar,
	"document_url" text,
	"is_active" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "web_page_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_slug" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"html_structure" text,
	"css_styles" text,
	"js_scripts" text,
	"content_blocks" jsonb,
	"color_schemes" jsonb,
	"font_options" jsonb,
	"layout_options" jsonb,
	"meta_title_template" varchar,
	"meta_description_template" text,
	"schema_template" jsonb,
	"thumbnail_url" text,
	"preview_url" text,
	"usage_count" integer DEFAULT 0,
	"last_used_at" timestamp,
	"is_active" boolean DEFAULT true,
	"is_premium" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "web_page_templates_template_slug_unique" UNIQUE("template_slug")
);
--> statement-breakpoint
CREATE TABLE "website_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"industry" text NOT NULL,
	"category" text NOT NULL,
	"preview_image" text NOT NULL,
	"demo_url" text,
	"pages" jsonb NOT NULL,
	"theme" jsonb NOT NULL,
	"features" jsonb NOT NULL,
	"is_pro" boolean DEFAULT false,
	"use_count" integer DEFAULT 0 NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_videos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"project_id" varchar,
	"title" varchar NOT NULL,
	"description" text,
	"video_type" varchar DEFAULT 'upload',
	"video_url" text NOT NULL,
	"thumbnail_url" text,
	"duration" integer,
	"file_size" integer,
	"autoplay" boolean DEFAULT false,
	"loop" boolean DEFAULT false,
	"muted" boolean DEFAULT true,
	"is_published" boolean DEFAULT true,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weigh_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" varchar NOT NULL,
	"weight" numeric(10, 2) NOT NULL,
	"scale_id" text,
	"weighed_by" varchar NOT NULL,
	"photo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_campaigns" ADD CONSTRAINT "ad_campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_campaigns" ADD CONSTRAINT "ad_campaigns_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_vendor_id_vendor_storefronts_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_storefronts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_content_id_affiliate_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."affiliate_content"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_content" ADD CONSTRAINT "affiliate_content_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_payouts" ADD CONSTRAINT "affiliate_payouts_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_payouts" ADD CONSTRAINT "affiliate_payouts_commission_id_affiliate_commissions_id_fk" FOREIGN KEY ("commission_id") REFERENCES "public"."affiliate_commissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_sales" ADD CONSTRAINT "affiliate_sales_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_sales" ADD CONSTRAINT "affiliate_sales_click_id_affiliate_clicks_id_fk" FOREIGN KEY ("click_id") REFERENCES "public"."affiliate_clicks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_conversations" ADD CONSTRAINT "agent_conversations_agent_id_ai_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_conversations" ADD CONSTRAINT "agent_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_flows" ADD CONSTRAINT "agent_flows_agent_id_ai_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_knowledge_sources" ADD CONSTRAINT "agent_knowledge_sources_agent_id_ai_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_configs" ADD CONSTRAINT "ai_agent_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_configs" ADD CONSTRAINT "ai_agent_configs_business_profile_id_business_profiles_id_fk" FOREIGN KEY ("business_profile_id") REFERENCES "public"."business_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_profiles" ADD CONSTRAINT "ai_agent_profiles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agents" ADD CONSTRAINT "ai_agents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_blog_tasks" ADD CONSTRAINT "ai_blog_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_blog_tasks" ADD CONSTRAINT "ai_blog_tasks_published_post_id_blog_posts_id_fk" FOREIGN KEY ("published_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_companion_chats" ADD CONSTRAINT "ai_companion_chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_companion_chats" ADD CONSTRAINT "ai_companion_chats_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_companion_settings" ADD CONSTRAINT "ai_companion_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_companion_settings" ADD CONSTRAINT "ai_companion_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_content_requests" ADD CONSTRAINT "ai_content_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_content_requests" ADD CONSTRAINT "ai_content_requests_conversation_id_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_issues" ADD CONSTRAINT "audit_issues_project_id_seo_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."seo_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_issues" ADD CONSTRAINT "audit_issues_page_id_crawled_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."crawled_pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_awards" ADD CONSTRAINT "badge_awards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_awards" ADD CONSTRAINT "badge_awards_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banner_projects" ADD CONSTRAINT "banner_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_target_keyword_id_seo_keywords_id_fk" FOREIGN KEY ("target_keyword_id") REFERENCES "public"."seo_keywords"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_series" ADD CONSTRAINT "blog_series_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_series_members" ADD CONSTRAINT "blog_series_members_series_id_blog_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."blog_series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_series_members" ADD CONSTRAINT "blog_series_members_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_access" ADD CONSTRAINT "book_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_annotations" ADD CONSTRAINT "book_annotations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_annotations" ADD CONSTRAINT "book_annotations_chapter_id_book_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."book_chapters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_case_studies" ADD CONSTRAINT "book_case_studies_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_case_studies" ADD CONSTRAINT "book_case_studies_sponsorship_id_sponsorships_id_fk" FOREIGN KEY ("sponsorship_id") REFERENCES "public"."sponsorships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_citations" ADD CONSTRAINT "book_citations_project_id_ghostwriting_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."ghostwriting_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_citations" ADD CONSTRAINT "book_citations_chapter_id_ghostwriting_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."ghostwriting_chapters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_citations" ADD CONSTRAINT "book_citations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_content_analyses" ADD CONSTRAINT "book_content_analyses_chapter_id_ghostwriting_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."ghostwriting_chapters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_content_analyses" ADD CONSTRAINT "book_content_analyses_project_id_ghostwriting_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."ghostwriting_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_content_analyses" ADD CONSTRAINT "book_content_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_production_templates" ADD CONSTRAINT "book_production_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_templates" ADD CONSTRAINT "book_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broker_profiles" ADD CONSTRAINT "broker_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_listing_analytics" ADD CONSTRAINT "business_listing_analytics_listing_id_business_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."business_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_listing_inquiries" ADD CONSTRAINT "business_listing_inquiries_listing_id_business_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."business_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_listings" ADD CONSTRAINT "business_listings_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_listings" ADD CONSTRAINT "business_listings_category_id_business_listing_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."business_listing_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_listing_history" ADD CONSTRAINT "buyer_listing_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_listing_history" ADD CONSTRAINT "buyer_listing_history_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_message_threads" ADD CONSTRAINT "buyer_message_threads_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_message_threads" ADD CONSTRAINT "buyer_message_threads_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_message_threads" ADD CONSTRAINT "buyer_message_threads_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_messages" ADD CONSTRAINT "buyer_messages_thread_id_buyer_message_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."buyer_message_threads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_messages" ADD CONSTRAINT "buyer_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_configs" ADD CONSTRAINT "calculator_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_instances" ADD CONSTRAINT "calculator_instances_config_id_calculator_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."calculator_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_instances" ADD CONSTRAINT "calculator_instances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_purchases" ADD CONSTRAINT "calculator_purchases_calculator_id_calculator_templates_id_fk" FOREIGN KEY ("calculator_id") REFERENCES "public"."calculator_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_purchases" ADD CONSTRAINT "calculator_purchases_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_purchases" ADD CONSTRAINT "calculator_purchases_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_reviews" ADD CONSTRAINT "calculator_reviews_calculator_id_calculator_templates_id_fk" FOREIGN KEY ("calculator_id") REFERENCES "public"."calculator_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_reviews" ADD CONSTRAINT "calculator_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_scenarios" ADD CONSTRAINT "calculator_scenarios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_templates" ADD CONSTRAINT "calculator_templates_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_themes" ADD CONSTRAINT "calculator_themes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_themes" ADD CONSTRAINT "calculator_themes_calculator_id_calculator_templates_id_fk" FOREIGN KEY ("calculator_id") REFERENCES "public"."calculator_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_themes" ADD CONSTRAINT "calculator_themes_business_profile_id_business_profiles_id_fk" FOREIGN KEY ("business_profile_id") REFERENCES "public"."business_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_usage_events" ADD CONSTRAINT "calculator_usage_events_calculator_id_calculator_templates_id_fk" FOREIGN KEY ("calculator_id") REFERENCES "public"."calculator_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_usage_events" ADD CONSTRAINT "calculator_usage_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapter_artifacts" ADD CONSTRAINT "chapter_artifacts_chapter_id_ghostwriting_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."ghostwriting_chapters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapter_artifacts" ADD CONSTRAINT "chapter_artifacts_project_id_ghostwriting_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."ghostwriting_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapter_artifacts" ADD CONSTRAINT "chapter_artifacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatbot_conversations" ADD CONSTRAINT "chatbot_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatbot_conversations" ADD CONSTRAINT "chatbot_conversations_assigned_agent_id_users_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleanbi_reports" ADD CONSTRAINT "cleanbi_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleanbi_scores" ADD CONSTRAINT "cleanbi_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleanbi_usage" ADD CONSTRAINT "cleanbi_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_analysis" ADD CONSTRAINT "cohort_analysis_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_ledger" ADD CONSTRAINT "commission_ledger_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_ledger" ADD CONSTRAINT "commission_ledger_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_intelligence" ADD CONSTRAINT "competition_intelligence_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_profiles" ADD CONSTRAINT "consultant_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_calendar" ADD CONSTRAINT "content_calendar_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_calendar" ADD CONSTRAINT "content_calendar_author_users_id_fk" FOREIGN KEY ("author") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_calendar" ADD CONSTRAINT "content_calendar_editor_users_id_fk" FOREIGN KEY ("editor") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_pipelines" ADD CONSTRAINT "content_pipelines_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_pipelines" ADD CONSTRAINT "content_pipelines_voice_profile_id_voice_profiles_id_fk" FOREIGN KEY ("voice_profile_id") REFERENCES "public"."voice_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_pipelines" ADD CONSTRAINT "content_pipelines_industry_id_industry_knowledge_bases_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industry_knowledge_bases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_projects" ADD CONSTRAINT "content_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversion_funnels" ADD CONSTRAINT "conversion_funnels_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crawled_pages" ADD CONSTRAINT "crawled_pages_project_id_seo_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."seo_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_payouts" ADD CONSTRAINT "creator_payouts_creator_id_creator_profiles_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creator_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_ltv_fact" ADD CONSTRAINT "customer_ltv_fact_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_portal_accounts" ADD CONSTRAINT "customer_portal_accounts_household_account_id_household_accounts_id_fk" FOREIGN KEY ("household_account_id") REFERENCES "public"."household_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_portal_accounts" ADD CONSTRAINT "customer_portal_accounts_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_preferences" ADD CONSTRAINT "customer_preferences_customer_portal_id_customer_portal_accounts_id_fk" FOREIGN KEY ("customer_portal_id") REFERENCES "public"."customer_portal_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_websites" ADD CONSTRAINT "customer_websites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_websites" ADD CONSTRAINT "customer_websites_template_id_website_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."website_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_checkins" ADD CONSTRAINT "daily_checkins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_checkins" ADD CONSTRAINT "daily_checkins_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_revenue_fact" ADD CONSTRAINT "daily_revenue_fact_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_alerts" ADD CONSTRAINT "deal_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_scout_history" ADD CONSTRAINT "deal_scout_history_scout_id_user_deal_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."user_deal_scout"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_scout_history" ADD CONSTRAINT "deal_scout_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_windows" ADD CONSTRAINT "delivery_windows_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "designs" ADD CONSTRAINT "designs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_product_listings" ADD CONSTRAINT "digital_product_listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_product_listings" ADD CONSTRAINT "digital_product_listings_project_id_ghostwriting_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."ghostwriting_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distributor_inquiries" ADD CONSTRAINT "distributor_inquiries_distributor_id_distributors_id_fk" FOREIGN KEY ("distributor_id") REFERENCES "public"."distributors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_orders" ADD CONSTRAINT "domain_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_orders" ADD CONSTRAINT "domain_orders_seo_project_id_seo_projects_id_fk" FOREIGN KEY ("seo_project_id") REFERENCES "public"."seo_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_route_fact" ADD CONSTRAINT "driver_route_fact_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_route_fact" ADD CONSTRAINT "driver_route_fact_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_route_fact" ADD CONSTRAINT "driver_route_fact_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_sessions" ADD CONSTRAINT "driver_sessions_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_sessions" ADD CONSTRAINT "driver_sessions_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "due_diligence_tasks" ADD CONSTRAINT "due_diligence_tasks_nda_request_id_nda_requests_id_fk" FOREIGN KEY ("nda_request_id") REFERENCES "public"."nda_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_contacts" ADD CONSTRAINT "email_contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_subscriber_id_newsletter_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_campaign_id_email_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."email_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_inquiries" ADD CONSTRAINT "equipment_inquiries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_listings" ADD CONSTRAINT "equipment_listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_logs" ADD CONSTRAINT "exercise_logs_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_logs" ADD CONSTRAINT "exercise_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_connections" ADD CONSTRAINT "external_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_connections" ADD CONSTRAINT "external_connections_project_id_seo_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."seo_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_listings" ADD CONSTRAINT "favorite_listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_listings" ADD CONSTRAINT "favorite_listings_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_bookmarks" ADD CONSTRAINT "forum_bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_follows" ADD CONSTRAINT "forum_follows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_mentions" ADD CONSTRAINT "forum_mentions_mentioned_user_id_users_id_fk" FOREIGN KEY ("mentioned_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_mentions" ADD CONSTRAINT "forum_mentions_mentioned_by_user_id_users_id_fk" FOREIGN KEY ("mentioned_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_reactions" ADD CONSTRAINT "forum_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_topic_id_forum_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."forum_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_topics" ADD CONSTRAINT "forum_topics_category_id_forum_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."forum_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_topics" ADD CONSTRAINT "forum_topics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_votes" ADD CONSTRAINT "forum_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "founding_members" ADD CONSTRAINT "founding_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_assets" ADD CONSTRAINT "generated_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_assets" ADD CONSTRAINT "generated_assets_project_id_content_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."content_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_assets" ADD CONSTRAINT "generated_assets_conversation_id_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geofence_zones" ADD CONSTRAINT "geofence_zones_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ghostwriting_chapters" ADD CONSTRAINT "ghostwriting_chapters_project_id_ghostwriting_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."ghostwriting_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ghostwriting_chapters" ADD CONSTRAINT "ghostwriting_chapters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ghostwriting_projects" ADD CONSTRAINT "ghostwriting_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ghostwriting_projects" ADD CONSTRAINT "ghostwriting_projects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gsc_properties" ADD CONSTRAINT "gsc_properties_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gsc_query_metrics" ADD CONSTRAINT "gsc_query_metrics_property_id_gsc_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."gsc_properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_accounts" ADD CONSTRAINT "household_accounts_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hydration_goals" ADD CONSTRAINT "hydration_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hydration_goals" ADD CONSTRAINT "hydration_goals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hydration_logs" ADD CONSTRAINT "hydration_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hydration_logs" ADD CONSTRAINT "hydration_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indexing_events" ADD CONSTRAINT "indexing_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keyword_rankings" ADD CONSTRAINT "keyword_rankings_keyword_id_seo_keywords_id_fk" FOREIGN KEY ("keyword_id") REFERENCES "public"."seo_keywords"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keyword_research_jobs" ADD CONSTRAINT "keyword_research_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keyword_research_jobs" ADD CONSTRAINT "keyword_research_jobs_industry_id_industry_knowledge_bases_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industry_knowledge_bases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laundromats" ADD CONSTRAINT "laundromats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "link_graph" ADD CONSTRAINT "link_graph_project_id_seo_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."seo_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_comparisons" ADD CONSTRAINT "listing_comparisons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_equipment" ADD CONSTRAINT "listing_equipment_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_financials" ADD CONSTRAINT "listing_financials_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_inquiries" ADD CONSTRAINT "listing_inquiries_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_inquiries" ADD CONSTRAINT "listing_inquiries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_media" ADD CONSTRAINT "listing_media_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_premium_purchases" ADD CONSTRAINT "listing_premium_purchases_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_premium_purchases" ADD CONSTRAINT "listing_premium_purchases_package_id_premium_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."premium_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_premium_purchases" ADD CONSTRAINT "listing_premium_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_views" ADD CONSTRAINT "listing_views_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_views" ADD CONSTRAINT "listing_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_auto_blog_post_id_blog_posts_id_fk" FOREIGN KEY ("auto_blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logo_projects" ADD CONSTRAINT "logo_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_customer_portal_id_customer_portal_accounts_id_fk" FOREIGN KEY ("customer_portal_id") REFERENCES "public"."customer_portal_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machine_assets" ADD CONSTRAINT "machine_assets_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machine_lifecycle_metrics" ADD CONSTRAINT "machine_lifecycle_metrics_machine_id_machine_assets_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machine_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machine_lifecycle_metrics" ADD CONSTRAINT "machine_lifecycle_metrics_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machine_predictive_metrics" ADD CONSTRAINT "machine_predictive_metrics_machine_id_machine_assets_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machine_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machine_predictive_metrics" ADD CONSTRAINT "machine_predictive_metrics_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machine_sensor_data" ADD CONSTRAINT "machine_sensor_data_machine_id_machines_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machine_turn_fact" ADD CONSTRAINT "machine_turn_fact_machine_id_machine_assets_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machine_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machine_turn_fact" ADD CONSTRAINT "machine_turn_fact_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machines" ADD CONSTRAINT "machines_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_plans" ADD CONSTRAINT "maintenance_plans_machine_id_machine_assets_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machine_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_plans" ADD CONSTRAINT "maintenance_plans_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_schedules" ADD CONSTRAINT "maintenance_schedules_machine_id_machines_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_schedules" ADD CONSTRAINT "maintenance_schedules_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_inquiries" ADD CONSTRAINT "marketplace_inquiries_listing_id_marketplace_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_products" ADD CONSTRAINT "marketplace_products_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_project_id_site_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."site_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_logs" ADD CONSTRAINT "medication_logs_medication_id_medications_id_fk" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_logs" ADD CONSTRAINT "medication_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medications" ADD CONSTRAINT "medications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medications" ADD CONSTRAINT "medications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mileage_logs" ADD CONSTRAINT "mileage_logs_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mileage_logs" ADD CONSTRAINT "mileage_logs_session_id_driver_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."driver_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_metrics" ADD CONSTRAINT "module_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nda_requests" ADD CONSTRAINT "nda_requests_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nda_requests" ADD CONSTRAINT "nda_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nda_requests" ADD CONSTRAINT "nda_requests_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "new_product_alerts" ADD CONSTRAINT "new_product_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_campaigns" ADD CONSTRAINT "newsletter_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ADD CONSTRAINT "newsletter_subscribers_source_blog_id_blog_posts_id_fk" FOREIGN KEY ("source_blog_id") REFERENCES "public"."blog_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_orders" ADD CONSTRAINT "online_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_orders" ADD CONSTRAINT "online_orders_business_profile_id_business_profiles_id_fk" FOREIGN KEY ("business_profile_id") REFERENCES "public"."business_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_service_order_id_service_orders_id_fk" FOREIGN KEY ("service_order_id") REFERENCES "public"."service_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_pos_transaction_id_pos_transactions_id_fk" FOREIGN KEY ("pos_transaction_id") REFERENCES "public"."pos_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_page_id_site_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."site_pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_inventory" ADD CONSTRAINT "parts_inventory_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_vendors" ADD CONSTRAINT "parts_vendors_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_settlements" ADD CONSTRAINT "payment_settlements_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_runs" ADD CONSTRAINT "pipeline_runs_pipeline_id_content_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."content_pipelines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_runs" ADD CONSTRAINT "pipeline_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD CONSTRAINT "platform_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_items" ADD CONSTRAINT "pos_items_transaction_id_pos_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."pos_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_transactions" ADD CONSTRAINT "pos_transactions_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_transactions" ADD CONSTRAINT "pos_transactions_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_jobs" ADD CONSTRAINT "production_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_jobs" ADD CONSTRAINT "production_jobs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_jobs" ADD CONSTRAINT "production_jobs_project_id_ghostwriting_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."ghostwriting_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_queue" ADD CONSTRAINT "production_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_queue" ADD CONSTRAINT "production_queue_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_milestones" ADD CONSTRAINT "progress_milestones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_milestones" ADD CONSTRAINT "progress_milestones_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_code_redemptions" ADD CONSTRAINT "promo_code_redemptions_promo_code_id_promo_codes_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proof_of_delivery" ADD CONSTRAINT "proof_of_delivery_stop_id_route_stops_id_fk" FOREIGN KEY ("stop_id") REFERENCES "public"."route_stops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proof_of_delivery" ADD CONSTRAINT "proof_of_delivery_transaction_id_pos_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."pos_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proof_of_delivery" ADD CONSTRAINT "proof_of_delivery_delivered_by_users_id_fk" FOREIGN KEY ("delivered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_chapter_id_book_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."book_chapters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_goals" ADD CONSTRAINT "recovery_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_goals" ADD CONSTRAINT "recovery_goals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_goals" ADD CONSTRAINT "recovery_goals_milestone_id_progress_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."progress_milestones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_logs" ADD CONSTRAINT "repair_logs_machine_id_machine_assets_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machine_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_logs" ADD CONSTRAINT "repair_logs_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_parts_used" ADD CONSTRAINT "repair_parts_used_repair_log_id_repair_logs_id_fk" FOREIGN KEY ("repair_log_id") REFERENCES "public"."repair_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_parts_used" ADD CONSTRAINT "repair_parts_used_part_inventory_id_parts_inventory_id_fk" FOREIGN KEY ("part_inventory_id") REFERENCES "public"."parts_inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_machine_id_machine_assets_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machine_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reputation_events" ADD CONSTRAINT "reputation_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "residential_scores" ADD CONSTRAINT "residential_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_usage" ADD CONSTRAINT "resource_usage_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_usage" ADD CONSTRAINT "resource_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_transaction_id_pos_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."pos_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_search_alerts" ADD CONSTRAINT "saved_search_alerts_saved_search_id_saved_searches_id_fk" FOREIGN KEY ("saved_search_id") REFERENCES "public"."saved_searches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_search_alerts" ADD CONSTRAINT "saved_search_alerts_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scale_calibrations" ADD CONSTRAINT "scale_calibrations_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scale_calibrations" ADD CONSTRAINT "scale_calibrations_calibrated_by_users_id_fk" FOREIGN KEY ("calibrated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_analytics" ADD CONSTRAINT "search_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensor_thresholds" ADD CONSTRAINT "sensor_thresholds_machine_id_machine_assets_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machine_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_agents" ADD CONSTRAINT "seo_agents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_agents" ADD CONSTRAINT "seo_agents_project_id_seo_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."seo_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_agents" ADD CONSTRAINT "seo_agents_template_id_seo_agent_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."seo_agent_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_audits" ADD CONSTRAINT "seo_audits_project_id_seo_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."seo_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_audits" ADD CONSTRAINT "seo_audits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_automation_tasks" ADD CONSTRAINT "seo_automation_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_backlinks" ADD CONSTRAINT "seo_backlinks_project_id_seo_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."seo_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_competitors" ADD CONSTRAINT "seo_competitors_project_id_seo_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."seo_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_indexing_jobs" ADD CONSTRAINT "seo_indexing_jobs_project_id_seo_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."seo_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_metrics" ADD CONSTRAINT "seo_metrics_project_id_seo_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."seo_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_projects" ADD CONSTRAINT "seo_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_publications" ADD CONSTRAINT "seo_publications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_publications" ADD CONSTRAINT "seo_publications_connection_id_external_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."external_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_publications" ADD CONSTRAINT "seo_publications_blog_post_id_blog_posts_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_publications" ADD CONSTRAINT "seo_publications_project_id_seo_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."seo_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_recommendations" ADD CONSTRAINT "seo_recommendations_project_id_seo_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."seo_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_recommendations" ADD CONSTRAINT "seo_recommendations_page_id_crawled_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."crawled_pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_tasks" ADD CONSTRAINT "seo_tasks_project_id_seo_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."seo_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_tasks" ADD CONSTRAINT "seo_tasks_audit_id_seo_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."seo_audits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "serp_results_cache" ADD CONSTRAINT "serp_results_cache_job_id_keyword_research_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."keyword_research_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "serp_snapshots" ADD CONSTRAINT "serp_snapshots_project_id_seo_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."seo_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "serp_snapshots" ADD CONSTRAINT "serp_snapshots_keyword_id_seo_keywords_id_fk" FOREIGN KEY ("keyword_id") REFERENCES "public"."seo_keywords"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_cards" ADD CONSTRAINT "service_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_cards" ADD CONSTRAINT "service_cards_project_id_site_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."site_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_cards" ADD CONSTRAINT "service_cards_business_profile_id_business_profiles_id_fk" FOREIGN KEY ("business_profile_id") REFERENCES "public"."business_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_guy_ai_conversations" ADD CONSTRAINT "service_guy_ai_conversations_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_guy_ai_conversations" ADD CONSTRAINT "service_guy_ai_conversations_machine_id_machine_assets_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machine_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_guy_ai_conversations" ADD CONSTRAINT "service_guy_ai_conversations_repair_log_id_repair_logs_id_fk" FOREIGN KEY ("repair_log_id") REFERENCES "public"."repair_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_pages" ADD CONSTRAINT "site_pages_project_id_site_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."site_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_projects" ADD CONSTRAINT "site_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_shares" ADD CONSTRAINT "social_shares_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsorships" ADD CONSTRAINT "sponsorships_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsorships" ADD CONSTRAINT "sponsorships_product_id_advertising_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."advertising_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "style_training_sessions" ADD CONSTRAINT "style_training_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "style_training_sessions" ADD CONSTRAINT "style_training_sessions_voice_profile_id_voice_profiles_id_fk" FOREIGN KEY ("voice_profile_id") REFERENCES "public"."voice_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supply_listings" ADD CONSTRAINT "supply_listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_dispatches" ADD CONSTRAINT "technician_dispatches_repair_log_id_repair_logs_id_fk" FOREIGN KEY ("repair_log_id") REFERENCES "public"."repair_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_dispatches" ADD CONSTRAINT "technician_dispatches_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_dispatches" ADD CONSTRAINT "technician_dispatches_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telemetry_events" ADD CONSTRAINT "telemetry_events_machine_id_machine_assets_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machine_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_downloads" ADD CONSTRAINT "template_downloads_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_downloads" ADD CONSTRAINT "template_downloads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade_recommendations" ADD CONSTRAINT "upgrade_recommendations_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade_recommendations" ADD CONSTRAINT "upgrade_recommendations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity_log" ADD CONSTRAINT "user_activity_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_content" ADD CONSTRAINT "user_content_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_content" ADD CONSTRAINT "user_content_moderated_by_users_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_deal_scout" ADD CONSTRAINT "user_deal_scout_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_integrations" ADD CONSTRAINT "user_integrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_integrations" ADD CONSTRAINT "user_integrations_business_profile_id_business_profiles_id_fk" FOREIGN KEY ("business_profile_id") REFERENCES "public"."business_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_journey" ADD CONSTRAINT "user_journey_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utility_bill_analyses" ADD CONSTRAINT "utility_bill_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_licenses" ADD CONSTRAINT "vendor_licenses_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_products" ADD CONSTRAINT "vendor_products_store_id_vendor_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."vendor_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_purchase_orders" ADD CONSTRAINT "vendor_purchase_orders_laundromat_id_laundromats_id_fk" FOREIGN KEY ("laundromat_id") REFERENCES "public"."laundromats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_purchase_orders" ADD CONSTRAINT "vendor_purchase_orders_ordered_by_users_id_fk" FOREIGN KEY ("ordered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_vendor_id_vendor_directory_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_directory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_storefronts" ADD CONSTRAINT "vendor_storefronts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_stores" ADD CONSTRAINT "vendor_stores_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visibility_jobs" ADD CONSTRAINT "visibility_jobs_order_id_visibility_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."visibility_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visibility_jobs" ADD CONSTRAINT "visibility_jobs_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visibility_orders" ADD CONSTRAINT "visibility_orders_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visibility_orders" ADD CONSTRAINT "visibility_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visibility_orders" ADD CONSTRAINT "visibility_orders_add_on_id_visibility_add_ons_id_fk" FOREIGN KEY ("add_on_id") REFERENCES "public"."visibility_add_ons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_profiles" ADD CONSTRAINT "voice_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vr_recovery_sessions" ADD CONSTRAINT "vr_recovery_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vr_recovery_sessions" ADD CONSTRAINT "vr_recovery_sessions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranty_records" ADD CONSTRAINT "warranty_records_machine_id_machine_assets_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machine_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_videos" ADD CONSTRAINT "website_videos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_videos" ADD CONSTRAINT "website_videos_project_id_site_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."site_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weigh_events" ADD CONSTRAINT "weigh_events_transaction_id_pos_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."pos_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weigh_events" ADD CONSTRAINT "weigh_events_weighed_by_users_id_fk" FOREIGN KEY ("weighed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_events_user_idx" ON "activity_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_events_module_idx" ON "activity_events" USING btree ("module");--> statement-breakpoint
CREATE INDEX "activity_events_created_at_idx" ON "activity_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ad_campaigns_user_idx" ON "ad_campaigns" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ad_campaigns_status_idx" ON "ad_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "activity_type_idx" ON "admin_activity_log" USING btree ("type");--> statement-breakpoint
CREATE INDEX "activity_created_at_idx" ON "admin_activity_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "activity_user_id_idx" ON "admin_activity_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "aeo_optimization_keyword_idx" ON "aeo_optimization" USING btree ("keyword");--> statement-breakpoint
CREATE INDEX "aeo_optimization_url_idx" ON "aeo_optimization" USING btree ("url");--> statement-breakpoint
CREATE INDEX "aeo_optimization_featured_idx" ON "aeo_optimization" USING btree ("currently_featured");--> statement-breakpoint
CREATE INDEX "aeo_engine_query_idx" ON "aeo_performance" USING btree ("engine","query");--> statement-breakpoint
CREATE INDEX "agent_conversations_agent_idx" ON "agent_conversations" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "agent_conversations_visitor_idx" ON "agent_conversations" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "agent_flows_agent_idx" ON "agent_flows" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "agent_knowledge_sources_agent_idx" ON "agent_knowledge_sources" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "ai_agent_configs_user_idx" ON "ai_agent_configs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_agent_configs_business_idx" ON "ai_agent_configs" USING btree ("business_profile_id");--> statement-breakpoint
CREATE INDEX "ai_agents_user_idx" ON "ai_agents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_user_session_idx" ON "ai_companion_chats" USING btree ("user_id","session_id");--> statement-breakpoint
CREATE INDEX "chat_topic_idx" ON "ai_companion_chats" USING btree ("topic");--> statement-breakpoint
CREATE INDEX "ai_content_requests_user_idx" ON "ai_content_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_content_requests_type_idx" ON "ai_content_requests" USING btree ("type");--> statement-breakpoint
CREATE INDEX "ai_content_requests_status_idx" ON "ai_content_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ai_conversations_user_idx" ON "ai_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_conversations_type_idx" ON "ai_conversations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "audit_issues_project_idx" ON "audit_issues" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "audit_issues_severity_idx" ON "audit_issues" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "audit_issues_status_idx" ON "audit_issues" USING btree ("status");--> statement-breakpoint
CREATE INDEX "backlink_profiles_target_url_idx" ON "backlink_profiles" USING btree ("target_url");--> statement-breakpoint
CREATE INDEX "backlink_profiles_source_url_idx" ON "backlink_profiles" USING btree ("source_url");--> statement-breakpoint
CREATE INDEX "backlink_profiles_quality_idx" ON "backlink_profiles" USING btree ("link_quality_score");--> statement-breakpoint
CREATE INDEX "backlink_profiles_live_idx" ON "backlink_profiles" USING btree ("is_live");--> statement-breakpoint
CREATE UNIQUE INDEX "badge_awards_user_badge_idx" ON "badge_awards" USING btree ("user_id","badge_id");--> statement-breakpoint
CREATE INDEX "banner_projects_user_idx" ON "banner_projects" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "blog_slug_idx" ON "blog_posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_category_idx" ON "blog_posts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "blog_published_idx" ON "blog_posts" USING btree ("published","date_published");--> statement-breakpoint
CREATE INDEX "blog_keyword_idx" ON "blog_posts" USING btree ("target_keyword_id");--> statement-breakpoint
CREATE UNIQUE INDEX "blog_series_slug_idx" ON "blog_series" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "blog_series_members_series_post_idx" ON "blog_series_members" USING btree ("series_id","post_id");--> statement-breakpoint
CREATE INDEX "book_annotations_user_chapter_idx" ON "book_annotations" USING btree ("user_id","chapter_id");--> statement-breakpoint
CREATE INDEX "citation_project_idx" ON "book_citations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "citation_pmid_idx" ON "book_citations" USING btree ("pmid");--> statement-breakpoint
CREATE INDEX "book_analysis_project_idx" ON "book_content_analyses" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "book_analysis_chapter_idx" ON "book_content_analyses" USING btree ("chapter_id");--> statement-breakpoint
CREATE INDEX "broker_profiles_user_idx" ON "broker_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "browse_abandonment_session_idx" ON "browse_abandonment" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "browse_abandonment_email_idx" ON "browse_abandonment" USING btree ("email");--> statement-breakpoint
CREATE INDEX "listing_analytics_listing_date_idx" ON "business_listing_analytics" USING btree ("listing_id","date");--> statement-breakpoint
CREATE INDEX "biz_listing_inquiries_listing_idx" ON "business_listing_inquiries" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "biz_listing_inquiries_status_idx" ON "business_listing_inquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "business_listings_slug_idx" ON "business_listings" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "business_listings_category_idx" ON "business_listings" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "business_listings_tier_idx" ON "business_listings" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "business_listings_status_idx" ON "business_listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "business_listings_featured_idx" ON "business_listings" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "business_listings_city_state_idx" ON "business_listings" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "business_profiles_user_idx" ON "business_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "buyer_listing_history_user_listing_idx" ON "buyer_listing_history" USING btree ("user_id","listing_id");--> statement-breakpoint
CREATE INDEX "buyer_listing_history_user_idx" ON "buyer_listing_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "buyer_listing_history_last_viewed_idx" ON "buyer_listing_history" USING btree ("user_id","last_viewed_at");--> statement-breakpoint
CREATE INDEX "buyer_message_threads_listing_idx" ON "buyer_message_threads" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "buyer_message_threads_buyer_idx" ON "buyer_message_threads" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "buyer_message_threads_seller_idx" ON "buyer_message_threads" USING btree ("seller_id");--> statement-breakpoint
CREATE UNIQUE INDEX "buyer_message_threads_unique_idx" ON "buyer_message_threads" USING btree ("listing_id","buyer_id");--> statement-breakpoint
CREATE INDEX "buyer_messages_thread_idx" ON "buyer_messages" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "buyer_messages_sender_idx" ON "buyer_messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "calculator_configs_user_idx" ON "calculator_configs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "calculator_configs_category_idx" ON "calculator_configs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "calculator_instances_config_idx" ON "calculator_instances" USING btree ("config_id");--> statement-breakpoint
CREATE INDEX "calculator_instances_user_idx" ON "calculator_instances" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "calc_purchase_calculator_idx" ON "calculator_purchases" USING btree ("calculator_id");--> statement-breakpoint
CREATE INDEX "calc_purchase_buyer_idx" ON "calculator_purchases" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "calc_purchase_creator_idx" ON "calculator_purchases" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "calc_review_calculator_idx" ON "calculator_reviews" USING btree ("calculator_id");--> statement-breakpoint
CREATE INDEX "calc_review_user_idx" ON "calculator_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "calc_template_creator_idx" ON "calculator_templates" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "calc_template_category_idx" ON "calculator_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "calc_template_status_idx" ON "calculator_templates" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "calc_template_slug_idx" ON "calculator_templates" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "calculator_themes_user_idx" ON "calculator_themes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "calculator_themes_calculator_idx" ON "calculator_themes" USING btree ("calculator_id");--> statement-breakpoint
CREATE INDEX "calc_usage_calculator_idx" ON "calculator_usage_events" USING btree ("calculator_id");--> statement-breakpoint
CREATE INDEX "calc_usage_event_type_idx" ON "calculator_usage_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "calc_usage_created_idx" ON "calculator_usage_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "certificates_user_course_idx" ON "certificates" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "artifact_chapter_idx" ON "chapter_artifacts" USING btree ("chapter_id");--> statement-breakpoint
CREATE INDEX "artifact_type_idx" ON "chapter_artifacts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "cohort_analysis_laundromat_idx" ON "cohort_analysis" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "cohort_analysis_cohort_idx" ON "cohort_analysis" USING btree ("cohort_month");--> statement-breakpoint
CREATE INDEX "cohort_analysis_offset_idx" ON "cohort_analysis" USING btree ("month_offset");--> statement-breakpoint
CREATE INDEX "commission_ledger_vendor_idx" ON "commission_ledger" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "commission_ledger_affiliate_idx" ON "commission_ledger" USING btree ("affiliate_id");--> statement-breakpoint
CREATE INDEX "consultant_profiles_user_idx" ON "consultant_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "consultant_profiles_status_idx" ON "consultant_profiles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "consultant_profiles_featured_idx" ON "consultant_profiles" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "content_analyses_url_idx" ON "content_analyses" USING btree ("url");--> statement-breakpoint
CREATE INDEX "content_analyses_primary_keyword_idx" ON "content_analyses" USING btree ("primary_keyword");--> statement-breakpoint
CREATE INDEX "content_analyses_analyzed_at_idx" ON "content_analyses" USING btree ("analyzed_at");--> statement-breakpoint
CREATE INDEX "content_calendar_status_idx" ON "content_calendar" USING btree ("status");--> statement-breakpoint
CREATE INDEX "content_calendar_publish_date_idx" ON "content_calendar" USING btree ("scheduled_publish_date");--> statement-breakpoint
CREATE INDEX "content_calendar_assigned_to_idx" ON "content_calendar" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "pipeline_user_idx" ON "content_pipelines" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "content_projects_user_idx" ON "content_projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "content_projects_type_idx" ON "content_projects" USING btree ("type");--> statement-breakpoint
CREATE INDEX "content_projects_status_idx" ON "content_projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "conversion_funnels_laundromat_idx" ON "conversion_funnels" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "conversion_funnels_date_idx" ON "conversion_funnels" USING btree ("date");--> statement-breakpoint
CREATE INDEX "conversion_funnels_funnel_type_idx" ON "conversion_funnels" USING btree ("funnel_type");--> statement-breakpoint
CREATE INDEX "course_modules_course_idx" ON "course_modules" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_modules_order_idx" ON "course_modules" USING btree ("order_index");--> statement-breakpoint
CREATE INDEX "crawled_pages_project_idx" ON "crawled_pages" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "crawled_pages_url_idx" ON "crawled_pages" USING btree ("url");--> statement-breakpoint
CREATE INDEX "creator_payout_creator_idx" ON "creator_payouts" USING btree ("creator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "creator_profile_user_idx" ON "creator_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "customer_ltv_fact_customer_idx" ON "customer_ltv_fact" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_ltv_fact_laundromat_idx" ON "customer_ltv_fact" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "customer_ltv_fact_date_idx" ON "customer_ltv_fact" USING btree ("as_of_date");--> statement-breakpoint
CREATE INDEX "customer_ltv_fact_segment_idx" ON "customer_ltv_fact" USING btree ("customer_segment");--> statement-breakpoint
CREATE INDEX "customer_portal_email_idx" ON "customer_portal_accounts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "customer_portal_laundromat_idx" ON "customer_portal_accounts" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "customer_portal_loyalty_tier_idx" ON "customer_portal_accounts" USING btree ("loyalty_tier");--> statement-breakpoint
CREATE INDEX "customer_portal_referral_code_idx" ON "customer_portal_accounts" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "customer_preferences_customer_idx" ON "customer_preferences" USING btree ("customer_portal_id");--> statement-breakpoint
CREATE INDEX "checkin_user_date_idx" ON "daily_checkins" USING btree ("user_id","checkin_date");--> statement-breakpoint
CREATE INDEX "daily_revenue_fact_laundromat_idx" ON "daily_revenue_fact" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "daily_revenue_fact_date_idx" ON "daily_revenue_fact" USING btree ("date");--> statement-breakpoint
CREATE INDEX "daily_revenue_fact_year_month_idx" ON "daily_revenue_fact" USING btree ("year","month");--> statement-breakpoint
CREATE INDEX "deal_alerts_email_idx" ON "deal_alerts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "delivery_windows_laundromat_idx" ON "delivery_windows" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "delivery_windows_day_idx" ON "delivery_windows" USING btree ("day_of_week");--> statement-breakpoint
CREATE INDEX "delivery_windows_active_idx" ON "delivery_windows" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "diagnostic_codes_manufacturer_code_idx" ON "diagnostic_codes" USING btree ("manufacturer","code");--> statement-breakpoint
CREATE UNIQUE INDEX "diagnostic_codes_slug_idx" ON "diagnostic_codes" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "diagnostic_codes_manufacturer_idx" ON "diagnostic_codes" USING btree ("manufacturer");--> statement-breakpoint
CREATE INDEX "diagnostic_codes_severity_idx" ON "diagnostic_codes" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "diagnostic_codes_code_idx" ON "diagnostic_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "digital_product_user_idx" ON "digital_product_listings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "digital_product_slug_idx" ON "digital_product_listings" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "digital_product_status_idx" ON "digital_product_listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "digital_product_category_idx" ON "digital_product_listings" USING btree ("category");--> statement-breakpoint
CREATE INDEX "domain_orders_user_id_idx" ON "domain_orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "domain_orders_status_idx" ON "domain_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "domain_orders_domain_idx" ON "domain_orders" USING btree ("domain_name");--> statement-breakpoint
CREATE INDEX "driver_route_fact_route_idx" ON "driver_route_fact" USING btree ("route_id");--> statement-breakpoint
CREATE INDEX "driver_route_fact_driver_idx" ON "driver_route_fact" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "driver_route_fact_laundromat_idx" ON "driver_route_fact" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "driver_route_fact_date_idx" ON "driver_route_fact" USING btree ("date");--> statement-breakpoint
CREATE INDEX "driver_sessions_driver_idx" ON "driver_sessions" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "driver_sessions_laundromat_idx" ON "driver_sessions" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "driver_sessions_date_idx" ON "driver_sessions" USING btree ("session_date");--> statement-breakpoint
CREATE INDEX "due_diligence_tasks_nda_idx" ON "due_diligence_tasks" USING btree ("nda_request_id");--> statement-breakpoint
CREATE INDEX "campaign_status_idx" ON "email_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "campaign_scheduled_idx" ON "email_campaigns" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "email_contacts_user_idx" ON "email_contacts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "email_contacts_email_user_idx" ON "email_contacts" USING btree ("email","user_id");--> statement-breakpoint
CREATE INDEX "email_contacts_status_idx" ON "email_contacts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_event_subscriber_idx" ON "email_events" USING btree ("subscriber_id","event_type");--> statement-breakpoint
CREATE INDEX "email_event_campaign_idx" ON "email_events" USING btree ("campaign_id","event_type");--> statement-breakpoint
CREATE INDEX "email_event_occurred_idx" ON "email_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "email_subscribers_email_idx" ON "email_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "email_subscribers_status_idx" ON "email_subscribers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_verification_token_idx" ON "email_verification_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "email_verification_email_idx" ON "email_verification_tokens" USING btree ("email");--> statement-breakpoint
CREATE INDEX "email_verification_expires_at_idx" ON "email_verification_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "equipment_inquiries_email_idx" ON "equipment_inquiries" USING btree ("email");--> statement-breakpoint
CREATE INDEX "equipment_inquiries_status_idx" ON "equipment_inquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "equipment_inquiries_created_at_idx" ON "equipment_inquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "equipment_listings_user_idx" ON "equipment_listings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "equipment_listings_category_idx" ON "equipment_listings" USING btree ("category");--> statement-breakpoint
CREATE INDEX "equipment_listings_status_idx" ON "equipment_listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "external_connections_user_idx" ON "external_connections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "external_connections_type_idx" ON "external_connections" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "favorite_listings_user_listing_idx" ON "favorite_listings" USING btree ("user_id","listing_id");--> statement-breakpoint
CREATE INDEX "favorite_listings_user_idx" ON "favorite_listings" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "forum_bookmarks_user_entity_idx" ON "forum_bookmarks" USING btree ("user_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "forum_bookmarks_user_idx" ON "forum_bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "forum_categories_slug_idx" ON "forum_categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "forum_follows_user_entity_idx" ON "forum_follows" USING btree ("user_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "forum_follows_user_idx" ON "forum_follows" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "forum_follows_entity_idx" ON "forum_follows" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "forum_mentions_mentioned_user_idx" ON "forum_mentions" USING btree ("mentioned_user_id");--> statement-breakpoint
CREATE INDEX "forum_mentions_entity_idx" ON "forum_mentions" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "forum_reactions_user_entity_type_idx" ON "forum_reactions" USING btree ("user_id","entity_type","entity_id","reaction_type");--> statement-breakpoint
CREATE INDEX "forum_reactions_entity_idx" ON "forum_reactions" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "forum_replies_topic_idx" ON "forum_replies" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "forum_replies_user_idx" ON "forum_replies" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "forum_replies_parent_idx" ON "forum_replies" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "forum_topics_category_idx" ON "forum_topics" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "forum_topics_user_idx" ON "forum_topics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "forum_topics_slug_idx" ON "forum_topics" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "forum_topics_activity_idx" ON "forum_topics" USING btree ("last_activity_at");--> statement-breakpoint
CREATE UNIQUE INDEX "forum_votes_user_entity_idx" ON "forum_votes" USING btree ("user_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "forum_votes_entity_idx" ON "forum_votes" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "generated_assets_user_idx" ON "generated_assets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "generated_assets_project_idx" ON "generated_assets" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "generated_assets_type_idx" ON "generated_assets" USING btree ("type");--> statement-breakpoint
CREATE INDEX "geofence_zones_laundromat_idx" ON "geofence_zones" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "geofence_zones_type_idx" ON "geofence_zones" USING btree ("zone_type");--> statement-breakpoint
CREATE INDEX "geofence_zones_active_idx" ON "geofence_zones" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "chapter_project_idx" ON "ghostwriting_chapters" USING btree ("project_id","chapter_number");--> statement-breakpoint
CREATE INDEX "ghostwriting_user_idx" ON "ghostwriting_projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ghostwriting_status_idx" ON "ghostwriting_projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gsc_property_user_idx" ON "gsc_properties" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "gsc_metrics_property_idx" ON "gsc_query_metrics" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "gsc_metrics_query_idx" ON "gsc_query_metrics" USING btree ("query");--> statement-breakpoint
CREATE INDEX "gsc_metrics_date_idx" ON "gsc_query_metrics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "household_accounts_laundromat_idx" ON "household_accounts" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "household_accounts_status_idx" ON "household_accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "hydration_user_date_idx" ON "hydration_logs" USING btree ("user_id","logged_at");--> statement-breakpoint
CREATE INDEX "indexing_url_idx" ON "indexing_events" USING btree ("url");--> statement-breakpoint
CREATE INDEX "indexing_status_idx" ON "indexing_events" USING btree ("index_now_status");--> statement-breakpoint
CREATE INDEX "industry_benchmarks_category_metric_idx" ON "industry_benchmarks" USING btree ("category","metric");--> statement-breakpoint
CREATE INDEX "industry_benchmarks_year_idx" ON "industry_benchmarks" USING btree ("year");--> statement-breakpoint
CREATE INDEX "industry_kb_slug_idx" ON "industry_knowledge_bases" USING btree ("industry_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "industry_pulse_date_period_idx" ON "industry_pulse" USING btree ("date","period");--> statement-breakpoint
CREATE INDEX "keyword_checked_idx" ON "keyword_rankings" USING btree ("keyword_id","checked_at");--> statement-breakpoint
CREATE INDEX "keyword_job_user_idx" ON "keyword_research_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "keyword_job_status_idx" ON "keyword_research_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "lesson_progress_user_lesson_idx" ON "lesson_progress" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "link_graph_project_idx" ON "link_graph" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "link_graph_from_url_idx" ON "link_graph" USING btree ("from_url");--> statement-breakpoint
CREATE INDEX "link_graph_to_url_idx" ON "link_graph" USING btree ("to_url");--> statement-breakpoint
CREATE INDEX "listing_comparisons_user_idx" ON "listing_comparisons" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "listing_equipment_listing_idx" ON "listing_equipment" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "listing_financials_listing_idx" ON "listing_financials" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "listing_inquiries_listing_idx" ON "listing_inquiries" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "listing_media_listing_idx" ON "listing_media" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "listing_views_listing_idx" ON "listing_views" USING btree ("listing_id");--> statement-breakpoint
CREATE UNIQUE INDEX "listings_slug_idx" ON "listings" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "listings_marketplace_search_idx" ON "listings" USING btree ("status","country","featured","priority_search");--> statement-breakpoint
CREATE INDEX "listings_user_idx" ON "listings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "logo_projects_user_idx" ON "logo_projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "loyalty_transactions_customer_idx" ON "loyalty_transactions" USING btree ("customer_portal_id");--> statement-breakpoint
CREATE INDEX "loyalty_transactions_laundromat_idx" ON "loyalty_transactions" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "loyalty_transactions_type_idx" ON "loyalty_transactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "machine_assets_laundromat_idx" ON "machine_assets" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "machine_assets_type_idx" ON "machine_assets" USING btree ("machine_type");--> statement-breakpoint
CREATE INDEX "machine_assets_status_idx" ON "machine_assets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "machine_assets_iot_idx" ON "machine_assets" USING btree ("iot_device_id");--> statement-breakpoint
CREATE INDEX "lifecycle_machine_idx" ON "machine_lifecycle_metrics" USING btree ("machine_id");--> statement-breakpoint
CREATE INDEX "lifecycle_laundromat_idx" ON "machine_lifecycle_metrics" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "predictive_metrics_machine_idx" ON "machine_predictive_metrics" USING btree ("machine_id");--> statement-breakpoint
CREATE INDEX "predictive_metrics_laundromat_idx" ON "machine_predictive_metrics" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "predictive_metrics_health_idx" ON "machine_predictive_metrics" USING btree ("overall_health_score");--> statement-breakpoint
CREATE INDEX "predictive_metrics_priority_idx" ON "machine_predictive_metrics" USING btree ("maintenance_priority");--> statement-breakpoint
CREATE INDEX "machine_turn_fact_machine_idx" ON "machine_turn_fact" USING btree ("machine_id");--> statement-breakpoint
CREATE INDEX "machine_turn_fact_laundromat_idx" ON "machine_turn_fact" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "machine_turn_fact_date_idx" ON "machine_turn_fact" USING btree ("date");--> statement-breakpoint
CREATE INDEX "maintenance_plans_machine_idx" ON "maintenance_plans" USING btree ("machine_id");--> statement-breakpoint
CREATE INDEX "maintenance_plans_next_due_idx" ON "maintenance_plans" USING btree ("next_due_date");--> statement-breakpoint
CREATE INDEX "marketplace_products_vendor_idx" ON "marketplace_products" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "marketplace_products_category_idx" ON "marketplace_products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "marketplace_products_slug_idx" ON "marketplace_products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "media_assets_user_idx" ON "media_assets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "media_assets_project_idx" ON "media_assets" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "mileage_logs_driver_idx" ON "mileage_logs" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "mileage_logs_session_idx" ON "mileage_logs" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "mileage_logs_date_idx" ON "mileage_logs" USING btree ("trip_date");--> statement-breakpoint
CREATE INDEX "mileage_logs_status_idx" ON "mileage_logs" USING btree ("reimbursement_status");--> statement-breakpoint
CREATE INDEX "module_metrics_module_idx" ON "module_metrics" USING btree ("module");--> statement-breakpoint
CREATE INDEX "module_metrics_user_module_idx" ON "module_metrics" USING btree ("user_id","module");--> statement-breakpoint
CREATE INDEX "module_metrics_date_idx" ON "module_metrics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "nda_requests_listing_status_idx" ON "nda_requests" USING btree ("listing_id","status");--> statement-breakpoint
CREATE INDEX "new_product_alerts_email_category_idx" ON "new_product_alerts" USING btree ("email","category");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_email_idx" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "newsletter_industry_idx" ON "newsletter_subscribers" USING btree ("primary_industry");--> statement-breakpoint
CREATE INDEX "newsletter_status_idx" ON "newsletter_subscribers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "newsletter_country_idx" ON "newsletter_subscribers" USING btree ("country_code");--> statement-breakpoint
CREATE INDEX "newsletter_lead_score_idx" ON "newsletter_subscribers" USING btree ("lead_score");--> statement-breakpoint
CREATE INDEX "onboarding_laundromat_idx" ON "onboarding_progress" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "onboarding_user_idx" ON "onboarding_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "onboarding_status_idx" ON "onboarding_progress" USING btree ("status");--> statement-breakpoint
CREATE INDEX "online_orders_business_idx" ON "online_orders" USING btree ("business_profile_id");--> statement-breakpoint
CREATE INDEX "online_orders_status_idx" ON "online_orders" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "online_orders_number_idx" ON "online_orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "order_items_service_order_idx" ON "order_items" USING btree ("service_order_id");--> statement-breakpoint
CREATE INDEX "traffic_date_country_idx" ON "organic_traffic" USING btree ("date","country_code");--> statement-breakpoint
CREATE INDEX "page_sections_page_idx" ON "page_sections" USING btree ("page_id");--> statement-breakpoint
CREATE UNIQUE INDEX "page_seo_path_idx" ON "page_seo_metadata" USING btree ("page_path");--> statement-breakpoint
CREATE INDEX "page_seo_type_idx" ON "page_seo_metadata" USING btree ("page_type");--> statement-breakpoint
CREATE INDEX "parts_inventory_laundromat_idx" ON "parts_inventory" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "parts_inventory_part_number_idx" ON "parts_inventory" USING btree ("part_number");--> statement-breakpoint
CREATE INDEX "parts_inventory_category_idx" ON "parts_inventory" USING btree ("category");--> statement-breakpoint
CREATE INDEX "parts_inventory_low_stock_idx" ON "parts_inventory" USING btree ("quantity_on_hand");--> statement-breakpoint
CREATE INDEX "vendors_laundromat_idx" ON "parts_vendors" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "vendors_preferred_idx" ON "parts_vendors" USING btree ("is_preferred");--> statement-breakpoint
CREATE INDEX "payment_settlements_laundromat_idx" ON "payment_settlements" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "payment_settlements_date_idx" ON "payment_settlements" USING btree ("settlement_date");--> statement-breakpoint
CREATE INDEX "run_pipeline_idx" ON "pipeline_runs" USING btree ("pipeline_id");--> statement-breakpoint
CREATE INDEX "run_user_idx" ON "pipeline_runs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "run_status_idx" ON "pipeline_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pos_items_transaction_idx" ON "pos_items" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "pos_transactions_laundromat_idx" ON "pos_transactions" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "pos_transactions_customer_idx" ON "pos_transactions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "pos_transactions_status_idx" ON "pos_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pos_transactions_created_at_idx" ON "pos_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "price_alerts_email_idx" ON "price_alerts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "price_alerts_asin_idx" ON "price_alerts" USING btree ("product_asin");--> statement-breakpoint
CREATE INDEX "production_user_idx" ON "production_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "production_status_idx" ON "production_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "production_queue_idx" ON "production_jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "queue_user_idx" ON "production_queue" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "queue_status_idx" ON "production_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "redemption_promo_code_idx" ON "promo_code_redemptions" USING btree ("promo_code_id");--> statement-breakpoint
CREATE INDEX "redemption_user_idx" ON "promo_code_redemptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "redemption_email_idx" ON "promo_code_redemptions" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "promo_code_idx" ON "promo_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "promo_active_idx" ON "promo_codes" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "promo_expires_idx" ON "promo_codes" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "proof_of_delivery_stop_idx" ON "proof_of_delivery" USING btree ("stop_id");--> statement-breakpoint
CREATE INDEX "proof_of_delivery_transaction_idx" ON "proof_of_delivery" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "proof_of_delivery_delivered_at_idx" ON "proof_of_delivery" USING btree ("delivered_at");--> statement-breakpoint
CREATE INDEX "quiz_attempts_user_lesson_idx" ON "quiz_attempts" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "quiz_questions_lesson_idx" ON "quiz_questions" USING btree ("lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rate_limit_ip_endpoint_idx" ON "rate_limit_log" USING btree ("ip_address","endpoint","window_start");--> statement-breakpoint
CREATE INDEX "rate_limit_expires_at_idx" ON "rate_limit_log" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "reading_progress_user_chapter_idx" ON "reading_progress" USING btree ("user_id","chapter_id");--> statement-breakpoint
CREATE UNIQUE INDEX "country_code_idx" ON "regional_pricing" USING btree ("country_code");--> statement-breakpoint
CREATE INDEX "repair_logs_machine_idx" ON "repair_logs" USING btree ("machine_id");--> statement-breakpoint
CREATE INDEX "repair_logs_laundromat_idx" ON "repair_logs" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "repair_logs_status_idx" ON "repair_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "repair_logs_category_idx" ON "repair_logs" USING btree ("issue_category");--> statement-breakpoint
CREATE INDEX "repair_logs_technician_idx" ON "repair_logs" USING btree ("technician_id");--> statement-breakpoint
CREATE INDEX "repair_parts_repair_idx" ON "repair_parts_used" USING btree ("repair_log_id");--> statement-breakpoint
CREATE INDEX "repair_parts_inventory_idx" ON "repair_parts_used" USING btree ("part_inventory_id");--> statement-breakpoint
CREATE INDEX "repair_tickets_laundromat_idx" ON "repair_tickets" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "repair_tickets_machine_idx" ON "repair_tickets" USING btree ("machine_id");--> statement-breakpoint
CREATE INDEX "repair_tickets_status_idx" ON "repair_tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "repair_tickets_priority_idx" ON "repair_tickets" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "repair_tickets_reported_at_idx" ON "repair_tickets" USING btree ("reported_at");--> statement-breakpoint
CREATE INDEX "reputation_events_user_idx" ON "reputation_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "resource_usage_resource_idx" ON "resource_usage" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "resource_usage_user_idx" ON "resource_usage" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "resources_slug_idx" ON "resources" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "resources_type_idx" ON "resources" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "resources_category_idx" ON "resources" USING btree ("category");--> statement-breakpoint
CREATE INDEX "route_stops_route_idx" ON "route_stops" USING btree ("route_id");--> statement-breakpoint
CREATE INDEX "route_stops_transaction_idx" ON "route_stops" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "route_stops_status_idx" ON "route_stops" USING btree ("status");--> statement-breakpoint
CREATE INDEX "routes_laundromat_idx" ON "routes" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "routes_driver_idx" ON "routes" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "routes_date_idx" ON "routes" USING btree ("route_date");--> statement-breakpoint
CREATE INDEX "routes_status_idx" ON "routes" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_search_alerts_search_listing_idx" ON "saved_search_alerts" USING btree ("saved_search_id","listing_id");--> statement-breakpoint
CREATE INDEX "saved_searches_user_idx" ON "saved_searches" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saved_searches_active_alert_idx" ON "saved_searches" USING btree ("is_active","alert_frequency");--> statement-breakpoint
CREATE INDEX "scale_calibrations_laundromat_idx" ON "scale_calibrations" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "scale_calibrations_scale_idx" ON "scale_calibrations" USING btree ("scale_id");--> statement-breakpoint
CREATE INDEX "scale_calibrations_date_idx" ON "scale_calibrations" USING btree ("calibration_date");--> statement-breakpoint
CREATE INDEX "schema_markup_library_url_idx" ON "schema_markup_library" USING btree ("url");--> statement-breakpoint
CREATE INDEX "schema_markup_library_schema_type_idx" ON "schema_markup_library" USING btree ("schema_type");--> statement-breakpoint
CREATE INDEX "schema_markup_library_deployed_idx" ON "schema_markup_library" USING btree ("is_deployed");--> statement-breakpoint
CREATE INDEX "search_analytics_query_idx" ON "search_analytics" USING btree ("query");--> statement-breakpoint
CREATE INDEX "search_analytics_searched_at_idx" ON "search_analytics" USING btree ("searched_at");--> statement-breakpoint
CREATE INDEX "search_index_entity_type_idx" ON "search_index" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "search_index_title_idx" ON "search_index" USING btree ("title");--> statement-breakpoint
CREATE INDEX "search_index_rank_idx" ON "search_index" USING btree ("search_rank");--> statement-breakpoint
CREATE INDEX "search_index_active_idx" ON "search_index" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "search_index_url_idx" ON "search_index" USING btree ("url");--> statement-breakpoint
CREATE INDEX "sensor_thresholds_machine_idx" ON "sensor_thresholds" USING btree ("machine_id");--> statement-breakpoint
CREATE INDEX "sensor_thresholds_sensor_idx" ON "sensor_thresholds" USING btree ("sensor_type");--> statement-breakpoint
CREATE INDEX "seo_agent_templates_category_idx" ON "seo_agent_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "seo_agent_templates_premium_idx" ON "seo_agent_templates" USING btree ("is_premium");--> statement-breakpoint
CREATE INDEX "seo_agents_user_id_idx" ON "seo_agents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "seo_agents_project_id_idx" ON "seo_agents" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "seo_agents_active_idx" ON "seo_agents" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "seo_audits_project_id_idx" ON "seo_audits" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "seo_audits_user_id_idx" ON "seo_audits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "seo_audits_audited_at_idx" ON "seo_audits" USING btree ("audited_at");--> statement-breakpoint
CREATE INDEX "seo_automation_tasks_task_type_idx" ON "seo_automation_tasks" USING btree ("task_type");--> statement-breakpoint
CREATE INDEX "seo_automation_tasks_status_idx" ON "seo_automation_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "seo_automation_tasks_next_run_idx" ON "seo_automation_tasks" USING btree ("next_run_at");--> statement-breakpoint
CREATE INDEX "seo_automation_tasks_user_idx" ON "seo_automation_tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "seo_backlinks_project_idx" ON "seo_backlinks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "seo_backlinks_source_domain_idx" ON "seo_backlinks" USING btree ("source_domain");--> statement-breakpoint
CREATE INDEX "seo_competitors_project_idx" ON "seo_competitors" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "seo_competitors_domain_idx" ON "seo_competitors" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "seo_indexing_jobs_project_id_idx" ON "seo_indexing_jobs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "seo_indexing_jobs_google_status_idx" ON "seo_indexing_jobs" USING btree ("google_status");--> statement-breakpoint
CREATE INDEX "seo_keyword_country_idx" ON "seo_keywords" USING btree ("keyword","country_code");--> statement-breakpoint
CREATE INDEX "seo_metrics_project_id_idx" ON "seo_metrics" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "seo_metrics_recorded_at_idx" ON "seo_metrics" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "seo_projects_user_id_idx" ON "seo_projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "seo_projects_status_idx" ON "seo_projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "seo_publications_connection_idx" ON "seo_publications" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "seo_publications_status_idx" ON "seo_publications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "seo_recommendations_project_idx" ON "seo_recommendations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "seo_recommendations_type_idx" ON "seo_recommendations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "seo_recommendations_priority_idx" ON "seo_recommendations" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "seo_tasks_project_id_idx" ON "seo_tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "seo_tasks_status_idx" ON "seo_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "seo_tasks_priority_idx" ON "seo_tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "serp_cache_keyword_idx" ON "serp_results_cache" USING btree ("keyword");--> statement-breakpoint
CREATE INDEX "serp_cache_job_idx" ON "serp_results_cache" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "serp_snapshots_project_keyword_idx" ON "serp_snapshots" USING btree ("project_id","keyword_id");--> statement-breakpoint
CREATE INDEX "serp_snapshots_fetched_at_idx" ON "serp_snapshots" USING btree ("fetched_at");--> statement-breakpoint
CREATE INDEX "serp_tracking_keyword_idx" ON "serp_tracking" USING btree ("keyword");--> statement-breakpoint
CREATE INDEX "serp_tracking_target_url_idx" ON "serp_tracking" USING btree ("target_url");--> statement-breakpoint
CREATE INDEX "serp_tracking_position_idx" ON "serp_tracking" USING btree ("current_position");--> statement-breakpoint
CREATE INDEX "serp_tracking_checked_at_idx" ON "serp_tracking" USING btree ("checked_at");--> statement-breakpoint
CREATE INDEX "service_cards_user_idx" ON "service_cards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "service_cards_project_idx" ON "service_cards" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "service_guy_ai_session_idx" ON "service_guy_ai_conversations" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "service_guy_ai_technician_idx" ON "service_guy_ai_conversations" USING btree ("technician_id");--> statement-breakpoint
CREATE INDEX "service_guy_ai_machine_idx" ON "service_guy_ai_conversations" USING btree ("machine_id");--> statement-breakpoint
CREATE INDEX "service_orders_laundromat_idx" ON "service_orders" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "service_orders_customer_idx" ON "service_orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "service_orders_status_idx" ON "service_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "site_audits_domain_idx" ON "site_audits" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "site_audits_health_score_idx" ON "site_audits" USING btree ("overall_health_score");--> statement-breakpoint
CREATE INDEX "site_audits_audited_at_idx" ON "site_audits" USING btree ("audited_at");--> statement-breakpoint
CREATE INDEX "site_pages_project_idx" ON "site_pages" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "site_projects_user_idx" ON "site_projects" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "site_projects_subdomain_idx" ON "site_projects" USING btree ("subdomain");--> statement-breakpoint
CREATE INDEX "social_shares_user_idx" ON "social_shares" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "social_shares_content_idx" ON "social_shares" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "social_shares_platform_idx" ON "social_shares" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "social_shares_affiliate_idx" ON "social_shares" USING btree ("affiliate_code");--> statement-breakpoint
CREATE INDEX "sponsorship_sponsor_idx" ON "sponsorships" USING btree ("sponsor_id");--> statement-breakpoint
CREATE INDEX "sponsorship_status_idx" ON "sponsorships" USING btree ("status");--> statement-breakpoint
CREATE INDEX "stock_alerts_email_idx" ON "stock_alerts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "stock_alerts_asin_idx" ON "stock_alerts" USING btree ("product_asin");--> statement-breakpoint
CREATE INDEX "style_session_user_idx" ON "style_training_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "style_session_profile_idx" ON "style_training_sessions" USING btree ("voice_profile_id");--> statement-breakpoint
CREATE INDEX "subscriptions_laundromat_idx" ON "subscriptions" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "subscriptions_customer_idx" ON "subscriptions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "supply_listings_user_idx" ON "supply_listings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "supply_listings_category_idx" ON "supply_listings" USING btree ("category");--> statement-breakpoint
CREATE INDEX "supply_listings_status_idx" ON "supply_listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "dispatches_repair_idx" ON "technician_dispatches" USING btree ("repair_log_id");--> statement-breakpoint
CREATE INDEX "dispatches_technician_idx" ON "technician_dispatches" USING btree ("technician_id");--> statement-breakpoint
CREATE INDEX "dispatches_laundromat_idx" ON "technician_dispatches" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "dispatches_status_idx" ON "technician_dispatches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "technicians_laundromat_idx" ON "technicians" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "technicians_status_idx" ON "technicians" USING btree ("status");--> statement-breakpoint
CREATE INDEX "telemetry_events_machine_idx" ON "telemetry_events" USING btree ("machine_id");--> statement-breakpoint
CREATE INDEX "telemetry_events_type_idx" ON "telemetry_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "telemetry_events_cycle_idx" ON "telemetry_events" USING btree ("cycle_id");--> statement-breakpoint
CREATE INDEX "telemetry_events_timestamp_idx" ON "telemetry_events" USING btree ("timestamp");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_user_unique_idx" ON "tenant_users" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE INDEX "upgrade_recs_laundromat_idx" ON "upgrade_recommendations" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "upgrade_recs_user_idx" ON "upgrade_recommendations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "upgrade_recs_status_idx" ON "upgrade_recommendations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "upgrade_recs_type_idx" ON "upgrade_recommendations" USING btree ("recommendation_type");--> statement-breakpoint
CREATE UNIQUE INDEX "user_achievement_unique_idx" ON "user_achievements" USING btree ("user_id","achievement_id");--> statement-breakpoint
CREATE INDEX "user_activity_user_date_idx" ON "user_activity_log" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "user_badges_user_idx" ON "user_badges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_badges_type_idx" ON "user_badges" USING btree ("badge_type");--> statement-breakpoint
CREATE INDEX "user_content_user_idx" ON "user_content" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_content_type_idx" ON "user_content" USING btree ("content_type");--> statement-breakpoint
CREATE INDEX "user_content_status_idx" ON "user_content" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_content_published_at_idx" ON "user_content" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "user_content_slug_idx" ON "user_content" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "user_integrations_user_idx" ON "user_integrations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_integrations_type_idx" ON "user_integrations" USING btree ("integration_type");--> statement-breakpoint
CREATE INDEX "utility_bill_user_idx" ON "utility_bill_analyses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "utility_bill_date_idx" ON "utility_bill_analyses" USING btree ("bill_date");--> statement-breakpoint
CREATE UNIQUE INDEX "vendor_directory_slug_idx" ON "vendor_directory" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "vendor_directory_category_idx" ON "vendor_directory" USING btree ("primary_category");--> statement-breakpoint
CREATE INDEX "vendor_products_store_idx" ON "vendor_products" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "vendor_products_category_idx" ON "vendor_products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "vendor_products_status_idx" ON "vendor_products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vendor_products_slug_idx" ON "vendor_products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "vendor_purchase_orders_laundromat_idx" ON "vendor_purchase_orders" USING btree ("laundromat_id");--> statement-breakpoint
CREATE INDEX "vendor_purchase_orders_vendor_idx" ON "vendor_purchase_orders" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "vendor_purchase_orders_status_idx" ON "vendor_purchase_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vendor_purchase_orders_order_date_idx" ON "vendor_purchase_orders" USING btree ("order_date");--> statement-breakpoint
CREATE INDEX "vendor_reviews_vendor_idx" ON "vendor_reviews" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "vendor_reviews_user_idx" ON "vendor_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "vendor_stores_owner_idx" ON "vendor_stores" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "vendor_stores_slug_idx" ON "vendor_stores" USING btree ("store_slug");--> statement-breakpoint
CREATE INDEX "vendor_stores_status_idx" ON "vendor_stores" USING btree ("status");--> statement-breakpoint
CREATE INDEX "visibility_jobs_order_idx" ON "visibility_jobs" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "visibility_jobs_status_idx" ON "visibility_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "visibility_orders_listing_idx" ON "visibility_orders" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "visibility_orders_user_idx" ON "visibility_orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "visibility_orders_status_idx" ON "visibility_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "voice_profile_user_idx" ON "voice_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "voice_profile_default_idx" ON "voice_profiles" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "vr_user_type_idx" ON "vr_recovery_sessions" USING btree ("user_id","session_type");--> statement-breakpoint
CREATE INDEX "warranty_records_machine_idx" ON "warranty_records" USING btree ("machine_id");--> statement-breakpoint
CREATE INDEX "warranty_records_end_date_idx" ON "warranty_records" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "warranty_records_active_idx" ON "warranty_records" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "web_template_slug_idx" ON "web_page_templates" USING btree ("template_slug");--> statement-breakpoint
CREATE INDEX "web_template_category_idx" ON "web_page_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "website_videos_user_idx" ON "website_videos" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "website_videos_project_idx" ON "website_videos" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "weigh_events_transaction_idx" ON "weigh_events" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "weigh_events_created_at_idx" ON "weigh_events" USING btree ("created_at");
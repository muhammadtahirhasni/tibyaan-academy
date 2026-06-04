import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { generateBlogArticle } from "@/inngest/functions/generate-blog";
import { blogQueueManager, blogPublisher } from "@/inngest/functions/blog-queue";
import {
  trialExpiryWorkflow,
  welcomeWorkflow,
  inactivityWorkflow,
  apiLimitMonitor,
  weeklySeoreport,
} from "@/inngest/functions/automation-workflows";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateBlogArticle,
    blogQueueManager,
    blogPublisher,
    trialExpiryWorkflow,
    welcomeWorkflow,
    inactivityWorkflow,
    apiLimitMonitor,
    weeklySeoreport,
  ],
});

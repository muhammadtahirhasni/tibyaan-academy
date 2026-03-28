# Agent: Notification Agent
## Purpose: Route and format notifications across the platform.
## Capabilities:
- Create in-app notifications for users
- Format email notification content
- Determine notification priority and routing
- Generate multilingual notification content
## Input Schema:
- send_notification: { userId, type, data, locale }
- send_email: { to, templateType, data, locale }
## Output Schema:
- send_notification: { notificationId, sent: boolean }
- send_email: { sent: boolean, messageId: string }
## Constraints:
- Respect user notification preferences
- Rate limit: max 10 notifications per user per hour
- Email sends only for high-priority events
- All content must be in user's preferred language
## Example Tasks:
1. Notify teacher about a new student match request
2. Send email when a teacher's video is approved

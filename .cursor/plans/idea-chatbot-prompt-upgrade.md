# Idea Chatbot Prompt Upgrade

## Goal

Replace the idea chatbot system prompts with the new 4-phase, rule-rich spec (stance, opening line, AI behaviour, workflow, fatigue detection, output format). Single source of truth for start and message routes.

## Completed

1. **Shared module** – [src/lib/idea-chat-prompts.ts](src/lib/idea-chat-prompts.ts): `IDEA_CHAT_SYSTEM_PROMPT_BASE`, `IDEA_CHAT_MESSAGE_PROMPT_TAIL`.
2. **Start route** – [src/app/api/ideas/chat/start/route.ts](src/app/api/ideas/chat/start/route.ts): uses base + profileBlock.
3. **Message route** – [src/app/api/ideas/chat/message/route.ts](src/app/api/ideas/chat/message/route.ts): uses base + tail + profileBlock (+ ideaContextBlock when ideaId).
4. **Tests** – `npx playwright test`: 48 passed, 6 skipped (header hide-on-scroll; ideas list upgrade menu). Skipped tests are pre-existing (ChatHeader has no hide-on-scroll; IdeaCard menu portal/timing in E2E).

## Verification

- Playwright: 48 passed, 6 skipped, exit code 0.
- No API or response shape changes; prompt text only.

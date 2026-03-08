# 📋 Cursor Instructions - Family Workspace

**Project:** Family Workspace (江口ファミリー)  
**Current Status:** Phase 2 Complete, AI Migration Needed  
**GitHub:** https://github.com/reonzpika/eguchi-family  
**Production:** https://eguchi-family.vercel.app

---

## 🎯 Your Mission

You are building the **Family Workspace** - a private web app for the Eguchi family to start and track business projects together.

**Current progress:** 40% complete (Phases 1-2 done)  
**Your job:** Complete remaining 60% (AI migration + Phases 3-6)

---

## 📚 All 14 Documents You Have

### **🚀 START WITH THESE (Read First):**

1. **START_HERE.md** ⭐ MOST IMPORTANT
2. **CURRENT_STATUS.md** - What's built vs missing
3. **MIGRATION_GUIDE.md** - AI migration steps (DO THIS FIRST)

### **📖 Architecture & Planning:**

4. **implementation-order.md** - Build order, updated with progress
5. **ai-agent-architecture.md** - Complete AI system design
6. **master-handoff.md** - Project philosophy & standards

### **🔧 Technical Specifications:**

7. **database-schema.sql** - All tables + RLS policies
8. **api-specification.md** - All API endpoints
9. **component-inventory.md** - React components list
10. **design-system.md** - UI/UX specifications

### **📝 Quick Reference:**

11. **README.md** - Project overview
12. **NAME_UPDATE.md** - Product name changes (15 min task)
13. **UPDATE_SUMMARY.md** - What was updated
14. **CURSOR_INSTRUCTIONS.md** - This file

---

## 🎯 Work Priority Order

### **Phase A: AI Migration (Week 1-2) ⚠️ DO THIS FIRST**

**Read:** MIGRATION_GUIDE.md

**Install:**
```bash
npm install @anthropic-ai/sdk
```

**Change 2 files:**
- `src/app/api/ideas/chat/start/route.ts`
- `src/app/api/ideas/chat/message/route.ts`

**Create 1 file:**
- `src/lib/claude.ts`

**Keep these using OpenAI:**
- `src/app/api/ideas/finalize/route.ts`
- `src/app/api/projects/create/route.ts`
- `src/app/api/projects/[id]/update/route.ts`

---

### **Phase B: Milestones (Week 3-4)**
Build milestone UI + task management

### **Phase C: Reflections (Week 5-6)**
Weekly reflection + AI analysis

### **Phase D: Feed + Comments (Week 7-8)**
Activity feed + collaboration

### **Phase E: Notifications (Week 9+)**
Push notifications + reminders

---

## 📋 Coding Standards

**Always:**
- Mobile-first (320px minimum)
- TypeScript for everything
- Tailwind CSS v4 only
- Use existing components
- Follow design-system.md colors exactly
- 48px touch targets
- Handle all errors
- Show loading states

**Never:**
- Custom CSS
- Skip error handling
- Break mobile layout
- Ignore TypeScript errors
- Skip RLS policies

---

## ✅ Before You Start

- [ ] Read START_HERE.md
- [ ] Read CURRENT_STATUS.md
- [ ] Read MIGRATION_GUIDE.md
- [ ] Local dev working (`npm run dev`)
- [ ] Can sign in to app
- [ ] Understand Phase A = AI migration

---

**Start with MIGRATION_GUIDE.md. Build incrementally. Test on mobile. 頑張って！ 🌸**

# Product Name Update: "Family Workspace"

**Current:** 江口ファミリーハブ (Eguchi Family Hub)  
**New:** Family Workspace  
**Scope:** All user-facing text, metadata, emails

---

## 🔍 Files to Update

### **1. Site Metadata & SEO**

**File:** `src/app/layout.tsx`
```typescript
// CURRENT:
export const metadata: Metadata = {
  title: "江口ファミリーハブ",
  description: "江口ファミリーのプライベートワークスペース",
  manifest: "/manifest.json",
};

// CHANGE TO:
export const metadata: Metadata = {
  title: "Family Workspace",
  description: "江口ファミリーのプライベートワークスペース",
  manifest: "/manifest.json",
};
```

---

### **2. Sign-In Page**

**File:** `src/app/sign-in/[[...sign-in]]/page.tsx`
```tsx
// CURRENT:
<h1 className="text-[26px] font-extrabold text-foreground">
  江口ファミリーハブ
</h1>

// CHANGE TO:
<h1 className="text-[26px] font-extrabold text-foreground">
  Family Workspace
</h1>
```

---

### **3. PWA Manifest**

**File:** `public/manifest.json`
```json
// CURRENT:
{
  "name": "江口ファミリーハブ",
  "short_name": "江口Hub",
  ...
}

// CHANGE TO:
{
  "name": "Family Workspace",
  "short_name": "Workspace",
  ...
}
```

---

### **4. Email Templates**

**File:** `src/lib/emails/ProjectUpdatedEmail.tsx`

Check for any hardcoded product names in email templates.

**Current email "from" address:**
```typescript
from: "eguchi-workspace@clinicpro.co.nz"
```

**Consider updating to:**
```typescript
from: "family-workspace@clinicpro.co.nz"
```

---

### **5. Environment Variables**

**File:** `.env.local` (and Vercel dashboard)

```bash
# CURRENT:
NEXTAUTH_URL=https://eguchi-family.vercel.app
NEXT_PUBLIC_APP_URL=https://eguchi-family.vercel.app

# CONSIDER:
# Keep URL same (don't break existing links)
# Or migrate to:
# NEXTAUTH_URL=https://family-workspace.vercel.app
```

**Decision:** Probably keep Vercel URL as-is to avoid breaking links.

---

### **6. Admin Panel**

**File:** `src/app/admin/layout.tsx`
```tsx
// CURRENT:
<div className="text-sm font-extrabold text-foreground">
  🔧 管理パネル — Ryo only
</div>

// This is fine - doesn't mention product name
```

---

### **7. Comments in Code**

Search entire codebase for:
- "江口ファミリーハブ"
- "Eguchi Family Hub"
- "eguchi-family"

**Command:**
```bash
grep -r "江口ファミリーハブ" src/
grep -r "Eguchi Family Hub" src/
```

Update any comments or documentation strings.

---

## ✅ Quick Update Script

```bash
# In your project root:

# 1. Update metadata
sed -i '' 's/江口ファミリーハブ/Family Workspace/g' src/app/layout.tsx

# 2. Update sign-in page
sed -i '' 's/江口ファミリーハブ/Family Workspace/g' src/app/sign-in/\[\[...sign-in\]\]/page.tsx

# 3. Update manifest (if exists)
sed -i '' 's/江口ファミリーハブ/Family Workspace/g' public/manifest.json

# 4. Search for remaining instances
echo "Remaining instances:"
grep -r "江口ファミリーハブ" src/ public/

# 5. Commit changes
git add .
git commit -m "Update product name to Family Workspace"
git push
```

---

## 🚨 DON'T Change

**Keep these as-is:**
- GitHub repo name (reonzpika/eguchi-family)
- Vercel URL (eguchi-family.vercel.app)
- Database table names
- API route paths
- Environment variable names (NEXT_PUBLIC_*, etc.)
- File/folder structure

**Reason:** Changing these could break existing deployments, links, or integrations.

---

## 📝 Optional: Gradual Migration

If you want to keep Japanese for the family but use "Family Workspace" externally:

### **Strategy:**
1. Keep "江口ファミリー" in internal UI (for family)
2. Use "Family Workspace" in metadata/SEO (for branding)
3. Keep both in different contexts

### **Example:**
```typescript
// Metadata (external)
title: "Family Workspace"

// Welcome message (internal)
"江口ファミリーへようこそ！"
```

---

## ✅ Verification Checklist

After updates:

- [ ] Browser tab title shows "Family Workspace"
- [ ] Sign-in page shows correct name
- [ ] PWA install shows correct name
- [ ] No Japanese family name in metadata
- [ ] All pages still work
- [ ] No broken links
- [ ] Git commit includes all changes

---

## 🎯 Summary

**Minimum changes needed:**
1. `src/app/layout.tsx` (metadata title)
2. `src/app/sign-in/[[...sign-in]]/page.tsx` (header)
3. `public/manifest.json` (PWA name)

**Time:** 15 minutes
**Risk:** Very low
**Impact:** Product name consistency

**Do it now or after AI migration? Your choice!**

---

**Recommendation:** Update name now (quick win), then focus on AI migration (high impact).

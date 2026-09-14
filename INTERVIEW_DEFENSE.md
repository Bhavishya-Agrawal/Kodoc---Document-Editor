# 🎓 Kodoc — Technical Viva & Interview Defense Guide
### *Tailored for 4th-Year B.Tech Computer Science & Engineering Placements*

---

## 📌 Executive Summary
**Project Title**: Kodoc (Git for Documents)  
**Domain**: Web Systems, Distributed Document Versioning, Rich Text Authoring  
**Core Technologies**: MongoDB, Express.js, React 19, Node.js (MERN), Tailwind CSS 4, Tiptap (ProseMirror), Zustand, Diff (Myers Algorithm).

**One-Line Pitch**:  
> *"Kodoc is a full-stack document platform that translates software version control concepts—such as commits, working trees, visual diffs, and non-destructive rollbacks—into a natural rich-text writing experience."*

---

## 🏛️ System Architecture

```
[ Client: React 19 + Zustand + Tiptap ]
                  │
                  ▼ (REST over HTTPS + JWT Bearer)
[ Server: Node.js + Express.js API Gateway ]
                  │
   ├── [ Auth Middleware ] (JWT verification)
   ├── [ Versioning Engine ] (Content Normalization, Word Counting)
   └── [ Mongoose ODM ] (Schema validation, query execution)
                  │
                  ▼
[ Database: MongoDB Engine ]
   ├── users collection
   ├── documents collection (Parent documents + word count + pointers)
   └── versions collection (Immutable snapshots indexed on {docId, versionNumber})
```

---

## 💡 Key Architectural Decisions & Justifications

### 1. Why MongoDB over MySQL for Document Versioning?
- **Flexible Document Schema**: Rich-text editors (like Tiptap/ProseMirror) output semi-structured HTML or JSON ASTs. Storing document snapshots in a JSON/BSON native document store eliminates unnecessary relational normalization (like splitting text into paragraphs or fragments across relational tables).
- **Snapshot Append Performance**: Version control is predominantly an **append-only (write-heavy)** workload. MongoDB collections with indexes on `{ documentId: 1, versionNumber: -1 }` handle append operations in $O(\log N)$ or $O(1)$ amortized time.
- **Relational Integrity**: We maintain relational integrity at the application layer through Mongoose schemas and compound unique indexes to guarantee that no two versions within the same document can have identical version numbers.

### 2. Snapshot Storage vs. Delta/Diff Storage
*An interviewer will often ask: "Why store full HTML snapshots rather than Git-style diffs (deltas)?"*
- **The Trade-off**:
  - **Deltas (Forward/Reverse Diffs)**: Saves disk space, but rendering version $N$ requires traversing and replaying all deltas from version $1$ to $N$ ($O(N)$ reconstruction time).
  - **Full Snapshots**: Consumes slightly more disk space, but provides **$O(1)$ instant retrieval** for previewing, restoring, and diffing any arbitrary pair of versions.
- **Why Snapshots Win for Rich Text**:
  - A typical 1,000-word document in HTML is ~10 KB. 100 versions consume only ~1 MB of disk space. Storage in MongoDB is extremely cheap compared to the computational overhead and latency of replaying rich-text AST deltas on every preview request.
  - In Kodoc, diffs are calculated **on-demand in memory** when requested by the user, providing both fast reads and visual diff capabilities without complex delta reconstruction.

### 3. State Management: Why Zustand instead of Redux?
- **Bundle Size & Simplicity**: Redux Toolkit introduces boilerplate (actions, reducers, dispatchers, provider wrappers). Zustand is under 2 KB, requires zero provider wrappers, and uses a clean hook-based API (`useDocumentStore()`, `useVersionStore()`).
- **Granular Reactivity**: Zustand allows components to selectively subscribe to precise slices of state (e.g., `const saving = useVersionStore((s) => s.saving)`), preventing unnecessary re-renders of the editor during typing.

### 4. Rich Text Engine: Why Tiptap (ProseMirror)?
- **Headless & Accessible**: Unlike legacy editors (`contentEditable`, Draft.js, Quill), Tiptap is headless, framework-agnostic, and built on top of ProseMirror (the industry standard behind Atlassian Confluence, Notion, and The New York Times CMS).
- **Structured Schema**: It produces semantic, sanitized HTML/JSON without unwanted inline styles, making version diffing clean and predictable.

---

## 🔍 The Diffing Engine (Myers Diff Algorithm)

When an interviewer asks how visual changes are tracked:
- Kodoc uses the standard **Myers Diff Algorithm** (implemented via the `diff` library).
- **How it works**:
  1. The HTML content of both snapshots is normalized and stripped of markup to isolate textual content.
  2. The algorithm models the problem as finding the **Shortest Edit Script (SES)** or **Longest Common Subsequence (LCS)** on an edit graph.
  3. It searches paths on a grid where a horizontal step represents a deletion, a vertical step represents an insertion, and a diagonal step represents matching words.
  4. The client renders added words in green (`bg-emerald-50 text-emerald-800`), removed words in red with strikethrough (`bg-rose-50 text-rose-800 line-through`), and untouched text cleanly.

---

## ❓ Top 10 Technical Interview / Viva Q&A

#### Q1: "Walk me through what happens when a user clicks 'Commit' in the editor."
> **Answer**:
> 1. The frontend captures the current ProseMirror HTML content and the optional user commit message.
> 2. An HTTP `POST /api/documents/:id/versions` request is dispatched with the JWT bearer token.
> 3. Express middleware validates the JWT token and verifies that the authenticated user is the owner of the document.
> 4. The backend normalizes whitespace in the content and compares it against the latest stored version to detect if any actual changes occurred (`NO_CHANGES` guard).
> 5. If changes are detected, a new `Version` document is created with `versionNumber = currentVersion + 1`, a computed `wordCount`, and byte size.
> 6. The parent `Document` is atomically updated with the new `currentVersion` number, `latestVersionId` pointer, and updated `wordCount`.
> 7. The saved version is prepended to the client's Zustand store, triggering an instant UI timeline update and toast notification.

#### Q2: "How do you handle rollbacks / restoring an old version?"
> **Answer**:
> *"We follow Git's approach: restores are **non-destructive**. When restoring version $k$, we do not delete versions $k+1, \dots, n$. Instead, we create a brand new version $n+1$ whose content is a copy of version $k$, tagged with action `'restore'` and `restoredFromVersionNumber = k`. This preserves a complete, unforgeable audit trail."*

#### Q3: "How do you secure user documents against unauthorized access (IDOR)?"
> **Answer**:
> *"Every protected route passes through our `auth.js` middleware, which decodes the JWT and attaches `req.user.id`. In `verifyDocumentOwnership`, we query the database for the document and check `if (document.owner.toString() !== req.user.id)`. If it doesn't match, the request is immediately rejected with HTTP 401/403, completely mitigating Insecure Direct Object References (IDOR)."*

#### Q4: "How is user authentication implemented?"
> **Answer**:
> *"We use stateless JWT authentication. Passwords are never stored in plaintext—they are hashed using `bcryptjs` with 10 salt rounds before persisting to MongoDB. Upon successful login, the server issues a signed JWT containing the user ID with a 5-hour expiration. The client includes this token in the `Authorization: Bearer <token>` header for all API requests."*

#### Q5: "What happens if a document with 50 versions is deleted?"
> **Answer**:
> *"We implement a cascade deletion pattern. In `DELETE /api/documents/:id`, the controller first deletes the document document via `Document.findByIdAndDelete()`, and then executes `Version.deleteMany({ documentId: req.params.id })`. This ensures zero orphaned version records remain in the database."*

#### Q6: "How do you handle indexing in MongoDB for this system?"
> **Answer**:
> *"We define two compound indexes on the `Version` collection:
> 1. `{ documentId: 1, versionNumber: -1 }` with `{ unique: true }` to enforce version uniqueness and speed up latest-version lookups.
> 2. `{ documentId: 1, createdAt: -1 }` to optimize timeline sorting when fetching version history."*

#### Q7: "How is the 'Uncommitted changes' status detected in the UI?"
> **Answer**:
> *"In `EditorPage.jsx`, we maintain `localContent` (the live working buffer from Tiptap) and compare it against `currentContent` (the content of the last committed version). If `localContent.trim() !== currentContent.trim()`, the UI displays an amber `● Uncommitted changes` badge. Clicking it allows the user to view an in-memory diff between their unsaved edits and the last commit."*

#### Q8: "How does the document duplication feature work?"
> **Answer**:
> *"In `POST /api/documents/:id/duplicate`, the backend queries the source document and retrieves its latest content. It then creates a new `Document` with title `"${sourceTitle} (Copy)"` owned by the user, and immediately generates an initial `Version` 1 containing the duplicated content. This provides the user with an isolated fork of the document without altering the original's history."*

#### Q9: "How do you handle exports without backend dependencies?"
> **Answer**:
> *"All exports (Markdown, HTML, Plain Text, and PDF) are performed client-side using native browser APIs and Blob downloads (`exportDocument.js`). For Markdown, we convert HTML semantic tags into Markdown tokens (`#`, `**`, `*`, lists, code blocks). For PDF, we leverage `window.print()` with CSS `@media print` rules. This eliminates unnecessary server load and works completely offline."*

#### Q10: "If you had another month to work on this, what would you add?"
> **Answer**:
> *"I would implement two advanced features:
> 1. **Branching & Merging**: Introducing named branches (e.g., `main`, `draft-v2`) with a 3-way merge conflict resolution interface.
> 2. **Real-time Collaboration**: Integrating WebSockets and Yjs (CRDTs — Conflict-free Replicated Data Types) to support multi-user concurrent typing alongside our milestone commit engine."*

---

## 📦 Project Checklist for Interview Presentation
- [x] Backend REST API running on port 5000 with MongoDB connected.
- [x] Frontend running on port 5173 with clean design and responsive layout.
- [x] Full CRUD operations for documents.
- [x] Version timeline with commit messages, word counts, and size metrics.
- [x] Visual Diff Viewer with Word-by-Word and Line-by-Line toggle.
- [x] Rollback / Restore with audit trail.
- [x] Star / Favorite filter tab.
- [x] Document duplication (cloning).
- [x] Multi-format export (Markdown, HTML, Plain Text, PDF).
- [x] User Profile management (Bio, Full Name, Password change).
- [x] Zero ESLint errors, zero build warnings.
- [x] Automated E2E test suite passing 100% (`node test-e2e-full.js`).

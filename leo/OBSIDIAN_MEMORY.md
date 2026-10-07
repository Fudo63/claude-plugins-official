# LEO Obsidian Memory Integration 🧠

LEO stores all conversations and memories in an **Obsidian Vault** on your computer. This is your personal "brain" — a searchable, interconnected knowledge base.

## What Gets Stored

### 📝 Conversations
- Every exchange with LEO is saved as a markdown file
- Organized by date: `conversations/2026-10-07/abc123.md`
- Includes metadata: participants, topics, contacts, sentiment

### 📅 Daily Notes
- Auto-generated daily summaries
- Quick reference for each day's activities
- Links to all conversations that day

### 👥 Contacts
- People you mention in conversations
- Auto-referenced with bidirectional links

### 🏷️ Topics
- Subjects and keywords from your conversations
- Automatically tagged and linked

### 🔗 Graph
- Bidirectional links showing relationships
- Connection map of your conversations, people, and topics

## Setup (Windows)

### Step 1: Install Obsidian
1. Download from [obsidian.md](https://obsidian.md)
2. Install and launch Obsidian

### Step 2: Open/Create Vault
1. Click "Open folder as vault"
2. Navigate to: `C:\Users\fuadd\Desktop\Gehirn`
3. Click "Open" (or create folder if it doesn't exist)

### Step 3: Initialize LEO Memory
```bash
cd leo-agent
npm install
node ../scripts/init-obsidian-vault.js "C:\Users\fuadd\Desktop\Gehirn"
```

### Step 4: Configure LEO
Create `leo-agent/.env`:
```env
LEO_TOKEN=change-me-to-something-secret
PORT=3000
ANTHROPIC_API_KEY=sk-ant-...
LEO_VAULT_PATH=C:\Users\fuadd\Desktop\Gehirn
LEO_ENABLE_MEMORY=true
```

### Step 5: Start LEO
```bash
npm start
```

## Example Vault Structure

```
C:\Users\fuadd\Desktop\Gehirn\
├── conversations/
│   ├── 2026-10-07/
│   │   ├── abc123.md          # Conversation with metadata
│   │   ├── def456.md
│   │   └── ...
│   └── 2026-10-06/
├── daily/
│   ├── 2026-10-07.md          # Today's summary
│   └── 2026-10-06.md
├── contacts/
│   ├── John-Doe.md            # People you've mentioned
│   └── Jane-Smith.md
├── topics/
│   ├── work.md                # Topics/subjects
│   ├── projects.md
│   └── learning.md
├── settings/
│   └── leo-config.md
├── _graph/
│   ├── graph.json             # Bidirectional links
│   └── index.json             # Conversation index
└── .gitignore
```

## Example Conversation File

```markdown
---
id: abc123
created: 2026-10-07T14:30:45Z
participants:
  - LEO
  - User
topics:
  - work
  - projects
contacts:
  - John Doe
sentiment: positive
duration_minutes: 15
tags:
  - conversation
  - project-planning
---

# Project Planning Discussion

**Context:** John asked about Q4 roadmap

## Exchange

### 2026-10-07T14:30 - User
Question about Q4 product roadmap and timeline.

### 2026-10-07T14:31 - LEO
Based on previous discussions, here's the timeline...

### 2026-10-07T14:35 - User
Sounds good. Please add to calendar.

### 2026-10-07T14:35 - LEO
✓ Event created for tomorrow.

## Topics
- [[work]]
- [[projects]]

## People
- [[John Doe]]

---
**Duration:** 4 exchanges | **Sentiment:** positive
```

## Features

### 🔍 Search & Discovery
- Full-text search in Obsidian
- Find conversations by topic, date, or keyword
- See connections between topics

### 🏗️ Bidirectional Links
- Click on `[[topic]]` to see all related conversations
- Automatic relationship mapping
- Knowledge graph visualization

### 📊 Analytics
- Daily mood tracking
- Conversation trends
- Topic frequency
- Person/contact frequency

### 🤖 Memory Retrieval
- LEO automatically reads past relevant conversations
- Provides context for new queries
- Learns from history

## Daily Workflow

### Morning ☀️
1. Open Obsidian
2. Check today's daily note for overview
3. Review yesterday's summary

### During Day 💭
1. Chat with LEO normally
2. Conversations auto-save to vault
3. Every mention creates automatic links

### Evening 🌙
1. Daily summary auto-generated
2. Review key topics and insights
3. Add manual notes if needed

## Tips & Tricks

### 💡 Better Organization
- Use consistent topic names: `[[work]]` not `[[Work]]` or `[[job]]`
- Mention people by full name: `[[John Doe]]`
- Leo automatically links them!

### 🏷️ Tags
- Add tags to conversations: `#important`, `#todo`, `#follow-up`
- Search by tag in Obsidian

### 📌 Important Info
- Star important conversations in Obsidian
- Create "evergreen" notes for reference material
- Link them from topics: `[[topics/work#Processes]]`

### 🔗 Manual Links
- You can manually create links: `[[2026-10-07]]`
- Link to people and topics
- Build your own knowledge graph

## Advanced: Obsidian Plugins

Recommended plugins for LEO vault:

- **Dataview** - Query conversations, create dashboards
- **Calendar** - Timeline view of conversations
- **Graph Analysis** - Visualize topic relationships
- **Auto Link Title** - Cleaner link formatting
- **Templater** - Custom note templates

## Troubleshooting

### Vault not initializing?
```bash
node scripts/init-obsidian-vault.js "C:\Users\fuadd\Desktop\Gehirn"
```

### Conversations not saving?
1. Check `.env` has `LEO_VAULT_PATH` set correctly
2. Verify folder permissions (must be writable)
3. Check logs: `DEBUG=leo:* npm start`

### Obsidian not syncing?
- Obsidian reads files from disk
- LEO writes to disk
- Just open the vault folder and it updates automatically

### Too many files?
- Archive old conversations: move to `conversations/archive/`
- Annual backups: copy entire folder
- Search within date ranges in Obsidian

## Data Privacy

✅ All data stays on your computer  
✅ No cloud sync unless you set it up  
✅ Vault is a normal folder - back it up like any other folder  
✅ Use Obsidian Sync if you want cloud backup (paid feature)  

## Next Steps

1. ✅ Initialize vault
2. ✅ Configure `.env` with vault path
3. ✅ Start LEO
4. ✅ Have first conversation (auto-saves)
5. ✅ Open Obsidian to view memory
6. ✅ Ask LEO questions - it remembers context!

---

**Your brain is ready!** 🧠 Start chatting with LEO!

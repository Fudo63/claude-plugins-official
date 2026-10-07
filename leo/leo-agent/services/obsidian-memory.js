'use strict';

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const crypto = require('crypto');

class ObsidianMemoryManager {
  constructor(vaultPath = null) {
    // Windows path handling
    this.vaultPath = vaultPath || this._getDefaultVaultPath();
    this.conversationPath = path.join(this.vaultPath, 'conversations');
    this.dailyPath = path.join(this.vaultPath, 'daily');
    this.contactsPath = path.join(this.vaultPath, 'contacts');
    this.topicsPath = path.join(this.vaultPath, 'topics');
    this.settingsPath = path.join(this.vaultPath, 'settings');
    this.graphPath = path.join(this.vaultPath, '_graph', 'graph.json');
    this.indexPath = path.join(this.vaultPath, '_graph', 'index.json');
  }

  _getDefaultVaultPath() {
    // Windows: C:\Users\fuadd\Desktop\Gehirn
    // Unix: ~/.obsidian/leo-vault
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      const userProfile = process.env.USERPROFILE || process.env.HOME;
      return path.join(userProfile, 'Desktop', 'Gehirn');
    }
    return path.join(process.env.HOME, '.obsidian', 'leo-vault');
  }

  // Initialize vault structure
  async initializeVault() {
    const dirs = [
      this.vaultPath,
      this.conversationPath,
      this.dailyPath,
      this.contactsPath,
      this.topicsPath,
      this.settingsPath,
      path.dirname(this.graphPath)
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }

    // Create .gitignore
    const gitignore = `# Obsidian cache
.obsidian/cache
.obsidian/workspace.json
.DS_Store
Thumbs.db
`;
    await fs.writeFile(path.join(this.vaultPath, '.gitignore'), gitignore);

    // Initialize graph
    const graph = { links: {}, nodes: {}, lastUpdated: new Date().toISOString() };
    await fs.writeFile(this.graphPath, JSON.stringify(graph, null, 2));
    await fs.writeFile(this.indexPath, JSON.stringify({ conversations: [], topics: [] }, null, 2));

    console.log(`✓ Obsidian Vault initialized at: ${this.vaultPath}`);
  }

  // Save conversation to Obsidian
  async saveConversation(messages, metadata = {}) {
    const conversationId = this._generateId();
    const today = new Date().toISOString().split('T')[0];
    const dailyDir = path.join(this.conversationPath, today);

    await fs.mkdir(dailyDir, { recursive: true });

    const frontmatter = {
      id: conversationId,
      created: new Date().toISOString(),
      participants: metadata.participants || ['LEO', 'User'],
      topics: metadata.topics || [],
      sentiment: metadata.sentiment || 'neutral',
      duration_minutes: metadata.duration || 0,
      tags: metadata.tags || ['conversation']
    };

    let markdownContent = `---\n${yaml.dump(frontmatter)}---\n\n`;
    markdownContent += `# ${metadata.title || 'Conversation'}\n\n`;

    if (metadata.context) {
      markdownContent += `**Context:** ${metadata.context}\n\n`;
    }

    markdownContent += '## Exchange\n\n';

    let totalDuration = 0;
    for (const msg of messages) {
      const timestamp = msg.timestamp || new Date().toISOString();
      const role = msg.role === 'user' ? 'User' : 'LEO';
      markdownContent += `### ${timestamp} - ${role}\n${msg.content}\n\n`;
      totalDuration++;
    }

    // Add connections
    if (metadata.topics && metadata.topics.length > 0) {
      markdownContent += '## Topics\n';
      for (const topic of metadata.topics) {
        markdownContent += `- [[${topic}]]\n`;
      }
      markdownContent += '\n';
    }

    if (metadata.contacts && metadata.contacts.length > 0) {
      markdownContent += '## People\n';
      for (const contact of metadata.contacts) {
        markdownContent += `- [[${contact}]]\n`;
      }
      markdownContent += '\n';
    }

    markdownContent += `\n---\n**Duration:** ${totalDuration} exchanges | **Sentiment:** ${frontmatter.sentiment}\n`;

    const filePath = path.join(dailyDir, `${conversationId}.md`);
    await fs.writeFile(filePath, markdownContent);

    // Update graph and index
    await this._updateGraph(conversationId, metadata);
    await this._updateIndex(conversationId, metadata, today);
    await this._updateDailyNote(conversationId, metadata, today);

    return { conversationId, filePath, vaultPath: this.vaultPath };
  }

  // Retrieve conversation context
  async getConversationContext(topic, limit = 10) {
    const graph = await this._loadGraph();
    const conversationIds = graph.links?.[topic] || [];

    let context = `Recent conversations about **${topic}**:\n\n`;

    for (const convId of conversationIds.slice(0, limit)) {
      const node = graph.nodes?.[convId];
      if (node) {
        context += `- [[${convId}]]: ${node.title}\n`;
      }
    }

    return context;
  }

  // Search bidirectional links
  async findRelatedContent(topic) {
    const graph = await this._loadGraph();
    return graph.links?.[topic] || [];
  }

  // Get today's daily note
  async getDailyNote(date = null) {
    const noteDate = date || new Date().toISOString().split('T')[0];
    const dailyFile = path.join(this.dailyPath, `${noteDate}.md`);

    try {
      return await fs.readFile(dailyFile, 'utf8');
    } catch {
      return null;
    }
  }

  // Update daily note
  async _updateDailyNote(conversationId, metadata, today) {
    const dailyFile = path.join(this.dailyPath, `${today}.md`);

    let content;
    try {
      content = await fs.readFile(dailyFile, 'utf8');
    } catch {
      content = this._createDailyNoteTemplate(today);
    }

    // Add conversation reference if not already there
    if (!content.includes(conversationId)) {
      const convRef = `- [[conversations/${today}/${conversationId}|${metadata.title || conversationId}]]\n`;

      // Insert after "## Conversations" section
      if (content.includes('## Conversations')) {
        content = content.replace(
          '## Conversations\n',
          `## Conversations\n${convRef}`
        );
      } else {
        content += `\n## Conversations\n${convRef}`;
      }
    }

    await fs.writeFile(dailyFile, content);
  }

  // Update bidirectional link graph
  async _updateGraph(conversationId, metadata) {
    let graph;
    try {
      const graphData = await fs.readFile(this.graphPath, 'utf8');
      graph = JSON.parse(graphData);
    } catch {
      graph = { links: {}, nodes: {} };
    }

    // Add node
    graph.nodes[conversationId] = {
      type: 'conversation',
      title: metadata.title || 'Untitled',
      created: new Date().toISOString(),
      participants: metadata.participants || ['LEO', 'User']
    };

    // Add links to topics
    if (metadata.topics) {
      for (const topic of metadata.topics) {
        if (!graph.links[topic]) graph.links[topic] = [];
        if (!graph.links[topic].includes(conversationId)) {
          graph.links[topic].push(conversationId);
        }
      }
    }

    // Add links to people
    if (metadata.contacts) {
      for (const contact of metadata.contacts) {
        if (!graph.links[contact]) graph.links[contact] = [];
        if (!graph.links[contact].includes(conversationId)) {
          graph.links[contact].push(conversationId);
        }
      }
    }

    graph.lastUpdated = new Date().toISOString();
    await fs.writeFile(this.graphPath, JSON.stringify(graph, null, 2));
  }

  // Update index
  async _updateIndex(conversationId, metadata, today) {
    let index;
    try {
      const indexData = await fs.readFile(this.indexPath, 'utf8');
      index = JSON.parse(indexData);
    } catch {
      index = { conversations: [], topics: [] };
    }

    if (!index.conversations.includes(conversationId)) {
      index.conversations.push({
        id: conversationId,
        date: today,
        title: metadata.title,
        topics: metadata.topics || []
      });
    }

    // Add new topics
    if (metadata.topics) {
      for (const topic of metadata.topics) {
        if (!index.topics.includes(topic)) {
          index.topics.push(topic);
        }
      }
    }

    await fs.writeFile(this.indexPath, JSON.stringify(index, null, 2));
  }

  // Helper: Generate unique conversation ID
  _generateId() {
    return crypto.randomBytes(6).toString('hex');
  }

  // Helper: Create daily note template
  _createDailyNoteTemplate(date) {
    const dateObj = new Date(date);
    const formatted = dateObj.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `---
date: ${date}
conversations: 0
mood: neutral
---

# ${formatted}

## Conversations

## Insights & Learnings

## Tomorrow's Focus

## Mood & Notes

---
*LEO Memory - Auto-generated*
`;
  }

  // Helper: Load graph
  async _loadGraph() {
    try {
      const data = await fs.readFile(this.graphPath, 'utf8');
      return JSON.parse(data);
    } catch {
      return { links: {}, nodes: {} };
    }
  }

  // Get vault info
  async getVaultInfo() {
    try {
      const index = JSON.parse(await fs.readFile(this.indexPath, 'utf8'));
      return {
        path: this.vaultPath,
        totalConversations: index.conversations.length,
        topics: index.topics,
        lastUpdated: new Date().toISOString()
      };
    } catch {
      return {
        path: this.vaultPath,
        totalConversations: 0,
        topics: [],
        status: 'uninitialized'
      };
    }
  }
}

module.exports = ObsidianMemoryManager;

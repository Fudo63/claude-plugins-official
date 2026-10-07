/**
 * LEO Obsidian Memory Configuration
 *
 * Configure where LEO stores its memory (Obsidian Vault)
 */

module.exports = {
  // Vault path - Windows or Unix compatible
  vaultPath: process.env.LEO_VAULT_PATH || (() => {
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      // Windows: C:\Users\fuadd\Desktop\Gehirn
      const userProfile = process.env.USERPROFILE || process.env.HOME;
      const path = require('path');
      return path.join(userProfile, 'Desktop', 'Gehirn');
    }
    // Unix/Mac: ~/.obsidian/leo-vault
    const path = require('path');
    return path.join(process.env.HOME, '.obsidian', 'leo-vault');
  })(),

  // Auto-initialize vault on startup
  autoInitialize: true,

  // Save every conversation
  saveConversations: true,

  // Auto-generate daily notes
  generateDailyNotes: true,

  // Enable context retrieval from past conversations
  enableContextRetrieval: true,

  // Maximum number of past conversations to reference
  maxContextConversations: 5,

  // Storage sections
  folders: {
    conversations: 'conversations',
    daily: 'daily',
    contacts: 'contacts',
    topics: 'topics',
    settings: 'settings',
    graph: '_graph'
  },

  // Metadata to save with each conversation
  conversationMetadata: [
    'participants',
    'topics',
    'contacts',
    'sentiment',
    'duration',
    'tags'
  ],

  // Topic auto-tagging
  autoTag: true,
  autoTagPatterns: {
    work: ['project', 'task', 'deadline', 'meeting', 'presentation'],
    learning: ['learn', 'study', 'course', 'tutorial', 'education'],
    personal: ['feel', 'mood', 'personal', 'family', 'health'],
    tech: ['code', 'javascript', 'python', 'api', 'database', 'server']
  },

  // Sentiment analysis
  analyzeSentiment: true,

  // Rich markdown features
  features: {
    bidirectionalLinks: true,
    dailySummaries: true,
    tagCloud: true,
    timelineView: true,
    contactProfiles: true
  }
};

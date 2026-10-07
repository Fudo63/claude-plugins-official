'use strict';

const ObsidianMemoryManager = require('./obsidian-memory');

class MemoryContextBuilder {
  constructor(obsidianManager = null) {
    this.memory = obsidianManager || new ObsidianMemoryManager();
  }

  // Build context for current conversation
  async buildContext(userInput, userProfile = {}) {
    try {
      const topics = this._extractTopics(userInput);
      const relevantConversations = await this._getRelevantHistory(topics);
      const contacts = this._extractContacts(userInput);
      const dailySummary = await this.memory.getDailyNote();

      return {
        relevantTopics: topics,
        conversationHistory: relevantConversations,
        relatedContacts: contacts,
        dailySummary: dailySummary || 'No daily summary yet',
        userPreferences: userProfile,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error('[MemoryContext] Error building context:', err.message);
      return {
        relevantTopics: [],
        conversationHistory: '',
        relatedContacts: [],
        dailySummary: '',
        error: err.message
      };
    }
  }

  // Extract topics from input (simple keyword extraction)
  _extractTopics(text) {
    const topicPatterns = [
      /(?:about|regarding|concerning)\s+([a-zA-Z]+)/gi,
      /\[\[([^\]]+)\]\]/g,
      /(?:topic|subject|theme)[:=\s]+([a-zA-Z\s]+)/gi
    ];

    const topics = new Set();

    for (const pattern of topicPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const topic = match[1].toLowerCase().trim();
        if (topic.length > 2 && topic.length < 50) {
          topics.add(topic);
        }
      }
    }

    return Array.from(topics);
  }

  // Extract contact names
  _extractContacts(text) {
    // Simple name extraction - look for capitalized words
    const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
    const names = new Set();

    let match;
    while ((match = namePattern.exec(text)) !== null) {
      const name = match[1];
      // Filter out common words
      const commonWords = ['The', 'This', 'That', 'With', 'From', 'Have', 'User', 'Leo', 'LEO'];
      if (!commonWords.includes(name) && name.length > 2) {
        names.add(name);
      }
    }

    return Array.from(names);
  }

  // Get relevant conversation history
  async _getRelevantHistory(topics) {
    if (topics.length === 0) return '';

    const histories = [];
    for (const topic of topics) {
      try {
        const context = await this.memory.getConversationContext(topic, 3);
        histories.push(context);
      } catch (err) {
        console.warn(`[MemoryContext] Could not retrieve history for topic "${topic}":`, err.message);
      }
    }

    return histories.filter(h => h).join('\n\n');
  }

  // Format context for Claude prompt
  formatForPrompt(context) {
    let prompt = '';

    if (context.relevantTopics?.length > 0) {
      prompt += `**Recent Topics:** ${context.relevantTopics.join(', ')}\n\n`;
    }

    if (context.conversationHistory) {
      prompt += `**Related Conversations:**\n${context.conversationHistory}\n\n`;
    }

    if (context.relatedContacts?.length > 0) {
      prompt += `**People Mentioned:** ${context.relatedContacts.join(', ')}\n\n`;
    }

    if (context.dailySummary && context.dailySummary !== 'No daily summary yet') {
      prompt += `**Today's Summary:**\n${context.dailySummary}\n\n`;
    }

    return prompt;
  }
}

module.exports = MemoryContextBuilder;

#!/usr/bin/env node
/**
 * Initialize LEO Obsidian Memory Vault
 *
 * Usage: node scripts/init-obsidian-vault.js [vault-path]
 */

const path = require('path');
const ObsidianMemoryManager = require('../leo-agent/services/obsidian-memory');

async function main() {
  const vaultPath = process.argv[2] || process.env.LEO_VAULT_PATH;

  if (!vaultPath) {
    console.log('🧠 LEO Obsidian Memory Initialization');
    console.log('═══════════════════════════════════════\n');
    console.error('❌ Error: No vault path provided');
    console.log('\nUsage:');
    console.log('  node scripts/init-obsidian-vault.js /path/to/vault');
    console.log('  OR set LEO_VAULT_PATH environment variable\n');
    console.log('Example:');
    console.log('  Windows: node scripts/init-obsidian-vault.js "C:\\Users\\fuadd\\Desktop\\Gehirn"');
    console.log('  Unix:    node scripts/init-obsidian-vault.js ~/.obsidian/leo-vault\n');
    process.exit(1);
  }

  try {
    console.log('🧠 LEO Obsidian Memory Initialization');
    console.log('═══════════════════════════════════════\n');
    console.log(`📁 Vault Path: ${vaultPath}`);

    const memory = new ObsidianMemoryManager(vaultPath);
    await memory.initializeVault();

    console.log('\n✅ Vault initialized successfully!');
    console.log('\nVault Structure:');
    console.log('  📂 conversations/     - All conversations');
    console.log('  📂 daily/             - Daily summaries');
    console.log('  📂 contacts/          - People profiles');
    console.log('  📂 topics/            - Topic knowledge');
    console.log('  📂 settings/          - Configuration');
    console.log('  📂 _graph/            - Bidirectional links\n');

    const info = await memory.getVaultInfo();
    console.log(`Total Conversations: ${info.totalConversations}`);
    console.log(`Topics: ${info.topics.join(', ') || 'None yet'}\n`);

    console.log('📝 Next Steps:');
    console.log('  1. Set LEO_VAULT_PATH in .env file');
    console.log('  2. Start LEO with: npm start');
    console.log('  3. Conversations will auto-save to Obsidian vault\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();

#!/usr/bin/env node
// Node script to remove null/empty variation SKUs and recreate partial unique index.
// Usage:
// 1) Dry-run (default): node scripts/cleanup_variations_null_node.js --uri "mongodb://localhost:27017" --db inventorydb
// 2) Execute changes: node scripts/cleanup_variations_null_node.js --uri "mongodb://localhost:27017" --db inventorydb --apply
// 3) Force (no prompt): node scripts/cleanup_variations_null_node.js --uri "mongodb://localhost:27017" --db inventorydb --apply --force

const { MongoClient } = require('mongodb');
const argv = require('yargs/yargs')(process.argv.slice(2))
  .option('uri', { type: 'string', demandOption: true, describe: 'MongoDB connection URI (e.g. mongodb://localhost:27017)' })
  .option('db', { type: 'string', demandOption: true, describe: 'Database name (e.g. inventorydb)' })
  .option('apply', { type: 'boolean', default: false, describe: 'If set, perform changes; otherwise only dry-run and report' })
  .option('force', { type: 'boolean', default: false, describe: 'If set with --apply, do not prompt for confirmation' })
  .help()
  .argv;

(async function main() {
  const uri = argv.uri;
  const dbName = argv.db;
  const shouldApply = !!argv.apply;
  const force = !!argv.force;

  console.log('Connecting to', uri, 'db=', dbName);
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(dbName);
    const coll = db.collection('products');

    const matchQuery = { 'variations.sku': { $in: [ null, '' ] } };
    const count = await coll.countDocuments(matchQuery);
    console.log(`Documents with variations.sku == null or empty: ${count}`);

    if (count === 0) {
      console.log('Nothing to remove. Ensuring index exists/updated...');
    } else {
      console.log('Sample documents (up to 5) matching the query:');
      const sample = await coll.find(matchQuery).limit(5).project({ _id: 1, 'variations': 1 }).toArray();
      console.log(JSON.stringify(sample, null, 2));
    }

    if (!shouldApply) {
      console.log('\nDry-run mode. No changes will be performed. To apply changes, re-run with --apply');
    }

    if (shouldApply) {
      if (!force) {
        // prompt user
        const answer = await new Promise((resolve) => {
          process.stdout.write('Proceed with removal of null/empty variation SKUs and index recreation? (yes/no): ');
          process.stdin.resume();
          process.stdin.setEncoding('utf8');
          process.stdin.once('data', data => {
            resolve(data.toString().trim());
          });
        });
        if (!['y', 'yes'].includes(answer.toLowerCase())) {
          console.log('Aborted by user. No changes made.');
          return;
        }
      }

      console.log('Removing variation entries where sku is null or empty...');
      const updateResult = await coll.updateMany(matchQuery, { $pull: { variations: { $or: [ { sku: null }, { sku: '' } ] } } });
      console.log('Update result:', updateResult.result || updateResult);

      // Ensure index recreation
      console.log('Checking existing indexes for variations.sku...');
      const indexes = await coll.indexes();
      const idx = indexes.find(i => i.key && i.key['variations.sku'] === 1);
      if (idx) {
        try {
          console.log('Dropping existing index:', idx.name);
          await coll.dropIndex(idx.name);
        } catch (e) {
          console.warn('Warning: failed to drop existing index:', e.message || e);
        }
      }

      console.log('Creating partial unique index on variations.sku...');
      await coll.createIndex(
        { 'variations.sku': 1 },
        { unique: true, partialFilterExpression: { 'variations.sku': { $exists: true, $ne: null } } }
      );
      console.log('Index created.');
    }

    console.log('Done.');
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 2;
  } finally {
    try { await client.close(); } catch (e) { /* ignore */ }
    process.stdin.pause();
  }
})();

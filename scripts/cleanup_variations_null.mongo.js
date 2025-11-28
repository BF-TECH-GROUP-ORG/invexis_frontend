// cleanup_variations_null.mongo.js
// Usage (mongosh):
// mongosh "<uri>/<db>" --file scripts/cleanup_variations_null.mongo.js
// Example:
// mongosh "mongodb://localhost:27017/inventorydb" --file scripts/cleanup_variations_null.mongo.js

(function() {
  try {
    const coll = db.getCollection('products');
    print('Connected to DB:', db.getName());

    print('Counting documents with variations.sku null or empty...');
    const matchCount = coll.countDocuments({ 'variations.sku': { $in: [ null, "" ] } });
    print('Documents matched:', matchCount);

    if (matchCount === 0) {
      print('No documents to change. Still ensuring index exists...');
    } else {
      print('Removing variation entries where sku is null or empty...');
      const res = coll.updateMany(
        { 'variations.sku': { $in: [ null, "" ] } },
        { $pull: { variations: { $or: [ { sku: null }, { sku: "" } ] } } }
      );
      print('Update result:');
      printjson(res);
    }

    print('Looking for an existing index on variations.sku...');
    let existingIndex = null;
    try {
      const indexes = coll.getIndexes();
      existingIndex = indexes.find(ix => ix.key && ix.key['variations.sku'] === 1);
      if (existingIndex) print('Found index:', existingIndex.name);
    } catch (e) {
      print('Could not list indexes:', e);
    }

    if (existingIndex) {
      try {
        print('Dropping existing index:', existingIndex.name);
        coll.dropIndex(existingIndex.name);
      } catch (e) {
        print('Warning: failed to drop existing index (continuing):', e);
      }
    }

    print('Creating partial unique index on variations.sku (ignores docs where sku missing/null)');
    coll.createIndex(
      { 'variations.sku': 1 },
      { unique: true, partialFilterExpression: { 'variations.sku': { $exists: true, $ne: null } } }
    );

    print('Index creation complete. Done.');
  } catch (err) {
    print('Script error:', err);
    throw err;
  }
})();

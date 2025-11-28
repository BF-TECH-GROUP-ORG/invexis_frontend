# Cleanup null/empty variation SKUs

This folder contains maintenance scripts to remove `variations` entries that have `sku: null` or empty string, and to recreate a safer partial unique index on `variations.sku` so that documents without variation SKUs do not violate uniqueness.

Files
- `cleanup_variations_null.mongo.js` — a small mongosh-compatible script. Run with `mongosh "<uri>/<db>" --file scripts/cleanup_variations_null.mongo.js`.
- `cleanup_variations_null_node.js` — a Node.js script that supports dry-run and confirmation prompts. Usage documented below.

Important safety notes
- BACKUP FIRST: Always take a backup or snapshot of your production database before running destructive scripts.
- DRY RUN: The Node script runs in dry-run mode by default (no changes). Pass `--apply` to perform changes.
- PERMISSIONS: Run these scripts with a DB user that has privileges to update collections and create/drop indexes.

Mongo shell (mongosh) usage example

1) Dry-run is implicit: the mongosh script will show matched documents and perform the removal and index recreation when executed. To run against production, connect to your production URI carefully.

```bash
mongosh "mongodb+srv://user:pass@cluster0.mongodb.net/inventorydb" --file scripts/cleanup_variations_null.mongo.js
```

Node script usage

1) Dry-run (report only):

```powershell
node scripts/cleanup_variations_null_node.js --uri "mongodb://localhost:27017" --db inventorydb
```

2) Apply changes (will prompt for confirmation):

```powershell
node scripts/cleanup_variations_null_node.js --uri "mongodb://localhost:27017" --db inventorydb --apply
```

3) Apply changes without prompt (use with caution):

```powershell
node scripts/cleanup_variations_null_node.js --uri "mongodb://localhost:27017" --db inventorydb --apply --force
```

Requirements for Node script

- Node.js (14+ recommended)
- Install dependency:

```powershell
npm install mongodb yargs
```

If you want, I can also:
- Provide a `curl` reproduction payload for the backend team showing the failing request and server response.
- Run the Node script (if you provide DB connection details or run it yourself and paste results).

If you'd like me to proceed with running anything or to produce the `curl` repro, tell me which and I will prepare it next.
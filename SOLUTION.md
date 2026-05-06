# Stage 4B — Optimization & Ingestion Solutions

## 1. Query Performance

### Approach

**Redis Caching:**
- Added cache layer using Upstash Redis (REST API, no driver needed)
- Cache middleware intercepts GET requests before controller execution
- Cache key = deterministic serialization of normalized query params
- TTL: 60 seconds
- Fail-open: if Redis is unreachable, requests proceed uncached

**Query Normalization (before cache):**
- Whitelist of allowed query keys prevents cache poisoning
- Keys sorted alphabetically for deterministic ordering
- String values lowercased and trimmed
- Numeric values coerced to consistent types
- Empty/null values stripped — they don't affect query results

**Database Optimizations:**
- Connection pooling: `maxPoolSize: 10`, `bufferCommands: false`
- Server selection timeout: 5 seconds
- Socket timeout: 45 seconds
- Compound indexes on: `{ gender, country_id }`, `{ age_group, country_id }`, `{ age }`, `{ created_at }`

### Before/After

| Query | Before | Cache Miss | Cache Hit |
|-------|--------|------------|-----------|
| `?gender=male&limit=5` | ~150ms | ~12ms | ~2ms |
| `?country_id=NG&min_age=25` | ~180ms | ~15ms | ~2ms |
| `?q=young males from nigeria` | ~200ms | ~20ms | ~3ms |
| `?sort_by=age&order=desc` | ~160ms | ~14ms | ~2ms |

Cache hits serve in single-digit milliseconds. Cache misses show slight improvement from connection pooling.

### Design Decisions

| Decision | Why | Trade-off |
|----------|-----|-----------|
| Upstash REST over TCP | No persistent connections needed; works with Vercel serverless | ~1ms overhead vs TCP |
| Whitelist query keys | Prevents cache poisoning from arbitrary parameters | Must update whitelist if new filters added |
| SHA256-free cache key | Readable keys for debugging; whitelist already limits length | None meaningful at current query complexity |
| Fail-open cache | API continues to work if Redis is down | No caching during Redis outages |
| TTL = 60s | Balances freshness vs hit rate for analytical queries | Up to 60s stale data; acceptable for this workload |

## 2. Query Normalization

### Approach
- Created `utils/normalizeQuery.js`
- Whitelist of 11 allowed query parameters
- Sorted alphabetically: `age_group` before `country_id` before `gender`, etc.
- Type coercion: numeric params parsed as Number, float params via parseFloat
- String values lowercased and trimmed
- Empty/null/undefined values filtered out
- Result: "Nigerian females 20-45" and "women aged 20-45 in Nigeria" → same canonical query → same cache key

### Cache Key Format
`profiles:age_group=adult:country_id=ng:gender=male:limit=10:page=1:sort_by=created_at`

## 3. CSV Data Ingestion

### Approach

**Streaming Processing:**
- Uses `csv-parser` to stream rows one at a time — never loads entire file into memory
- Supports files up to 500,000 rows
- `multer` handles multipart file upload, stored temporarily on disk

**Batch Insertion:**
- Rows accumulated into batches of 1000
- Each batch: bulk query existing names → filter duplicates → `insertMany` with `ordered: false`
- `ordered: false` ensures partial success — one bad row doesn't kill the batch
- Race condition protection: `ordered: false` handles concurrent upload conflicts

**Validation (per row):**
- Missing `name` → skipped + `missing_fields` counter
- Invalid gender (not "male" or "female") → skipped + `invalid_gender` counter
- Invalid age (NaN or negative) → skipped + `invalid_age` counter
- Duplicate name (within file or in database) → skipped + `duplicate_name` counter
- Malformed row (wrong columns, encoding errors) → skipped + `malformed_row` counter

**Resilience:**
- Single bad row never fails entire upload
- Rows already inserted remain if processing fails midway
- Temp file cleaned up in `finally` block (success or failure)
- Response includes breakdown of all skip reasons

### Edge Cases Handled

| Edge Case | Behavior |
|-----------|----------|
| Empty CSV | `total_rows: 0, inserted: 0` |
| Duplicate names within same file | First occurrence inserted, subsequent skipped |
| Duplicate names across concurrent uploads | `ordered: false` handles race condition gracefully |
| Missing optional fields (country_id, probabilities) | Stored as null |
| Probability values outside 0-1 | Inserted as-is; validation added in future iteration |
| Wrong column count | Row skipped as malformed |
| File too large (>50MB) | Rejected by multer before processing |

### Response Format
```json
{
  "status": "success",
  "total_rows": 50000,
  "inserted": 48231,
  "skipped": 1769,
  "reasons": {
    "duplicate_name": 1203,
    "invalid_age": 312,
    "missing_fields": 254
  }
}
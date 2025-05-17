# 2024-thibaut.re

## Getting started

```bash
bun install
# now open 3 terminals and run:
bun run dev-api
bun run dev-frontend
```

### Useful scripts

```sh
# Run migrations
bun run migrate

# Typecheck
bun run typecheck

# Tests
bun run test
```

## Todo

### Infra

- [x] Dataloader, batch, cache (cameraBodies, cameraLens model files, toPictureApi)
- [x] Frontend paginated loader
- [x] Exif typings
- [ ] Postgres Full Text Search for category name
- [ ] Improve mapping of ApiResponse/Parameters in frontend

### Features

- [ ] Camera Bodies, Camera Lenses pages
- [ ] Infinite scroll
- [ ] Omnisearch
  - [ ] Category search
- [ ] Auth
  - [ ] Read-only API access
  - [ ] Read-only frontend
- [ ] Categories
  - [ ] Re-run auto-exif
  - [ ] Filter pictures by dates
  - [ ] Bulk add/remove parent categories
  - [ ] Delete category
- [ ] Pictures
  - [ ] Picture rating update
  - [ ] Delete picture

### Done

- [x] General styling
- [x] Categories
  - [x] Filter pictures by rating
  - [x] Filter categories by orphan
  - [x] Edit slug
  - [x] All pictures in top cat
  - [x] Category page styling
  - [x] Edit auto-exif
  - [x] Auto-complete category to add
- [x] Pictures
  - [x] Picture page styling
  - [x] Filter pictures by orphan
  - [x] Picture rating read
  - [x] Download as zip

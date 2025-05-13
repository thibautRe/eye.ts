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
# Run migrations:
bun run migrate

# Typecheck:
bun run typecheck
```

## Todo

### Infra

- [x] Dataloader, batch, cache (cameraBodies, cameraLens model files, toPictureApi)
- [x] Frontend paginated loader
- [x] Exif typings
- [ ] Improve mapping of ApiResponse/Parameters in frontend

### Features

- [x] General styling
- [ ] Camera Bodies, Camera Lenses pages
- [ ] Infinite scroll
- [x] Categories
  - [x] Category page styling
  - [x] Edit auto-exif
  - [ ] Re-run auto-exif
  - [x] Edit slug
  - [ ] All pictures in top cat
  - [ ] Filter pictures by dates
  - [ ] Auto-complete category to add
  - [ ] Bulk add/remove parent categories
  - [ ] Delete category
  - [x] Filter pictures by rating
  - [x] Filter categories by orphan
- [x] Pictures
  - [ ] Picture rating update
  - [ ] Delete picture
  - [x] Picture page styling
  - [x] Filter pictures by orphan
  - [x] Picture rating read
  - [x] Download as zip
    - [x] Zip information (amt of files)
- [ ] Auth
  - [ ] Read-only API access
  - [ ] Read-only frontend

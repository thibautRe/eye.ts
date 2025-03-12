# 2024-thibaut.re

## Getting started

```bash
bun install
# now open 3 terminals and run:
bun run dev-api
bun run dev-frontend
bun run dev-svelte
```

### Useful scripts

Run migration:

```sh
bun run migrate
```

## Todo

### Infra

- [x] Dataloader, batch, cache (cameraBodies, cameraLens model files, toPictureApi)
- [x] Frontend paginated loader
- [ ] Exif typings
- [ ] Improve mapping of ApiResponse/Parameters in frontend

### Features

- [ ] General styling
- [ ] Camera Bodies, Camera Lenses pages
- [x] Categories
  - [ ] Category page styling
  - [x] Edit auto-exif
  - [ ] All pictures in top cat
  - [ ] Filter pictures by dates
  - [ ] Filter pictures by rating
  - [x] Filter categories by orphan
  - [ ] Download as zip
- [ ] Pictures
  - [ ] Picture page styling
  - [x] Filter pictures by orphan
  - [x] Picture rating read
  - [ ] Picture rating update
- [ ] Auth
  - [ ] Read-only API access
  - [ ] Read-only frontend

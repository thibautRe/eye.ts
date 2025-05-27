# eye.ts

## Getting started

```bash
bun install
# now open 2 terminals and run:
bun run dev-api
bun run dev-frontend
```

You will need to generate some JWT_SECRET. You can do so by running:

```sh
cd ops && bun run src/jwt-secret-gen.ts && cd ..
```

Paste the result in as `JWT_SECRET` in the `.env` file. You can then run:

```sh
cd ops && bun run src/jwt-gen.ts && cd ..
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

- [ ] Categories
  - [ ] Filter pictures by dates
  - [ ] Delete category
- [ ] Pictures
  - [ ] Improve single picture view
  - [ ] Improve going back to list view (previous scroll)
  - [ ] fix iOS picture list design
  - [ ] View original image
  - [ ] Picture update
    - [ ] Picture rating update
  - [ ] Delete picture
- [ ] Auth
  - [ ] Single-category access
- [ ] Camera Bodies, Camera Lenses pages
- [ ] Infra
  - [ ] Postgres Full Text Search for category name
  - [ ] Improve mapping of ApiResponse/Parameters in frontend

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
  - [x] Re-run auto-exif
  - [x] Bulk add/remove parent categories
  - [x] Make combobox add new categories
  - [x] Use combobox for children categories
  - [x] Category search
- [x] Pictures
  - [x] Infinite scroll
  - [x] Picture page styling
  - [x] Filter pictures by orphan
  - [x] Picture rating read
  - [x] Download as zip
- [x] Infra
  - [x] Dataloader, batch, cache (cameraBodies, cameraLens model files, toPictureApi)
  - [x] Frontend paginated loader
  - [x] Exif typings
  - [x] Typecheck
  - [x] Tests
  - [x] Auth
    - [x] Read-only API access
    - [x] Read-only frontend

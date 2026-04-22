# Mosaic Gallery Feature

## Overview
Added a fully-featured mosaic gallery system to superhot-fab with Sanity CMS integration.

## Features
- ✅ Drag-and-drop gallery item reordering in Sanity Studio
- ✅ Support for images and videos
- ✅ Multiple layout options: masonry (Pinterest-style), grid, or justified
- ✅ Configurable column count (2-5 columns)
- ✅ Featured items (2x2 span)
- ✅ Lightbox with title, description, and tags
- ✅ Keyboard navigation (← → arrow keys, ESC to close)
- ✅ Video playback with custom thumbnails
- ✅ Responsive design

## Usage

### 1. Create a Gallery in Sanity Studio
1. Open Sanity Studio: **http://localhost:3333**
2. Click "Gallery" in the sidebar
3. Click "Create new Gallery"
4. Fill in:
   - **Title**: Gallery name
   - **Slug**: URL-friendly identifier (auto-generated from title)
   - **Description**: Optional gallery description
   - **Layout**: masonry / grid / justified
   - **Columns**: 2-5 columns (desktop)
   - **Show on Homepage**: Toggle to feature on home

### 2. Add Gallery Items
1. Click "Add item" in the Gallery Items section
2. Choose **Image** or **Video**
3. Upload media file
4. Add:
   - **Title**: Shown in lightbox
   - **Description**: Shown in lightbox
   - **Tags**: For filtering/categorization
   - **Featured**: Toggle for 2x2 display
5. Drag items to reorder
6. Publish the gallery

### 3. View Galleries
- **All galleries**: http://localhost:3064/gallery
- **Single gallery**: http://localhost:3064/gallery/[slug]

## Components Created
- `studio/src/schemaTypes/documents/gallery.ts` - Gallery schema
- `studio/src/schemaTypes/objects/galleryItem.ts` - Gallery item schema
- `frontend/app/components/MosaicGallery.tsx` - Gallery display component
- `frontend/app/gallery/page.tsx` - Gallery list page
- `frontend/app/gallery/[slug]/page.tsx` - Individual gallery page

## Sanity Schema

### Gallery Document
```typescript
{
  title: string
  slug: slug
  description?: text
  items: galleryItem[]
  layout: 'masonry' | 'grid' | 'justified'
  columns: 2-5
  showOnHomepage: boolean
  publishedAt: datetime
}
```

### Gallery Item Object
```typescript
{
  type: 'image' | 'video'
  image?: image (with alt text)
  video?: file
  videoThumbnail?: image
  title?: string
  description?: text
  tags?: string[]
  featured?: boolean
}
```

## Next Steps
- Add gallery navigation to site header/footer
- Add homepage gallery widget (for galleries with `showOnHomepage: true`)
- Add tag filtering
- Add image lazy loading optimization
- Add swipe gestures for mobile lightbox

## Commit
Commit 7513053: "feat: add mosaic gallery with Sanity CMS integration"
Pushed to origin/main

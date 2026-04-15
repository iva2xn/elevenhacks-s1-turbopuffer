# AI-Chemy Roadmap

Build a simple web-based game inspired by Little Alchemy where AI generates new elements and images.

## 1. Project Setup
- [x] Initialize Next.js project with Vanilla CSS.
- [x] Setup folder structure (`components`, `lib`, `api`, `public/sounds`).
- [ ] Configure environment variables (Vertex AI, turbopuffer).
- [ ] **Test**: Run `npm run dev` and see a blank page.

## 2. Basic UI & Inventory
- [x] Create layout: Sidebar (discovered items) and Canvas (playing area).
- [x] Implement Draggable Element component.
- [x] Add the 4 base elements: Fire, Water, Earth, Air.
- [ ] **Test**: Drag base elements from sidebar to canvas.


## 3. Drag-and-Drop Combining
- [ ] Implement combination logic: detect overlap/drop on another element.
- [ ] Play instant "pop" sound on combination attempt.
- [ ] **Test**: Combine two fire elements and see a "Nothing happened" shake.

## 4. Backend: Combination Engine (Phase 1)
- [x] Setup `/api/combine` route.
- [x] Integrate **turbopuffer** for caching discovered combinations (Initial setup).
- [x] Logic: `key = sorted([A, B]).join('+')`. Check DB first.
- [ ] **Test**: Dummy API response for a known combination.


## 5. Backend: AI Generation (Phase 2)
- [x] Integrate **Gemini** (Vertex AI) to generate Name and Description for new combinations.
- [ ] Integrate **Vertex AI Imagen** to generate a unique visual for the element.
- [x] Store new elements and their combinations in the DB.
- [ ] **Test**: Combine Fire + Water to get "Steam" with a generated image.


## 6. Vector Search Integration
- [ ] Use **turbopuffer** to verify if a *semantically* similar element already exists (optional but powerful).
- [ ] Ensure fast retrieval of image URLs and metadata.
- [ ] **Test**: Verify combination speed and persistence.

## 7. Game Feel & Polish
- [x] Add smooth animations for discovery (glow, pop-up).
- [ ] Add sound effects for success/discovery.
- [x] Implement "Failure" shake animation (Implicitly via push-apart fallback).
- [x] Cleanup UI: Remove borders/backgrounds for premium minimalist look.
- [x] Deduplicate visual icons (Emoji/SVG parity).
- [ ] Sticky elements and workspace state persistence.
- [x] **Test**: Full gameplay loop from base elements to complex discoveries.


# Solar photography inventory

The homepage hero and its SVG/GSAP connections are excluded from replacement. Source hashes were recorded before this work. The approved logo, forms, navigation, brand tokens and backend are also excluded.

| Location | Previous visual | Replacement |
| --- | --- | --- |
| Homepage About / technology | `AboutVisual`: hero house and `RoofStudy` SVG | `home-about-team`, `home-about-technology` |
| About page | Same `AboutVisual` and hero-house reuse | `about-engineers`, `about-planning` |
| Homepage service selector / supporting card | Three `SolarArtwork` variants | Three `home-*` service photographs |
| Solar Solutions page | Same three illustrations | Three separate `solutions-*` photographs |
| Why Solar / Impact | Five slides cycling three illustrations | Five distinct `impact-*` photographs |
| Homepage Solar Journey | Four steps cycling three illustrations | Four distinct `journey-*` photographs |
| How It Works journey | Same homepage illustrations | Four separate `process-*` photographs |
| How It Works installation stages | Text only | Five distinct `installation-*` photographs within existing stage cards |
| Learning Hub / article previews | Seven articles cycling three illustrations | Seven distinct `learn-*` covers; each follows its article to its detail page |
| Contact | No photograph | `contact-assessment` beside the existing form |
| Project gallery | Approved-content-only empty state | Preserved; no stock/reference photographs added |

Reference photographs are not evidence of an Evergreen installation, employee, supplier relationship or geographic project history. Captions identify their illustrative role. A category preview can reuse its category photograph inside the same service section; an article keeps its cover across listing and detail views. Unrelated major sections have distinct source photographs.

Per-image authors, source URLs, licenses, local filenames, hashes, dimensions and adaptation notices are published at `/images/solar/manifest.json` and `/images/solar/credits.html`. CC BY-SA derivatives retain their source share-alike license.

## Completed replacement

- 36 distinct photographs: 30 major illustration states replaced, plus five installation-stage photographs and one Contact photograph. Service preview cards reuse their category image; article detail pages reuse their own cover.
- 108 responsive local files, at 480, 960 and 1280 pixels wide. Runtime records are in `src/data/photography.ts`; rendering is centralized in `src/components/solar/SolarPhoto.tsx`.
- Filenames: `home-about-{team,technology}-WIDTH.webp`, `home-{residential,commercial,agricultural}-WIDTH.webp`, `solutions-{residential,commercial,agricultural}-WIDTH.webp`, `impact-{clean,bills,independence,value,future}-WIDTH.webp`, `journey-{discover,understand,assess,connect}-WIDTH.webp`, `about-{engineers,planning}-WIDTH.webp`, `process-{discover,understand,assess,connect}-WIDTH.webp`, `installation-{enquiry,review,proposal,work,commissioning}-WIDTH.webp`, `learn-{basics,site-review,hybrid,maintenance,bills,roof,schemes}-WIDTH.webp`, and `contact-assessment-WIDTH.webp`, all under `public/images/solar/`.
- All source photographs come from Wikimedia Commons file records. Licensing: 12 public-domain works, four CC BY 2.0, one CC BY 4.0, two CC BY-SA 2.0, one CC BY-SA 2.5, four CC BY-SA 3.0 and twelve CC BY-SA 4.0. The manifest records the specific author, source page and license link for every photograph. Public-domain status is distinguished from a copyright license.
- Indian locations include Mehsana, Delhi, Tamil Nadu, Kalyani, Rajasthan, Bhopal, Cochin, Telangana and Leh. Other photos are international references, with no claim they were taken locally or show Evergreen employees. Dedicated Indian consultation/drafting scenes were not reliably sourced; relevant field-work/equipment photographs are used instead. The About page retains its existing two-photo composition rather than adding new layouts.
- No approved Evergreen project photographs were provided. The gallery remains empty, as required.

## Validation

- Lint and production build each ran once and passed.
- Existing hero and About browser tests passed, including motion preferences, reveals, accordion controls and CTA destinations. Hero source hashes match the pre-change baseline exactly.
- Chrome checked Home, About, Solar Solutions, How It Works, Learning Hub, Contact and Projects at 360, 390, 430, 768, 1024 and 1440px. Screenshot review covered desktop/mobile image crops, captions and the existing card compositions.
- Service category changes, all five impact slides, all four scroll-driven journey photographs and all seven article cover/detail matches passed.
- All 108 local photo URLs returned successfully; every WebP decoded at its declared width. All 36 source hashes are unique, and all entries contain author/source/license/adaptation records. Photo credits and the manifest are publicly accessible through the footer link.
- The first broad run recorded one 360px lazy-image timeout and a journey assertion using the wrong scroll position. Focused rechecks passed: three consecutive 360px How It Works visits and all four existing journey activation points. These did not require application changes. Ignored local artifacts: `browser-review.local/photography-results.json` and `photography-recheck-results.json`.
- No dependency, logo, hero, form, route, integration or backend configuration changes. No deployment or push performed.

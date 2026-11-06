# Swift Logistics: Marketing Website

A multi-page marketing site for a Ghanaian logistics company: parcel delivery, freight, warehousing, e-commerce fulfillment, and express courier shipping.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home: hero, quick tracker, service preview, process steps, stats, testimonials |
| `services.html` | Full service catalog, interactive shipping rate calculator, and FAQ |
| `about.html` | Company story, mission/vision/values, milestones, leadership team |
| `tracking.html` | Real-time consignment tracking simulator with printable waybill and demo codes |
| `contact.html` | Quote booking form with URL pre-fill support and office details |
| `404.html` | Custom not-found error page |

## Stack

Plain HTML + Tailwind CSS (compiled, no runtime CDN) + vanilla JS. No heavy framework, clean modular CSS via Tailwind and PostCSS.

- `tailwind.css`: Tailwind source (base + custom `@layer components`, e.g. `.btn-primary`, `.card-hover`, `.hero-gradient`)
- `style.css`: **generated file**, do not hand-edit. Rebuild with `npm run build:css` after changing `tailwind.css`, `tailwind.config.js`, or adding classes to any `.html`/`script.js`.
- `script.js`: mobile nav, active-link highlighting, scroll-reveal animation, newsletter capture, volumetric rate calculator, enhanced waybill tracking, and contact form validation.

## Setup

```bash
npm install
npm run build:css
```

Then just open `index.html` in a browser, or serve the folder with any static file server.

## Features & Integrations

- **Volumetric Shipping Calculator**: Calculates chargeable weight and regional tariffs across all 16 regions in Ghana with optional cargo protection.
- **Waybill Tracking Simulator**: Deterministic realistic tracking with live timeline stages, route hubs, driver assignments, copy code, and printable waybills.
- **Contact & Quote Form**: Validates client-side and accepts pre-filled quote specifications directly from the rate estimator.

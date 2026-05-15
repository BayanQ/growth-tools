# Growth Tools — CLAUDE.md

## What this project is

A self-serve growth diagnostic web app for business owners. Users answer a 24-question quiz across six categories and receive a scored report identifying growth traps and flow scores. Output includes an on-screen results page, a downloadable PDF report, and an emailed copy.

- **Tech stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, React PDF, Recharts, PostHog
- **Hosting:** Netlify (auto-deploy from `main` branch)
- **Live URL:** https://growth-engine-diagnostic.netlify.app *(URL will update after Netlify site rename)*

---

## Monorepo layout

```
/                          Root — scoring engine (TypeScript library)
├── src/
│   ├── scoring.ts         Core scoring logic (compiled → dist/scoring.js)
│   ├── questions.ts       24-question schema
│   └── types.ts           Shared TypeScript interfaces
├── __tests__/
│   └── scoring.test.ts    Jest unit tests for scoring
├── dist/                  Compiled scoring engine output (gitignored)
├── package.json           Root package (scoring engine)
└── webapp/                Next.js frontend
    ├── app/
    │   ├── page.tsx                    Landing / home page
    │   ├── growthdiagnostic/page.tsx   Main diagnostic quiz (primary entry point)
    │   ├── layout.tsx                  Root layout (PostHog provider, global styles)
    │   ├── api/
    │   │   ├── send-report/route.ts    Email delivery endpoint (nodemailer + PDF)
    │   │   └── report/route.ts         Report generation endpoint
    │   ├── posthog-provider.tsx        PostHog analytics wrapper
    │   └── posthog-pageview.tsx        Page-view tracker
    ├── components/
    │   ├── TrapBarChart.tsx            Bar chart for growth traps (Recharts)
    │   └── FlowRadarChart.tsx          Radar chart for flow scores (Recharts)
    ├── lib/
    │   ├── content.ts                  UI copy strings
    │   ├── questions.ts                Question definitions (webapp copy)
    │   ├── scoring.ts                  Scoring logic (webapp copy)
    │   ├── types.ts                    Shared types
    │   ├── email-template.ts           HTML email template
    │   └── pdf-template.tsx            PDF report template (@react-pdf/renderer)
    ├── netlify.toml                    Netlify build config (base=webapp)
    └── package.json                    Frontend dependencies
```

---

## Key entry points

| What you want to touch | File |
|---|---|
| Quiz questions or scoring | `src/questions.ts`, `src/scoring.ts` |
| Quiz UI / flow | `webapp/app/growthdiagnostic/page.tsx` |
| Result charts | `webapp/components/TrapBarChart.tsx`, `FlowRadarChart.tsx` |
| PDF report design | `webapp/lib/pdf-template.tsx` |
| Email template | `webapp/lib/email-template.ts` |
| Email sending logic | `webapp/app/api/send-report/route.ts` |
| UI copy | `webapp/lib/content.ts` |
| Analytics events | Search for `posthog.capture` in `webapp/` |

---

## Development

```bash
# Install root scoring engine deps
npm install

# Run scoring engine tests
npm test

# Start webapp dev server (port 3000)
cd webapp && npm install && npm run dev

# Build webapp
cd webapp && npm run build
```

---

## Coding conventions

- **TypeScript everywhere** — strict mode enabled in both root and webapp `tsconfig.json`
- **Next.js App Router** — use server components by default; add `"use client"` only when needed
- **Tailwind CSS** — all styling via Tailwind utility classes, no CSS modules or inline styles
- **No raw HTML emails** — use `webapp/lib/email-template.ts` for email markup
- **PostHog for analytics** — capture events via `posthog.capture()`, keep event names consistent with existing conventions
- **No `any` types** — use the types in `webapp/lib/types.ts` and `src/types.ts`

---

## Deployment (Netlify)

- Deploy triggers automatically on push to `main`
- Build config in `netlify.toml`: base directory `webapp`, command `npm run build`, publish `.next`
- Plugin `@netlify/plugin-nextjs` handles SSR/API route adaptation
- Environment variables required in Netlify dashboard:
  - `EMAIL_USER` — Gmail address for sending reports
  - `EMAIL_PASS` — Gmail app password
  - `NEXT_PUBLIC_POSTHOG_KEY` — PostHog project API key
  - `NEXT_PUBLIC_POSTHOG_HOST` — PostHog host URL

---

## Never-violate rules

1. **Never commit secrets** — no `.env` files, API keys, or passwords in git
2. **Never push directly to `main`** — all changes via feature branch + PR
3. **Never skip TypeScript** — do not use `// @ts-ignore` or `as any` without a documented reason
4. **Never break the email/PDF flow** — the `send-report` API route is production-critical; test locally before merging
5. **Never remove PostHog tracking** without a replacement analytics plan — lead capture and funnel data depends on it
6. **Netlify site name is linked to the domain** — coordinate URL changes with the board before renaming the Netlify site

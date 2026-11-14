# Centre the loader's name, push, deploy on Vercel — plan

Source: Harsha, 2026-11-14: "harshavardhanan can be little bit more centred,
push everything, I need to deploy this, free deployment, snappy, in Vercel,
like reponame.vercel.app".

Which name: the loader's. It starts at the left gutter and stops short of the
right one (60px to 1268px in a 1440px window, so its middle sits 56px left of
the window's). The frame's name is already centred (604 to 836px, middle 720).

Pushing: the standing rule is "never push"; Harsha asked for this push
himself. The GitHub repo `rharshavardhanan/Harshavardhanan` is public and
empty. Checked before pushing: no phone numbers, keys or tokens in tracked
files; the résumé PDF holds the phone number, which Harsha accepted on
2026-11-13 (design spec, "the rule covers the web pages").

### Task 1: The loader's name sits in the middle of the window

- **Goal:** The loader's name is centred across the window at every width, with the white fill still sweeping from its first letter to its last.
- **Why:** Left-aligned, the big name looks off-centre: the gap on its right is wider than the gutter on its left.
- **Files:** `app/globals.css` (`.loader-name`: `align-self: center`, so its box hugs the text and the fill's clip runs over the letters, not empty space), `e2e/loader.e2e.ts`.
- **Steps:** write the test; watch it fail; add the rule; watch it pass (on a clean `.next-test`, see the stale-CSS note in `2026-11-14-enter-gate.md`).
- **Done when:** `pnpm e2e loader` passes "the name sits in the middle of the window": at 1440px and 360px the name's middle is within 4px of the window's.

### Task 2: Everything is on GitHub

- **Goal:** `main` with every commit is on `origin` (github.com/rharshavardhanan/Harshavardhanan).
- **Why:** Vercel builds from it, and it is the "Code" link's home.
- **Steps:** commit Task 1; `git push -u origin main`.
- **Done when:** `git rev-list --count origin/main..main` prints 0 and `gh repo view --json defaultBranchRef` names `main`.

### Task 3: The site is live on a free vercel.app address

- **Goal:** The production build is served at `https://harshavardhanan.vercel.app` (Vercel's address for a project named after the repo; it adds a suffix only if the name is taken), on the free Hobby plan.
- **Why:** Recruiters need a link that opens.
- **Files:** none in the repo (`.vercel/` is git-ignored). `lib/site.ts` already reads Vercel's own production address (`VERCEL_PROJECT_PRODUCTION_URL`), so no variable is needed.
- **Steps:** `vercel link --yes --project harshavardhanan`; connect the GitHub repo so each push to `main` redeploys; `vercel deploy --prod`; inspect; smoke-check pages.
- **Done when:** `vercel inspect <url>` says Ready; `curl` gets 200 for `/`, `/about`, `/work/odovox`, `/resume.pdf`, `/media/mood/mood-road.mp4`; `/sitemap.xml` lists the vercel.app address; the runtime error log is empty.

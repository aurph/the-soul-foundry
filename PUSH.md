# Push THE SOUL FOUNDRY to GitHub

This repository is already initialized and committed locally — it just needs a
remote and a push. **Claude Code** can do all of this. Run from the repo root.

## Option A — GitHub CLI (recommended)
```bash
gh auth status   # make sure you're authenticated
gh repo create the-soul-foundry \
  --public \
  --source=. \
  --remote=origin \
  --description "THE SOUL FOUNDRY — a true-3D desolate colony-automation game (Higgsfield)" \
  --push
```

## Option B — manual
1. Create a new **public** repo named `the-soul-foundry` on github.com (empty: no README, no license, no .gitignore).
2. Then:
```bash
git remote add origin https://github.com/<your-username>/the-soul-foundry.git
git branch -M main
git push -u origin main
```

## Notes
- The repo already has full commit history — do **not** run `git init` again.
- Keep it **public** per the owner's request.
- After pushing, the game lives at `game/index.html`.

# contribution-animations

Animated SVG styles for your real GitHub contribution graph. No fake commits, no personal data, refreshed automatically.

![Snake](https://raw.githubusercontent.com/dilshan-codes/contribution-animations/output/snake.svg)

![Ripple](https://raw.githubusercontent.com/dilshan-codes/contribution-animations/output/ripple.svg)

[All animations](https://github.com/dilshan-codes/contribution-animations/tree/output) · [Add your own](CONTRIBUTING.md)

## Use it on your own profile

1. Create a public repo named exactly like your username (`USERNAME/USERNAME`) with a `README.md`.
2. Add `.github/workflows/contribution-animation.yml`:

```yaml
name: Contribution animation
on:
  schedule:
    - cron: "17 3 * * *"
  workflow_dispatch:
permissions:
  contents: write
jobs:
  animate:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: dilshan-codes/contribution-animations@v1
        with:
          animations: snake
```

3. Open the **Actions** tab, choose "Contribution animation", and press **Run workflow** once.
4. Put this in your profile `README.md` (replace `USERNAME`):

```markdown
![contribution animation](https://raw.githubusercontent.com/USERNAME/USERNAME/output/snake.svg)

```

It also refreshes by itself every 24 hours. Use `animations: all` to build every style, then point the image at `<name>.svg`.
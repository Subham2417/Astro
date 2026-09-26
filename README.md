# AstroVeda — Free Jathagam & Horoscope

A multi-page, static horoscope website designed for GitHub Pages.

## Included
- Home dashboard
- Jathagam / Vedic birth chart
- Kundali matching
- Daily Rashifal
- Panchang
- Nakshatra explorer
- Numerology
- About / methodology
- Responsive mobile UI
- No login or paid API required
- Browser-side calculations

## Important accuracy note
The site uses Astronomy Engine for planetary astronomy and a Lahiri-style sidereal conversion for the Vedic layer. This is suitable for a free public tool, but if you need professional-grade astrological calculations (especially exact historical timezone/DST handling, divisional charts, house cusps, or legal/financial-grade astronomical precision), replace the calculation layer with a validated Swiss Ephemeris backend and a timezone database.

The site intentionally does **not** claim that astrological predictions are scientifically proven. Prediction text is presented as traditional/entertainment guidance.

## GitHub Pages
1. Create a new GitHub repository, e.g. `astroveda`.
2. Upload the entire project, keeping `index.html` at the repository root.
3. GitHub → Settings → Pages.
4. Under Build and deployment, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save.
7. Your site will appear at:
   `https://YOUR-USERNAME.github.io/astroveda/`

If you use a custom domain, add it in GitHub Pages and follow GitHub's DNS instructions.

## Local preview
Because the site loads Astronomy Engine from jsDelivr, run a simple local web server rather than opening files directly:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Making calculations more production-grade
The calculation interface is centralized in `js/astro.js`. You can later replace the astronomy implementation without redesigning the website.

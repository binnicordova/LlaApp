# AI Skill: Performance Optimization

This skill focuses on ensuring the mobile-first website is fast, lightweight, and efficient for all users.

## Optimization Strategies
1. **Critical CSS**: Identify and inline CSS required for the above-the-fold content.
2. **Lazy Loading**: Ensure all images and non-critical assets are lazy-loaded by default.
3. **Asset Minification**: Recommend minification for HTML, CSS, and JS files.
4. **Font Optimization**: Use system fonts or highly optimized web fonts to avoid layout shifts (CLS).

## Mobile Performance Metrics
- **LCP (Largest Contentful Paint)**: Keep under 2.5s.
- **FID (First Input Delay)**: Keep under 100ms.
- **CLS (Cumulative Layout Shift)**: Keep under 0.1.

## AI Instructions
- When suggesting images, remind me to use modern formats like WebP or Avif.
- Avoid suggesting heavy JavaScript libraries when simpler CSS-only solutions exist.
- Always consider the "Mobile User on 3G" scenario when proposing features.

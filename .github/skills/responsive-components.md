# AI Skill: Responsive Components

This skill focuses on building UI components that adapt fluidly across different screen sizes.

## Reusable Patterns
1. **Fluid Grids**: Use `display: grid` or `display: flex` with wrap for layouts. Prefer `fr` units or percentages over fixed pixel widths.
2. **Adaptive Imagery**: Always use `max-width: 100%` and `height: auto` for images. Use `srcset` for better performance on mobile.
3. **Stacked to Horizontal**: Components like cards or feature grids should stack vertically on mobile and spread horizontally on desktop.

## Components Guidelines
- **Cards**: Single column on mobile, 2 cols on tablet, 3-4 cols on desktop.
- **Forms**: Single column inputs on mobile to maximize horizontal space for typing.
- **Tables**: Use horizontal scrolling or transform tables into card-like lists for small screens.

## AI Instructions
- Generate component code that uses modern CSS (Flexbox/Grid) for responsiveness.
- Ensure components are "component-driven" and work regardless of their parent container width.

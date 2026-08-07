# AI Skill: Mobile-First Strategy

This skill provides instructions for designing and implementing websites starting from the mobile viewport and scaling up.

## Core Principles
1. **Content Prioritization**: Identify the most critical information for mobile users and display it first.
2. **Touch-First Interface**: Ensure all interactive elements have a minimum touch target size of 44x44 pixels.
3. **Progressive Enhancement**: Start with a functional mobile layout and add complex features/layouts as screen real estate increases.

## Design Constraints
- **Viewport**: Always start design discussions and code with `min-width: 0` (base mobile styles).
- **Navigation**: Use "hamburger" menus or bottom bars for mobile, transitioning to horizontal navigation only at tablet/desktop breakpoints.
- **Typography**: Maintain readable font sizes (minimum 16px for body text) without requiring zoom.

## AI Instructions
- When asked to create a layout, provide the CSS for mobile first.
- Use media queries only to *add* styles for larger screens (using `min-width`).
- Avoid "Desktop-out" design where styles are overridden for smaller screens using `max-width`.

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/_static/index.html", "./public/assets/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        body: ["system-ui", "-apple-system", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "monospace"]
      },
      colors: {
        ink: "#161a24",
        inkMuted: "#596174",
        night: "#06080e",
        brand: "#3b48ff",
        signal: "#ffed00"
      },
      boxShadow: {
        strong: "0 24px 55px rgba(0, 0, 0, 0.26)"
      }
    }
  },
  plugins: []
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "body-theme": "var(--bg-body)",
        "card-theme": "var(--bg-card)",
        "panel-theme": "var(--bg-panel)",
        "main-theme": "var(--border-main)",
        "subtle-theme": "var(--border-subtle)",
        "primary-theme": "var(--text-primary)",
        "secondary-theme": "var(--text-secondary)",
        "muted-theme": "var(--text-muted)",
        "accent-theme": "var(--accent-color)"
      }
    },
  },
  plugins: [],
}


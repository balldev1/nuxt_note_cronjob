/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,vue}",
    "./components/**/*.{js,ts,vue}",
    "./layouts/**/*.{js,ts,vue}",
    "./app.vue",
  ],
  plugins: [require("daisyui")],
};

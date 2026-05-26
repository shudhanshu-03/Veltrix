/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        inter:     ['Inter', 'sans-serif'],
      },
      colors: {
        gaming: {
          dark: '#08080f',
          surface: '#13131a',
          'surface-low': '#1b1b23',
          'surface-high': '#2a2931',
          'surface-highest': '#34343c',
        },
        brand: {
          purple: '#7c3aed',
          'purple-dim': '#d2bbff',
          cyan: '#06b6d4',
          'cyan-dim': '#4cd7f6',
        },
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(135deg, #7c3aed, #06b6d4)',
        'glass-grad': 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'purple-glow': '0 0 30px rgba(124,58,237,0.25)',
        'cyan-glow': '0 0 30px rgba(6,182,212,0.25)',
        'btn-purple': '0 4px 20px rgba(124,58,237,0.30)',
        'btn-cyan': '0 4px 20px rgba(6,182,212,0.30)',
        'btn-hover': '0 0 45px rgba(124,58,237,0.4), 0 0 20px rgba(6,182,212,0.4)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'float':   'float 3s ease-in-out infinite',
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards',
      },
      keyframes: {
        float:  { '0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-10px)'} },
        fadeUp: { from:{opacity:'0',transform:'translateY(40px)'}, to:{opacity:'1',transform:'translateY(0)'} },
      },
    },
  },
  plugins: [],
}

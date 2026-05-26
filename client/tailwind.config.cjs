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
        rajdhani: ['Rajdhani', 'sans-serif'],
        inter:    ['Inter', 'sans-serif'],
      },
      colors: {
        vx: {
          bg:       '#05050a',
          bg2:      '#09090f',
          bg3:      '#0d0d16',
          card:     '#0f0f1a',
          text:     '#f1f0ff',
          text2:    '#9490b8',
          text3:    '#4a4770',
        },
        brand: {
          orange:       '#ff5500',
          'orange-light':'#ff8c42',
          purple:       '#8800ff',
          'purple-light':'#a855f7',
        },
      },
      backgroundImage: {
        'brand-grad':  'linear-gradient(135deg, #ff5500, #cc00ff)',
        'brand-grad-h':'linear-gradient(135deg, #ff8c42, #a855f7)',
        'glass-grad':  'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'orange-glow': '0 0 30px rgba(255,85,0,0.25)',
        'purple-glow': '0 0 30px rgba(136,0,255,0.25)',
        'glow-dual':   '0 0 60px rgba(255,85,0,0.25), 0 0 100px rgba(136,0,255,0.2)',
        'btn-primary': '0 0 24px rgba(255,85,0,0.3)',
        'btn-hover':   '0 0 45px rgba(255,85,0,0.4), 0 0 20px rgba(136,0,255,0.3)',
        'glass-card':  '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'float':        'float 3s ease-in-out infinite',
        'fade-up':      'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards',
        'neon-pulse':   'neonPulse 2s infinite ease-in-out',
        'veltrix-pulse':'veltrixPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float:  { '0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-10px)'} },
        fadeUp: { from:{opacity:'0',transform:'translateY(40px)'}, to:{opacity:'1',transform:'translateY(0)'} },
        neonPulse: {
          '0%,100%':{ boxShadow:'0 0 12px rgba(255,85,0,.4), 0 0 0 1px rgba(255,85,0,.25)' },
          '50%':    { boxShadow:'0 0 32px rgba(255,85,0,.7), 0 0 0 1px rgba(255,85,0,.5), 0 0 60px rgba(136,0,255,.25)' },
        },
        veltrixPulse: {
          '0%,100%':{ filter:'drop-shadow(0 0 30px rgba(255,85,0,.45)) drop-shadow(0 0 60px rgba(136,0,255,.3))' },
          '50%':    { filter:'drop-shadow(0 0 60px rgba(255,85,0,.8)) drop-shadow(0 0 100px rgba(136,0,255,.5))' },
        },
      },
    },
  },
  plugins: [],
}

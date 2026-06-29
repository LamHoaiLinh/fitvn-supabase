import type { Config } from 'tailwindcss';
export default { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'], theme: { extend: { colors: { fitBlue: '#0EA5E9', fitGreen: '#22C55E', fitDark: '#0F172A' }, boxShadow: { soft: '0 18px 50px rgba(15,23,42,.12)' } } }, plugins: [] } satisfies Config;

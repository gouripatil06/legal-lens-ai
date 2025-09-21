module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'automation-zoom-in': {
  				'0%': {
  					transform: 'translateY(-30px) scale(0.2)'
  				},
  				'100%': {
  					transform: 'transform: translateY(0px) scale(1)'
  				}
  			},
  			flip: {
  				to: {
  					transform: 'rotate(360deg)'
  				}
  			},
  			rotate: {
  				to: {
  					transform: 'rotate(90deg)'
  				}
  			},
  			'rotate-new': {
  				'0%': {
  					transform: 'rotate(0deg) scale(10)'
  				},
  				'100%': {
  					transform: 'rotate(-360deg) scale(10)'
  				}
  			},
  			shimmer: {
  				from: {
  					backgroundPosition: '0 0'
  				},
  				to: {
  					backgroundPosition: '-200% 0'
  				}
  			},
  			'border-beam': {
  				'100%': {
  					'offset-distance': '100%'
  				}
  			},
  			'marquee': {
  				from: {
  					transform: 'translateX(0)'
  				},
  				to: {
  					transform: 'translateX(calc(-100% - var(--gap)))'
  				}
  			},
  			'shine': {
  				'0%': {
  					'background-position': '100%'
  				},
  				'100%': {
  					'background-position': '-100%'
  				}
  			},
  			'glitch': {
  				'0%': {
  					'clip-path': 'inset(20% 0 50% 0)'
  				},
  				'5%': {
  					'clip-path': 'inset(10% 0 60% 0)'
  				},
  				'10%': {
  					'clip-path': 'inset(15% 0 55% 0)'
  				},
  				'15%': {
  					'clip-path': 'inset(25% 0 35% 0)'
  				},
  				'20%': {
  					'clip-path': 'inset(30% 0 40% 0)'
  				},
  				'25%': {
  					'clip-path': 'inset(40% 0 20% 0)'
  				},
  				'30%': {
  					'clip-path': 'inset(10% 0 60% 0)'
  				},
  				'35%': {
  					'clip-path': 'inset(15% 0 55% 0)'
  				},
  				'40%': {
  					'clip-path': 'inset(25% 0 35% 0)'
  				},
  				'45%': {
  					'clip-path': 'inset(30% 0 40% 0)'
  				},
  				'50%': {
  					'clip-path': 'inset(20% 0 50% 0)'
  				},
  				'55%': {
  					'clip-path': 'inset(10% 0 60% 0)'
  				},
  				'60%': {
  					'clip-path': 'inset(15% 0 55% 0)'
  				},
  				'65%': {
  					'clip-path': 'inset(25% 0 35% 0)'
  				},
  				'70%': {
  					'clip-path': 'inset(30% 0 40% 0)'
  				},
  				'75%': {
  					'clip-path': 'inset(40% 0 20% 0)'
  				},
  				'80%': {
  					'clip-path': 'inset(20% 0 50% 0)'
  				},
  				'85%': {
  					'clip-path': 'inset(10% 0 60% 0)'
  				},
  				'90%': {
  					'clip-path': 'inset(15% 0 55% 0)'
  				},
  				'95%': {
  					'clip-path': 'inset(25% 0 35% 0)'
  				},
  				'100%': {
  					'clip-path': 'inset(30% 0 40% 0)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'automation-zoom-in': 'automation-zoom-in 0.5s',
  			flip: 'flip 6s infinite steps(2, end)',
  			rotate: 'rotate 3s linear infinite both',
  			'rotate-new': 'rotate-new 20s linear infinite',
  			shimmer: 'shimmer 2s linear infinite',
  			'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
  			'marquee': 'marquee var(--duration) linear infinite',
  			'shine': 'shine 5s linear infinite',
  			'glitch-after': 'glitch var(--after-duration) infinite linear alternate-reverse',
  			'glitch-before': 'glitch var(--before-duration) infinite linear alternate-reverse'
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
}
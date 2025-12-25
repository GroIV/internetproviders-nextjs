'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

// Animated data pulse component for circuit lines
function DataPulse({ delay = 0, duration = 3 }: { delay?: number; duration?: number }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full bg-cyan-400"
      style={{ filter: 'blur(1px)', boxShadow: '0 0 8px rgba(6, 182, 212, 0.8)' }}
      initial={{ left: '-5%', opacity: 0 }}
      animate={{
        left: '105%',
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 relative overflow-hidden">
      {/* Animated Circuit Pattern Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Horizontal circuit lines with data pulses */}
        <div className="absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent">
          <DataPulse delay={0} duration={4} />
        </div>
        <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/15 to-transparent">
          <DataPulse delay={1.5} duration={5} />
        </div>
        <div className="absolute bottom-24 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent">
          <DataPulse delay={2.5} duration={6} />
        </div>

        {/* Vertical circuit lines */}
        <div className="absolute top-0 bottom-0 left-1/4 w-px bg-gradient-to-b from-transparent via-blue-500/10 to-transparent" />
        <div className="absolute top-0 bottom-0 right-1/4 w-px bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent" />

        {/* Corner accents */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-cyan-500/20" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r border-t border-cyan-500/20" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l border-b border-blue-500/20" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b border-blue-500/20" />

        {/* Glowing orbs */}
        <div className="absolute top-1/2 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
        <div className="absolute top-1/2 right-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Rankings
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/compare" className="hover:text-cyan-400 transition-colors">Find Providers</Link></li>
              <li><Link href="/best/fiber-providers" className="hover:text-cyan-400 transition-colors">Best Fiber</Link></li>
              <li><Link href="/best/cable-providers" className="hover:text-cyan-400 transition-colors">Best Cable</Link></li>
              <li><Link href="/cheapest/providers" className="hover:text-cyan-400 transition-colors">Cheapest Internet</Link></li>
              <li><Link href="/fastest/providers" className="hover:text-cyan-400 transition-colors">Fastest Internet</Link></li>
              <li><Link href="/deals" className="hover:text-cyan-400 transition-colors">Deals & Promotions</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Comparisons
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/compare/att-internet-vs-spectrum" className="hover:text-blue-400 transition-colors">AT&T vs Spectrum</Link></li>
              <li><Link href="/compare/xfinity-vs-spectrum" className="hover:text-blue-400 transition-colors">Xfinity vs Spectrum</Link></li>
              <li><Link href="/compare/att-internet-vs-verizon-fios" className="hover:text-blue-400 transition-colors">AT&T vs Verizon</Link></li>
              <li><Link href="/compare/technology/fiber-vs-cable" className="hover:text-blue-400 transition-colors">Fiber vs Cable</Link></li>
              <li><Link href="/compare/technology/cable-vs-5g" className="hover:text-blue-400 transition-colors">Cable vs 5G</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              By Location
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/internet" className="hover:text-purple-400 transition-colors">Internet by State</Link></li>
              <li><Link href="/internet/texas" className="hover:text-purple-400 transition-colors">Texas</Link></li>
              <li><Link href="/internet/california" className="hover:text-purple-400 transition-colors">California</Link></li>
              <li><Link href="/internet/florida" className="hover:text-purple-400 transition-colors">Florida</Link></li>
              <li><Link href="/internet/new-york" className="hover:text-purple-400 transition-colors">New York</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Resources
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/guides" className="hover:text-green-400 transition-colors">Guides</Link></li>
              <li><Link href="/faq" className="hover:text-green-400 transition-colors">FAQ</Link></li>
              <li><Link href="/tools/speed-test" className="hover:text-green-400 transition-colors">Speed Test</Link></li>
              <li><Link href="/tools/quiz" className="hover:text-green-400 transition-colors">Find Your Plan</Link></li>
              <li><Link href="/tools/ai-assistant" className="hover:text-green-400 transition-colors">AI Assistant</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Company
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-orange-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-orange-400 transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-orange-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 relative">
          {/* Glowing line on border */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <motion.p
              className="text-sm text-gray-500"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              &copy; {new Date().getFullYear()} InternetProviders.ai. All rights reserved.
            </motion.p>

            {/* Social links with glow effect */}
            <div className="flex items-center gap-4">
              <motion.a
                href="#"
                className="text-gray-500 hover:text-cyan-400 transition-colors"
                whileHover={{ scale: 1.1, filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))' }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-500 hover:text-blue-400 transition-colors"
                whileHover={{ scale: 1.1, filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

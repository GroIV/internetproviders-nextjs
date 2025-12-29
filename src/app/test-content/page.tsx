'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { AuroraBlobs } from '@/components/effects/AuroraBlobs'
import { CircuitPattern } from '@/components/effects/CircuitPattern'

// Sample content that mimics what would come from Supabase
const sampleHtml = `
<div class="ipai-container ipai-container--narrow">
  <!-- Hero Card -->
  <div class="ipai-card" style="margin-bottom: 2rem;">
    <div class="ipai-card__glow"></div>
    <div class="ipai-card__content">
      <span class="ipai-tier-badge ipai-tier-badge--value">Technology Guide</span>
      <h1 style="font-size: 2.25rem; font-weight: 700; margin-top: 1rem; background: linear-gradient(to right, #ffffff, #e0f2fe); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        5G Home Internet: Complete Guide
      </h1>
      <p style="color: #9ca3af; font-size: 1.125rem; margin-top: 0.5rem;">
        Everything you need to know about 5G fixed wireless internet for your home.
      </p>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="ipai-stats-grid" style="margin-bottom: 2rem;">
    <div class="ipai-stat-card ipai-stat-card--cyan">
      <div class="ipai-stat-card__label">Max Speed</div>
      <div class="ipai-stat-card__value">1 Gbps</div>
    </div>
    <div class="ipai-stat-card ipai-stat-card--green">
      <div class="ipai-stat-card__label">Starting Price</div>
      <div class="ipai-stat-card__value">$40/mo</div>
    </div>
    <div class="ipai-stat-card ipai-stat-card--purple">
      <div class="ipai-stat-card__label">Availability</div>
      <div class="ipai-stat-card__value">Growing</div>
    </div>
    <div class="ipai-stat-card">
      <div class="ipai-stat-card__label">Contract</div>
      <div class="ipai-stat-card__value">None</div>
    </div>
  </div>

  <!-- Plan Cards -->
  <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: white;">Top 5G Providers</h2>
  <div class="ipai-grid ipai-grid--2" style="margin-bottom: 2rem;">
    <div class="ipai-plan-card ipai-plan-card--value">
      <div class="ipai-plan-card__gradient"></div>
      <div class="ipai-plan-card__content">
        <div class="ipai-plan-card__header">
          <div>
            <p class="ipai-plan-card__provider">T-Mobile</p>
            <h3 class="ipai-plan-card__name">5G Home Internet</h3>
          </div>
          <span class="ipai-tech-badge ipai-tech-badge--5g">5G</span>
        </div>
        <div class="ipai-plan-card__price">
          <span class="ipai-plan-card__price-amount">$50</span>
          <span class="ipai-plan-card__price-period">/mo</span>
          <p class="ipai-plan-card__price-note">No contract required</p>
        </div>
        <div class="ipai-plan-card__actions">
          <a href="/providers/t-mobile" class="ipai-btn ipai-btn--primary" style="width: 100%;">View Plans</a>
        </div>
      </div>
    </div>

    <div class="ipai-plan-card ipai-plan-card--premium">
      <div class="ipai-plan-card__gradient"></div>
      <div class="ipai-plan-card__content">
        <div class="ipai-plan-card__header">
          <div>
            <p class="ipai-plan-card__provider">Verizon</p>
            <h3 class="ipai-plan-card__name">5G Home Plus</h3>
          </div>
          <span class="ipai-tech-badge ipai-tech-badge--5g">5G</span>
        </div>
        <div class="ipai-plan-card__price">
          <span class="ipai-plan-card__price-amount">$60</span>
          <span class="ipai-plan-card__price-period">/mo</span>
          <p class="ipai-plan-card__price-note">With Auto Pay</p>
        </div>
        <div class="ipai-plan-card__actions">
          <a href="/providers/verizon-5g" class="ipai-btn ipai-btn--primary" style="width: 100%;">View Plans</a>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="ipai-prose">
    <h2>What is 5G Home Internet?</h2>
    <p>
      5G home internet uses cellular towers to deliver high-speed internet to your home without the need for cable or fiber connections. It's a <strong>fixed wireless</strong> service, meaning you get a gateway device that connects to nearby 5G towers.
    </p>

    <h3>Key Benefits</h3>
    <ul>
      <li><strong>No installation required</strong> - just plug in the gateway and connect</li>
      <li><strong>No contracts</strong> - most providers offer month-to-month service</li>
      <li><strong>No data caps</strong> - unlimited data with T-Mobile and Verizon</li>
      <li><strong>Competitive speeds</strong> - typically 100-300 Mbps, up to 1 Gbps in some areas</li>
    </ul>

    <h3>How Does It Compare?</h3>
    <p>
      5G home internet sits between traditional <a href="/compare/technology/cable-vs-5g">cable internet</a> and <a href="/compare/technology/fiber-vs-5g">fiber</a> in terms of speed and reliability. It's an excellent option for:
    </p>
    <ul>
      <li>Areas without fiber or cable availability</li>
      <li>Renters who can't install permanent connections</li>
      <li>Anyone wanting to avoid contracts and installation fees</li>
    </ul>
  </div>

  <!-- Comparison Table -->
  <div class="ipai-table-wrap" style="margin: 2rem 0;">
    <table>
      <thead>
        <tr>
          <th>Provider</th>
          <th>Speed</th>
          <th>Price</th>
          <th>Contract</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>T-Mobile 5G Home</td>
          <td>Up to 245 Mbps</td>
          <td>$50/mo</td>
          <td>None</td>
        </tr>
        <tr>
          <td>Verizon 5G Home</td>
          <td>Up to 1 Gbps</td>
          <td>$60/mo</td>
          <td>None</td>
        </tr>
        <tr>
          <td>Starlink</td>
          <td>Up to 220 Mbps</td>
          <td>$120/mo</td>
          <td>None</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- CTA Section -->
  <div class="ipai-cta-section" style="margin-top: 3rem;">
    <div class="ipai-cta-section__glow"></div>
    <div class="ipai-cta-section__content">
      <h2 class="ipai-cta-section__title">Check 5G Availability</h2>
      <p class="ipai-cta-section__text">
        Enter your ZIP code to see if 5G home internet is available in your area.
      </p>
      <div class="ipai-cta-section__buttons">
        <a href="/compare" class="ipai-btn ipai-btn--primary ipai-btn--lg">
          Check Availability
        </a>
        <a href="/providers" class="ipai-btn ipai-btn--secondary ipai-btn--lg">
          Browse Providers
        </a>
      </div>
    </div>
  </div>
</div>
`

// Animation variants for scroll-triggered reveals
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function TestContentPage() {
  return (
    <>
      {/* Animated backgrounds - multiple layers */}
      <AuroraBlobs opacity={0.08} />
      <CircuitPattern opacity={0.04} animated={true} />

      <div className="min-h-screen relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb with fade in */}
            <motion.nav
              className="ipai-breadcrumb"
              aria-label="Breadcrumb"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/">Home</Link>
              <span className="ipai-breadcrumb__separator">/</span>
              <Link href="/guides">Guides</Link>
              <span className="ipai-breadcrumb__separator">/</span>
              <Link href="/guides?category=technology">Technology</Link>
              <span className="ipai-breadcrumb__separator">/</span>
              <span className="ipai-breadcrumb__current">5G Home Internet Guide</span>
            </motion.nav>

            {/* Content wrapper with scroll-triggered animations */}
            <motion.article
              className="ipai-prose"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {/*
                For static HTML content, we wrap sections in motion.div
                The template can split content by sections or use a single fade-in
              */}
              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                dangerouslySetInnerHTML={{ __html: sampleHtml }}
              />
            </motion.article>

            {/* Back link with fade in */}
            <motion.div
              className="mt-12 pt-8 border-t border-gray-800"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to All Guides
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}

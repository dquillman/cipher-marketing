import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';

/**
 * OGCard — 1200×630 social card. Renders as a still (one frame) for use as
 * og:image / twitter:image on cipherexam.com routes.
 *
 * Render via `npx remotion still ...` — see scripts/render-og-cards.mjs.
 *
 * Brand colors lifted from BrandLogo.tsx:
 *   bg          #020617 (cipher-exam-context verified)
 *   text accent linear-gradient(135deg, #818cf8 0%, #3b82f6 100%)
 *   subtle text #cbd5e1 (slate-300)
 *   muted text  #94a3b8 (slate-400)
 *   ring        rgba(99, 102, 241, 0.3)
 */

export type OGCardProps = {
  eyebrow: string;        // e.g., "CipherExam · PMP"
  headline: string;       // big top-of-card line
  subhead: string;        // 1-line supporting copy
  ctaText: string;        // "Start Free Trial — cipherexam.com"
};

export const OG_DEFAULT: OGCardProps = {
  eyebrow: 'CipherExam',
  headline: 'Learn How Certification Exams Think.',
  subhead: 'AI-powered cert prep with reasoning explained per question.',
  ctaText: 'Start Free Trial · cipherexam.com',
};

export const OG_PMP: OGCardProps = {
  eyebrow: 'CipherExam · PMP',
  headline: 'Practice PMP the way PMI thinks.',
  subhead: 'Bloom’s-classified questions with the PMI Decision Lens explained.',
  ctaText: 'Free 7-day trial · cipherexam.com/lp/pmp',
};

export const OG_SECURITY_PLUS: OGCardProps = {
  eyebrow: 'CipherExam · Security+',
  headline: 'PBQ-native Security+ practice.',
  subhead: 'Drag-drop, topology, CLI items — reasoned through the CIA triad.',
  ctaText: 'Free 7-day trial · cipherexam.com/lp/security-plus',
};

export const OG_SHRM_CP: OGCardProps = {
  eyebrow: 'CipherExam · SHRM-CP',
  headline: 'SHRM-CP situational questions, decoded.',
  subhead: 'Every right answer tied to the SHRM behavioral competency it tests.',
  ctaText: 'Free 7-day trial · cipherexam.com/lp/shrm-cp',
};

export const OG_STORY: OGCardProps = {
  eyebrow: 'CipherExam · Founder Story',
  headline: 'Why I built CipherExam.',
  subhead: 'Cert exams test how you think — not what you memorized.',
  ctaText: 'Read the story · cipherexam.com/story',
};

export const OGCard: React.FC<OGCardProps> = ({ eyebrow, headline, subhead, ctaText }) => (
  <AbsoluteFill
    style={{
      backgroundColor: '#020617',
      backgroundImage:
        'radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.22) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(59, 130, 246, 0.18) 0%, transparent 55%)',
      padding: '72px 80px',
      fontFamily: '"Satoshi", "General Sans", system-ui, sans-serif',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    {/* Top row — logo lockup */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
      }}
    >
      <Img
        src={staticFile('cipherexam-logo.png')}
        style={{
          width: 64,
          height: 64,
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 16px rgba(99, 102, 241, 0.4))',
        }}
      />
      <div
        style={{
          fontWeight: 800,
          fontSize: 36,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #818cf8 0%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
        }}
      >
        CipherExam
      </div>
    </div>

    {/* Middle block — eyebrow, headline, subhead */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div
        style={{
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          fontSize: 18,
          fontWeight: 600,
          color: '#a5b4fc',
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontSize: 70,
          fontWeight: 800,
          letterSpacing: '-0.025em',
          lineHeight: 1.05,
          color: '#ffffff',
          maxWidth: 1000,
        }}
      >
        {headline}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 400,
          lineHeight: 1.35,
          color: '#cbd5e1',
          maxWidth: 980,
        }}
      >
        {subhead}
      </div>
    </div>

    {/* Bottom row — CTA pill */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '16px 28px',
          borderRadius: 999,
          background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
          fontSize: 22,
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-0.005em',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
        }}
      >
        {ctaText}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 500,
          color: '#94a3b8',
          letterSpacing: '0.02em',
        }}
      >
        PMP · CompTIA · Scrum · SHRM · ITIL · AWS · 11+ certs
      </div>
    </div>
  </AbsoluteFill>
);

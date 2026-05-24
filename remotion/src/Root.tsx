import React from 'react';
import { Composition } from 'remotion';
import { CipherExamAd, AD_DEFAULTS, AD_DURATION_FRAMES } from './CipherExamAd';
import {
  CipherExamSingleChunkAd,
  SINGLE_CHUNK_AD_DEFAULTS,
  SINGLE_CHUNK_AD_DURATION,
} from './CipherExamSingleChunkAd';
import {
  CipherExamHybridLite,
  HYBRID_LITE_DEFAULTS,
  HYBRID_LITE_DURATION,
} from './CipherExamHybridLite';
import {
  CipherExamHybridFull,
  HYBRID_FULL_DEFAULTS,
  HYBRID_FULL_DURATION,
} from './CipherExamHybridFull';
import {
  CipherExamMotionAd,
  MOTION_AD_DURATION,
  MOTION_AD_DEFAULTS,
  PMP_VARIANT,
  SECURITY_PLUS_VARIANT,
  SHRM_CP_VARIANT,
} from './CipherExamMotionAd';

// ────────────────────────────────────────────────────────────────────────────
// COMPOSITIONS
// ────────────────────────────────────────────────────────────────────────────
// 1. CipherExamAd  — Hybrid: stitches Veo chunks + adds captions + logo + end card.
//                    24fps, 1280×720, matches Veo source. Requires public/chunk1.mp4 + chunk2.mp4.
//
// 2. CipherExamMotionAd_* — Pure motion graphics, no video chunks needed. Per-cert variants
//                    pre-wired (PMP / Security+ / SHRM-CP). 30fps, 1920×1080. Ships TODAY without
//                    burning any Veo quota.
// ────────────────────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <>
    {/* ─── HYBRID COMPOSITION (needs Veo chunks) ─── */}
    <Composition
      id="CipherExamAd"
      component={CipherExamAd}
      durationInFrames={AD_DURATION_FRAMES}
      fps={24}
      width={1280}
      height={720}
      defaultProps={AD_DEFAULTS}
    />

    {/* ─── HYBRID FULL (cost-anchor + Veo chunk2 + Veo chunk3 + end card) ─── */}
    <Composition
      id="CipherExamHybridFull"
      component={CipherExamHybridFull}
      durationInFrames={HYBRID_FULL_DURATION}
      fps={24}
      width={1280}
      height={720}
      defaultProps={HYBRID_FULL_DEFAULTS}
    />

    {/* ─── HYBRID LITE (motion-graphics cost-anchor + Veo chunk2 + end card) ─── */}
    <Composition
      id="CipherExamHybridLite"
      component={CipherExamHybridLite}
      durationInFrames={HYBRID_LITE_DURATION}
      fps={24}
      width={1280}
      height={720}
      defaultProps={HYBRID_LITE_DEFAULTS}
    />

    {/* ─── SINGLE-CHUNK HYBRID (one Veo clip + Remotion polish + end card) ─── */}
    <Composition
      id="CipherExamSingleChunkAd"
      component={CipherExamSingleChunkAd}
      durationInFrames={SINGLE_CHUNK_AD_DURATION}
      fps={24}
      width={1280}
      height={720}
      defaultProps={SINGLE_CHUNK_AD_DEFAULTS}
    />

    {/* ─── PURE MOTION-GRAPHICS COMPOSITIONS (no Veo needed) ─── */}
    <Composition
      id="CipherExamMotionAd-PMP"
      component={CipherExamMotionAd}
      durationInFrames={MOTION_AD_DURATION}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={PMP_VARIANT}
    />
    <Composition
      id="CipherExamMotionAd-SecurityPlus"
      component={CipherExamMotionAd}
      durationInFrames={MOTION_AD_DURATION}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={SECURITY_PLUS_VARIANT}
    />
    <Composition
      id="CipherExamMotionAd-SHRMCP"
      component={CipherExamMotionAd}
      durationInFrames={MOTION_AD_DURATION}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={SHRM_CP_VARIANT}
    />
    {/* Generic editable composition — tweak props live in Studio */}
    <Composition
      id="CipherExamMotionAd"
      component={CipherExamMotionAd}
      durationInFrames={MOTION_AD_DURATION}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={MOTION_AD_DEFAULTS}
    />
  </>
);

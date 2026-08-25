import { Composition, continueRender, delayRender } from "remotion";
import { useEffect, useState } from "react";
import "./fonts.css";
import { LaunchTeaser } from "./components/LaunchTeaser";
import { AiTutorDemo } from "./components/AiTutorDemo";
import { DomainWeights } from "./components/DomainWeights";
import { PbqWalkthrough } from "./components/PbqWalkthrough";
import { AdAllFour } from "./components/AdAllFour";
import { PostVideo, type PostVideoProps } from "./components/PostVideo";
import { PostVideoTwoBeat, type PostVideoTwoBeatProps } from "./components/PostVideoTwoBeat";
import { PostCard } from "./components/PostCard";
import type { PostCardProps } from "./data/postCard";
import type { ExamVariant } from "./data/examVariants";

const FontLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [handle] = useState(() => delayRender("Loading Satoshi + General Sans"));

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,800,900&f[]=general-sans@300,400,500,600,700&display=swap";
    link.onload = () => {
      const docFonts: any = (document as any).fonts;
      const loads = [
        docFonts?.load?.('700 64px "Satoshi"'),
        docFonts?.load?.('800 96px "Satoshi"'),
        docFonts?.load?.('500 32px "General Sans"'),
      ].filter(Boolean);
      Promise.all(loads).finally(() => continueRender(handle));
    };
    link.onerror = () => continueRender(handle);
    document.head.appendChild(link);
  }, [handle]);

  return <>{children}</>;
};

/**
 * The LinkedIn post cards use their own faces, not Satoshi/General Sans.
 * The four looks are deliberately un-SaaS: an editorial serif, a scan-form
 * mono, a code mono, and a grotesk. Served from Google Fonts.
 */
const CardFontLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [handle] = useState(() => delayRender("Loading post-card fonts"));

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@500;600;700&family=Instrument+Serif&family=JetBrains+Mono:wght@400;500;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap";
    link.onload = () => {
      const docFonts: any = (document as any).fonts;
      const loads = [
        docFonts?.load?.('400 108px "Instrument Serif"'),
        docFonts?.load?.('400 40px "Newsreader"'),
        docFonts?.load?.('700 84px "IBM Plex Sans"'),
        docFonts?.load?.('400 34px "IBM Plex Mono"'),
        docFonts?.load?.('700 76px "JetBrains Mono"'),
        docFonts?.load?.('700 42px "Archivo"'),
      ].filter(Boolean);
      Promise.all(loads).finally(() => continueRender(handle));
    };
    link.onerror = () => continueRender(handle);
    document.head.appendChild(link);
  }, [handle]);

  return <>{children}</>;
};

type VariantProps = { variant: ExamVariant };

const wrap =
  <P extends VariantProps>(Component: React.FC<P>): React.FC<P> =>
  (props) => (
    <FontLoader>
      <Component {...props} />
    </FontLoader>
  );

const TIER_1: ExamVariant[] = ["pmp", "secplus", "shrm"];
const ROUND_2: ExamVariant[] = ["pmp2", "secplus2", "shrm2"];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {TIER_1.map((v) => (
        <Composition
          key={`launch-teaser-${v}`}
          id={`launch-teaser-${v}`}
          component={wrap(LaunchTeaser) as React.FC<VariantProps>}
          durationInFrames={360}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{ variant: v }}
        />
      ))}
      {TIER_1.map((v) => (
        <Composition
          key={`ai-tutor-demo-${v}`}
          id={`ai-tutor-demo-${v}`}
          component={wrap(AiTutorDemo) as React.FC<VariantProps>}
          durationInFrames={750}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ variant: v }}
        />
      ))}
      {TIER_1.map((v) => (
        <Composition
          key={`domain-weights-${v}`}
          id={`domain-weights-${v}`}
          component={wrap(DomainWeights) as React.FC<VariantProps>}
          durationInFrames={450}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{ variant: v }}
        />
      ))}
      {ROUND_2.map((v) => (
        <Composition
          key={`ai-tutor-demo-${v}`}
          id={`ai-tutor-demo-${v}`}
          component={wrap(AiTutorDemo) as React.FC<VariantProps>}
          durationInFrames={750}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ variant: v }}
        />
      ))}
      <Composition
        key="pbq-walkthrough-secplus"
        id="pbq-walkthrough-secplus"
        component={wrap(() => <PbqWalkthrough />) as React.FC<VariantProps>}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ variant: "secplus" }}
      />
      {/* ===== 4:5 LinkedIn-optimised variants (1080×1350) =====
          Same components, different canvas. AbsoluteFill flex layouts
          adapt: top-anchored headers stay top, bottom-anchored footers
          stay bottom, middle content compresses. */}
      {TIER_1.concat(ROUND_2).map((v) => (
        <Composition
          key={`ai-tutor-demo-${v}-li`}
          id={`ai-tutor-demo-${v}-li`}
          component={wrap(AiTutorDemo) as React.FC<VariantProps>}
          durationInFrames={750}
          fps={30}
          width={1080}
          height={1350}
          defaultProps={{ variant: v }}
        />
      ))}
      {/* ===== Paid-social motion ad: "All four answers" (5s loop) =====
          1:1 = universal (X, Reddit, link). 4:5 = LinkedIn-recommended. */}
      <Composition
        key="ad-all-four-1x1"
        id="ad-all-four-1x1"
        component={wrap(() => <AdAllFour />) as React.FC<VariantProps>}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{ variant: "pmp" }}
      />
      <Composition
        key="ad-all-four-4x5"
        id="ad-all-four-4x5"
        component={wrap(() => <AdAllFour />) as React.FC<VariantProps>}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1350}
        defaultProps={{ variant: "pmp" }}
      />
      <Composition
        key="pbq-walkthrough-secplus-li"
        id="pbq-walkthrough-secplus-li"
        component={wrap(() => <PbqWalkthrough />) as React.FC<VariantProps>}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1350}
        defaultProps={{ variant: "secplus" }}
      />
      {/* ===== Post-to-video: turns a draft's copy into a 7s motion ad =====
          Data-driven (examName/examPrice/hookText passed per render) rather
          than a fixed variant — the Cloud Function supplies props per post. */}
      <Composition
        key="post-video"
        id="post-video"
        component={(props: PostVideoProps) => (
          <FontLoader>
            <PostVideo {...props} />
          </FontLoader>
        )}
        durationInFrames={420}
        fps={60}
        width={1080}
        height={1080}
        defaultProps={{
          examName: "PMP",
          examPrice: 425,
          hookText: "Cert prep tools haven't changed since 2010.",
          ctaText: "Start Free Trial",
        }}
      />
      {/* Two-beat variant: hook → supporting line → price/CTA lockup. */}
      <Composition
        key="post-video-2beat"
        id="post-video-2beat"
        component={(props: PostVideoTwoBeatProps) => (
          <FontLoader>
            <PostVideoTwoBeat {...props} />
          </FontLoader>
        )}
        durationInFrames={480}
        fps={60}
        width={1080}
        height={1080}
        defaultProps={{
          examName: "PMP",
          examPrice: 425,
          hookText: "The PMP exam changed on July 9, 2026.",
          supportText: "PMI increased Business Environment from 8% to 26%.",
          ctaText: "Start Free Trial",
        }}
      />
      {/* ===== Post card: 1080×1350 still for the LinkedIn feed =====
          Four approved looks; the look and all copy arrive as props from
          scripts/render-post-card.mjs. Render with `remotion still`. */}
      <Composition
        key="post-card"
        id="post-card"
        component={(props: PostCardProps) => (
          <CardFontLoader>
            <PostCard {...props} />
          </CardFontLoader>
        )}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1350}
        defaultProps={{
          look: "answerSheet",
          eyebrow: "PMP · COST MANAGEMENT",
          meta: "CIPHEREXAM",
          headline: "Four answers.\nAll defensible.\nOne scores.",
          options: [
            { letter: "A", text: "Draw the full $210,000 from contingency" },
            { letter: "B", text: "Apply $180,000, take $30,000 to governance" },
            { letter: "C", text: "Defer a scope item to absorb $30,000" },
            { letter: "D", text: "Re-estimate to find $30,000 first" },
          ],
          correctIndex: 1,
          why: "Contingency covers the risk you planned for. The $30,000 that crosses your cost baseline was never yours to approve.",
        } as PostCardProps}
      />
    </>
  );
};

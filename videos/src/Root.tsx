import { Composition, continueRender, delayRender } from "remotion";
import { useEffect, useState } from "react";
import "./fonts.css";
import { LaunchTeaser } from "./components/LaunchTeaser";
import { AiTutorDemo } from "./components/AiTutorDemo";
import { DomainWeights } from "./components/DomainWeights";
import { PbqWalkthrough } from "./components/PbqWalkthrough";
import { AdAllFour } from "./components/AdAllFour";
import { PostVideo, type PostVideoProps } from "./components/PostVideo";
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
    </>
  );
};

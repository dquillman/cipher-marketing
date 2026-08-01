import { Composition } from "remotion";
import { PostVideo } from "./PostVideo.jsx";

// Deploy-scoped Remotion root — registers only the post-video compositions.
// The full multi-composition root lives in videos/src/Root.tsx; this is a
// minimal entry so the Cloud Function bundles fast and stays small.
//
// Two aspect ratios: LinkedIn recommends 4:5, which occupies noticeably more
// feed height than a square, while X and everything else take 1:1. The render
// function picks by channel, so there's no extra UI to drive.
const DEFAULTS = {
  examName: "PMP",
  examPrice: 425,
  hookText: "Cert prep tools haven't changed since 2010.",
  ctaText: "Start Free Trial",
};

export const RemotionRoot = () => (
  <>
    <Composition
      id="post-video"
      component={PostVideo}
      durationInFrames={420}
      fps={60}
      width={1080}
      height={1080}
      defaultProps={DEFAULTS}
    />
    <Composition
      id="post-video-4x5"
      component={PostVideo}
      durationInFrames={420}
      fps={60}
      width={1080}
      height={1350}
      defaultProps={DEFAULTS}
    />
  </>
);

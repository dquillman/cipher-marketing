import { Composition } from "remotion";
import { PostVideo } from "./PostVideo.jsx";

// Deploy-scoped Remotion root — registers ONLY the post-video composition.
// The full multi-composition root lives in videos/src/Root.tsx; this is a
// minimal entry so the Cloud Function bundles fast and stays small.
export const RemotionRoot = () => (
  <Composition
    id="post-video"
    component={PostVideo}
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
);

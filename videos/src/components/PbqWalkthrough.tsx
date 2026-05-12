import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { theme } from "./theme";
import { fontHeading, fontBody } from "./fonts";
import { AudioTrack } from "./AudioTrack";

// Sec+ PBQ-walkthrough: match each control to which CIA-triad principle it protects.
// 9:16, 1080×1920, 30s @ 30fps = 900 frames.

type CIAKey = "C" | "I" | "A";
type Item = { id: string; label: string; bucket: CIAKey; reasoning: string };

const ITEMS: Item[] = [
  { id: "tls",   label: "TLS encryption on email",      bucket: "C", reasoning: "Hides content from anyone in transit." },
  { id: "hash",  label: "Hash check on downloads",      bucket: "I", reasoning: "Detects tampering — same data in, same hash out." },
  { id: "raid",  label: "RAID 5 storage redundancy",    bucket: "A", reasoning: "Survives a disk failure without downtime." },
  { id: "log",   label: "Append-only transaction logs", bucket: "I", reasoning: "Records can't be silently rewritten." },
];

const BUCKETS: { key: CIAKey; title: string; sub: string; color: string }[] = [
  { key: "C", title: "Confidentiality", sub: "Who can see it?",   color: theme.accent },
  { key: "I", title: "Integrity",        sub: "Has it changed?",   color: theme.accentPurple },
  { key: "A", title: "Availability",     sub: "Can you use it?",   color: theme.good },
];

// Timing constants (frames @ 30fps)
const F_TITLE_IN     = 0;
const F_BUCKETS_IN   = 60;     // 2s
const F_ITEMS_IN     = 150;    // 5s — all 4 items appear
const F_DRAG_START   = 270;    // 9s
const F_DRAG_STEP    = 80;     // 2.67s per drag
const F_CHECK_IN     = F_DRAG_START + ITEMS.length * F_DRAG_STEP; // 690 = 23s
const F_LENS_IN      = F_CHECK_IN + 30;   // 24s
const F_FOOTER_IN    = 840;    // 28s

export const PbqWalkthrough: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ---- Title ----
  const titleP = spring({ frame: frame - F_TITLE_IN, fps, config: { damping: 20, stiffness: 110 } });
  const titleOpacity = interpolate(titleP, [0, 1], [0, 1]);
  const titleY = interpolate(titleP, [0, 1], [-16, 0]);
  // Title fades out as content takes over
  const titleOut = interpolate(frame, [F_ITEMS_IN, F_ITEMS_IN + 30], [1, 0.45], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ---- Bucket rows fade in ----
  const bucketsP = spring({ frame: frame - F_BUCKETS_IN, fps, config: { damping: 22, stiffness: 110 } });
  const bucketsOpacity = interpolate(bucketsP, [0, 1], [0, 1]);

  // ---- Items appear in a row ----
  const itemsP = spring({ frame: frame - F_ITEMS_IN, fps, config: { damping: 22, stiffness: 110 } });
  const itemsRowOpacity = interpolate(itemsP, [0, 1], [0, 1]);

  // ---- Lens explanation panel ----
  const lensP = spring({ frame: frame - F_LENS_IN, fps, config: { damping: 22, stiffness: 110 } });
  const lensOpacity = interpolate(lensP, [0, 1], [0, 1]);
  const lensY = interpolate(lensP, [0, 1], [40, 0]);

  // ---- Footer ----
  const footerP = spring({ frame: frame - F_FOOTER_IN, fps, config: { damping: 22, stiffness: 110 } });
  const footerOpacity = interpolate(footerP, [0, 1], [0, 1]);

  // Bucket positions (vertical layout). The "tray" of items sits at the bottom.
  // 1080×1920 canvas; padding 56 on each side.
  // We compute drag animation per item: each item's start position is in the tray;
  // its destination is inside its bucket.
  const BUCKET_H = 200;
  const BUCKET_GAP = 24;
  const BUCKETS_TOP = 280;
  const TRAY_Y = 1480;
  const ITEM_W = 224;
  const ITEM_H = 96;
  const ITEM_GAP = 20;

  // Tray X positions for 4 items, centered
  const totalTrayW = ITEMS.length * ITEM_W + (ITEMS.length - 1) * ITEM_GAP;
  const trayStartX = (1080 - totalTrayW) / 2;
  const trayPos = ITEMS.map((_, i) => ({
    x: trayStartX + i * (ITEM_W + ITEM_GAP),
    y: TRAY_Y,
  }));
  // Destination per item: stacked inside the bucket (left side of the bucket row)
  const bucketY = (k: CIAKey) => {
    const i = BUCKETS.findIndex(b => b.key === k);
    return BUCKETS_TOP + i * (BUCKET_H + BUCKET_GAP);
  };
  // Track which item is the n-th to land in its bucket (for stacking)
  function destXY(item: Item, idx: number) {
    // count earlier items going to the same bucket
    const order = ITEMS.slice(0, idx).filter(it => it.bucket === item.bucket).length;
    // Bucket label takes ~320px at x=84 (bucket left 56 + padding 28). After
    // a 24px gap, item area starts at x≈428. Stack items with a real gap.
    const itemAreaStart = 428;
    const itemGap = 24;
    const itemX = itemAreaStart + order * (ITEM_W + itemGap);
    const bY = bucketY(item.bucket);
    return { x: itemX, y: bY + (BUCKET_H - ITEM_H) / 2 };
  }

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily: fontBody, color: theme.fg }}>
      <AudioTrack category="pbq" />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(125,211,252,0.10) 0%, rgba(2,6,23,0) 60%)" }} />

      {/* Title */}
      <div style={{
        position: "absolute", top: 60, left: 0, right: 0, textAlign: "center",
        opacity: titleOpacity * titleOut, transform: `translateY(${titleY}px)`,
        padding: "0 56px",
      }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: theme.accent, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Security+ PBQ
        </div>
        <div style={{ fontSize: 60, fontWeight: 800, marginTop: 10, fontFamily: fontHeading, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Match each control to the CIA principle it protects
        </div>
      </div>

      {/* Buckets */}
      <div style={{ opacity: bucketsOpacity, position: "absolute", left: 56, right: 56, top: BUCKETS_TOP }}>
        {BUCKETS.map((b, i) => (
          <div key={b.key} style={{
            height: BUCKET_H,
            marginBottom: i < BUCKETS.length - 1 ? BUCKET_GAP : 0,
            backgroundColor: theme.bgElev,
            border: `2px solid ${b.color}`,
            borderRadius: 20,
            padding: "24px 28px",
            display: "flex",
            alignItems: "center",
            gap: 24,
            position: "relative",
            boxShadow: `0 12px 32px ${b.color}22`,
          }}>
            <div style={{ width: 340, flexShrink: 0 }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: b.color, fontFamily: fontHeading, letterSpacing: "-0.01em" }}>{b.title}</div>
              <div style={{ fontSize: 24, color: theme.fgDim, marginTop: 6 }}>{b.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Items — start in tray, animate to buckets one by one */}
      {ITEMS.map((item, idx) => {
        const start = trayPos[idx];
        const dest = destXY(item, idx);
        // Item appears in tray at F_ITEMS_IN + staggered
        const appearAt = F_ITEMS_IN + idx * 12;
        const appearP = spring({ frame: frame - appearAt, fps, config: { damping: 20, stiffness: 110 } });
        const appearOp = interpolate(appearP, [0, 1], [0, 1]);

        // Drag animation: this item is dragged at F_DRAG_START + idx*F_DRAG_STEP
        const dragAt = F_DRAG_START + idx * F_DRAG_STEP;
        const dragP = spring({ frame: frame - dragAt, fps, config: { damping: 24, stiffness: 70, mass: 0.9 } });
        const x = interpolate(dragP, [0, 1], [start.x, dest.x]);
        const y = interpolate(dragP, [0, 1], [start.y, dest.y]);
        const scale = interpolate(dragP, [0, 0.5, 1], [1, 1.04, 1]);
        const landed = frame >= dragAt + 30; // ~1s into the drag

        // Item color = its bucket's color once landed
        const itemBucket = BUCKETS.find(b => b.key === item.bucket)!;
        const borderColor = landed ? itemBucket.color : theme.border;

        return (
          <div key={item.id} style={{
            position: "absolute",
            left: x, top: y,
            width: ITEM_W, height: ITEM_H,
            backgroundColor: theme.bgElev2,
            border: `2px solid ${borderColor}`,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 16px",
            textAlign: "center",
            fontSize: 22,
            fontWeight: 600,
            lineHeight: 1.25,
            opacity: appearOp,
            transform: `scale(${scale})`,
            boxShadow: landed ? `0 8px 24px ${itemBucket.color}33` : "0 4px 12px rgba(0,0,0,0.4)",
            color: theme.fg,
          }}>
            {item.label}
          </div>
        );
      })}

      {/* Final ✓ marks per bucket */}
      {frame >= F_CHECK_IN && BUCKETS.map(b => {
        const checkP = spring({ frame: frame - F_CHECK_IN, fps, config: { damping: 16, stiffness: 130 } });
        const bY = bucketY(b.key);
        return (
          <div key={b.key + "-check"} style={{
            position: "absolute",
            top: bY + (BUCKET_H - 60) / 2,
            right: 80,
            width: 60, height: 60,
            borderRadius: 30,
            background: b.color,
            color: theme.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 40, fontWeight: 800,
            transform: `scale(${checkP})`,
            opacity: checkP,
            boxShadow: `0 0 24px ${b.color}88`,
          }}>✓</div>
        );
      })}

      {/* Lens explanation panel */}
      {frame >= F_LENS_IN && (
        <div style={{
          position: "absolute",
          left: 56, right: 56,
          bottom: 220,
          opacity: lensOpacity,
          transform: `translateY(${lensY}px)`,
          backgroundColor: theme.bgElev,
          border: `1px solid ${theme.border}`,
          borderLeft: `4px solid ${theme.accent}`,
          borderRadius: 18,
          padding: "26px 30px",
        }}>
          <div style={{
            fontSize: 28, fontWeight: 700, color: theme.accent,
            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10,
          }}>Exam Lens</div>
          <div style={{ fontSize: 36, fontWeight: 600, lineHeight: 1.35, fontFamily: fontHeading }}>
            On every Security+ scenario, ask: <span style={{ color: theme.accent }}>which CIA principle is this control protecting?</span>{" "}
            That's how the exam thinks — not by tool, by principle.
          </div>
        </div>
      )}

      {/* Footer logo — AbsoluteFill is flex-direction:column, so the cross
          axis is HORIZONTAL (alignItems centers L/R) and the main axis is
          VERTICAL (justifyContent flex-end pushes to the bottom). */}
      <AbsoluteFill style={{
        opacity: footerOpacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 80,
      }}>
        <div style={{
          backgroundColor: theme.bg,
          border: `1px solid ${theme.border}`,
          borderRadius: 100,
          padding: "20px 40px",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: 36, fontWeight: 800, color: theme.fg,
            letterSpacing: "0.02em", fontFamily: fontHeading,
          }}>CipherExam</div>
          <div style={{ fontSize: 24, color: theme.accent, marginTop: 6 }}>
            7-day free trial · cipherexam.com
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

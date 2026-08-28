import React from "react";
import { AbsoluteFill } from "remotion";
import {
  CTA_LINE,
  CTA_SUB,
  type CardOption,
  type DiffRow,
  type PostCardProps,
} from "../data/postCard";

/**
 * PostCard — 1080×1350 still for LinkedIn feed posts. Four approved looks.
 * See ../data/postCard.ts for the look-selection rule.
 *
 * Deliberately flat: no radial glow, no gradient fills, no rounded pills.
 * That glow-on-dark treatment is what every AI-built cert-prep card looks like.
 */

const INDIGO = "#4338ca";
const BRAND_INDIGO = "#4f46e5";

const lines = (s: string) =>
  s.split("\n").map((line, i, all) => (
    <React.Fragment key={i}>
      {line}
      {i < all.length - 1 ? <br /> : null}
    </React.Fragment>
  ));

const Mark: React.FC<{ size: number; ring: string; chevron: string }> = ({ size, ring, chevron }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path d="M 32 8 A 24 24 0 1 0 32 56" stroke={ring} strokeWidth={7} strokeLinecap="round" />
    <path d="M 40 22 L 50 32 L 40 42" stroke={chevron} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** The one action on every card. Same shape across looks, recoloured per look. */
const CtaBar: React.FC<{
  bg: string;
  fg: string;
  subFg: string;
  chevron: string;
  font: string;
  subFont: string;
  padding: string;
  line: string;
  sub: string;
}> = ({ bg, fg, subFg, chevron, font, subFont, padding, line, sub }) => (
  <div
    style={{
      background: bg,
      color: fg,
      padding,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 24,
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      <div style={{ fontFamily: font, fontWeight: 700, fontSize: 42, letterSpacing: "-0.02em" }}>{line}</div>
      <div style={{ fontFamily: subFont, fontWeight: 600, fontSize: 22, color: subFg }}>{sub}</div>
    </div>
    <Mark size={48} ring={fg} chevron={chevron} />
  </div>
);

// ---------------------------------------------------------------- A · Ledger

const Ledger: React.FC<PostCardProps> = (p) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      background: "#f2eee5",
      color: "#17140f",
      fontFamily: "'Newsreader', Georgia, serif",
      padding: "72px 76px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontWeight: 700,
            fontSize: 21,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: INDIGO,
          }}
        >
          {p.eyebrow}
        </div>
        <div
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontWeight: 600,
            fontSize: 19,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#6b6255",
          }}
        >
          {p.meta}
        </div>
      </div>
      <div style={{ height: 3, background: "#17140f" }} />
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>
      <div
        style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: 108,
          lineHeight: 0.94,
          letterSpacing: "-0.015em",
        }}
      >
        {lines(p.headline)}
      </div>

      {p.statWas && p.statNow ? (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontSize: 17,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#6b6255",
              }}
            >
              Was
            </div>
            <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 92, lineHeight: 1, color: "#6b6255" }}>
              {p.statWas}
            </div>
          </div>
          <div style={{ width: 92, height: 3, background: INDIGO, marginBottom: 42 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontSize: 17,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: INDIGO,
              }}
            >
              Now
            </div>
            <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 138, lineHeight: 1, color: INDIGO }}>
              {p.statNow}
            </div>
          </div>
          {p.statLabel ? (
            <div style={{ fontSize: 34, lineHeight: 1.35, color: "#40392e", maxWidth: 330, marginBottom: 26 }}>{p.statLabel}</div>
          ) : null}
        </div>
      ) : null}

      {p.support ? <div style={{ fontSize: 40, lineHeight: 1.38, maxWidth: 830 }}>{p.support}</div> : null}
    </div>

    <div>
      <div style={{ height: 1, background: "#cbc2b1" }} />
      <div style={{ marginTop: 34 }}>
        <CtaBar
          bg="#17140f"
          fg="#f2eee5"
          subFg="#b9b0a0"
          chevron="#a5b4fc"
          font="'Archivo', sans-serif"
          subFont="'Archivo', sans-serif"
          padding="34px 38px"
          line={p.ctaLine ?? CTA_LINE}
          sub={p.ctaSub ?? CTA_SUB}
        />
      </div>
    </div>
  </div>
);

// ----------------------------------------------------------- B · Answer Sheet

const Bubble: React.FC<{ filled: boolean }> = ({ filled }) => (
  <div
    style={{
      width: 54,
      height: 54,
      borderRadius: "50%",
      border: "4px solid " + (filled ? INDIGO : "#a8b0bc"),
      background: filled ? INDIGO : "transparent",
      flex: "none",
    }}
  />
);

/**
 * A gated post promises the answer in the first comment. The card must not
 * give it away — filling the right bubble kills the reason to comment and
 * makes the copy read as a lie. `gated: true` keeps correctIndex/why in the
 * data for the reveal card, and hides them here.
 */
const GatedNote: React.FC<{ font: string; color: string; accent: string }> = ({ font, color, accent }) => (
  <div style={{ borderLeft: "5px solid " + accent, paddingLeft: 30, display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ fontFamily: font, fontSize: 19, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
      Your call
    </div>
    {/* Names Exam Lens on the PROMISE, because the demonstration itself lands
        a post later in the reveal comment. 8 of 10 drafts are gated, so the
        ungated 'Exam Lens · why B' label would almost never render — putting
        the term only there would have kept it invisible. Here it says what is
        coming, and the reveal delivers it. */}
    <div style={{ fontSize: 36, lineHeight: 1.4, maxWidth: 830, color }}>
      Answer and the full Exam Lens breakdown in the first comment.
    </div>
  </div>
);

const AnswerSheet: React.FC<PostCardProps> = (p) => {
  const options: CardOption[] = p.options ?? [];
  const correct = p.gated ? -1 : p.correctIndex ?? -1;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        background: "#fbfaf6",
        color: "#14161a",
        fontFamily: "'IBM Plex Sans', sans-serif",
        padding: "64px 68px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(20,22,26,0.05) 0px, rgba(20,22,26,0.05) 1px, transparent 1px, transparent 54px)",
      }}
    >
      {/* Registration marks — the corner squares a real scan form carries. */}
      <div style={{ position: "absolute", top: 28, left: 28, width: 30, height: 30, background: "#14161a" }} />
      <div style={{ position: "absolute", top: 28, right: 28, width: 30, height: 30, background: "#14161a" }} />
      <div style={{ position: "absolute", bottom: 28, left: 28, width: 30, height: 30, background: "#14161a" }} />
      <div style={{ position: "absolute", bottom: 28, right: 28, width: 30, height: 30, background: "#14161a" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 20,
            letterSpacing: "0.1em",
            color: "#5c6470",
          }}
        >
          <div>{p.eyebrow}</div>
          <div>{p.meta}</div>
        </div>
        <div style={{ height: 4, background: "#14161a" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 52 }}>
        <div style={{ fontWeight: 700, fontSize: 84, lineHeight: 1.04, letterSpacing: "-0.028em" }}>{lines(p.headline)}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {options.map((o, i) => (
            <div key={o.letter} style={{ display: "flex", alignItems: "center", gap: 26 }}>
              <Bubble filled={i === correct} />
              <div
                style={{
                  display: "flex",
                  gap: 22,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: i === correct ? 600 : 400,
                  fontSize: 34,
                  color: i === correct ? "#14161a" : "#5c6470",
                }}
              >
                {/* Letter is its own column so a wrapped option indents under
                    the text, not under the letter. */}
                <div style={{ flex: "none" }}>{o.letter}</div>
                <div>{o.text}</div>
              </div>
            </div>
          ))}
        </div>

        {p.gated ? (
          <GatedNote font="'IBM Plex Mono', monospace" color="#14161a" accent={INDIGO} />
        ) : p.why ? (
          <div style={{ borderLeft: "5px solid " + INDIGO, paddingLeft: 30, display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 19,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: INDIGO,
              }}
            >
              {/* Exam Lens is the locked umbrella brand term (2026-05-11) and it
                  had gone missing: 1 of 35 LinkedIn posts named it. Naming it on
                  THIS block attaches it to the demonstration — the reader has
                  just seen the reasoning that makes one answer best, and this
                  says what that is called. A benefit nobody can name is one
                  nobody asks for. */}
              Exam Lens · why {options[correct]?.letter ?? ""}
            </div>
            <div style={{ fontSize: 36, lineHeight: 1.4, maxWidth: 830 }}>{p.why}</div>
          </div>
        ) : null}
      </div>

      <CtaBar
        bg={INDIGO}
        fg="#ffffff"
        subFg="#c7c9f5"
        chevron="#c7c9f5"
        font="'IBM Plex Sans', sans-serif"
        subFont="'IBM Plex Mono', monospace"
        padding="34px 38px"
        line={p.ctaLine ?? CTA_LINE}
        sub={p.ctaSub ?? CTA_SUB}
      />
    </div>
  );
};

// ------------------------------------------------------------------ C · Diff

const DIFF_STYLES: Record<DiffRow["kind"], { bg: string; sign: string; signColor: string; color: string }> = {
  minus: { bg: "#2d1416", sign: "-", signColor: "#f85149", color: "#ffa198" },
  plus: { bg: "#0f2f1a", sign: "+", signColor: "#3fb950", color: "#7ee787" },
  context: { bg: "transparent", sign: "+", signColor: "#484f58", color: "#8b949e" },
};

const Diff: React.FC<PostCardProps> = (p) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      background: "#0d1117",
      color: "#e6edf3",
      fontFamily: "'JetBrains Mono', monospace",
      padding: "64px 0 0 0",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
      <div
        style={{
          padding: "0 68px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 20,
          letterSpacing: "0.1em",
          color: "#7d8590",
        }}
      >
        <div>{p.eyebrow}</div>
        <div>{p.meta}</div>
      </div>

      <div style={{ padding: "0 68px", fontWeight: 700, fontSize: 76, lineHeight: 1.08, letterSpacing: "-0.035em" }}>
        {lines(p.headline)}
      </div>

      {p.diffRows && p.diffRows.length ? (
        <div style={{ borderTop: "1px solid #21262d", borderBottom: "1px solid #21262d", background: "#010409" }}>
          {p.diffRows.map((row, i) => {
            const s = DIFF_STYLES[row.kind];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, padding: "20px 68px", background: s.bg }}>
                <div style={{ width: 26, color: s.signColor, fontSize: 34, flex: "none" }}>{s.sign}</div>
                <div style={{ fontSize: 32, color: s.color }}>{row.text}</div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div style={{ padding: "0 68px", display: "flex", flexDirection: "column", gap: 14, fontSize: 32, lineHeight: 1.45, color: "#8b949e" }}>
        {(p.comments ?? []).map((c, i) => (
          <div key={i}>
            <span style={{ color: "#6e7681" }}># </span>
            {c}
          </div>
        ))}
      </div>
    </div>

    <CtaBar
      bg={BRAND_INDIGO}
      fg="#ffffff"
      subFg="#c7d2fe"
      chevron="#c7d2fe"
      font="'JetBrains Mono', monospace"
      subFont="'JetBrains Mono', monospace"
      padding="40px 68px"
      line={p.ctaLine ?? CTA_LINE}
      sub={p.ctaSub ?? CTA_SUB}
    />
  </div>
);

// ------------------------------------------------------------- D · Marked Up

const CIRCLE =
  "M 26 58 C 22 22, 120 10, 268 12 C 428 14, 516 26, 508 58 C 500 90, 380 102, 240 100 C 96 98, 30 92, 26 58 Z";

const MarkedUp: React.FC<PostCardProps> = (p) => {
  const options: CardOption[] = p.options ?? [];
  // Gated: no red circle, no margin notes — the pen marks would hand over the
  // answer the post is holding back. See GatedNote above.
  const correct = p.gated ? -1 : p.correctIndex ?? -1;
  const notes = p.gated ? ["Your call. Answer and the full Exam Lens breakdown in the first comment."] : p.marginNotes ?? [];
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        background: "#fdfbf6",
        color: "#1b1917",
        fontFamily: "'Newsreader', Georgia, serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", padding: "62px 62px 0 62px", display: "flex", flexDirection: "column", gap: 40 }}>
        {/* Margin rule belongs to the question block only — it must not run
            through the closing line or the CTA bar. */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 578, width: 1, background: "#e7e0d3" }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "'Archivo', sans-serif",
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          <div style={{ color: "#8a7f6c" }}>{p.eyebrow}</div>
          <div style={{ color: "#b91c1c" }}>{p.meta}</div>
        </div>

        <div style={{ display: "flex", gap: 44 }}>
          <div style={{ width: 496, display: "flex", flexDirection: "column", gap: 30 }}>
            <div style={{ fontSize: 37, lineHeight: 1.42 }}>{p.headline.replace(/\n/g, " ")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, fontSize: 33, lineHeight: 1.36, color: "#4a453d" }}>
              {options.map((o, i) =>
                i === correct ? (
                  <div key={o.letter} style={{ position: "relative", color: "#1b1917" }}>
                    <span style={{ position: "relative", zIndex: 1 }}>
                      {o.letter}.&nbsp;&nbsp;{o.text}
                    </span>
                    {/* Stretches to the option box, so the circle still wraps
                        the answer when the text runs to two or three lines. */}
                    <div style={{ position: "absolute", left: -22, right: -22, top: -20, bottom: -20, zIndex: 0 }}>
                      <svg viewBox="0 0 534 112" fill="none" preserveAspectRatio="none" width="100%" height="100%">
                        <path d={CIRCLE} stroke="#b91c1c" strokeWidth={4} fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div key={o.letter}>
                    {o.letter}.&nbsp;&nbsp;{o.text}
                  </div>
                )
              )}
            </div>
          </div>

          <div style={{ width: 356, display: "flex", flexDirection: "column", gap: 26, paddingTop: 96 }}>
            {notes.map((note, i) => (
              <React.Fragment key={i}>
                {i > 0 ? <div style={{ height: 2, width: 84, background: "#e2b9b9" }} /> : null}
                <div style={{ fontStyle: "italic", fontSize: 31, lineHeight: 1.4, color: "#b91c1c" }}>{note}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {p.support ? (
        <div style={{ padding: "0 62px", marginTop: 56 }}>
          <div
            style={{
              borderTop: "2px solid #1b1917",
              paddingTop: 30,
              fontFamily: "'Archivo', sans-serif",
              fontWeight: 600,
              fontSize: 30,
              lineHeight: 1.4,
              color: "#4a453d",
              maxWidth: 880,
            }}
          >
            {p.support}
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: "auto" }} />
      <CtaBar
        bg="#1b1917"
        fg="#fdfbf6"
        subFg="#b3aa99"
        chevron="#a5b4fc"
        font="'Archivo', sans-serif"
        subFont="'Archivo', sans-serif"
        padding="38px 62px"
        line={p.ctaLine ?? CTA_LINE}
        sub={p.ctaSub ?? CTA_SUB}
      />
    </div>
  );
};

// ------------------------------------------------------------------- switch

export const PostCard: React.FC<PostCardProps> = (props) => {
  const Look =
    props.look === "ledger"
      ? Ledger
      : props.look === "diff"
      ? Diff
      : props.look === "markedUp"
      ? MarkedUp
      : AnswerSheet;
  return (
    <AbsoluteFill>
      <Look {...props} />
    </AbsoluteFill>
  );
};

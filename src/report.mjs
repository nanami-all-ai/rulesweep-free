// 監査結果を人間向けテキスト / Markdown に整形する。
//
// renderConsole / renderMarkdown は有料版専用。そのメッセージは src/i18n-paid.mjs にあり、
// 呼び出し側（bin/rulesweep.mjs）が先に読み込んでおく（無料版には同梱しないため）。

import { t } from "./i18n.mjs";

function bar(value, max, width = 24) {
  if (max <= 0) return " ".repeat(width);
  const n = Math.max(1, Math.round((value / max) * width));
  return "█".repeat(Math.min(width, n)) + " ".repeat(Math.max(0, width - n));
}

function fmt(n) {
  return n.toLocaleString("en-US");
}

/**
 * コンソール向けの短いサマリ。
 */
export function renderConsole(audit) {
  const lines = [];
  lines.push("");
  lines.push(t("auditTitle"));
  lines.push("  " + "─".repeat(50));
  lines.push(t("alwaysOn", { tok: fmt(audit.alwaysOnTokens) }));
  if (audit.reloadFactor > 1) {
    lines.push(t("perTurn", { tok: fmt(audit.perTurnCost), factor: audit.reloadFactor }));
  }
  lines.push("");

  const maxTok = Math.max(...audit.perFile.map((f) => f.tokens), 1);
  lines.push(t("byFile"));
  for (const f of audit.perFile.sort((a, b) => b.tokens - a.tokens)) {
    lines.push(
      `    ${bar(f.tokens, maxTok)}  ${String(fmt(f.tokens)).padStart(6)} tok  ${f.rel}`
    );
  }
  lines.push("");

  lines.push(t("paidDup", { n: audit.duplicates.length, tok: fmt(audit.dupWasteTokens) }));
  lines.push(
    t("contradictions", { n: audit.contradictions.length }) +
      (audit.contradictions.truncated ? t("truncated") : "")
  );
  lines.push(
    t("brokenRefs", { n: audit.brokenRefs.length }) +
      (audit.brokenRefs.advisory && audit.brokenRefs.advisory.length
        ? t("advisory", { n: audit.brokenRefs.advisory.length })
        : "")
  );
  lines.push(t("movableLine", { n: audit.movable.length, tok: fmt(audit.movableTokens) }));
  lines.push("");
  lines.push(
    t("projected", {
      tok: fmt(audit.projectedAfter),
      remain: pct(audit.projectedAfter, audit.alwaysOnTokens),
      saved: pct(audit.alwaysOnTokens - audit.projectedAfter, audit.alwaysOnTokens),
    })
  );

  if (audit.brokenRefs.length) {
    lines.push("");
    lines.push(t("brokenTop10"));
    for (const r of audit.brokenRefs.slice(0, 10)) {
      lines.push(`    - ${r.file}:${r.line}  →  ${r.ref}`);
    }
  }

  lines.push("");
  lines.push(t("nextSort"));
  lines.push("");
  return lines.join("\n");
}

/**
 * 無料版（summaryOnly の audit）向けのコンソール出力。
 * 2026-08-31（🔴要決断#1・案B）: ファイル別/合計トークンと各検出の「件数」のみを
 * 見せる。退避候補（movable）関連の数値・詳細は audit.mjs 側でそもそも計算されて
 * いないため、ここでも参照しない。
 */
export function renderConsoleFree(audit) {
  const lines = [];
  lines.push("");
  lines.push(t("freeTitle"));
  lines.push("  " + "─".repeat(50));
  lines.push(t("alwaysOn", { tok: fmt(audit.alwaysOnTokens) }));
  if (audit.reloadFactor > 1) {
    lines.push(t("perTurn", { tok: fmt(audit.perTurnCost), factor: audit.reloadFactor }));
  }
  lines.push("");

  const maxTok = Math.max(...audit.perFile.map((f) => f.tokens), 1);
  lines.push(t("byFile"));
  for (const f of audit.perFile.slice().sort((a, b) => b.tokens - a.tokens)) {
    lines.push(
      `    ${bar(f.tokens, maxTok)}  ${String(fmt(f.tokens)).padStart(6)} tok  ${f.rel}`
    );
  }
  lines.push("");

  lines.push(t("freeDup", { n: fmt(audit.duplicateCount) }));
  lines.push(
    t("contradictions", { n: fmt(audit.contradictionCount) }) +
      (audit.contradictionsTruncated ? t("truncated") : "")
  );
  lines.push(
    t("brokenRefs", { n: fmt(audit.brokenRefCount) }) +
      (audit.brokenRefAdvisoryCount ? t("advisory", { n: fmt(audit.brokenRefAdvisoryCount) }) : "")
  );
  lines.push("");
  lines.push(t("freeUpsell1"));
  lines.push(t("freeUpsell2"));
  lines.push(t("freeUpsell3"));
  lines.push("");
  return lines.join("\n");
}

function pct(part, whole) {
  if (whole <= 0) return "0%";
  return Math.round((part / whole) * 100) + "%";
}

/**
 * 詳細な Markdown レポート（ファイルに保存する用）。
 */
export function renderMarkdown(audit) {
  const md = [];
  md.push(t("mdTitle"));
  md.push("");
  md.push(t("mdRoot", { root: audit.root }));
  md.push(t("mdGenerated", { at: new Date().toISOString() }));
  md.push(t("mdAlwaysOn", { tok: fmt(audit.alwaysOnTokens) }));
  if (audit.reloadFactor > 1) {
    md.push(t("mdPerTurn", { tok: fmt(audit.perTurnCost), factor: audit.reloadFactor }));
  }
  md.push(
    t("mdProjected", {
      tok: fmt(audit.projectedAfter),
      saved: pct(audit.alwaysOnTokens - audit.projectedAfter, audit.alwaysOnTokens),
    })
  );
  md.push("");
  md.push(t("mdHeuristic"));
  md.push("");

  md.push(t("mdByFile"));
  md.push("");
  md.push(t("mdFileHeader"));
  md.push("|---|---|---:|---:|");
  for (const f of audit.perFile.sort((a, b) => b.tokens - a.tokens)) {
    md.push(`| \`${f.rel}\` | ${f.kind} | ${f.lines} | ${fmt(f.tokens)} |`);
  }
  md.push("");

  md.push(t("mdMovable"));
  md.push("");
  if (!audit.movable.length) {
    md.push(t("none"));
  } else {
    md.push(t("mdMovableHeader"));
    md.push("|---|---|---|---:|---|---|");
    for (const m of audit.movable) {
      md.push(
        `| \`${m.file}\` | ${escapePipe(m.heading)} | ${m.startLine}–${m.endLine} | ${fmt(
          m.tokens
        )} | **${m.verdict}** | ${escapePipe(m.reasons.join(" / "))} |`
      );
    }
  }
  md.push("");

  md.push(t("mdDup"));
  md.push("");
  if (!audit.duplicates.length) {
    md.push(t("none"));
  } else {
    for (const d of audit.duplicates.slice(0, 40)) {
      md.push(`- \`${escapePipe(d.occurrences[0].text.slice(0, 100))}\``);
      for (const o of d.occurrences) md.push(`  - ${o.file}:${o.line}`);
    }
  }
  md.push("");

  md.push(t("mdContra"));
  md.push("");
  if (!audit.contradictions.length) {
    md.push(t("none"));
  } else {
    for (const c of audit.contradictions) {
      md.push(t("mdOverlap", { ratio: c.overlapRatio }));
      md.push(`  - ${c.a.file}:${c.a.line} — ${escapePipe(c.a.text.slice(0, 120))}`);
      md.push(`  - ${c.b.file}:${c.b.line} — ${escapePipe(c.b.text.slice(0, 120))}`);
    }
  }
  md.push("");

  md.push(t("mdBroken"));
  md.push("");
  if (!audit.brokenRefs.length) {
    md.push(t("none"));
  } else {
    md.push(t("mdBrokenHeader"));
    md.push("|---|---|---|");
    for (const r of audit.brokenRefs) {
      md.push(`| ${r.file}:${r.line} | \`${escapePipe(r.ref)}\` | ${escapePipe(r.snippet)} |`);
    }
  }
  md.push("");
  return md.join("\n");
}

function escapePipe(s) {
  return String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

export { fmt, pct };

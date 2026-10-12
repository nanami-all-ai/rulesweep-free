// 出力メッセージの多言語化（ja / en）。依存なし。
//
// 言語の決定順: --lang（setLang） > RULESWEEP_LANG > LC_ALL / LC_MESSAGES / LANG
// （POSIXの優先順で最初に値があるもの）が "ja" で始まれば ja > それ以外は en。
// 判定は t() 呼び出しのたびに行う（テストや子プロセスで環境変数を後から変えても効くように）。
//
// このファイルは無料版にも同梱されるため、共通・無料版のメッセージだけを置く。
// 有料版専用のメッセージは src/i18n-paid.mjs が register() で追加する（無料版には含めない）。

const catalogs = { ja: {}, en: {} };
let forced = null;

/** "ja_JP.UTF-8" → "ja"、"en-US" → "en"。それ以外は null。 */
export function normalizeLang(v) {
  const s = String(v || "").toLowerCase();
  if (s.startsWith("ja")) return "ja";
  if (s.startsWith("en")) return "en";
  return null;
}

/** --lang の値で言語を固定する。未対応の値なら null を返す（null を渡すと固定解除）。 */
export function setLang(v) {
  forced = normalizeLang(v);
  return forced;
}

export function getLang(env = process.env) {
  if (forced) return forced;
  const explicit = normalizeLang(env.RULESWEEP_LANG);
  if (explicit) return explicit;
  const locale = env.LC_ALL || env.LC_MESSAGES || env.LANG || "";
  return locale.toLowerCase().startsWith("ja") ? "ja" : "en";
}

export function register(ja, en) {
  Object.assign(catalogs.ja, ja);
  Object.assign(catalogs.en, en);
}

export function t(key, vars = {}) {
  const msg = catalogs[getLang()][key] ?? catalogs.ja[key] ?? key;
  return typeof msg === "function" ? msg(vars) : msg;
}

const PAID_URL = "https://nanamiallai.gumroad.com/l/rulesweep";

register(
  {
    // --- 共通 ---
    rootNotFound: (v) => `ルートが見つかりません: ${v.root}`,
    noInstructionFiles: "CLAUDE.md / .claude/rules/*.md が見つかりませんでした。--root を確認してください。",
    badLang: (v) => `未対応の --lang: ${v.lang}（en または ja）`,
    preamble: "(前文)",
    wikilinkAdvisory: "wikilink の解決先が見つからない（別 vault の可能性・要目視）",
    // --- 無料版 ---
    freeHelp: `rulesweep（無料版）— CLAUDE.md 継続スリム化キット・診断のみ

使い方:
  rulesweep-free audit [--root .] [--global] [--reload-factor N] [--json]

出力: ファイル別/合計トークン推定・重複行の件数・壊れた参照の件数・矛盾候補の件数。
どのセクションを skill/subagent に退避すべきか・具体的な直し方・修正後の削減幅の
記録・振り分けワークシート・スタブ生成・BYOKリライトは有料版でご利用いただけます。
有料版: ${PAID_URL}
`,
    freeUnknownCmd: (v) => `未知のサブコマンド: ${v.cmd}（無料版は audit のみ対応）\n`,
    freeTitle: "  rulesweep（無料版）— 監査結果",
    alwaysOn: (v) => `  常時ロードされる指示: 約 ${v.tok} tok`,
    perTurn: (v) => `  サブエージェント込みの毎ターン概算: 約 ${v.tok} tok（×${v.factor}）`,
    byFile: "  ファイル別:",
    freeDup: (v) => `  重複行: ${v.n} 種`,
    contradictions: (v) => `  矛盾の疑い: ${v.n} 件`,
    truncated: "（命令行が多く一部のみ比較）",
    brokenRefs: (v) => `  壊れた参照: ${v.n} 件`,
    advisory: (v) => ` ＋ 要目視 ${v.n} 件（wikilink 等）`,
    freeUpsell1: "  どのセクションを skill/subagent に退避すべきか・具体的な直し方・",
    freeUpsell2: "  修正後の削減幅の記録は有料版（sort / stub / rewrite / remeasure）で。",
    freeUpsell3: `  有料版: ${PAID_URL}`,
  },
  {
    rootNotFound: (v) => `Root not found: ${v.root}`,
    noInstructionFiles: "No CLAUDE.md or .claude/rules/*.md found. Check --root.",
    badLang: (v) => `Unsupported --lang: ${v.lang} (use en or ja)`,
    preamble: "(preamble)",
    wikilinkAdvisory: "wikilink target not found (may live in another vault; check by eye)",
    freeHelp: `rulesweep (free edition) — measure what your CLAUDE.md costs per turn

Usage:
  rulesweep audit [--root .] [--global] [--reload-factor N] [--json] [--lang en|ja]

Options:
  --root DIR          project root (default: current directory)
  --global            also include ~/.claude/CLAUDE.md
  --reload-factor N   multiply the per-turn cost by N to approximate subagent reloads
  --json              machine-readable output
  --lang en|ja        output language (default: RULESWEEP_LANG, then your locale)

Output: estimated tokens per file and in total, plus counts of duplicate lines,
broken references and possible contradictions.
Which sections to move into skills/subagents, how to fix them, before/after
tracking, the sorting worksheet, stub generation and the BYOK rewrite are in
the paid edition: ${PAID_URL}
`,
    freeUnknownCmd: (v) => `Unknown subcommand: ${v.cmd} (the free edition only supports audit)\n`,
    freeTitle: "  rulesweep (free) — audit",
    alwaysOn: (v) => `  Always-loaded instructions: ~${v.tok} tok`,
    perTurn: (v) => `  Per-turn estimate incl. subagents: ~${v.tok} tok (×${v.factor})`,
    byFile: "  By file:",
    freeDup: (v) => `  Duplicate lines: ${v.n} distinct`,
    contradictions: (v) => `  Possible contradictions: ${v.n}`,
    truncated: " (too many imperative lines; only part compared)",
    brokenRefs: (v) => `  Broken references: ${v.n}`,
    advisory: (v) => ` + ${v.n} to check by eye (wikilinks etc.)`,
    freeUpsell1: "  Which sections to move into skills/subagents, how to fix them, and",
    freeUpsell2: "  tracking the savings are in the paid edition (sort / stub / rewrite / remeasure).",
    freeUpsell3: `  Paid edition: ${PAID_URL}`,
  }
);

#!/usr/bin/env node
// rulesweep（無料版）専用エントリーポイント。
//
// 2026-08-31（🔴要決断#1・案B・adversarial-reviewer指摘対応）:
// `bin/rulesweep.mjs --free` という「同じ配布物にオプトインのフラグを足す」だけの
// 実装は、利用者がフラグを外して `audit --json` や `sort` を叩けば分類ロジック
// （`src/audit.mjs`のclassifySection＝商品の核心IP）がそのまま出てしまい、
// 実質的な保護になっていないと指摘された。これはフラグの問題ではなく配布物の
// 問題のため、無料版として実際に配布するのは常にこのファイル一本にする。
//
// 無料版リポジトリに含めるべきファイル（これ以外は含めないこと）:
//   bin/rulesweep-free.mjs（このファイル）
//   src/discover.mjs / src/tokens.mjs / src/audit.mjs / src/sections.mjs / src/report.mjs
//   src/i18n.mjs（共通・無料版のメッセージのみ。2026-09-24 多言語化で追加）
// 含めてはいけないファイル（有料版のみ）:
//   src/sort.mjs / src/stub.mjs / src/rewrite.mjs / src/baseline.mjs / src/classify.mjs
//   src/i18n-paid.mjs（有料版専用メッセージ）
//   bin/rulesweep.mjs（sort/stub/rewrite/remeasureへの導線を持つため）
//
// 2026-08-31（バックログ#3.7対応・完了）: classifySection()（有料版の判定ロジック
// ＝核心IP）は`src/classify.mjs`へ分離済み。audit.mjsは非summaryOnly時のみ
// 動的importするため、上記の通りclassify.mjsを同梱しなければ物理的にソースが
// 含まれない。audit.mjs自体は含めてよく（含めないと discover/report 等が壊れる）、
// 除去版を別途生成する必要はない——このファイル単体で完結する（配布は
// `launch/build-free-repo.sh`のホワイトリスト方式を使うこと。手動で組む場合も
// 上記2つの一覧を厳守する）。

import { existsSync } from "node:fs";
import path from "node:path";
const { resolve } = path;

import { discover } from "../src/discover.mjs";
import { runAudit } from "../src/audit.mjs";
import { renderConsoleFree } from "../src/report.mjs";
import { t, setLang } from "../src/i18n.mjs";

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--root") args.root = argv[++i];
    else if (a === "--global") args.global = true;
    else if (a === "--json") args.json = true;
    else if (a === "--reload-factor") args.reloadFactor = Number(argv[++i]);
    else if (a === "--lang") args.lang = argv[++i] ?? "";
    else if (a === "-h" || a === "--help") args.help = true;
    else args._.push(a);
  }
  return args;
}


async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];
  if (args.lang !== undefined && !setLang(args.lang)) {
    console.error(t("badLang", { lang: args.lang }));
    process.exit(2);
  }
  if (args.help || !cmd) {
    console.log(t("freeHelp"));
    process.exit(cmd ? 0 : 1);
  }
  if (cmd !== "audit") {
    console.error(t("freeUnknownCmd", { cmd }));
    console.log(t("freeHelp"));
    process.exit(1);
  }
  const root = resolve(args.root || process.cwd());
  if (!existsSync(root)) {
    console.error(t("rootNotFound", { root }));
    process.exit(2);
  }
  const disc = discover(root, { global: args.global });
  if (!disc.instructionFiles.length && !disc.ruleFiles.length) {
    console.error(t("noInstructionFiles"));
    process.exit(3);
  }
  const audit = await runAudit(disc, {
    subagentReloadFactor: args.reloadFactor || 1,
    summaryOnly: true, // 常に無料モード。CLIフラグで解除する経路を持たない
  });
  console.log(args.json ? JSON.stringify(audit, null, 2) : renderConsoleFree(audit));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

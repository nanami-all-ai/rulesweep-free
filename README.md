# rulesweep (free) — How much is your CLAUDE.md costing you per turn?

[English](#english) | [日本語](#日本語)

## English

`CLAUDE.md` and `.claude/rules/` aren't code. Claude Code reloads them on **every turn and every subagent spawn**, so they are a fixed cost you pay over and over. Most people never measure it.

The free edition is a diagnostic tool that shows you that number.

### Usage

No install needed (npm):

```bash
npx rulesweep audit --global --reload-factor 3
```

From source:

```bash
git clone https://github.com/nanami-all-ai/rulesweep-free
cd rulesweep-free
node bin/rulesweep.mjs audit --global --reload-factor 3
```

- `--global` also includes `~/.claude/CLAUDE.md`.
- `--reload-factor N` multiplies the total by N as a rough stand-in for subagent reloads.
- `--json` prints machine-readable output.
- Output language follows `--lang en|ja`, then the `RULESWEEP_LANG` environment variable, then your locale (`LC_ALL` / `LC_MESSAGES` / `LANG`). Anything that isn't Japanese gets English.

### Example output

This is the included demo project (`launch/fixtures/demo-project` in the development repo: a deliberately bloated `CLAUDE.md` plus a few rule files), **not a real project and not your setup**. Your numbers will differ.

```text
$ npx rulesweep audit --root demo-project --reload-factor 3

  rulesweep (free) — audit
  ──────────────────────────────────────────────────
  Always-loaded instructions: ~3,551 tok
  Per-turn estimate incl. subagents: ~10,653 tok (×3)

  By file:
    ████████████████████████     860 tok  CLAUDE.md
    ███████████████████          675 tok  .claude/rules/delivery-flow.md
    █████████████                463 tok  .claude/rules/release.md
    ████████████                 442 tok  .claude/rules/review.md
    █████████                    325 tok  .claude/rules/deployment.md
    █████████                    323 tok  .claude/rules/testing.md
    █████████                    307 tok  .claude/rules/git-workflow.md
    ████                         156 tok  .claude/rules/style.md

  Duplicate lines: 5 distinct
  Possible contradictions: 0
  Broken references: 5

  Which sections to move into skills/subagents, and how to fix them, is up to you:
  the paid edition (sort / stub / rewrite / remeasure) is no longer sold.
```

What it reports:

- Estimated tokens per file and in total (what Claude Code loads on every turn)
- Number of duplicate lines (the same thing said more than once across files)
- Number of broken references (`` `path.md` `` or `[[wikilink]]` pointing at files that don't exist)
- Number of possible contradictions (a "do X" line and a "don't do X" line with heavy word overlap)

These are pattern-matching heuristics. They point you at places to look, not verdicts.

### Free vs. paid

| | Free (this repo) | Paid ($29, one-time) |
|---|---|---|
| Token estimate per file / total | yes | yes |
| Counts of duplicates, broken references, contradictions | yes | yes, with file and line for each |
| Per-section suggestion: keep / move to skill / move to subagent / delete | — | yes (`sort` worksheet) |
| Generate skill/subagent stub files (never edits CLAUDE.md itself) | — | yes (`stub`) |
| Before/after against a saved baseline | — | yes (`remeasure`) |
| Optional slimmed-draft rewrite with your own API key (BYOK) | — | yes (`rewrite`) |

The paid edition is no longer sold (the free edition above stays as is).

#### Why the free edition stops here

To be upfront: the heuristic that sorts each section into KEEP / SKILL / SUBAGENT / DELETE is the core of this tool, and everything built on it (the worksheet, stub generation, the BYOK draft, before/after tracking) is what the paid edition sells. The free edition shows you the problem; the paid edition helps you fix it. The classification code is not in this repository at all.

### About the token numbers

Token counts are a **heuristic estimate**, not billed tokens: roughly 4 characters per token for Latin text and code, about 1 token per character for CJK. Expect around ±15% versus the real tokenizer. Use them for relative comparison (which file is heavy, before vs. after), not as a billing figure.

### Requirements

Node.js 18+. No dependencies. No API key, and nothing is sent over the network.

### AI disclosure

This tool, this README and the related posts were made with Claude Code. I'm not hiding that.

### License

See [LICENSE](./LICENSE). It is a limited-use license written in Japanese; the **Japanese text of LICENSE is the legally binding version**. English summary, for convenience only:

- You may run and use the tool freely, for personal or commercial work, and apply its results to your projects.
- You may not redistribute the source (including publishing a fork), publish modified versions, or bundle it into another product.
- No warranty of any kind.

---

## 日本語

`CLAUDE.md`と`.claude/rules/`は、コードではなく**毎ターン・毎サブエージェント起動で再ロードされる固定コスト**です。ほとんどの人はこれを計測していません。

この無料版は、その事実をあなたに見せるための診断ツールです。

### 使い方

インストール不要（npm）:

```bash
npx rulesweep audit --global --reload-factor 3
```

ソースから:

```bash
git clone https://github.com/nanami-all-ai/rulesweep-free
cd rulesweep-free
node bin/rulesweep.mjs audit --global --reload-factor 3
```

出力の言語は `--lang en|ja` → 環境変数 `RULESWEEP_LANG` → ロケール（`LC_ALL` / `LC_MESSAGES` / `LANG`）の順で決まります。日本語ロケールなら従来どおり日本語で表示されます。

出力（サマリ）:
- ファイル別・合計のトークン推定（Claude Code が毎ターン読み込んでいる量）
- 重複行の件数（ファイル横断で同じことを繰り返し言っている箇所）
- 壊れた参照リンクの件数（存在しないファイルを指す`` `path.md` ``や`[[wikilink]]`）
- 矛盾候補の件数

無料版はここまでです。「どのセクションを skill/subagent に退避すべきか」「実際にどう直すか」「修正後にどれだけ削減できたか」の一歩先は、有料版（現在は販売していません）で扱う予定だった範囲です。

#### なぜ無料版はここで止めているのか

正直に書きます。判定ヒューリスティック（KEEP/SKILL/SUBAGENT/DELETEの振り分けロジック）はこのツールの核であり、そこから先（振り分けワークシート・退避スタブ自動生成・BYOKでのスリム版草案・before/after記録）は有料版の価値そのものです。無料版は「問題を見せる」ところまで、有料版は「直す」ところからです。

### 必要環境

Node.js 18+。API キー不要。

### AI利用について

このツール自体・このREADME・関連する発信物は Claude Code を使って作られています。それを隠していません（一次体験ベースの発信という方針のため）。ツールの実行自体にAPIキーは不要です。

### 有料版について

有料版（振り分けワークシート・退避スタブ自動生成・BYOKリライト・before/after計測）は現在販売していません。

### ライセンス

[LICENSE](./LICENSE) を参照（限定使用許諾。個人・商用問わず利用は自由ですが、ソースコードの複製・再配布・改変版の公開はできません）。

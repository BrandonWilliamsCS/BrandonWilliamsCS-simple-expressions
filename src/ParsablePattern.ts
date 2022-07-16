import { Iteration } from "./Iteration";
import { SyntaxTree } from "./SyntaxTree";
import { Token } from "./Token";

export type ParsablePattern =
  | AlternativesPattern
  | RepeatPattern
  | SequencePattern
  | SyntaxMatchPattern
  | TokenMatchPattern;

export interface AlternativesPattern {
  kind: "alternatives";
  pieces: ParsablePattern[];
}
export function makeAlternativesPattern(
  pieces: ParsablePattern[],
): AlternativesPattern {
  return { kind: "alternatives", pieces };
}

export interface RepeatPattern {
  kind: "repeat";
  pattern: ParsablePattern;
  minCount: number;
  maxCount?: number;
}
export function makeRepeatPattern(
  counts: number | [number, number?],
  pattern: ParsablePattern,
): RepeatPattern {
  const [minCount, maxCount] =
    typeof counts === "number" ? [counts, counts] : counts;
  return { kind: "repeat", pattern, minCount, maxCount };
}

export interface SequencePattern {
  kind: "sequence";
  pieces: ParsablePattern[];
}
export function makeSequencePattern(
  pieces: ParsablePattern[],
): SequencePattern {
  return { kind: "sequence", pieces };
}

export interface SyntaxMatchPattern {
  kind: "syntaxMatch";
  parser: (
    iteration: Iteration<Token>,
  ) => [SyntaxTree, Iteration<Token>] | undefined;
}
export function makeSyntaxMatchPattern(
  parser: (
    iteration: Iteration<Token>,
  ) => [SyntaxTree, Iteration<Token>] | undefined,
): SyntaxMatchPattern {
  return { kind: "syntaxMatch", parser };
}

export interface TokenMatchPattern {
  kind: "tokenMatch";
  tokenKind: Token["kind"];
}
export function makeTokenMatchPattern(
  tokenKind: Token["kind"],
): TokenMatchPattern {
  return { kind: "tokenMatch", tokenKind };
}

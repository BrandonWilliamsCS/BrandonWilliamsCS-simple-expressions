import { Iteration } from "./Iteration";
import { ParsablePattern } from "./ParsablePattern";
import { SyntaxTree } from "./SyntaxTree";
import { Token } from "./Token";

export function parsePattern(
  pattern: ParsablePattern,
  initialIteration: Iteration<Token>,
): [Array<Token | SyntaxTree>, Iteration<Token>] | undefined {
  if (pattern.kind === "tokenMatch") {
    return initialIteration.atEnd ||
      initialIteration.current.kind !== pattern.tokenKind
      ? undefined
      : [[initialIteration.current], initialIteration.advance()];
  } else if (pattern.kind === "syntaxMatch") {
    const result = pattern.parser(initialIteration);
    if (!result) {
      return undefined;
    }
    const [resultTree, resultIteration] = result;
    return [[resultTree], resultIteration];
  } else if (pattern.kind === "alternatives") {
    // Grab the first successful result.
    for (const subPattern of pattern.pieces) {
      const result = parsePattern(subPattern, initialIteration);
      if (result) {
        return result;
      }
    }
    return undefined;
  } else if (pattern.kind === "sequence") {
    let iteration = initialIteration;
    const matches: Array<Token | SyntaxTree> = [];
    // Step through each sub-pattern and merge them into one big sequence
    for (const subPattern of pattern.pieces) {
      const result = parsePattern(subPattern, iteration);
      if (!result) {
        return undefined;
      }
      const [resultTokens, resultIteration] = result;
      pushAll(resultTokens, matches);
      iteration = resultIteration;
    }
    return [matches, iteration];
  } else if (pattern.kind === "repeat") {
    let iteration = initialIteration;
    let repeatCount = 0;
    const matches: Array<Token | SyntaxTree> = [];
    // Grab matches until we hit the limit
    while (repeatCount < (pattern.maxCount ?? Number.POSITIVE_INFINITY)) {
      const iterativeMatch = parsePattern(pattern.pattern, iteration);
      if (!iterativeMatch) {
        // When we can't match any more, succeed IFF we got enough
        if (repeatCount < pattern.minCount) {
          return undefined;
        } else {
          return [matches, iteration];
        }
      }
      pushAll(iterativeMatch[0], matches);
      iteration = iterativeMatch[1];
      repeatCount += 1;
    }
    return [matches, iteration];
  }
}

function pushAll<T>(from: T[], to: T[]) {
  for (const item of from) {
    to.push(item);
  }
}

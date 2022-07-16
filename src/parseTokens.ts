import { Iteration } from "./Iteration";
import {
  makeAlternativesPattern,
  makeRepeatPattern,
  makeSequencePattern,
  makeSyntaxMatchPattern,
  makeTokenMatchPattern,
} from "./ParsablePattern";
import { parsePattern } from "./parsePattern";
import {
  Drilldown,
  Expression,
  FunctionCall,
  Identifier,
  Literal,
  NamedLiteral,
  NumberLiteral,
  StringLiteral,
} from "./SyntaxTree";
import { DigitSequenceToken, PeriodSymbol, Token } from "./Token";

export function parseTokens(tokens: Token[]): Expression {
  const iteration = new Iteration(tokens);
  const parseResult = parseExpression(iteration);
  if (!parseResult) {
    throw new Error("Unable to parse tokens into expression.");
  }
  const [resultTree, resultIteration] = parseResult;
  if (!resultIteration.atEnd) {
    throw new Error("Unexpected tokens found after parsing.");
  }
  return resultTree;
}

export function parseExpression(
  initialIteration: Iteration<Token>,
): [Expression, Iteration<Token>] | undefined {
  const result = parsePattern(
    makeSequencePattern([
      makeAlternativesPattern([
        makeSyntaxMatchPattern(parseLiteral),
        // Try function call first to ensure that they aren't mistaken as plain identifiers
        makeSyntaxMatchPattern(parseFunctionCall),
        makeSyntaxMatchPattern(parseIdentifier),
      ]),
      makeRepeatPattern([0], makeSyntaxMatchPattern(parseDrilldown)),
    ]),
    initialIteration,
  );
  if (!result) {
    return undefined;
  }
  // pull the base expression out then all drilldowns as possible
  const [resultItems, resultIteration] = result;
  if (
    resultItems[0].kind !== "literal" &&
    resultItems[0].kind !== "identifier" &&
    resultItems[0].kind !== "functionCall"
  ) {
    throw new Error("Unexpected pattern parse result");
  }
  if (resultItems.length === 1) {
    return [
      { kind: "expression", baseExpression: resultItems[0] },
      resultIteration,
    ];
  }
  const drilldown: Drilldown[] = [];
  for (let i = 1; i < resultItems.length; i++) {
    const drilldownItem = resultItems[i];
    if (drilldownItem.kind !== "drilldown") {
      throw new Error("Unexpected pattern parse result");
    }
    drilldown!.push(drilldownItem);
  }
  return [
    { kind: "expression", baseExpression: resultItems[0], drilldown },
    resultIteration,
  ];
}

export function parseDrilldown(
  initialIteration: Iteration<Token>,
): [Drilldown, Iteration<Token>] | undefined {
  const result = parsePattern(
    makeAlternativesPattern([
      makeSequencePattern([
        makeTokenMatchPattern("periodSymbol"),
        makeSyntaxMatchPattern(parseIdentifier),
      ]),
      makeSequencePattern([
        makeTokenMatchPattern("openBracketSymbol"),
        makeSyntaxMatchPattern(parseExpression),
        makeTokenMatchPattern("closeBracketSymbol"),
      ]),
    ]),
    initialIteration,
  );
  if (!result) {
    return undefined;
  }
  const [resultItems, resultIteration] = result;

  if (
    resultItems[0].kind === "periodSymbol" &&
    resultItems[1].kind === "identifier"
  ) {
    return [
      {
        kind: "drilldown",
        variant: "period",
        format: resultItems[0],
        syntax: resultItems[1],
      },
      resultIteration,
    ];
  }
  if (
    resultItems[0].kind === "openBracketSymbol" &&
    resultItems[1].kind === "expression" &&
    resultItems[2].kind === "closeBracketSymbol"
  ) {
    return [
      {
        kind: "drilldown",
        variant: "brackets",
        format: [resultItems[0], resultItems[2]],
        syntax: resultItems[1],
      },
      resultIteration,
    ];
  }
  throw new Error("Unexpected pattern parse result");
}

export function parseFunctionCall(
  initialIteration: Iteration<Token>,
): [FunctionCall, Iteration<Token>] | undefined {
  const result = parsePattern(
    makeSequencePattern([
      makeTokenMatchPattern("identifierToken"),
      makeTokenMatchPattern("openParenthesisSymbol"),
      // Optionally provide arguments
      makeRepeatPattern(
        [0, 1],
        makeSequencePattern([
          // Arguments must start with an expression
          makeSyntaxMatchPattern(parseExpression),
          // optionally followed by any number of other expressions, separated by commas
          makeRepeatPattern(
            [0],
            makeSequencePattern([
              makeTokenMatchPattern("commaSymbol"),
              makeSyntaxMatchPattern(parseExpression),
            ]),
          ),
          // With an optional trailing comma.
          makeRepeatPattern([0, 1], makeTokenMatchPattern("commaSymbol")),
        ]),
      ),
      makeTokenMatchPattern("closeParenthesisSymbol"),
    ]),
    initialIteration,
  );
  if (!result) {
    return undefined;
  }
  const [resultItems, resultIteration] = result;

  // pull the identifier off, then loop through drilldowns and build up the access
  const closeParenthesisItem = resultItems[resultItems.length - 1];
  if (
    resultItems[0].kind !== "identifierToken" ||
    resultItems[1].kind !== "openParenthesisSymbol" ||
    closeParenthesisItem.kind !== "closeParenthesisSymbol"
  ) {
    throw new Error("Unexpected pattern parse result");
  }
  const args: FunctionCall["arguments"] = [];
  // Loop over the items inside the parens, but not the identifier or parens themselves
  for (let i = 2; i < resultItems.length - 1; i++) {
    const expressionItem = resultItems[i];
    const commaItem = resultItems[i + 1];
    if (expressionItem.kind !== "expression") {
      throw new Error("Unexpected pattern parse result");
    }
    if (commaItem.kind === "commaSymbol") {
      args.push({ value: expressionItem, commaSeparator: commaItem });
      i++;
    } else {
      // Only the last comma is optional.
      if (i < resultItems.length - 2) {
        throw new Error("Unexpected pattern parse result");
      }
      args.push({ value: expressionItem, commaSeparator: undefined });
    }
  }
  return [
    {
      kind: "functionCall",
      name: resultItems[0],
      openParenthesis: resultItems[1],
      arguments: args,
      closeParenthesis: closeParenthesisItem,
    },
    resultIteration,
  ];
}

export function parseIdentifier(
  initialIteration: Iteration<Token>,
): [Identifier, Iteration<Token>] | undefined {
  const result = parsePattern(
    makeTokenMatchPattern("identifierToken"),
    initialIteration,
  );
  if (!result) {
    return undefined;
  }
  const [resultItems, resultIteration] = result;
  if (resultItems[0].kind !== "identifierToken") {
    throw new Error("Unexpected pattern parse result");
  }
  return [{ kind: "identifier", token: resultItems[0] }, resultIteration];
}

export function parseLiteral(
  initialIteration: Iteration<Token>,
): [Literal, Iteration<Token>] | undefined {
  const result = parsePattern(
    makeAlternativesPattern([
      makeSyntaxMatchPattern(parseNamedLiteral),
      makeSyntaxMatchPattern(parseNumberLiteral),
      makeSyntaxMatchPattern(parseStringLiteral),
    ]),
    initialIteration,
  );
  if (!result) {
    return undefined;
  }
  const [resultItems, resultIteration] = result;
  if (
    resultItems[0].kind !== "namedLiteral" &&
    resultItems[0].kind !== "numberLiteral" &&
    resultItems[0].kind !== "stringLiteral"
  ) {
    throw new Error("Unexpected pattern parse result");
  }
  return [{ kind: "literal", value: resultItems[0] }, resultIteration];
}

export function parseNamedLiteral(
  initialIteration: Iteration<Token>,
): [NamedLiteral, Iteration<Token>] | undefined {
  const result = parsePattern(
    makeAlternativesPattern([
      makeTokenMatchPattern("falseLiteralToken"),
      makeTokenMatchPattern("nullLiteralToken"),
      makeTokenMatchPattern("trueLiteralToken"),
    ]),
    initialIteration,
  );
  if (!result) {
    return undefined;
  }
  const [resultItems, resultIteration] = result;
  if (
    resultItems[0].kind !== "falseLiteralToken" &&
    resultItems[0].kind !== "nullLiteralToken" &&
    resultItems[0].kind !== "trueLiteralToken"
  ) {
    throw new Error("Unexpected pattern parse result");
  }
  return [{ kind: "namedLiteral", name: resultItems[0] }, resultIteration];
}

export function parseNumberLiteral(
  initialIteration: Iteration<Token>,
): [NumberLiteral, Iteration<Token>] | undefined {
  const result = parsePattern(
    makeSequencePattern([
      makeRepeatPattern(
        [0, 1],
        makeAlternativesPattern([
          makeTokenMatchPattern("minusSymbol"),
          makeTokenMatchPattern("plusSymbol"),
        ]),
      ),
      makeTokenMatchPattern("digitSequenceToken"),
      // Allow trailing decimal point with or without a fractional part.
      makeRepeatPattern(
        [0, 1],
        makeSequencePattern([
          makeTokenMatchPattern("periodSymbol"),
          makeRepeatPattern(
            [0, 1],
            makeTokenMatchPattern("digitSequenceToken"),
          ),
        ]),
      ),
    ]),
    initialIteration,
  );
  if (!result) {
    return undefined;
  }
  const [resultItems, resultIteration] = result;
  const syntax = { kind: "numberLiteral" } as NumberLiteral;
  let i = 0;
  if (
    resultItems[0].kind === "minusSymbol" ||
    resultItems[0].kind === "plusSymbol"
  ) {
    syntax.sign = resultItems[0];
    i += 1;
  }
  if (resultItems[i].kind !== "digitSequenceToken") {
    throw new Error("Unexpected pattern parse result");
  }
  syntax.integerPart = resultItems[i] as DigitSequenceToken;
  if (resultItems[i + 1]?.kind === "periodSymbol") {
    syntax.decimalPoint = resultItems[i + 1] as PeriodSymbol;
  } else {
    // Don't accept a fractional part unless we have a decimal point
    return [syntax, resultIteration];
  }
  if (resultItems[i + 2]?.kind === "digitSequenceToken") {
    syntax.fractionalPart = resultItems[i + 2] as DigitSequenceToken;
  }
  return [syntax, resultIteration];
}

export function parseStringLiteral(
  initialIteration: Iteration<Token>,
): [StringLiteral, Iteration<Token>] | undefined {
  const result = parsePattern(
    makeTokenMatchPattern("stringLiteralToken"),
    initialIteration,
  );
  if (!result) {
    return undefined;
  }
  const [resultItems, resultIteration] = result;
  if (resultItems[0].kind !== "stringLiteralToken") {
    throw new Error("Unexpected pattern parse result");
  }
  return [{ kind: "stringLiteral", token: resultItems[0] }, resultIteration];
}

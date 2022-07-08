import {
  AlphanumericUnit,
  LexicalUnit,
  StringUnit,
  SymbolUnit,
} from "./LexicalUnit";
import { Token } from "./Token";

export function analyzeLexicalUnit(token: LexicalUnit): Token {
  switch (token.kind) {
    case "alphanumeric":
      return analyzeAlphanumericUnit(token);
    case "string":
      return analyzeStringUnit(token);
    case "symbol":
      return analyzeSymbolUnit(token);
  }
}

function analyzeAlphanumericUnit(token: AlphanumericUnit): Token {
  switch (token.value) {
    case "false":
      return { kind: "falseLiteralToken" };
    case "null":
      return { kind: "nullLiteralToken" };
    case "true":
      return { kind: "trueLiteralToken" };
  }
  if (/^\d+$/.test(token.value)) {
    return { kind: "digitSequenceToken", value: token.value };
  }
  if (/^\d+$/.test(token.value[0])) {
    throw new Error("Identifier may not start with number");
  }
  return { kind: "identifierToken", value: token.value };
}

function analyzeStringUnit(token: StringUnit): Token {
  return {
    kind: "stringLiteralToken",
    delimiter: token.delimiter,
    content: token.content,
  };
}

function analyzeSymbolUnit(token: SymbolUnit): Token {
  switch (token.value) {
    case "]":
      return { kind: "closeBracketSymbol" };
    case ")":
      return { kind: "closeParenthesisSymbol" };
    case ",":
      return { kind: "commaSymbol" };
    case "-":
      return { kind: "minusSymbol" };
    case "[":
      return { kind: "openBracketSymbol" };
    case "(":
      return { kind: "openParenthesisSymbol" };
    case "+":
      return { kind: "plusSymbol" };
    case ".":
      return { kind: "periodSymbol" };
  }
  throw new Error("Unrecognized symbol " + token.value);
}

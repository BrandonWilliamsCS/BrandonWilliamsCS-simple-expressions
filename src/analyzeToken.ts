import { LexicalUnit } from "./LexicalUnit";
import { AlphanumericToken, StringToken, SymbolToken, Token } from "./Token";

export function analyzeToken(token: Token): LexicalUnit {
  switch (token.type) {
    case "alphanumeric":
      return analyzeAlphanumericToken(token);
    case "string":
      return analyzeStringToken(token);
    case "symbol":
      return analyzeSymbolToken(token);
  }
}

function analyzeAlphanumericToken(token: AlphanumericToken): LexicalUnit {
  switch (token.value) {
    case "false":
      return { type: "falseLiteral" };
    case "null":
      return { type: "nullLiteral" };
    case "true":
      return { type: "trueLiteral" };
  }
  if (/^\d+$/.test(token.value)) {
    return { type: "numericSequence", value: token.value };
  }
  if (/^\d+$/.test(token.value[0])) {
    throw new Error("Identifier may not start with number");
  }
  return { type: "identifier", value: token.value };
}

function analyzeStringToken(token: StringToken): LexicalUnit {
  return {
    type: "stringLiteral",
    delimiter: token.delimiter,
    content: token.content,
  };
}

function analyzeSymbolToken(token: SymbolToken): LexicalUnit {
  switch (token.value) {
    case "]":
      return { type: "closeBracketSymbol" };
    case ")":
      return { type: "closeParenthesisSymbol" };
    case ",":
      return { type: "commaSymbol" };
    case "-":
      return { type: "minusSymbol" };
    case "[":
      return { type: "openBracketSymbol" };
    case "(":
      return { type: "openParenthesisSymbol" };
    case "+":
      return { type: "plusSymbol" };
    case ".":
      return { type: "periodSymbol" };
  }
  throw new Error("Unrecognized symbol " + token.value);
}

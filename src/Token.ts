export type Token =
  | IdentifierToken
  | LiteralToken
  | DigitSequenceToken
  | SymbolToken;

export type IdentifierToken = {
  kind: "identifierToken";
  value: string;
};

export type LiteralToken =
  | FalseLiteral
  | NullLiteral
  | StringLiteral
  | TrueLiteral;
export type FalseLiteral = {
  kind: "falseLiteralToken";
};
export type NullLiteral = {
  kind: "nullLiteralToken";
};
export type StringLiteral = {
  kind: "stringLiteralToken";
  content: string;
  delimiter: string;
};
export type TrueLiteral = {
  kind: "trueLiteralToken";
};

export type DigitSequenceToken = {
  kind: "digitSequenceToken";
  value: string;
};

export type SymbolToken =
  | CloseBracketSymbol
  | CloseParenthesisSymbol
  | CommaSymbol
  | MinusSymbol
  | OpenBracketSymbol
  | OpenParenthesisSymbol
  | PeriodSymbol
  | PlusSymbol;
export type CommaSymbol = {
  kind: "commaSymbol";
};
export type CloseBracketSymbol = {
  kind: "closeBracketSymbol";
};
export type CloseParenthesisSymbol = {
  kind: "closeParenthesisSymbol";
};
export type MinusSymbol = {
  kind: "minusSymbol";
};
export type OpenBracketSymbol = {
  kind: "openBracketSymbol";
};
export type OpenParenthesisSymbol = {
  kind: "openParenthesisSymbol";
};
export type PeriodSymbol = {
  kind: "periodSymbol";
};
export type PlusSymbol = {
  kind: "plusSymbol";
};

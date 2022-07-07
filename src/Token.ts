export type Token =
  | IdentifierToken
  | LiteralToken
  | DigitSequenceToken
  | SymbolToken;

export type IdentifierToken = {
  kind: "identifier";
  value: string;
};

export type LiteralToken =
  | FalseLiteral
  | NullLiteral
  | StringLiteral
  | TrueLiteral;
export type FalseLiteral = {
  kind: "falseLiteral";
};
export type NullLiteral = {
  kind: "nullLiteral";
};
export type StringLiteral = {
  kind: "stringLiteral";
  content: string;
  delimiter: string;
};
export type TrueLiteral = {
  kind: "trueLiteral";
};

export type DigitSequenceToken = {
  kind: "digitSequence";
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

export type LexicalUnit = Identifier | Literal | NumericSequence | Symbol;

export type Identifier = {
  type: "identifier";
  value: string;
};

export type Literal = FalseLiteral | NullLiteral | StringLiteral | TrueLiteral;
export type FalseLiteral = {
  type: "falseLiteral";
};
export type NullLiteral = {
  type: "nullLiteral";
};
export type StringLiteral = {
  type: "stringLiteral";
  content: string;
  delimiter: string;
};
export type TrueLiteral = {
  type: "trueLiteral";
};

export type NumericSequence = {
  type: "numericSequence";
  value: string;
};

export type Symbol =
  | CloseBracketSymbol
  | CommaSymbol
  | MinusSymbol
  | OpenBracketSymbol
  | PeriodSymbol
  | PlusSymbol;
export type CommaSymbol = {
  type: "commaSymbol";
};
export type CloseBracketSymbol = {
  type: "closeBracketSymbol";
};
export type MinusSymbol = {
  type: "minusSymbol";
};
export type OpenBracketSymbol = {
  type: "openBracketSymbol";
};
export type PeriodSymbol = {
  type: "periodSymbol";
};
export type PlusSymbol = {
  type: "plusSymbol";
};

import {
  CloseBracketSymbol,
  CloseParenthesisSymbol,
  CommaSymbol,
  FalseLiteral,
  IdentifierToken,
  MinusSymbol,
  NullLiteral,
  DigitSequenceToken,
  OpenBracketSymbol,
  OpenParenthesisSymbol,
  PeriodSymbol,
  PlusSymbol,
  StringLiteral as StringLiteralToken,
  TrueLiteral,
} from "./Token";

export type SyntaxTree =
  | Expression
  | Drilldown
  | FunctionCall
  | Identifier
  | Literal
  | NamedLiteral
  | NumberLiteral
  | StringLiteral;

export interface Expression {
  kind: "expression";
  baseExpression: Literal | Identifier | FunctionCall;
  drilldown?: Array<Drilldown>;
}

export type Drilldown = {
  kind: "drilldown";
} & (
  | { variant: "period"; format: PeriodSymbol; syntax: Identifier }
  | {
      variant: "brackets";
      format: [OpenBracketSymbol, CloseBracketSymbol];
      syntax: Expression;
    }
);

export interface FunctionCall {
  kind: "functionCall";
  name: IdentifierToken;
  openParenthesis: OpenParenthesisSymbol;
  arguments: Array<{
    value: Expression;
    commaSeparator: CommaSymbol | undefined;
  }>;
  closeParenthesis: CloseParenthesisSymbol;
}

export interface Identifier {
  kind: "identifier";
  token: IdentifierToken;
}

export interface Literal {
  kind: "literal";
  value: NamedLiteral | NumberLiteral | StringLiteral;
}

export interface NamedLiteral {
  kind: "namedLiteral";
  name: FalseLiteral | NullLiteral | TrueLiteral;
}

export interface NumberLiteral {
  kind: "numberLiteral";
  sign?: PlusSymbol | MinusSymbol;
  integerPart: DigitSequenceToken;
  decimalPoint?: PeriodSymbol;
  fractionalPart?: DigitSequenceToken;
}

export interface StringLiteral {
  kind: "stringLiteral";
  token: StringLiteralToken;
}

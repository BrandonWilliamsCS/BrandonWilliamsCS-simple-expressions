export type LexicalUnit = AlphanumericUnit | StringUnit | SymbolUnit;

export type AlphanumericUnit = {
  kind: "alphanumeric";
  value: string;
};

export type StringUnit = {
  kind: "string";
  content: string;
  delimiter: string;
};

export type SymbolUnit = {
  kind: "symbol";
  value: string;
};

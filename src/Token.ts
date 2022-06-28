export type Token = AlphanumericToken | StringToken | SymbolToken;

export type AlphanumericToken = {
  type: "alphanumeric";
  value: string;
};

export type StringToken = {
  type: "string";
  content: string;
  delimiter: string;
};

export type SymbolToken = {
  type: "symbol";
  value: string;
};

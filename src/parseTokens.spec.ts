import { Iteration } from "./Iteration";
import {
  parseDrilldown,
  parseExpression,
  parseFunctionCall,
  parseIdentifier,
  parseLiteral,
  parseNamedLiteral,
  parseNumberLiteral,
  parseStringLiteral,
  parseTokens,
} from "./parseTokens";
import { Token } from "./Token";

describe("parseTokens", () => {
  it("parses complex sequence of tokens as an expression", () => {
    // Arrange
    const tokens: Token[] = [
      { kind: "identifierToken", value: "compute_value" },
      { kind: "openParenthesisSymbol" },
      { kind: "identifierToken", value: "name" },
      { kind: "commaSymbol" },
      { kind: "falseLiteralToken" },
      { kind: "commaSymbol" },
      { kind: "closeParenthesisSymbol" },
      { kind: "periodSymbol" },
      { kind: "identifierToken", value: "items" },
      { kind: "openBracketSymbol" },
      { kind: "digitSequenceToken", value: "1" },
      { kind: "periodSymbol" },
      { kind: "digitSequenceToken", value: "5" },
      { kind: "closeBracketSymbol" },
    ];
    // Act
    const result = parseTokens(tokens);
    // Assert
    expect(result).toEqual({
      kind: "expression",
      baseExpression: {
        kind: "functionCall",
        name: { kind: "identifierToken", value: "compute_value" },
        openParenthesis: { kind: "openParenthesisSymbol" },
        arguments: [
          {
            value: {
              kind: "expression",
              baseExpression: {
                kind: "identifier",
                token: { kind: "identifierToken", value: "name" },
              },
            },
            commaSeparator: { kind: "commaSymbol" },
          },
          {
            value: {
              kind: "expression",
              baseExpression: {
                kind: "literal",
                value: {
                  kind: "namedLiteral",
                  name: { kind: "falseLiteralToken" },
                },
              },
            },
            commaSeparator: { kind: "commaSymbol" },
          },
        ],
        closeParenthesis: { kind: "closeParenthesisSymbol" },
      },
      drilldown: [
        {
          kind: "drilldown",
          variant: "period",
          format: { kind: "periodSymbol" },
          syntax: {
            kind: "identifier",
            token: { kind: "identifierToken", value: "items" },
          },
        },
        {
          kind: "drilldown",
          variant: "brackets",
          format: [
            { kind: "openBracketSymbol" },
            { kind: "closeBracketSymbol" },
          ],
          syntax: {
            kind: "expression",
            baseExpression: {
              kind: "literal",
              value: {
                kind: "numberLiteral",
                integerPart: { kind: "digitSequenceToken", value: "1" },
                decimalPoint: { kind: "periodSymbol" },
                fractionalPart: { kind: "digitSequenceToken", value: "5" },
              },
            },
          },
        },
      ],
    });
  });
});

describe("parseExpression", () => {
  it("parses literal token as literal expression", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "trueLiteralToken" },
    ]);
    // Act
    const result = parseExpression(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "expression",
      baseExpression: {
        kind: "literal",
        value: { kind: "namedLiteral", name: { kind: "trueLiteralToken" } },
      },
    });
  });
  it("parses identifier token as environment access expression", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "identifierToken", value: "x" },
    ]);
    // Act
    const result = parseExpression(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "expression",
      baseExpression: {
        kind: "identifier",
        token: { kind: "identifierToken", value: "x" },
      },
    });
  });
  it("parses empty function call as function call expression", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "identifierToken", value: "x" },
      { kind: "openParenthesisSymbol" },
      { kind: "closeParenthesisSymbol" },
    ]);
    // Act
    const result = parseExpression(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "expression",
      baseExpression: {
        kind: "functionCall",
        name: { kind: "identifierToken", value: "x" },
        openParenthesis: { kind: "openParenthesisSymbol" },
        arguments: [],
        closeParenthesis: { kind: "closeParenthesisSymbol" },
      },
    });
  });
  it("takes as many drilldowns as available when parsing", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "identifierToken", value: "x" },
      { kind: "openBracketSymbol" },
      { kind: "trueLiteralToken" },
      { kind: "closeBracketSymbol" },
      { kind: "periodSymbol" },
      { kind: "identifierToken", value: "y" },
    ]);
    // Act
    const result = parseExpression(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "expression",
      baseExpression: {
        kind: "identifier",
        token: { kind: "identifierToken", value: "x" },
      },
      drilldown: [
        {
          kind: "drilldown",
          variant: "brackets",
          format: [
            { kind: "openBracketSymbol" },
            { kind: "closeBracketSymbol" },
          ],
          syntax: {
            kind: "expression",
            baseExpression: {
              kind: "literal",
              value: {
                kind: "namedLiteral",
                name: { kind: "trueLiteralToken" },
              },
            },
          },
        },
        {
          kind: "drilldown",
          variant: "period",
          format: { kind: "periodSymbol" },
          syntax: {
            kind: "identifier",
            token: { kind: "identifierToken", value: "y" },
          },
        },
      ],
    });
  });
  it("fails to parse invalid expression", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([{ kind: "periodSymbol" }]);
    // Act
    const result = parseExpression(initialIteration);
    // Assert
    expect(result).toBeUndefined();
  });
});

describe("parseDrilldown", () => {
  it("parses period and identifier tokens as period drilldown", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "periodSymbol" },
      { kind: "identifierToken", value: "x" },
    ]);
    // Act
    const result = parseDrilldown(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "drilldown",
      variant: "period",
      format: { kind: "periodSymbol" },
      syntax: {
        kind: "identifier",
        token: { kind: "identifierToken", value: "x" },
      },
    });
  });
  it("parses bracked literal tokens as brackets drilldown", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "openBracketSymbol" },
      { kind: "trueLiteralToken" },
      { kind: "closeBracketSymbol" },
    ]);
    // Act
    const result = parseDrilldown(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "drilldown",
      variant: "brackets",
      format: [{ kind: "openBracketSymbol" }, { kind: "closeBracketSymbol" }],
      syntax: {
        kind: "expression",
        baseExpression: {
          kind: "literal",
          value: { kind: "namedLiteral", name: { kind: "trueLiteralToken" } },
        },
      },
    });
  });
  it("fails to parse invalid drilldown", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([{ kind: "periodSymbol" }]);
    // Act
    const result = parseExpression(initialIteration);
    // Assert
    expect(result).toBeUndefined();
  });
});

describe("parseFunctionCall", () => {
  it("parses identifier and empty parentheses as function call", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "identifierToken", value: "f" },
      { kind: "openParenthesisSymbol" },
      { kind: "closeParenthesisSymbol" },
    ]);
    // Act
    const result = parseFunctionCall(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "functionCall",
      name: { kind: "identifierToken", value: "f" },
      openParenthesis: { kind: "openParenthesisSymbol" },
      arguments: [],
      closeParenthesis: { kind: "closeParenthesisSymbol" },
    });
  });
  it("parses a single-parameter call without trailing comma", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "identifierToken", value: "f" },
      { kind: "openParenthesisSymbol" },
      { kind: "trueLiteralToken" },
      { kind: "closeParenthesisSymbol" },
    ]);
    // Act
    const result = parseFunctionCall(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "functionCall",
      name: { kind: "identifierToken", value: "f" },
      openParenthesis: { kind: "openParenthesisSymbol" },
      arguments: [
        {
          value: {
            kind: "expression",
            baseExpression: {
              kind: "literal",
              value: {
                kind: "namedLiteral",
                name: { kind: "trueLiteralToken" },
              },
            },
          },
        },
      ],
      closeParenthesis: { kind: "closeParenthesisSymbol" },
    });
  });
  it("parses a single-parameter call with trailing comma", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "identifierToken", value: "f" },
      { kind: "openParenthesisSymbol" },
      { kind: "trueLiteralToken" },
      { kind: "commaSymbol" },
      { kind: "closeParenthesisSymbol" },
    ]);
    // Act
    const result = parseFunctionCall(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "functionCall",
      name: { kind: "identifierToken", value: "f" },
      openParenthesis: { kind: "openParenthesisSymbol" },
      arguments: [
        {
          value: {
            kind: "expression",
            baseExpression: {
              kind: "literal",
              value: {
                kind: "namedLiteral",
                name: { kind: "trueLiteralToken" },
              },
            },
          },
          commaSeparator: { kind: "commaSymbol" },
        },
      ],
      closeParenthesis: { kind: "closeParenthesisSymbol" },
    });
  });
  it("parses a multi-parameter call without trailing comma", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "identifierToken", value: "f" },
      { kind: "openParenthesisSymbol" },
      { kind: "trueLiteralToken" },
      { kind: "commaSymbol" },
      { kind: "falseLiteralToken" },
      { kind: "closeParenthesisSymbol" },
    ]);
    // Act
    const result = parseFunctionCall(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "functionCall",
      name: { kind: "identifierToken", value: "f" },
      openParenthesis: { kind: "openParenthesisSymbol" },
      arguments: [
        {
          value: {
            kind: "expression",
            baseExpression: {
              kind: "literal",
              value: {
                kind: "namedLiteral",
                name: { kind: "trueLiteralToken" },
              },
            },
          },
          commaSeparator: { kind: "commaSymbol" },
        },
        {
          value: {
            kind: "expression",
            baseExpression: {
              kind: "literal",
              value: {
                kind: "namedLiteral",
                name: { kind: "falseLiteralToken" },
              },
            },
          },
        },
      ],
      closeParenthesis: { kind: "closeParenthesisSymbol" },
    });
  });
  it("parses a single-parameter call with trailing comma", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "identifierToken", value: "f" },
      { kind: "openParenthesisSymbol" },
      { kind: "trueLiteralToken" },
      { kind: "commaSymbol" },
      { kind: "falseLiteralToken" },
      { kind: "commaSymbol" },
      { kind: "closeParenthesisSymbol" },
    ]);
    // Act
    const result = parseFunctionCall(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "functionCall",
      name: { kind: "identifierToken", value: "f" },
      openParenthesis: { kind: "openParenthesisSymbol" },
      arguments: [
        {
          value: {
            kind: "expression",
            baseExpression: {
              kind: "literal",
              value: {
                kind: "namedLiteral",
                name: { kind: "trueLiteralToken" },
              },
            },
          },
          commaSeparator: { kind: "commaSymbol" },
        },
        {
          value: {
            kind: "expression",
            baseExpression: {
              kind: "literal",
              value: {
                kind: "namedLiteral",
                name: { kind: "falseLiteralToken" },
              },
            },
          },
          commaSeparator: { kind: "commaSymbol" },
        },
      ],
      closeParenthesis: { kind: "closeParenthesisSymbol" },
    });
  });
  it("fails to parse invalid function call", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "identifierToken", value: "f" },
      { kind: "openParenthesisSymbol" },
      { kind: "commaSymbol" },
      { kind: "closeParenthesisSymbol" },
    ]);
    // Act
    const result = parseFunctionCall(initialIteration);
    // Assert
    expect(result).toBeUndefined();
  });
});

describe("parseIdentifier", () => {
  it("parses identifier token as identifier syntax", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "identifierToken", value: "x" },
    ]);
    // Act
    const result = parseIdentifier(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "identifier",
      token: { kind: "identifierToken", value: "x" },
    });
  });
  it("fails to parse non-identifier token", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "trueLiteralToken" },
    ]);
    // Act
    const result = parseIdentifier(initialIteration);
    // Assert
    expect(result).toBeUndefined();
  });
});

describe("parseLiteral", () => {
  it("parses named literal token as named literal", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "trueLiteralToken" },
    ]);
    // Act
    const result = parseLiteral(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "literal",
      value: {
        kind: "namedLiteral",
        name: { kind: "trueLiteralToken" },
      },
    });
  });
  it("parses numeric token as number literal", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "digitSequenceToken", value: "123" },
    ]);
    // Act
    const result = parseLiteral(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "literal",
      value: {
        kind: "numberLiteral",
        integerPart: { kind: "digitSequenceToken", value: "123" },
      },
    });
  });
  it("parses string literal token as string literal", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "stringLiteralToken", content: "hello", delimiter: '"' },
    ]);
    // Act
    const result = parseLiteral(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "literal",
      value: {
        kind: "stringLiteral",
        token: { kind: "stringLiteralToken", content: "hello", delimiter: '"' },
      },
    });
  });
  it("fails to parse non-literal token", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([{ kind: "periodSymbol" }]);
    // Act
    const result = parseLiteral(initialIteration);
    // Assert
    expect(result).toBeUndefined();
  });
});

describe("parseNamedLiteral", () => {
  it("parses named literal token as named literal", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "trueLiteralToken" },
    ]);
    // Act
    const result = parseNamedLiteral(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "namedLiteral",
      name: { kind: "trueLiteralToken" },
    });
  });
  it("fails to parse non-named-literal token", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "digitSequenceToken", value: "123" },
    ]);
    // Act
    const result = parseNamedLiteral(initialIteration);
    // Assert
    expect(result).toBeUndefined();
  });
});

describe("parseNumberLiteral", () => {
  it("parses numeric token as integer number literal", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "digitSequenceToken", value: "123" },
    ]);
    // Act
    const result = parseNumberLiteral(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "numberLiteral",
      integerPart: { kind: "digitSequenceToken", value: "123" },
    });
  });
  it("parses numeric token with sign as number literal", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "minusSymbol" },
      { kind: "digitSequenceToken", value: "123" },
    ]);
    // Act
    const result = parseNumberLiteral(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "numberLiteral",
      sign: { kind: "minusSymbol" },
      integerPart: { kind: "digitSequenceToken", value: "123" },
    });
  });
  it("parses numeric token with trailing decimal point as number literal", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "digitSequenceToken", value: "123" },
      { kind: "periodSymbol" },
    ]);
    // Act
    const result = parseNumberLiteral(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "numberLiteral",
      integerPart: { kind: "digitSequenceToken", value: "123" },
      decimalPoint: { kind: "periodSymbol" },
    });
  });
  it("parses numeric tokens separated by decimal point as number literal", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "digitSequenceToken", value: "123" },
      { kind: "periodSymbol" },
      { kind: "digitSequenceToken", value: "456" },
    ]);
    // Act
    const result = parseNumberLiteral(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "numberLiteral",
      integerPart: { kind: "digitSequenceToken", value: "123" },
      decimalPoint: { kind: "periodSymbol" },
      fractionalPart: { kind: "digitSequenceToken", value: "456" },
    });
  });
  it("ignores apparent fractional part after a non-decimal-point token", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "digitSequenceToken", value: "123" },
      { kind: "commaSymbol" },
      { kind: "digitSequenceToken", value: "456" },
    ]);
    // Act
    const result = parseNumberLiteral(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "numberLiteral",
      integerPart: { kind: "digitSequenceToken", value: "123" },
    });
  });
  it("fails to parse non-number-literal token", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "trueLiteralToken" },
    ]);
    // Act
    const result = parseNumberLiteral(initialIteration);
    // Assert
    expect(result).toBeUndefined();
  });
});

describe("parseStringLiteral", () => {
  it("parses string literal token as string literal", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "stringLiteralToken", content: "hello", delimiter: '"' },
    ]);
    // Act
    const result = parseStringLiteral(initialIteration);
    // Assert
    expect(result![0]).toEqual({
      kind: "stringLiteral",
      token: { kind: "stringLiteralToken", content: "hello", delimiter: '"' },
    });
  });
  it("fails to parse non-string-literal token", () => {
    // Arrange
    const initialIteration = new Iteration<Token>([
      { kind: "trueLiteralToken" },
    ]);
    // Act
    const result = parseStringLiteral(initialIteration);
    // Assert
    expect(result).toBeUndefined();
  });
});

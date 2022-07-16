import { Iteration } from "./Iteration";
import {
  makeAlternativesPattern,
  makeRepeatPattern,
  makeSequencePattern,
  makeSyntaxMatchPattern,
  makeTokenMatchPattern,
  ParsablePattern,
} from "./ParsablePattern";
import { parsePattern } from "./parsePattern";
import { Token } from "./Token";

describe("parsePattern", () => {
  it("parses token match when candidate token is correct", () => {
    // Arrange
    const pattern: ParsablePattern = makeTokenMatchPattern("trueLiteralToken");
    const initialIteration = new Iteration<Token>([
      { kind: "trueLiteralToken" },
    ]);
    // Act
    const result = parsePattern(pattern, initialIteration);
    // Assert
    expect(result![0]).toEqual([{ kind: "trueLiteralToken" }]);
    expect(result![1].position).toEqual(1);
  });
  it("fails to parse token match when candidate token is incorrect", () => {
    // Arrange
    const pattern: ParsablePattern = makeTokenMatchPattern("trueLiteralToken");
    const initialIteration = new Iteration<Token>([
      { kind: "falseLiteralToken" },
    ]);
    // Act
    const result = parsePattern(pattern, initialIteration);
    // Assert
    expect(result).toBeUndefined();
  });
  it("fails to parse token match when candidate token is missing", () => {
    // Arrange
    const pattern: ParsablePattern = makeTokenMatchPattern("trueLiteralToken");
    const initialIteration = new Iteration<Token>([]);
    // Act
    const result = parsePattern(pattern, initialIteration);
    // Assert
    expect(result).toBeUndefined();
  });
  it("parses syntax match when parser succeeds", () => {
    // Arrange
    const pattern: ParsablePattern = makeSyntaxMatchPattern((iteration) => [
      {
        kind: "literal",
        value: { kind: "namedLiteral", name: { kind: "trueLiteralToken" } },
      },
      iteration.advance(),
    ]);
    const initialIteration = new Iteration<Token>([
      { kind: "trueLiteralToken" },
    ]);
    // Act
    const result = parsePattern(pattern, initialIteration);
    // Assert
    expect(result![0]).toEqual([
      {
        kind: "literal",
        value: { kind: "namedLiteral", name: { kind: "trueLiteralToken" } },
      },
    ]);
    expect(result![1].position).toEqual(1);
  });
  it("fails to parse syntax match when parser fails", () => {
    // Arrange
    const pattern: ParsablePattern = makeSyntaxMatchPattern(
      (iteration) => undefined,
    );
    const initialIteration = new Iteration<Token>([
      { kind: "trueLiteralToken" },
    ]);
    // Act
    const result = parsePattern(pattern, initialIteration);
    // Assert
    expect(result).toBeUndefined();
  });
  it("parses as first available option among alternatives", () => {
    // Arrange
    const pattern: ParsablePattern = {
      kind: "alternatives",
      pieces: [
        makeTokenMatchPattern("falseLiteralToken"),
        makeTokenMatchPattern("trueLiteralToken"),
        makeSyntaxMatchPattern((iteration) => [
          {
            kind: "literal",
            value: { kind: "namedLiteral", name: { kind: "trueLiteralToken" } },
          },
          iteration.advance(),
        ]),
      ],
    };
    const initialIteration = new Iteration<Token>([
      { kind: "trueLiteralToken" },
    ]);
    // Act
    const result = parsePattern(pattern, initialIteration);
    // Assert
    expect(result![0]).toEqual([{ kind: "trueLiteralToken" }]);
    expect(result![1].position).toEqual(1);
  });
  it("parses sequence of matches", () => {
    // Arrange
    const pattern: ParsablePattern = makeSequencePattern([
      makeTokenMatchPattern("trueLiteralToken"),
      makeTokenMatchPattern("falseLiteralToken"),
    ]);
    const initialIteration = new Iteration<Token>([
      { kind: "trueLiteralToken" },
      { kind: "falseLiteralToken" },
    ]);
    // Act
    const result = parsePattern(pattern, initialIteration);
    // Assert
    expect(result![0]).toEqual([
      { kind: "trueLiteralToken" },
      { kind: "falseLiteralToken" },
    ]);
    expect(result![1].position).toEqual(2);
  });
  it("parses as an empty result when optional repetition is missing", () => {
    // Arrange
    const pattern: ParsablePattern = makeRepeatPattern(
      [0],
      makeTokenMatchPattern("trueLiteralToken"),
    );
    const initialIteration = new Iteration<Token>([]);
    // Act
    const result = parsePattern(pattern, initialIteration);
    // Assert
    expect(result![0]).toEqual([]);
  });
  it("parses result when minCount tokens are present", () => {
    // Arrange
    const pattern: ParsablePattern = makeRepeatPattern(
      1,
      makeTokenMatchPattern("trueLiteralToken"),
    );
    const initialIteration = new Iteration<Token>([
      { kind: "trueLiteralToken" },
    ]);
    // Act
    const result = parsePattern(pattern, initialIteration);
    // Assert
    expect(result![0]).toEqual([{ kind: "trueLiteralToken" }]);
    expect(result![1].position).toEqual(1);
  });
  it("doesn't parse result when fewer than minCount tokens are present", () => {
    // Arrange
    const pattern: ParsablePattern = makeRepeatPattern(
      2,
      makeTokenMatchPattern("trueLiteralToken"),
    );
    const initialIteration = new Iteration<Token>([
      { kind: "trueLiteralToken" },
    ]);
    // Act
    const result = parsePattern(pattern, initialIteration);
    // Assert
    expect(result).toBeUndefined;
  });
  it("parses all available repeats when fewer than maxCount repeats are present", () => {
    // Arrange
    const pattern: ParsablePattern = makeRepeatPattern(
      [0, 3],
      makeTokenMatchPattern("trueLiteralToken"),
    );
    const initialIteration = new Iteration<Token>([
      { kind: "trueLiteralToken" },
      { kind: "trueLiteralToken" },
    ]);
    // Act
    const result = parsePattern(pattern, initialIteration);
    // Assert
    expect(result![0]).toEqual([
      { kind: "trueLiteralToken" },
      { kind: "trueLiteralToken" },
    ]);
    expect(result![1].position).toEqual(2);
  });
  it("parses maxCount repeats when greater than maxCount repeats are present", () => {
    // Arrange
    const pattern: ParsablePattern = makeRepeatPattern(
      [0, 2],
      makeTokenMatchPattern("trueLiteralToken"),
    );
    const initialIteration = new Iteration<Token>([
      { kind: "trueLiteralToken" },
      { kind: "trueLiteralToken" },
      { kind: "trueLiteralToken" },
    ]);
    // Act
    const result = parsePattern(pattern, initialIteration);
    // Assert
    expect(result![0]).toEqual([
      { kind: "trueLiteralToken" },
      { kind: "trueLiteralToken" },
    ]);
    expect(result![1].position).toEqual(2);
  });
  it("parses a complex pattern tree", () => {
    // Arrange
    const pattern: ParsablePattern = {
      kind: "sequence",
      pieces: [
        makeTokenMatchPattern("identifierToken"),
        makeAlternativesPattern([
          makeSequencePattern([
            makeTokenMatchPattern("periodSymbol"),
            makeTokenMatchPattern("identifierToken"),
          ]),
          makeSequencePattern([
            makeTokenMatchPattern("openBracketSymbol"),
            makeTokenMatchPattern("digitSequenceToken"),
            makeTokenMatchPattern("closeBracketSymbol"),
          ]),
        ]),
      ],
    };
    const initialIteration = new Iteration<Token>([
      { kind: "identifierToken", value: "x" },
      { kind: "openBracketSymbol" },
      { kind: "digitSequenceToken", value: "1234" },
      { kind: "closeBracketSymbol" },
      { kind: "periodSymbol" },
      { kind: "identifierToken", value: "y" },
    ]);
    // Act
    const result = parsePattern(pattern, initialIteration);
    // Assert
    expect(result![0]).toEqual([
      { kind: "identifierToken", value: "x" },
      { kind: "openBracketSymbol" },
      { kind: "digitSequenceToken", value: "1234" },
      { kind: "closeBracketSymbol" },
    ]);
    expect(result![1].position).toEqual(4);
  });
});

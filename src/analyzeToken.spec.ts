import { analyzeToken } from "./analyzeToken";
import { Token } from "./Token";

describe("analyzeToken", () => {
  it("recognizes an alphanumeric token starting with a letter as an identifier", () => {
    // Arrange
    const token: Token = { type: "alphanumeric", value: "abc_123" };
    // Act
    const lexicalUnit = analyzeToken(token);
    // Assert
    expect(lexicalUnit).toEqual({ type: "identifier", value: "abc_123" });
  });
  it("recognizes an alphanumeric token starting with an underscore as an identifier", () => {
    // Arrange
    const token: Token = { type: "alphanumeric", value: "_abc123" };
    // Act
    const lexicalUnit = analyzeToken(token);
    // Assert
    expect(lexicalUnit).toEqual({ type: "identifier", value: "_abc123" });
  });
  it("rejects an alphanumeric token starting with a number when not entirely numeric", () => {
    // Arrange
    const token: Token = { type: "alphanumeric", value: "123_abc" };
    // Act
    const act = () => {
      const lexicalUnit = analyzeToken(token);
    };
    // Assert
    expect(act).toThrow();
  });
  it("recognizes a purely numeric alphanumeric token as a numeric sequence", () => {
    // Arrange
    const token: Token = { type: "alphanumeric", value: "123" };
    // Act
    const lexicalUnit = analyzeToken(token);
    // Assert
    expect(lexicalUnit).toEqual({ type: "numericSequence", value: "123" });
  });
  it("recognizes the 'false' special token as a literal", () => {
    // Arrange
    const token: Token = { type: "alphanumeric", value: "false" };
    // Act
    const lexicalUnit = analyzeToken(token);
    // Assert
    expect(lexicalUnit).toEqual({ type: "falseLiteral" });
  });
  it("recognizes the 'null' special token as a literal", () => {
    // Arrange
    const token: Token = { type: "alphanumeric", value: "null" };
    // Act
    const lexicalUnit = analyzeToken(token);
    // Assert
    expect(lexicalUnit).toEqual({ type: "nullLiteral" });
  });
  it("recognizes the 'true' special token as a literal", () => {
    // Arrange
    const token: Token = { type: "alphanumeric", value: "true" };
    // Act
    const lexicalUnit = analyzeToken(token);
    // Assert
    expect(lexicalUnit).toEqual({ type: "trueLiteral" });
  });
  it("recognizes a valid symbol token", () => {
    // Arrange
    const token: Token = { type: "symbol", value: "." };
    // Act
    const lexicalUnit = analyzeToken(token);
    // Assert
    expect(lexicalUnit).toEqual({ type: "periodSymbol" });
  });
  it("rejects an invalid symbol token", () => {
    // Arrange
    const token: Token = { type: "symbol", value: "{" };
    // Act
    const act = () => {
      const lexicalUnit = analyzeToken(token);
    };
    // Assert
    expect(act).toThrow();
  });
});

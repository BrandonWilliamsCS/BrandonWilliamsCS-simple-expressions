import { analyzeLexicalUnit } from "./analyzeLexicalUnit";
import { LexicalUnit } from "./LexicalUnit";

describe("analyzeLexicalUnit", () => {
  it("recognizes an alphanumeric token starting with a letter as an identifier", () => {
    // Arrange
    const unit: LexicalUnit = { kind: "alphanumeric", value: "abc_123" };
    // Act
    const token = analyzeLexicalUnit(unit);
    // Assert
    expect(token).toEqual({ kind: "identifier", value: "abc_123" });
  });
  it("recognizes an alphanumeric token starting with an underscore as an identifier", () => {
    // Arrange
    const unit: LexicalUnit = { kind: "alphanumeric", value: "_abc123" };
    // Act
    const token = analyzeLexicalUnit(unit);
    // Assert
    expect(token).toEqual({ kind: "identifier", value: "_abc123" });
  });
  it("rejects an alphanumeric token starting with a number when not entirely numeric", () => {
    // Arrange
    const unit: LexicalUnit = { kind: "alphanumeric", value: "123_abc" };
    // Act
    const act = () => {
      const token = analyzeLexicalUnit(unit);
    };
    // Assert
    expect(act).toThrow();
  });
  it("recognizes a purely numeric alphanumeric token as a digit sequence", () => {
    // Arrange
    const unit: LexicalUnit = { kind: "alphanumeric", value: "123" };
    // Act
    const token = analyzeLexicalUnit(unit);
    // Assert
    expect(token).toEqual({ kind: "digitSequence", value: "123" });
  });
  it("recognizes the 'false' special token as a literal", () => {
    // Arrange
    const unit: LexicalUnit = { kind: "alphanumeric", value: "false" };
    // Act
    const token = analyzeLexicalUnit(unit);
    // Assert
    expect(token).toEqual({ kind: "falseLiteral" });
  });
  it("recognizes the 'null' special token as a literal", () => {
    // Arrange
    const unit: LexicalUnit = { kind: "alphanumeric", value: "null" };
    // Act
    const token = analyzeLexicalUnit(unit);
    // Assert
    expect(token).toEqual({ kind: "nullLiteral" });
  });
  it("recognizes the 'true' special token as a literal", () => {
    // Arrange
    const unit: LexicalUnit = { kind: "alphanumeric", value: "true" };
    // Act
    const token = analyzeLexicalUnit(unit);
    // Assert
    expect(token).toEqual({ kind: "trueLiteral" });
  });
  it("recognizes a valid symbol token", () => {
    // Arrange
    const unit: LexicalUnit = { kind: "symbol", value: "." };
    // Act
    const token = analyzeLexicalUnit(unit);
    // Assert
    expect(token).toEqual({ kind: "periodSymbol" });
  });
  it("rejects an invalid symbol token", () => {
    // Arrange
    const unit: LexicalUnit = { kind: "symbol", value: "{" };
    // Act
    const act = () => {
      const token = analyzeLexicalUnit(unit);
    };
    // Assert
    expect(act).toThrow();
  });
});

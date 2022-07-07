import { splitLexicalUnits } from "./splitLexicalUnits";

describe("splitLexicalUnits", () => {
  it("produces no unit for an empty string", () => {
    // Arrange
    const input = "";
    // Act
    const units = splitLexicalUnits(input);
    // Assert
    expect(units.length).toBe(0);
  });
  it("recognizes letters and numbers as an alphanumeric unit", () => {
    // Arrange
    const input = "hello123";
    // Act
    const units = splitLexicalUnits(input);
    // Assert
    expect(units[0]).toEqual({ kind: "alphanumeric", value: "hello123" });
  });
  it("treats underscore character as alphanumeric", () => {
    // Arrange
    const input = "hello_123";
    // Act
    const units = splitLexicalUnits(input);
    // Assert
    expect(units[0]).toEqual({ kind: "alphanumeric", value: "hello_123" });
  });
  it("splits alphanumeric at whitespace", () => {
    // Arrange
    const input = "hello\t123";
    // Act
    const units = splitLexicalUnits(input);
    // Assert
    expect(units).toEqual([
      { kind: "alphanumeric", value: "hello" },
      { kind: "alphanumeric", value: "123" },
    ]);
  });
  it("recognizes a symbol as a symbol unit", () => {
    // Arrange
    const input = ".";
    // Act
    const units = splitLexicalUnits(input);
    // Assert
    expect(units[0]).toEqual({ kind: "symbol", value: "." });
  });
  it("rejects control characters outside of string literals", () => {
    // Arrange
    const input = "\u0000";
    // Act
    const act = () => {
      const units = splitLexicalUnits(input);
    };
    // Assert
    expect(act).toThrow();
  });
  it("recognizes a double-quoted string with escaped double-quotes and unescaped single quotes", () => {
    // Arrange
    const input = '"\'hello\'\\\\\\"world\\""';
    // Act
    const units = splitLexicalUnits(input);
    // Assert
    expect(units[0]).toEqual({
      kind: "string",
      delimiter: '"',
      content: "'hello'\\\"world\"",
    });
  });
  it("recognizes a single-quoted string with escaped single-quotes and unescaped double quotes", () => {
    // Arrange
    const input = "'\\'hello\\'\\\\\"world\"'";
    // Act
    const units = splitLexicalUnits(input);
    // Assert
    expect(units[0]).toEqual({
      kind: "string",
      delimiter: "'",
      content: "'hello'\\\"world\"",
    });
  });
  it("maintains emoji, symbols, and spaces in string literals", () => {
    // Arrange
    const input = "'\thello! 👋\r\n'";
    // Act
    const units = splitLexicalUnits(input);
    // Assert
    expect(units[0]).toEqual({
      kind: "string",
      delimiter: "'",
      content: "\thello! 👋\r\n",
    });
  });
  it("ignores whitespace outside between units", () => {
    // Arrange
    const input = "hello - ' + ' - 123";
    // Act
    const units = splitLexicalUnits(input);
    // Assert
    expect(units).toEqual([
      { kind: "alphanumeric", value: "hello" },
      { kind: "symbol", value: "-" },
      { kind: "string", delimiter: "'", content: " + " },
      { kind: "symbol", value: "-" },
      { kind: "alphanumeric", value: "123" },
    ]);
  });
  it("includes all units for complex input strings", () => {
    // Arrange
    const input = "concat(')', '👋', name, 7)";
    // Act
    const units = splitLexicalUnits(input);
    // Assert
    expect(units).toEqual([
      {
        kind: "alphanumeric",
        value: "concat",
      },
      {
        kind: "symbol",
        value: "(",
      },
      {
        kind: "string",
        delimiter: "'",
        content: ")",
      },
      {
        kind: "symbol",
        value: ",",
      },
      {
        kind: "string",
        delimiter: "'",
        content: "👋",
      },
      {
        kind: "symbol",
        value: ",",
      },
      {
        kind: "alphanumeric",
        value: "name",
      },
      {
        kind: "symbol",
        value: ",",
      },
      {
        kind: "alphanumeric",
        value: "7",
      },
      {
        kind: "symbol",
        value: ")",
      },
    ]);
  });
});

import { tokenize } from "./tokenize";

describe("tokenize", () => {
  it("produces no token for an empty string", () => {
    // Arrange
    const input = "";
    // Act
    const tokens = tokenize(input);
    // Assert
    expect(tokens.length).toBe(0);
  });
  it("recognizes letters and numbers as an alphanumeric token", () => {
    // Arrange
    const input = "hello123";
    // Act
    const tokens = tokenize(input);
    // Assert
    expect(tokens[0]).toEqual({ type: "alphanumeric", value: "hello123" });
  });
  it("treats underscore character as alphanumeric", () => {
    // Arrange
    const input = "hello_123";
    // Act
    const tokens = tokenize(input);
    // Assert
    expect(tokens[0]).toEqual({ type: "alphanumeric", value: "hello_123" });
  });
  it("splits alphanumeric at whitespace", () => {
    // Arrange
    const input = "hello\t123";
    // Act
    const tokens = tokenize(input);
    // Assert
    expect(tokens).toEqual([
      { type: "alphanumeric", value: "hello" },
      { type: "alphanumeric", value: "123" },
    ]);
  });
  it("recognizes a symbol as a symbol token", () => {
    // Arrange
    const input = ".";
    // Act
    const tokens = tokenize(input);
    // Assert
    expect(tokens[0]).toEqual({ type: "symbol", value: "." });
  });
  it("rejects control characters outside of string literals", () => {
    // Arrange
    const input = "\u0000";
    // Act
    const act = () => {
      const tokens = tokenize(input);
    };
    // Assert
    expect(act).toThrow();
  });
  it("recognizes a double-quoted string with escaped double-quotes and unescaped single quotes", () => {
    // Arrange
    const input = '"\'hello\'\\\\\\"world\\""';
    // Act
    const tokens = tokenize(input);
    // Assert
    expect(tokens[0]).toEqual({
      type: "string",
      delimiter: '"',
      content: "'hello'\\\"world\"",
    });
  });
  it("recognizes a single-quoted string with escaped single-quotes and unescaped double quotes", () => {
    // Arrange
    const input = "'\\'hello\\'\\\\\"world\"'";
    // Act
    const tokens = tokenize(input);
    // Assert
    expect(tokens[0]).toEqual({
      type: "string",
      delimiter: "'",
      content: "'hello'\\\"world\"",
    });
  });
  it("maintains emoji, symbols, and spaces in string literals", () => {
    // Arrange
    const input = "'\thello! 👋\r\n'";
    // Act
    const tokens = tokenize(input);
    // Assert
    expect(tokens[0]).toEqual({
      type: "string",
      delimiter: "'",
      content: "\thello! 👋\r\n",
    });
  });
  it("ignores whitespace outside between tokens", () => {
    // Arrange
    const input = "hello - ' + ' - 123";
    // Act
    const tokens = tokenize(input);
    // Assert
    expect(tokens).toEqual([
      { type: "alphanumeric", value: "hello" },
      { type: "symbol", value: "-" },
      { type: "string", delimiter: "'", content: " + " },
      { type: "symbol", value: "-" },
      { type: "alphanumeric", value: "123" },
    ]);
  });
  it("includes all tokens for complex input strings", () => {
    // Arrange
    const input = "concat(')', '👋', name, 7)";
    // Act
    const tokens = tokenize(input);
    // Assert
    expect(tokens).toEqual([
      {
        type: "alphanumeric",
        value: "concat",
      },
      {
        type: "symbol",
        value: "(",
      },
      {
        type: "string",
        delimiter: "'",
        content: ")",
      },
      {
        type: "symbol",
        value: ",",
      },
      {
        type: "string",
        delimiter: "'",
        content: "👋",
      },
      {
        type: "symbol",
        value: ",",
      },
      {
        type: "alphanumeric",
        value: "name",
      },
      {
        type: "symbol",
        value: ",",
      },
      {
        type: "alphanumeric",
        value: "7",
      },
      {
        type: "symbol",
        value: ")",
      },
    ]);
  });
});

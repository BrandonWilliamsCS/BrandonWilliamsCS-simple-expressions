import { Iteration } from "./Iteration";
import { StringToken, Token } from "./Token";

export function tokenize(expressionString: string): Token[] {
  // Array.from treats complex characters (e.g., emojis) as one character where others split it.
  const iteration = new Iteration(Array.from(expressionString));
  const tokens: Token[] = [];
  let currentAlphanum: string[] = [];
  while (!iteration.atEnd) {
    const currentChar = iteration.current;
    // Reject things like control characters
    if (isInvalid(currentChar)) {
      throw new Error("Invalid character " + currentChar);
    }
    if (isAplhanum(currentChar)) {
      currentAlphanum.push(currentChar);
    } else if (currentAlphanum.length > 0) {
      // non-alphanumeric characters end any current alphanumeric sequence
      tokens.push({ type: "alphanumeric", value: currentAlphanum.join("") });
      currentAlphanum = [];
    }
    if (isSymbol(currentChar)) {
      if (isStringDelimiter(currentChar)) {
        const stringToken = consumeStringToken(iteration);
        tokens.push(stringToken);
      } else {
        tokens.push({ type: "symbol", value: currentChar });
      }
    }
    iteration.advance();
  }
  // make sure any final alphanumeric sequence becomes a token
  if (currentAlphanum.length > 0) {
    tokens.push({ type: "alphanumeric", value: currentAlphanum.join("") });
  }
  return tokens;
}

function consumeStringToken(iteration: Iteration<string>): StringToken {
  const delimiter = iteration.current;
  const contentCharacters: string[] = [];
  iteration.advance();
  // Iterate up to, but not consuming, the closing delimiter.
  // That way the parent can advance beyond it.
  while (iteration.current !== delimiter) {
    if (iteration.current === "\\") {
      // Backslash escapes next character, so just advance to it
      iteration.advance();
    }
    contentCharacters.push(iteration.current);
    iteration.advance();
  }
  return { type: "string", delimiter, content: contentCharacters.join("") };
}

function isAplhanum(char: string) {
  return RegExp(/^[_\p{L}\p{N}]$/, "u").test(char);
}

function isInvalid(char: string) {
  // Some whitespace characters (e.g., \n) are considered "control" characters, but are acceptable.
  return (
    RegExp(/^[\p{C}\p{M}]$/, "u").test(char) && RegExp(/^\S$/, "u").test(char)
  );
}

function isStringDelimiter(char: string) {
  return char === '"' || char === "'";
}

function isSymbol(char: string) {
  return char !== "_" && RegExp(/^[\p{P}\p{S}]$/, "u").test(char);
}

import { Iteration } from "./Iteration";
import { StringUnit, LexicalUnit } from "./LexicalUnit";

export function splitLexicalUnits(expressionString: string): LexicalUnit[] {
  // Array.from treats complex characters (e.g., emojis) as one character where others split it.
  let iteration = new Iteration(Array.from(expressionString));
  const units: LexicalUnit[] = [];
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
      units.push({ kind: "alphanumeric", value: currentAlphanum.join("") });
      currentAlphanum = [];
    }
    if (isSymbol(currentChar)) {
      if (isStringDelimiter(currentChar)) {
        const [nextIteration, stringLexicalUnit] = consumeStringUnit(iteration);
        iteration = nextIteration;
        units.push(stringLexicalUnit);
      } else {
        units.push({ kind: "symbol", value: currentChar });
      }
    }
    iteration = iteration.advance();
  }
  // make sure any final alphanumeric sequence becomes a token
  if (currentAlphanum.length > 0) {
    units.push({ kind: "alphanumeric", value: currentAlphanum.join("") });
  }
  return units;
}

function consumeStringUnit(
  initialIteration: Iteration<string>,
): [Iteration<string>, StringUnit] {
  const delimiter = initialIteration.current;
  const contentCharacters: string[] = [];
  let iteration = initialIteration.advance();
  // Iterate up to, but not consuming, the closing delimiter.
  // That way the parent can advance beyond it.
  while (iteration.current !== delimiter) {
    if (iteration.current === "\\") {
      // Backslash escapes next character, so just advance to it
      iteration = iteration.advance();
    }
    contentCharacters.push(iteration.current);
    iteration = iteration.advance();
  }
  return [
    iteration,
    { kind: "string", delimiter, content: contentCharacters.join("") },
  ];
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

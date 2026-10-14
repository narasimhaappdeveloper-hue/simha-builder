/*
 SIMHA Programming Language
 Version 0.1
 Initial Interpreter
*/

"use strict";

const SIMHA = (() => {

  const keywords = {
    "విలువ": "let",
    "చూపించు": "print",
    "let": "let",
    "print": "print"
  };

  function tokenize(source) {
    const pattern =
      /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[A-Za-z_][A-Za-z0-9_]*|[\u0C00-\u0C7F]+|[0-9]+(?:\.[0-9]+)?|==|!=|<=|>=|[=+\-*/():]/gu;

    return source.match(pattern) || [];
  }

  function parseValue(token, variables) {
    if (token === undefined) {
      throw new Error("విలువ ఇవ్వలేదు / Missing value");
    }

    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"))
    ) {
      return token.slice(1, -1);
    }

    if (/^-?\d+(?:\.\d+)?$/.test(token)) {
      return Number(token);
    }

    if (Object.prototype.hasOwnProperty.call(variables, token)) {
      return variables[token];
    }

    throw new Error("తెలియని విలువ / Unknown value: " + token);
  }

  function execute(source) {
    const variables = Object.create(null);
    const output = [];

    const lines = source
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Ignore comments
      if (line.startsWith("//") || line.startsWith("#")) {
        continue;
      }

      // Variable declaration:
      // let age = 25
      // విలువ వయస్సు = 25
      const declaration = line.match(
        /^(?:let|విలువ)\s+([\w\u0C00-\u0C7F]+)\s*=\s*(.+)$/u
      );

      if (declaration) {
        const name = declaration[1];
        const expression = declaration[2].trim();

        const arithmetic = expression.match(
          /^(.+?)\s*([+\-*/])\s*(.+)$/
        );

        let value;

        if (arithmetic) {
          const left = parseValue(
            arithmetic[1].trim(),
            variables
          );

          const right = parseValue(
            arithmetic[3].trim(),
            variables
          );

          const operator = arithmetic[2];

          if (
            typeof left !== "number" ||
            typeof right !== "number"
          ) {
            throw new Error(
              "లెక్కలకు సంఖ్యలు అవసరం / Numbers required"
            );
          }

          if (operator === "+") value = left + right;
          if (operator === "-") value = left - right;
          if (operator === "*") value = left * right;

          if (operator === "/") {
            if (right === 0) {
              throw new Error(
                "సున్నాతో భాగించలేరు / Division by zero"
              );
            }

            value = left / right;
          }
        } else {
          value = parseValue(expression, variables);
        }

        variables[name] = value;
        continue;
      }

      // Print:
      // print(age)
      // చూపించు(వయస్సు)
      const printMatch = line.match(
        /^(?:print|చూపించు)\s*\((.*)\)$/u
      );

      if (printMatch) {
        const argument = printMatch[1].trim();
        output.push(String(parseValue(argument, variables)));
        continue;
      }

      throw new Error(
        `లైన్ ${i + 1} లో తప్పు / Error at line ${i + 1}: ${line}`
      );
    }

    return {
      output,
      variables: { ...variables }
    };
  }

  return {
    version: "0.1.0",
    tokenize,
    execute
  };

})();

// Example program
const example = `
విలువ పేరు = "SIMHA"
విలువ సంఖ్య = 10
విలువ మొత్తం = సంఖ్య + 5
చూపించు(పేరు)
చూపించు(మొత్తం)
`;

try {
  const result = SIMHA.execute(example);

  console.log("SIMHA Language Version:", SIMHA.version);
  console.log("Output:");
  result.output.forEach(value => console.log(value));
} catch (error) {
  console.error("SIMHA Error:", error.message);
}

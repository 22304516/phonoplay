"use client";

import { useState } from "react";

const targetWord = [
  { phoneme: "/θ/", english: "TH" },
  { phoneme: "/ɪ/", english: "I" },
  { phoneme: "/ŋ/", english: "NG" },
];

const phonemes = [
  { symbol: "/θ/", english: "TH", example: "thin" },
  { symbol: "/ð/", english: "TH", example: "this" },
  { symbol: "/ʃ/", english: "SH", example: "ship" },
  { symbol: "/tʃ/", english: "CH", example: "chip" },
  { symbol: "/ɪ/", english: "I", example: "sit" },
  { symbol: "/iː/", english: "EE", example: "see" },
  { symbol: "/ŋ/", english: "NG", example: "sing" },
];

type TileStatus = "correct" | "present" | "incorrect" | "empty";

type Guess = {
  phonemes: string[];
  statuses: TileStatus[];
};

type Difficulty = "easy" | "medium" | "hard";

const difficultySettings = {
  easy: {
    label: "Easy",
    attempts: 6,
    hints: true,
  },
  medium: {
    label: "Medium",
    attempts: 5,
    hints: true,
  },
  hard: {
    label: "Hard",
    attempts: 4,
    hints: false,
  },
};

export default function Wordle() {
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  function addPhoneme(phoneme: string) {
    if (gameOver || currentGuess.length >= targetWord.length) {
      return;
    }

    setCurrentGuess([...currentGuess, phoneme]);
  }

  function deletePhoneme() {
    setCurrentGuess(currentGuess.slice(0, -1));
  }

  function checkAnswer() {
    if (currentGuess.length !== targetWord.length || gameOver) {
      return;
    }

    const statuses: TileStatus[] = currentGuess.map((phoneme, index) => {
      if (phoneme === targetWord[index].phoneme) {
        return "correct";
      }

      if (targetWord.some((item) => item.phoneme === phoneme)) {
        return "present";
      }

      return "incorrect";
    });

    const newGuess = {
      phonemes: currentGuess,
      statuses,
    };

    setGuesses([...guesses, newGuess]);

    const correct = statuses.every((status) => status === "correct");

    if (correct) {
      setWon(true);
      setGameOver(true);
    } else if (guesses.length >= difficultySettings[difficulty].attempts - 1) {
      setGameOver(true);
    }

    setCurrentGuess([]);
  }

  function resetGame() {
    setCurrentGuess([]);
    setGuesses([]);
    setGameOver(false);
    setWon(false);
  }

  function generateHTML() {
    const selectedDifficulty = difficultySettings[difficulty];

    const maxAttempts = selectedDifficulty.attempts;

    const hintsEnabled = selectedDifficulty.hints;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>PhonoPlay Wordle Activity</title>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 30px 15px;
  font-family: Arial, Helvetica, sans-serif;
  background: #f8fafc;
  color: #111827;
  text-align: center;
}

main {
  max-width: 700px;
  margin: auto;
}

h1 {
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
}

.board {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  margin: 30px 0;
}

.row {
  display: flex;
  gap: 8px;
}

.tile {
  width: 70px;
  height: 60px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  font-size: 18px;
  font-weight: bold;
}

.tile.correct {
  background: #22c55e;
  color: white;
  border-color: #22c55e;
}

.tile.present {
  background: #eab308;
  color: white;
  border-color: #eab308;
}

.tile.incorrect {
  background: #6b7280;
  color: white;
  border-color: #6b7280;
}

.keyboard {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  max-width: 600px;
  margin: auto;
}

button {
  min-width: 60px;
  min-height: 48px;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #f3f4f6;
}

.controls {
  margin-top: 10px;
}

.result {
  margin-top: 25px;
  padding: 15px;
  border-radius: 8px;
}

.success {
  background: #dcfce7;
}

.failure {
  background: #f3f4f6;
}

.hint {
  margin-top: 20px;
  color: #6b7280;
}

@media (max-width: 500px) {
  .tile {
    width: 60px;
    height: 55px;
    font-size: 15px;
  }

  button {
    min-width: 55px;
  }
}
</style>
</head>

<body>

<main>

<h1>PhonoPlay Wordle</h1>

<p class="subtitle">
Guess the phoneme-based word.
</p>

<p>
Difficulty:
<strong>${selectedDifficulty.label}</strong>
</p>

<div
  id="board"
  class="board"
  aria-label="Wordle game board">
</div>

<div class="keyboard">

<button
  onclick="addPhoneme('/θ/')"
  title="/θ/ = TH as in thin"
>
/θ/
</button>

<button
  onclick="addPhoneme('/ð/')"
  title="/ð/ = TH as in this"
>
/ð/
</button>

<button
  onclick="addPhoneme('/ʃ/')"
  title="/ʃ/ = SH as in ship"
>
/ʃ/
</button>

<button
  onclick="addPhoneme('/tʃ/')"
  title="/tʃ/ = CH as in chip"
>
/tʃ/
</button>

<button
  onclick="addPhoneme('/ɪ/')"
  title="/ɪ/ = I as in sit"
>
/ɪ/
</button>

<button
  onclick="addPhoneme('/iː/')"
  title="/iː/ = EE as in see"
>
/iː/
</button>

<button
  onclick="addPhoneme('/ŋ/')"
  title="/ŋ/ = NG as in sing"
>
/ŋ/
</button>

</div>

<div class="controls">

<button onclick="deletePhoneme()">
Delete
</button>

<button onclick="checkAnswer()">
Enter
</button>

<button onclick="resetGame()">
Reset
</button>

</div>

${
  hintsEnabled
    ? `
<p class="hint">
  Hover over a phoneme to see its English equivalent.
</p>
`
    : ""
}

<div id="result"></div>

</main>

<script>

const target = ["/θ/", "/ɪ/", "/ŋ/"];

let current = [];

let guesses = [];

const maxAttempts = ${maxAttempts};

function addPhoneme(phoneme) {

  if (current.length >= 3) {
    return;
  }

  current.push(phoneme);

  render();

}

function deletePhoneme() {

  current.pop();

  render();

}

function checkAnswer() {

  if (current.length !== 3) {

    showResult(
      "Please enter three phonemes.",
      "failure"
    );

    return;

  }

  const statuses = current.map((phoneme, index) => {

    if (phoneme === target[index]) {
      return "correct";
    }

    if (target.includes(phoneme)) {
      return "present";
    }

    return "incorrect";

  });

  guesses.push({
    phonemes: [...current],
    statuses
  });

  const correct =
    statuses.every(status => status === "correct");

  current = [];

  render();

  if (correct) {

    showResult(
      "Correct! /θɪŋ/ → THING",
      "success"
    );

    disableKeyboard();

    return;

  }

  if (guesses.length >= maxAttempts) {

    showResult(
      "Activity complete. The answer was /θɪŋ/ → THING.",
      "failure"
    );

    disableKeyboard();

  }

}

function render() {

  const board =
    document.getElementById("board");

  board.innerHTML = "";

  for (
    let rowIndex = 0;
    rowIndex < maxAttempts;
    rowIndex++
  ) {

    const row =
      document.createElement("div");

    row.className = "row";

    const guess = guesses[rowIndex];

    for (
      let tileIndex = 0;
      tileIndex < 3;
      tileIndex++
    ) {

      const tile =
        document.createElement("div");

      tile.className = "tile";

      if (guess) {

        tile.textContent =
          guess.phonemes[tileIndex];

        tile.classList.add(
          guess.statuses[tileIndex]
        );

      } else if (
        rowIndex === guesses.length
      ) {

        tile.textContent =
          current[tileIndex] || "";

      }

      row.appendChild(tile);

    }

    board.appendChild(row);

  }

}

function showResult(message, type) {

  const result =
    document.getElementById("result");

  result.textContent = message;

  result.className =
    "result " + type;

}

function resetGame() {

  current = [];

  guesses = [];

  const result =
    document.getElementById("result");

  result.textContent = "";

  result.className = "result";

  enableKeyboard();

  render();

}

function disableKeyboard() {

  document
    .querySelectorAll(".keyboard button")
    .forEach(button => {
      button.disabled = true;
    });

}

function enableKeyboard() {

  document
    .querySelectorAll(".keyboard button")
    .forEach(button => {
      button.disabled = false;
    });

}

render();

</script>

</body>
</html>
`;

    const blob = new Blob([html], { type: "text/html" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "phonoplay-wordle.html";

    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="wordle-page">
      <section className="page-header">
        <h1>Wordle Activity Builder</h1>

        <p>
          Create a phoneme-based Wordle activity for Speech Pathology
          classrooms.
        </p>
      </section>

      <section className="builder">
        <aside className="settings-panel">
          <h2>Activity Settings</h2>

          <div className="setting-group">
            <label htmlFor="difficulty">
              <strong>Difficulty</strong>
            </label>

            <select
              id="difficulty"
              value={difficulty}
              onChange={(event) => {
                setDifficulty(event.target.value as Difficulty);
                resetGame();
              }}
            >
              <option value="easy">Easy (6 attempts)</option>

              <option value="medium">Medium (5 attempts)</option>

              <option value="hard">Hard (4 attempts)</option>
            </select>
          </div>

          <p>
            <strong>Target length:</strong> 3 phonemes
          </p>

          <p>
            <strong>Attempts:</strong> {difficultySettings[difficulty].attempts}
          </p>

          <p>
            <strong>Hints:</strong>{" "}
            {difficultySettings[difficulty].hints ? "Enabled" : "Disabled"}
          </p>

          <button onClick={resetGame}>Reset Activity</button>
        </aside>

        <section className="preview-panel">
          <h2>Activity Preview</h2>

          <p>Select phonemes to build your answer.</p>

          <div className="wordle-board">
            {Array.from({
              length: difficultySettings[difficulty].attempts,
            }).map((_, rowIndex) => {
              const guess = guesses[rowIndex];

              return (
                <div className="wordle-row" key={rowIndex}>
                  {Array.from({ length: 3 }).map((_, tileIndex) => {
                    const phoneme =
                      guess?.phonemes[tileIndex] ??
                      (rowIndex === guesses.length
                        ? currentGuess[tileIndex]
                        : "");

                    const status = guess?.statuses[tileIndex] ?? "empty";

                    return (
                      <div className={`phoneme-tile ${status}`} key={tileIndex}>
                        {phoneme}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="phoneme-keyboard">
            {phonemes.map((item) => (
              <button
                key={item.symbol}
                onClick={() => addPhoneme(item.symbol)}
                title={`${item.symbol} = ${item.english} as in ${item.example}`}
                aria-label={`${item.symbol}, ${item.english} as in ${item.example}`}
              >
                <span>{item.symbol}</span>
              </button>
            ))}

            <button onClick={deletePhoneme}>Delete</button>

            <button onClick={checkAnswer}>Enter</button>
          </div>

          {difficultySettings[difficulty].hints && (
            <div className="phoneme-hint">
              <strong>Phoneme hints:</strong> Hover over or focus a phoneme to
              see its English equivalent and an example word.
            </div>
          )}

          {won && (
            <div className="success-message" role="status" aria-live="polite">
              <strong>Correct!</strong>

              <p>
                /θɪŋ/ → <strong>THING</strong>
              </p>
            </div>
          )}

          {gameOver && !won && (
            <div className="failure-message" role="status" aria-live="polite">
              <strong>Activity complete.</strong>

              <p>
                The answer was /θɪŋ/ → <strong>THING</strong>
              </p>
            </div>
          )}
        </section>
      </section>

      <section className="generate-section">
        <button className="generate-button" onClick={generateHTML}>
          Generate HTML
        </button>
      </section>
    </div>
  );
}

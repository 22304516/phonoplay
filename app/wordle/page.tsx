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

export default function Wordle() {
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

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
    } else if (guesses.length >= 5) {
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
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>PhonoPlay Wordle</title>

<style>
* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: #f5f7fa;
  color: #111827;
  text-align: center;
  padding: 30px 15px;
}

h1 {
  margin-bottom: 5px;
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
  width: 60px;
  height: 60px;
  border: 2px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  background: white;
  border-radius: 4px;
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
  max-width: 650px;
  margin: auto;
}

.keyboard button {
  padding: 12px;
  margin: 4px;
  cursor: pointer;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 16px;
}

.keyboard button:hover {
  background: #e5e7eb;
}

.control-button {
  background: #2563eb !important;
  color: white;
  border-color: #2563eb !important;
}

#result {
  margin-top: 20px;
  font-size: 18px;
  font-weight: bold;
}

.hint {
  color: #6b7280;
  margin-top: 15px;
}

@media (max-width: 500px) {
  .tile {
    width: 50px;
    height: 50px;
    font-size: 15px;
  }
}
</style>
</head>

<body>

<h1>PhonoPlay Wordle</h1>

<p class="subtitle">
Guess the phoneme-based word.
</p>

<div class="board" id="board"></div>

<div class="keyboard">

<button title="/θ/ = TH as in thin" onclick="add('/θ/')">/θ/</button>
<button title="/ð/ = TH as in this" onclick="add('/ð/')">/ð/</button>
<button title="/ʃ/ = SH as in ship" onclick="add('/ʃ/')">/ʃ/</button>
<button title="/tʃ/ = CH as in chip" onclick="add('/tʃ/')">/tʃ/</button>
<button title="/ɪ/ = I as in sit" onclick="add('/ɪ/')">/ɪ/</button>
<button title="/iː/ = EE as in see" onclick="add('/iː/')">/iː/</button>
<button title="/ŋ/ = NG as in sing" onclick="add('/ŋ/')">/ŋ/</button>

<br>

<button onclick="removeLast()">Delete</button>
<button class="control-button" onclick="check()">Enter</button>
<button onclick="reset()">Reset</button>

</div>

<p class="hint">
Hover over a phoneme to see its English equivalent.
</p>

<p id="result"></p>

<script>

const target = ["/θ/", "/ɪ/", "/ŋ/"];

let current = [];
let guesses = [];

function createBoard() {

  const board = document.getElementById("board");

  board.innerHTML = "";

  for (let rowIndex = 0; rowIndex < 6; rowIndex++) {

    const row = document.createElement("div");

    row.className = "row";

    for (let columnIndex = 0; columnIndex < 3; columnIndex++) {

      const tile = document.createElement("div");

      tile.className = "tile";

      if (guesses[rowIndex]) {

        const phoneme = guesses[rowIndex].phonemes[columnIndex];

        tile.textContent = phoneme;

        tile.classList.add(
          guesses[rowIndex].statuses[columnIndex]
        );

      }

      else if (rowIndex === guesses.length) {

        tile.textContent =
          current[columnIndex] || "";

      }

      row.appendChild(tile);

    }

    board.appendChild(row);

  }

}

function add(phoneme) {

  if (current.length < 3 && guesses.length < 6) {

    current.push(phoneme);

    createBoard();

  }

}

function removeLast() {

  current.pop();

  createBoard();

}

function check() {

  const result = document.getElementById("result");

  if (current.length !== 3) {

    result.textContent =
      "Please enter three phonemes.";

    return;

  }

  const statuses = [];

  for (let i = 0; i < target.length; i++) {

    if (current[i] === target[i]) {

      statuses.push("correct");

    }

    else if (target.includes(current[i])) {

      statuses.push("present");

    }

    else {

      statuses.push("incorrect");

    }

  }

  guesses.push({
    phonemes: [...current],
    statuses: statuses
  });

  const correct =
    statuses.every(status => status === "correct");

  if (correct) {

    result.innerHTML =
      "Correct! /θɪŋ/ → <strong>THING</strong>";

  }

  else if (guesses.length >= 6) {

    result.innerHTML =
      "Activity complete. The answer was /θɪŋ/ → <strong>THING</strong>";

  }

  else {

    result.textContent =
      "Not quite. Try again!";

  }

  current = [];

  createBoard();

}

function reset() {

  current = [];

  guesses = [];

  document.getElementById("result").textContent = "";

  createBoard();

}

createBoard();

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

          <p>
            <strong>Target length:</strong> 3 phonemes
          </p>

          <p>
            <strong>Attempts:</strong> 6
          </p>

          <button onClick={resetGame}>Reset Activity</button>
        </aside>

        <section className="preview-panel">
          <h2>Activity Preview</h2>

          <p>
            Select phonemes to build your answer.
          </p>

          <div className="wordle-board">
            {Array.from({ length: 6 }).map((_, rowIndex) => {
              const guess = guesses[rowIndex];

              return (
                <div className="wordle-row" key={rowIndex}>
                  {Array.from({ length: 3 }).map((_, tileIndex) => {
                    const phoneme =
                      guess?.phonemes[tileIndex] ??
                      (rowIndex === guesses.length
                        ? currentGuess[tileIndex]
                        : "");

                    const status =
                      guess?.statuses[tileIndex] ?? "empty";

                    return (
                      <div
                        className={`phoneme-tile ${status}`}
                        key={tileIndex}
                      >
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
                {item.symbol}
              </button>
            ))}

            <button onClick={deletePhoneme}>
              Delete
            </button>

            <button onClick={checkAnswer}>
              Enter
            </button>
          </div>

          <p className="phoneme-hint">
            Hover over a phoneme to see its English equivalent and example.
          </p>

          {won && (
            <div className="success-message">
              <strong>Correct!</strong>

              <p>
                /θɪŋ/ → <strong>THING</strong>
              </p>
            </div>
          )}

          {gameOver && !won && (
            <div className="failure-message">
              <strong>Activity complete.</strong>

              <p>
                The answer was /θɪŋ/ → <strong>THING</strong>
              </p>
            </div>
          )}
        </section>
      </section>

      <section className="generate-section">
        <button
          className="generate-button"
          onClick={generateHTML}
        >
          Generate HTML
        </button>
      </section>
    </div>
  );
}
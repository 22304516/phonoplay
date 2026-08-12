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
body {
  font-family: Arial, sans-serif;
  background: #f5f7fa;
  text-align: center;
  padding: 40px 20px;
}

h1 {
  margin-bottom: 10px;
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
  border: 2px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}

.keyboard {
  max-width: 600px;
  margin: auto;
}

button {
  padding: 12px;
  margin: 4px;
  cursor: pointer;
}
</style>
</head>

<body>
<h1>PhonoPlay Wordle</h1>
<p>Guess the phoneme-based word.</p>

<div class="board" id="board"></div>

<div class="keyboard">
<button onclick="add('/θ/')">/θ/</button>
<button onclick="add('/ð/')">/ð/</button>
<button onclick="add('/ʃ/')">/ʃ/</button>
<button onclick="add('/tʃ/')">/tʃ/</button>
<button onclick="add('/ɪ/')">/ɪ/</button>
<button onclick="add('/iː/')">/iː/</button>
<button onclick="add('/ŋ/')">/ŋ/</button>
<br>
<button onclick="removeLast()">Delete</button>
<button onclick="check()">Check Answer</button>
<button onclick="reset()">Reset</button>
</div>

<p id="result"></p>

<script>
const target = ["/θ/", "/ɪ/", "/ŋ/"];
let current = [];

function add(phoneme) {
  if (current.length < 3) {
    current.push(phoneme);
    render();
  }
}

function removeLast() {
  current.pop();
  render();
}

function render() {
  const board = document.getElementById("board");

  board.innerHTML = "";

  const row = document.createElement("div");
  row.className = "row";

  for (let i = 0; i < 3; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = current[i] || "";
    row.appendChild(tile);
  }

  board.appendChild(row);
}

function check() {
  if (current.length !== 3) {
    document.getElementById("result").textContent =
      "Please enter three phonemes.";
    return;
  }

  if (JSON.stringify(current) === JSON.stringify(target)) {
    document.getElementById("result").textContent =
      "Correct! The English equivalent is THING.";
  } else {
    document.getElementById("result").textContent =
      "Not quite. Try again!";
  }
}

function reset() {
  current = [];
  document.getElementById("result").textContent = "";
  render();
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
"use client";

import { useEffect, useState } from "react";

type DatabaseWord = {
  id: number;
  english: string;
  phoneme: string;
  phonemes: {
    id: number;
    symbol: string;
    position: number;
  }[];
};

type DatabaseActivity = {
  id: number;
  name: string;
  type: "WORDLE" | "WORD_SEARCH";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  hint: boolean;
  wordId: number | null;
  word: DatabaseWord | null;
};

type WordleProps = {
  activityId?: string;
};

type PhonemeOption = {
  symbol: string;
  english: string;
  example: string;
};

const defaultPhonemes: PhonemeOption[] = [
  { symbol: "/θ/", english: "TH", example: "thin" },
  { symbol: "/ð/", english: "TH", example: "this" },
  { symbol: "/ʃ/", english: "SH", example: "ship" },
  { symbol: "/tʃ/", english: "CH", example: "chip" },
  { symbol: "/ɪ/", english: "I", example: "sit" },
  { symbol: "/iː/", english: "EE", example: "see" },
  { symbol: "/ŋ/", english: "NG", example: "sing" },
  { symbol: "/n/", english: "N", example: "win" },
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

export default function Wordle({ activityId }: WordleProps) {
  const [databaseWords, setDatabaseWords] = useState<DatabaseWord[]>([]);
  const [targetDatabaseWord, setTargetDatabaseWord] =
    useState<DatabaseWord | null>(null);

  const [activity, setActivity] = useState<DatabaseActivity | null>(null);

  const [activityName, setActivityName] = useState("");
  const [activityDifficulty, setActivityDifficulty] =
    useState<Difficulty>("easy");
  const [activityHint, setActivityHint] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const targetWord =
    activityId && targetDatabaseWord
      ? targetDatabaseWord.phonemes
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((phoneme) => ({
            phoneme: phoneme.symbol,
            english: targetDatabaseWord.english,
          }))
      : [
          { phoneme: "/θ/", english: "THING" },
          { phoneme: "/ɪ/", english: "THING" },
          { phoneme: "/n/", english: "THING" },
        ];

  const keyboardPhonemes: PhonemeOption[] = activityId
    ? Array.from(
        new Set([
          ...defaultPhonemes.map((item) => item.symbol),
          ...databaseWords.flatMap((word) =>
            word.phonemes.map((phoneme) => phoneme.symbol),
          ),
        ]),
      ).map((symbol) => {
        const existing = defaultPhonemes.find((item) => item.symbol === symbol);

        return (
          existing ?? {
            symbol,
            english: symbol,
            example: "",
          }
        );
      })
    : defaultPhonemes;

  useEffect(() => {
    if (!activityId) {
      return;
    }

    async function loadActivity() {
      try {
        setLoadingActivity(true);

        const response = await fetch(
          `/api/word-lists/7/activities/${activityId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load activity");
        }

        const data = await response.json();

        setActivity(data);
        setDatabaseWords(data.wordList.words);
        setTargetDatabaseWord(data.word ?? null);

        if (data.difficulty) {
          setDifficulty(
            data.difficulty.toLowerCase() as "easy" | "medium" | "hard",
          );
        }

        if (typeof data.hint === "boolean") {
          setActivityHint(data.hint);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingActivity(false);
      }
    }

    loadActivity();
  }, [activityId]);

  useEffect(() => {
    if (activityId) {
      setDifficulty(activityDifficulty);
    }
  }, [activityId, activityDifficulty]);

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

    const hintsEnabled = activityId ? activityHint : selectedDifficulty.hints;

    const generatedTarget = targetWord.map((item) => item.phoneme);
    const generatedEnglish = targetWord[0]?.english || "WORD";

    const generatedKeyboard = keyboardPhonemes
      .map((item) => {
        const title =
          item.example.length > 0
            ? `${item.symbol} = ${item.english} as in ${item.example}`
            : item.symbol;

        return `
<button
  onclick="addPhoneme(${JSON.stringify(item.symbol)})"
  title=${JSON.stringify(title)}
>
  ${item.symbol}
</button>`;
      })
      .join("");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PhonoPlay Wordle Activity</title>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background: #f5f5f5;
}

main {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

h1 {
  margin-bottom: 8px;
}

.subtitle {
  margin-bottom: 20px;
}

.board {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  margin: 25px 0;
}

.row {
  display: flex;
  gap: 8px;
}

.tile {
  width: 55px;
  height: 55px;
  border: 2px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  background: white;
}

.tile.correct {
  background: #6aaa64;
  color: white;
  border-color: #6aaa64;
}

.tile.present {
  background: #c9b458;
  color: white;
  border-color: #c9b458;
}

.tile.incorrect {
  background: #787c7e;
  color: white;
  border-color: #787c7e;
}

.keyboard {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  max-width: 700px;
  margin: 20px auto;
}

.keyboard button {
  padding: 12px 16px;
  font-size: 18px;
  cursor: pointer;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.controls button {
  padding: 10px 18px;
  cursor: pointer;
}

.result {
  margin-top: 20px;
  font-weight: bold;
}

.result.success {
  color: #2e7d32;
}

.result.failure {
  color: #c62828;
}

.hint {
  margin-top: 20px;
  font-size: 14px;
}
</style>
</head>

<body>
<main>

<h1>${activityName || "PhonoPlay Wordle"}</h1>

<p class="subtitle">
Guess the phoneme-based word.
</p>

<p>
Difficulty: <strong>${selectedDifficulty.label}</strong>
</p>

<div id="board" class="board"></div>

<div class="keyboard">
${generatedKeyboard}
</div>

<div class="controls">
<button onclick="deletePhoneme()">Delete</button>
<button onclick="checkAnswer()">Enter</button>
<button onclick="resetGame()">Reset</button>
</div>

${
  hintsEnabled
    ? `<p class="hint">
Hover over a phoneme to see its English equivalent.
</p>`
    : ""
}

<div id="result"></div>

</main>

<script>
const target = ${JSON.stringify(generatedTarget)};
let current = [];
let guesses = [];
const maxAttempts = ${maxAttempts};

function addPhoneme(phoneme) {
  if (current.length >= target.length) return;

  current.push(phoneme);
  render();
}

function deletePhoneme() {
  current.pop();
  render();
}

function checkAnswer() {
  if (current.length !== target.length) {
    showResult(
      "Please enter " + target.length + " phonemes.",
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

  const correct = statuses.every(
    status => status === "correct"
  );

  current = [];

  render();

  if (correct) {
    showResult(
      "Correct! " +
      target.join("") +
      " → " +
      ${JSON.stringify(generatedEnglish)},
      "success"
    );

    disableKeyboard();
    return;
  }

  if (guesses.length >= maxAttempts) {
    showResult(
      "Activity complete. The answer was " +
      target.join("") +
      " → " +
      ${JSON.stringify(generatedEnglish)} +
      ".",
      "failure"
    );

    disableKeyboard();
  }
}

function render() {
  const board = document.getElementById("board");

  board.innerHTML = "";

  for (
    let rowIndex = 0;
    rowIndex < maxAttempts;
    rowIndex++
  ) {
    const row = document.createElement("div");

    row.className = "row";

    const guess = guesses[rowIndex];

    for (
      let tileIndex = 0;
      tileIndex < target.length;
      tileIndex++
    ) {
      const tile = document.createElement("div");

      tile.className = "tile";

      if (guess) {
        tile.textContent =
          guess.phonemes[tileIndex];

        tile.classList.add(
          guess.statuses[tileIndex]
        );
      } else if (rowIndex === guesses.length) {
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

    const blob = new Blob([html], {
      type: "text/html",
    });

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
        <h1>
          {activityId && activityName
            ? activityName
            : "Wordle Activity Builder"}
        </h1>

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
            <strong>Target length:</strong> {targetWord.length} phonemes
          </p>

          <p>
            <strong>Attempts:</strong> {difficultySettings[difficulty].attempts}
          </p>

          <p>
            <strong>Hints:</strong>{" "}
            {(activityId ? activityHint : difficultySettings[difficulty].hints)
              ? "Enabled"
              : "Disabled"}
          </p>

          <button onClick={resetGame}>Reset Activity</button>
        </aside>

        <section className="preview-panel">
          <h2>Activity Preview</h2>

          {loadingActivity && <p>Loading activity...</p>}

          <p>Select phonemes to build your answer.</p>

          <div className="wordle-board">
            {Array.from({
              length: difficultySettings[difficulty].attempts,
            }).map((_, rowIndex) => {
              const guess = guesses[rowIndex];

              return (
                <div className="wordle-row" key={rowIndex}>
                  {Array.from({
                    length: targetWord.length,
                  }).map((_, tileIndex) => {
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
            {keyboardPhonemes.map((item) => (
              <button
                key={item.symbol}
                onClick={() => addPhoneme(item.symbol)}
                title={
                  !activityId || activity?.hint
                    ? item.example
                      ? `${item.symbol} = ${item.english} as in ${item.example}`
                      : item.symbol
                    : undefined
                }
                aria-label={
                  !activityId || activity?.hint
                    ? item.example
                      ? `${item.symbol}, ${item.english} as in ${item.example}`
                      : item.symbol
                    : item.symbol
                }
              >
                <span>{item.symbol}</span>
              </button>
            ))}
            <button onClick={deletePhoneme}>Delete</button>

            <button onClick={checkAnswer}>Enter</button>
          </div>

          {(activityId
            ? activityHint
            : difficultySettings[difficulty].hints) && (
            <div className="phoneme-hint">
              <strong>Phoneme hints:</strong> Hover over or focus a phoneme to
              see its English equivalent and an example word.
            </div>
          )}

          {won && (
            <div className="success-message" role="status" aria-live="polite">
              <strong>Correct!</strong>

              <p>
                {targetWord.map((item) => item.phoneme).join("")} →{" "}
                <strong>{targetWord[0]?.english}</strong>
              </p>
            </div>
          )}

          {gameOver && !won && (
            <div className="failure-message" role="status" aria-live="polite">
              <strong>Activity complete.</strong>

              <p>
                The answer was {targetWord.map((item) => item.phoneme).join("")}{" "}
                → <strong>{targetWord[0]?.english}</strong>
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

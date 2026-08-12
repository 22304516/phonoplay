"use client";

import { useState } from "react";

const words = [
  { phoneme: "/θɪn/", english: "THIN" },
  { phoneme: "/ʃɪp/", english: "SHIP" },
  { phoneme: "/tʃɪp/", english: "CHIP" },
  { phoneme: "/sɪŋ/", english: "SING" },
  { phoneme: "/ðɪs/", english: "THIS" },
];

const grid = [
  ["T", "H", "I", "N", "S", "H", "I"],
  ["A", "C", "H", "I", "P", "P", "T"],
  ["S", "I", "N", "G", "O", "E", "H"],
  ["T", "H", "I", "S", "R", "L", "I"],
  ["M", "A", "T", "H", "I", "N", "N"],
  ["P", "H", "O", "N", "E", "M", "E"],
  ["S", "H", "I", "P", "A", "B", "C"],
];

export default function WordSearch() {
  const [selected, setSelected] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);

  function selectCell(row: number, column: number) {
    const cell = `${row}-${column}`;

    if (selected.includes(cell)) {
      setSelected(selected.filter((item) => item !== cell));
    } else {
      setSelected([...selected, cell]);
    }
  }

  function checkSelection() {
    const selectedLetters = selected
      .map((cell) => {
        const [row, column] = cell.split("-").map(Number);
        return grid[row][column];
      })
      .join("");

    const matchingWord = words.find(
      (word) => word.english === selectedLetters
    );

    if (matchingWord && !foundWords.includes(matchingWord.english)) {
      setFoundWords([...foundWords, matchingWord.english]);
      setSelected([]);
    } else {
      alert("That selection does not match a word.");
    }
  }

  function resetPuzzle() {
    setSelected([]);
    setFoundWords([]);
  }

function generateHTML() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>PhonoPlay Word Search Activity</title>

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
  max-width: 800px;
  margin: auto;
}

.subtitle {
  color: #6b7280;
}

.word-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 25px 0;
}

.word {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
}

.word.found {
  background: #dcfce7;
  border-color: #22c55e;
  text-decoration: line-through;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 55px);
  gap: 5px;
  justify-content: center;
  margin: 30px auto;
}

.cell {
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  background: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.cell:hover {
  background: #f3f4f6;
}

.cell.selected {
  background: #bfdbfe;
  border-color: #2563eb;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

button {
  min-height: 44px;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-weight: 600;
}

button:hover {
  background: #f3f4f6;
}

.primary {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.primary:hover {
  background: #1d4ed8;
}

.result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  background: #dcfce7;
}

.hint {
  margin-top: 20px;
  color: #6b7280;
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: repeat(7, 40px);
    gap: 4px;
  }

  .cell {
    width: 40px;
    height: 40px;
    font-size: 13px;
  }
}
</style>
</head>

<body>

<main>

<h1>PhonoPlay Word Search</h1>

<p class="subtitle">
Find the phoneme-based words hidden in the grid.
</p>

<div
  id="wordList"
  class="word-list">
</div>

<div
  id="grid"
  class="grid"
  aria-label="Word search grid">
</div>

<div class="controls">

<button
  class="primary"
  onclick="checkSelection()">
  Check Selection
</button>

<button onclick="resetGame()">
  Reset
</button>

</div>

<div
  id="result"
  class="result"
  style="display:none;"
  role="status"
  aria-live="polite">
</div>

<p class="hint">
Select the letters belonging to a phoneme word,
then choose Check Selection.
</p>

</main>

<script>

const words = [
  {
    phoneme: "/θɪn/",
    english: "THIN"
  },
  {
    phoneme: "/ʃɪp/",
    english: "SHIP"
  },
  {
    phoneme: "/tʃɪp/",
    english: "CHIP"
  },
  {
    phoneme: "/sɪŋ/",
    english: "SING"
  },
  {
    phoneme: "/ðɪs/",
    english: "THIS"
  }
];

const gridData = [
  ["T", "H", "I", "N", "S", "H", "I"],
  ["A", "C", "H", "I", "P", "P", "T"],
  ["S", "I", "N", "G", "O", "E", "H"],
  ["T", "H", "I", "S", "R", "L", "I"],
  ["M", "A", "T", "H", "I", "N", "N"],
  ["P", "H", "O", "N", "E", "M", "E"],
  ["S", "H", "I", "P", "A", "B", "C"]
];

let selected = [];

let foundWords = [];

function renderWords() {

  const container =
    document.getElementById("wordList");

  container.innerHTML = "";

  words.forEach((word, index) => {

    const element =
      document.createElement("div");

    element.className = "word";

    if (foundWords.includes(index)) {
      element.classList.add("found");
    }

    element.textContent =
      word.phoneme + " → " + word.english;

    container.appendChild(element);

  });

}

function renderGrid() {

  const grid =
    document.getElementById("grid");

  grid.innerHTML = "";

  gridData.forEach((row, rowIndex) => {

    row.forEach((letter, columnIndex) => {

      const button =
        document.createElement("button");

      button.className = "cell";

      button.textContent = letter;

      button.setAttribute(
        "aria-label",
        "Row " +
        (rowIndex + 1) +
        ", Column " +
        (columnIndex + 1) +
        ", letter " +
        letter
      );

      button.setAttribute(
        "aria-pressed",
        selected.some(
          cell =>
            cell.row === rowIndex &&
            cell.column === columnIndex
        )
      );

      const selectedCell =
        selected.some(
          cell =>
            cell.row === rowIndex &&
            cell.column === columnIndex
        );

      if (selectedCell) {
        button.classList.add("selected");
      }

      button.onclick = () =>
        toggleCell(
          rowIndex,
          columnIndex
        );

      grid.appendChild(button);

    });

  });

}

function toggleCell(row, column) {

  const index =
    selected.findIndex(
      cell =>
        cell.row === row &&
        cell.column === column
    );

  if (index >= 0) {

    selected.splice(index, 1);

  } else {

    selected.push({
      row,
      column
    });

  }

  renderGrid();

}

function checkSelection() {

  const letters =
    selected
      .map(
        cell =>
          gridData[cell.row][cell.column]
      )
      .join("");

  const normalised =
    letters.toUpperCase();

  const wordIndex =
    words.findIndex(
      word =>
        word.english === normalised &&
        !foundWords.includes(
          words.indexOf(word)
        )
    );

  const result =
    document.getElementById("result");

  result.style.display = "block";

  if (wordIndex >= 0) {

    foundWords.push(wordIndex);

    result.textContent =
      "Correct! " +
      words[wordIndex].phoneme +
      " → " +
      words[wordIndex].english;

    selected = [];

    renderWords();
    renderGrid();

    if (foundWords.length === words.length) {

      result.textContent =
        "Excellent! You found all five words.";

    }

  } else {

    result.textContent =
      "That selection does not match a word. Try again.";

  }

}

function resetGame() {

  selected = [];

  foundWords = [];

  const result =
    document.getElementById("result");

  result.style.display = "none";

  result.textContent = "";

  renderWords();
  renderGrid();

}

renderWords();
renderGrid();

</script>

</body>
</html>
`;

  const blob = new Blob(
    [html],
    { type: "text/html" }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    "phonoplay-word-search.html";

  link.click();

  URL.revokeObjectURL(url);
}

  return (
    <div className="word-search-page">
      <section className="page-header">
        <h1>Word Search Activity Builder</h1>

        <p>
          Create a phoneme-based word search activity for your classroom.
        </p>
      </section>

      <section className="builder">
        <aside className="settings-panel">
          <h2>Word List</h2>

          <p>
            Select the phonemes and find their English equivalents in
            the puzzle.
          </p>

          <ul className="phoneme-word-list">
            {words.map((word) => (
              <li key={word.english}>
                <strong>{word.phoneme}</strong>
                <span> → {word.english}</span>

                {foundWords.includes(word.english) && (
                  <span className="found-label"> Found</span>
                )}
              </li>
            ))}
          </ul>

          <button onClick={resetPuzzle}>
            Reset Puzzle
          </button>
        </aside>

        <section className="preview-panel">
          <h2>Activity Preview</h2>

          <p>
            Select the letters that form one of the listed words.
          </p>

          <div className="word-search-grid">
            {grid.map((row, rowIndex) =>
              row.map((letter, columnIndex) => {
                const cell = `${rowIndex}-${columnIndex}`;
                const isSelected = selected.includes(cell);

                return (
                  <button
                    key={cell}
                    className={`search-cell ${
                        isSelected ? "selected" : ""
                    }`}
                    aria-pressed={isSelected}
                    onClick={() =>
                      selectCell(rowIndex, columnIndex)
                    }
                    aria-label={`Row ${rowIndex + 1}, Column ${
                      columnIndex + 1
                    }, letter ${letter}`}
                  >
                    {letter}
                  </button>
                );
              })
            )}
          </div>

          <div className="word-search-controls">
            <button onClick={checkSelection}>
              Check Selection
            </button>

            <button onClick={resetPuzzle}>
              Reset
            </button>
          </div>

          <p className="phoneme-hint">
            Select the letters of a word, then check your selection.
          </p>
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
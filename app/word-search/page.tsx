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
<title>PhonoPlay Word Search</title>

<style>
body {
  font-family: Arial, sans-serif;
  background: #f5f7fa;
  text-align: center;
  padding: 30px 15px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 50px);
  gap: 5px;
  justify-content: center;
  margin: 30px auto;
}

.cell {
  width: 50px;
  height: 50px;
  border: 1px solid #ccc;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
}

.cell.selected {
  background: #bfdbfe;
}

button {
  padding: 10px 15px;
  margin: 5px;
  cursor: pointer;
}

.word-list {
  max-width: 400px;
  margin: auto;
}
</style>
</head>

<body>

<h1>PhonoPlay Word Search</h1>

<p>Find the English words represented by the phonemes.</p>

<div class="grid" id="grid"></div>

<div class="word-list">
<h2>Phoneme Words</h2>
<ul>
<li>/θɪn/ → THIN</li>
<li>/ʃɪp/ → SHIP</li>
<li>/tʃɪp/ → CHIP</li>
<li>/sɪŋ/ → SING</li>
<li>/ðɪs/ → THIS</li>
</ul>
</div>

<button onclick="reset()">Reset</button>

<script>
const letters = [
["T","H","I","N","S","H","I"],
["A","C","H","I","P","P","T"],
["S","I","N","G","O","E","H"],
["T","H","I","S","R","L","I"],
["M","A","T","H","I","N","N"],
["P","H","O","N","E","M","E"],
["S","H","I","P","A","B","C"]
];

let selected = [];

function render() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  letters.forEach((row, rowIndex) => {
    row.forEach((letter, columnIndex) => {

      const cell = document.createElement("button");

      cell.className = "cell";
      cell.textContent = letter;

      cell.onclick = function() {
        const id = rowIndex + "-" + columnIndex;

        if (selected.includes(id)) {
          selected = selected.filter(item => item !== id);
          cell.classList.remove("selected");
        } else {
          selected.push(id);
          cell.classList.add("selected");
        }
      };

      grid.appendChild(cell);
    });
  });
}

function reset() {
  selected = [];
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
    link.download = "phonoplay-word-search.html";
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
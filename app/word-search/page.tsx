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
  border: 2px solid #d1d5db;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  cursor: pointer;
  border-radius: 5px;
}

.cell:hover {
  background: #e5e7eb;
}

.cell.selected {
  background: #93c5fd;
  border-color: #2563eb;
}

.word-list {
  max-width: 450px;
  margin: 30px auto;
  text-align: left;
}

.word-list li {
  margin-bottom: 10px;
}

.found {
  color: #16a34a;
  font-weight: bold;
}

.controls {
  margin-top: 20px;
}

button.control {
  padding: 11px 16px;
  margin: 5px;
  cursor: pointer;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
}

button.primary {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

#result {
  margin-top: 20px;
  font-weight: bold;
}

@media (max-width: 500px) {

  .grid {
    grid-template-columns: repeat(7, 40px);
    gap: 3px;
  }

  .cell {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }

}

</style>

</head>

<body>

<h1>PhonoPlay Word Search</h1>

<p class="subtitle">
Find the English words represented by the phonemes.
</p>

<div class="grid" id="grid"></div>

<div class="word-list">

<h2>Phoneme Words</h2>

<ul>

<li id="word-THIN">
/θɪn/ → <strong>THIN</strong>
</li>

<li id="word-SHIP">
/ʃɪp/ → <strong>SHIP</strong>
</li>

<li id="word-CHIP">
/tʃɪp/ → <strong>CHIP</strong>
</li>

<li id="word-SING">
/sɪŋ/ → <strong>SING</strong>
</li>

<li id="word-THIS">
/ðɪs/ → <strong>THIS</strong>
</li>

</ul>

</div>

<div class="controls">

<button class="control primary" onclick="checkSelection()">
Check Selection
</button>

<button class="control" onclick="reset()">
Reset
</button>

</div>

<p id="result"></p>

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

const phonemeWords = {

"THIN": "/θɪn/",
"SHIP": "/ʃɪp/",
"CHIP": "/tʃɪp/",
"SING": "/sɪŋ/",
"THIS": "/ðɪs/"

};

let selected = [];
let found = [];

function render() {

const grid = document.getElementById("grid");

grid.innerHTML = "";

letters.forEach((row, rowIndex) => {

row.forEach((letter, columnIndex) => {

const cell = document.createElement("button");

cell.className = "cell";

cell.textContent = letter;

cell.setAttribute(
"aria-label",
"Row " +
(rowIndex + 1) +
", Column " +
(columnIndex + 1) +
", Letter " +
letter
);

cell.onclick = function() {

const id =
rowIndex + "-" + columnIndex;

if (selected.includes(id)) {

selected =
selected.filter(item => item !== id);

cell.classList.remove("selected");

}

else {

selected.push(id);

cell.classList.add("selected");

}

};

grid.appendChild(cell);

});

});

}

function checkSelection() {

const result =
document.getElementById("result");

const selectedLetters = selected
.map(cell => {

const parts =
cell.split("-");

return letters[
Number(parts[0])
][
Number(parts[1])
];

})
.join("");

if (phonemeWords[selectedLetters]) {

if (!found.includes(selectedLetters)) {

found.push(selectedLetters);

document
.getElementById("word-" + selectedLetters)
.classList.add("found");

result.innerHTML =
"Correct! " +
phonemeWords[selectedLetters] +
" → <strong>" +
selectedLetters +
"</strong>";

}

else {

result.textContent =
"You already found that word.";

}

selected = [];

render();

}

else {

result.textContent =
"That selection does not match a word.";

}

}

function reset() {

selected = [];

found = [];

document
.querySelectorAll(".found")
.forEach(element => {

element.classList.remove("found");

});

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
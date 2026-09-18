"use client";

import { useEffect, useState } from "react";

const grid = [
  ["/θ/", "/ɪ/", "/n/", "/ʃ/", "/ɪ/", "/p/", "/tʃ/"],
  ["/s/", "/a/", "/m/", "/ð/", "/ɪ/", "/s/", "/n/"],
  ["/ʃ/", "/ɪ/", "/p/", "/e/", "/θ/", "/ɪ/", "/n/"],
  ["/tʃ/", "/ɪ/", "/p/", "/s/", "/ɪ/", "/ŋ/", "/m/"],
  ["/ð/", "/ɪ/", "/s/", "/a/", "/ʃ/", "/ɪ/", "/p/"],
  ["/n/", "/θ/", "/ɪ/", "/s/", "/m/", "/e/", "/tʃ/"],
  ["/s/", "/ɪ/", "/ŋ/", "/θ/", "/ɪ/", "/n/", "/a/"],
];

const phonemeHints: Record<string, string> = {
  "/θ/": "TH as in thin",
  "/ð/": "TH as in this",
  "/ʃ/": "SH as in ship",
  "/tʃ/": "CH as in chip",
  "/ɪ/": "I as in sit",
  "/iː/": "EE as in see",
  "/ŋ/": "NG as in sing",
  "/n/": "N as in no",
  "/s/": "S as in sun",
  "/a/": "A as in cat",
  "/m/": "M as in man",
  "/e/": "E as in bed",
};

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
  settings: string | null;
};

type Difficulty = "easy" | "medium" | "hard";

const difficultySettings = {
  easy: {
    label: "Easy",
    gridSize: 7,
    directions: "Horizontal",
  },
  medium: {
    label: "Medium",
    gridSize: 8,
    directions: "Horizontal",
  },
  hard: {
    label: "Hard",
    gridSize: 9,
    directions: "Horizontal",
  },
};

type WordSearchProps = {
  activityId?: string;
};

export default function WordSearch({ activityId }: WordSearchProps) {
  const [databaseWords, setDatabaseWords] = useState<DatabaseWord[]>([]);
  const [activityName, setActivityName] = useState("");
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [activityDifficulty, setActivityDifficulty] =
    useState<Difficulty>("easy");
  const [activityDirection, setActivityDirection] = useState("Horizontal");

  const [activity, setActivity] = useState<DatabaseActivity | null>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const words =
    databaseWords.length > 0
      ? databaseWords.map((word) => ({
          phonemes: word.phonemes
            .sort((a, b) => a.position - b.position)
            .map((phoneme) => phoneme.symbol),
          phoneme: word.phoneme,
          english: word.english,
        }))
      : [
          {
            phonemes: ["/θ/", "/ɪ/", "/n/"],
            phoneme: "/θɪn/",
            english: "THIN",
          },
          {
            phonemes: ["/ʃ/", "/ɪ/", "/p/"],
            phoneme: "/ʃɪp/",
            english: "SHIP",
          },
          {
            phonemes: ["/tʃ/", "/ɪ/", "/p/"],
            phoneme: "/tʃɪp/",
            english: "CHIP",
          },
          {
            phonemes: ["/s/", "/ɪ/", "/ŋ/"],
            phoneme: "/sɪŋ/",
            english: "SING",
          },
          {
            phonemes: ["/ð/", "/ɪ/", "/s/"],
            phoneme: "/ðɪs/",
            english: "THIS",
          },
        ];

  const activeGridSize = activityId
    ? difficultySettings[activityDifficulty].gridSize
    : difficultySettings[difficulty].gridSize;

  const activeGrid = activityId
    ? (() => {
        const fallbackPhonemes = [
          "/θ/",
          "/ɪ/",
          "/n/",
          "/ʃ/",
          "/s/",
          "/m/",
          "/a/",
          "/e/",
          "/ŋ/",
        ];

        const newGrid: (string | null)[][] = Array.from(
          { length: activeGridSize },
          () => Array(activeGridSize).fill(null),
        );

        words.forEach((word, wordIndex) => {
          if (word.phonemes.length > activeGridSize) {
            return;
          }

          const availableColumns = activeGridSize - word.phonemes.length + 1;

          // Start with a different row for each word,
          // then try every other row if that row is occupied.
          const preferredRow = wordIndex % activeGridSize;

          for (let rowOffset = 0; rowOffset < activeGridSize; rowOffset++) {
            const row = (preferredRow + rowOffset) % activeGridSize;

            // Try different columns across the row.
            const preferredColumn = (wordIndex * 2) % availableColumns;

            for (
              let columnOffset = 0;
              columnOffset < availableColumns;
              columnOffset++
            ) {
              const column =
                (preferredColumn + columnOffset) % availableColumns;

              const canPlace = word.phonemes.every(
                (_, phonemeIndex) =>
                  newGrid[row][column + phonemeIndex] === null,
              );

              if (!canPlace) {
                continue;
              }

              word.phonemes.forEach((phoneme, phonemeIndex) => {
                newGrid[row][column + phonemeIndex] = phoneme;
              });

              return;
            }
          }

          console.warn(
            `Could not place word "${word.english}" in the ${activeGridSize}x${activeGridSize} grid.`,
          );
        });

        // Fill remaining cells with fallback phonemes.
        return newGrid.map((row, rowIndex) =>
          row.map(
            (cell, columnIndex) =>
              cell ??
              fallbackPhonemes[
                (rowIndex + columnIndex) % fallbackPhonemes.length
              ],
          ),
        );
      })()
    : grid;

  useEffect(() => {
    if (!activityId) {
      return;
    }

    async function loadActivity() {
      try {
        setLoadingActivity(true);

        const response = await fetch(`/api/activities/${activityId}`);
        if (!response.ok) {
          throw new Error("Failed to load activity");
        }

        const data = await response.json();

        console.log("LOADED ACTIVITY:", data);
        console.log("DIFFICULTY:", data.difficulty);
        console.log("SETTINGS:", data.settings);

        setActivity(data);
        setActivityName(data.name);
        setDatabaseWords(data.wordList.words);

        if (data.difficulty) {
          const loadedDifficulty = data.difficulty.toLowerCase() as Difficulty;

          setActivityDifficulty(loadedDifficulty);

          let loadedGridSize = difficultySettings[loadedDifficulty].gridSize;

          if (data.settings) {
            try {
              const settings = JSON.parse(data.settings);

              if (settings.direction) {
                setActivityDirection(
                  settings.direction.charAt(0).toUpperCase() +
                    settings.direction.slice(1),
                );
              }
            } catch (error) {
              console.error("Failed to parse activity settings:", error);
            }
          }
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

  function selectCell(row: number, column: number) {
    const cell = `${row}-${column}`;

    if (selected.includes(cell)) {
      setSelected(selected.filter((item) => item !== cell));
      return;
    }

    if (selected.length === 0) {
      setSelected([cell]);
      return;
    }

    const lastCell = selected[selected.length - 1];
    const [lastRow, lastColumn] = lastCell.split("-").map(Number);

    const isNextHorizontalCell = row === lastRow && column === lastColumn + 1;

    if (!isNextHorizontalCell) {
      alert("Select adjacent cells from left to right.");
      return;
    }

    setSelected([...selected, cell]);
  }

  function checkSelection() {
    const selectedPhonemes = selected
      .map((cell) => {
        const [row, column] = cell.split("-").map(Number);
        return activeGrid[row][column];
      })
      .join("");

    const matchingWord = words.find(
      (word) =>
        word.phonemes.join("") === selectedPhonemes &&
        !foundWords.includes(word.english),
    );

    if (matchingWord) {
      setFoundWords([...foundWords, matchingWord.english]);
      setFoundCells([...foundCells, ...selected]);
      setSelected([]);
    } else {
      alert("That selection does not match a phoneme word.");
    }
  }

  function resetPuzzle() {
    setSelected([]);
    setFoundWords([]);
    setFoundCells([]);
  }

  function generateHTML() {
    const gridSize = activeGridSize;

    const generatedGrid = activeGrid;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>${activityName || "PhonoPlay Word Search Activity"}</title>

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
  max-width: 900px;
  margin: auto;
}

h1 {
  margin-bottom: 8px;
}

.subtitle {
  color: #6b7280;
}

.info {
  margin: 15px 0;
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
  grid-template-columns: repeat(${gridSize}, minmax(0, 1fr));
  gap: 6px;
  width: min(90vw, 650px);
  margin: 30px auto;
}

.cell {
  aspect-ratio: 1;
  width: 100%;
  min-width: 0;
  padding: 4px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;

  font-size: clamp(12px, 2.5vw, 18px);
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

.cell.found {
  background: #dcfce7;
  border-color: #22c55e;
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
  margin: 20px auto;
  padding: 15px;
  max-width: 600px;
  border-radius: 8px;
  background: #dcfce7;
}

.hint {
  margin-top: 20px;
  color: #6b7280;
}

@media (max-width: 500px) {

  .grid {
    gap: 4px;
    width: 95vw;
  }

}

</style>
</head>

<body>

<main>

<h1>${activityName || "PhonoPlay Word Search"}</h1>

<p class="subtitle">
Find the phoneme-based words hidden in the grid.
</p>

<div class="info">

<p>
Difficulty:
<strong>${difficultySettings[difficulty].label}</strong>
</p>

<p>
Grid:
<strong>${gridSize} × ${gridSize}</strong>
</p>

<p>
Directions:
<strong>${activityId ? activityDirection : difficultySettings[difficulty].directions}</strong>
</p>

</div>

<div
  id="wordList"
  class="word-list">
</div>

<div
  id="grid"
  class="grid"
  aria-label="Phoneme word search grid">
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
Select the phonemes belonging to a word, then choose Check Selection.
</p>

</main>

<script>

const words = ${JSON.stringify(words)};

const gridData = ${JSON.stringify(generatedGrid)};

let selected = [];

let foundWords = [];

let foundCells = [];

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

  const container =
    document.getElementById("grid");

  container.innerHTML = "";

  gridData.forEach((row, rowIndex) => {

    row.forEach((phoneme, columnIndex) => {

      const button =
        document.createElement("button");

      button.className = "cell";

      button.textContent = phoneme;

      button.setAttribute(
        "aria-label",
        "Row " +
        (rowIndex + 1) +
        ", Column " +
        (columnIndex + 1) +
        ", phoneme " +
        phoneme
      );

      const isSelected =
        selected.some(
          cell =>
            cell.row === rowIndex &&
            cell.column === columnIndex
        );

      button.setAttribute(
        "aria-pressed",
        isSelected
      );

      const isFound =
  foundCells.some(
    cell =>
      cell.row === rowIndex &&
      cell.column === columnIndex
  );

    if (isSelected) {
    button.classList.add("selected");
    }

    if (isFound) {
    button.classList.add("found");
    }

      button.onclick = function() {
        toggleCell(rowIndex, columnIndex);
      };

      container.appendChild(button);

    });

  });

}

function toggleCell(row, column) {
    const isFound =
        foundCells.some(
            cell =>
            cell.row === row &&
            cell.column === column
        );

        if (isFound) {
        return;
        }

  const index =
    selected.findIndex(
      cell =>
        cell.row === row &&
        cell.column === column
    );

  if (index >= 0) {

    selected.splice(index, 1);

    renderGrid();
    return;

  }

  if (selected.length === 0) {

    selected.push({
      row: row,
      column: column
    });

    renderGrid();
    return;

  }

  const lastCell =
    selected[selected.length - 1];

  const isNextHorizontalCell =
    row === lastCell.row &&
    column === lastCell.column + 1;

  if (!isNextHorizontalCell) {

    alert("Select adjacent cells from left to right.");
    return;

  }

  selected.push({
    row: row,
    column: column
  });

  renderGrid();

}

function checkSelection() {

  const selectedPhonemes =
    selected.map(
      cell =>
        gridData[cell.row][cell.column]
    );

  const selectedString =
    selectedPhonemes.join("");

  const wordIndex =
    words.findIndex(
      (word, index) =>
        word.phonemes.join("") === selectedString &&
        !foundWords.includes(index)
    );

  const result =
    document.getElementById("result");

  result.style.display = "block";

  if (wordIndex >= 0) {

    foundWords.push(wordIndex);

    foundCells.push(
    ...selected.map(cell => ({
        row: cell.row,
        column: cell.column
    }))
    );

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
        "Excellent! You found all ${words.length} words.";

    }

  } else {

    result.textContent =
      "That selection does not match a word. Try again.";

  }

}

function resetGame() {

    selected = [];

    foundWords = [];

    foundCells = [];

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
        <button
          type="button"
          className="activity-back-button"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>

        <h1>Word Search Activity Builder</h1>

        <p>Create a phoneme-based word search activity for your classroom.</p>
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
                resetPuzzle();
              }}
            >
              <option value="easy">Easy (7×7)</option>

              <option value="medium">Medium (8×8)</option>

              <option value="hard">Hard (9×9)</option>
            </select>
          </div>

          <p>
            <strong>Grid:</strong> {activeGridSize}×{activeGridSize}
          </p>

          <p>
            <strong>Directions:</strong>{" "}
            {activityId
              ? activityDirection
              : difficultySettings[difficulty].directions}
          </p>

          <h2>Word List</h2>

          <p>
            Select the phonemes and find their English equivalents in the
            puzzle.
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

          <button onClick={resetPuzzle}>Reset Puzzle</button>
        </aside>

        <section className="preview-panel">
          <h2>Activity Preview</h2>

          {activityId && activityName && <p>{activityName}</p>}
          <p>
            <strong>Difficulty:</strong> {difficultySettings[difficulty].label}
            {" · "}
            <strong>Hints:</strong>{" "}
            {activityId ? (activity?.hint ? "Enabled" : "Disabled") : "Enabled"}
          </p>

          <p>Select the letters that form one of the listed words.</p>

          <div
            className="word-search-grid"
            style={
              {
                "--grid-size": activeGridSize,
              } as React.CSSProperties
            }
          >
            {Array.from({
              length: activeGridSize,
            }).map((_, rowIndex) =>
              Array.from({
                length: activeGridSize,
              }).map((_, columnIndex) => {
                const letter = activeGrid[rowIndex]?.[columnIndex] ?? "/";

                const cell = `${rowIndex}-${columnIndex}`;
                const isSelected = selected.includes(cell);
                const isFound = foundCells.includes(cell);

                return (
                  <button
                    key={cell}
                    className={`search-cell ${
                      isSelected ? "selected" : ""
                    } ${isFound ? "found" : ""}`}
                    aria-pressed={isSelected}
                    title={
                      !activityId || activity?.hint
                        ? phonemeHints[letter] || letter
                        : undefined
                    }
                    onClick={() => selectCell(rowIndex, columnIndex)}
                    aria-label={
                      !activityId || activity?.hint
                        ? `Row ${rowIndex + 1}, Column ${
                            columnIndex + 1
                          }, ${letter}, ${phonemeHints[letter] || "phoneme"}`
                        : `Row ${rowIndex + 1}, Column ${
                            columnIndex + 1
                          }, ${letter}`
                    }
                  >
                    {letter}
                  </button>
                );
              }),
            )}
          </div>

          <div className="word-search-controls">
            <button onClick={checkSelection}>Check Selection</button>

            <button onClick={resetPuzzle}>Reset</button>
          </div>

          <p className="phoneme-hint">
            Select the letters of a word, then check your selection.
          </p>
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

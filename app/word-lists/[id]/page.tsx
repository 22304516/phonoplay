"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Word = {
  id: number;
  english: string;
  phoneme: string;
  phonemes: {
    id: number;
    symbol: string;
    position: number;
  }[];
};

type WordList = {
  id: number;
  name: string;
  description: string | null;
  words: Word[];
  activities: Activity[];
};

type Activity = {
  id: number;
  name: string;
  type: "WORDLE" | "WORD_SEARCH";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  hint: boolean;
  settings: string | null;
};

export default function WordListPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [wordList, setWordList] = useState<WordList | null>(null);
  const [english, setEnglish] = useState("");
  const [phoneme, setPhoneme] = useState("");
  const [phonemes, setPhonemes] = useState("");
  const [activityName, setActivityName] = useState("");
  const [activityType, setActivityType] = useState<"WORDLE" | "WORD_SEARCH">(
    "WORD_SEARCH",
  );
  const [activityDifficulty, setActivityDifficulty] = useState<
    "EASY" | "MEDIUM" | "HARD"
  >("EASY");
  const [activityHint, setActivityHint] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWordList() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/word-lists/${id}`);

      if (!response.ok) {
        throw new Error("Failed to load word list");
      }

      const data = await response.json();
      setWordList(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load word list");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWordList();
  }, [id]);

  async function addWord(event: React.FormEvent) {
    event.preventDefault();

    if (!english.trim() || !phoneme.trim()) {
      setError("English word and phoneme are required");
      return;
    }

    const phonemeList = phonemes
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      setError("");

      const response = await fetch(`/api/word-lists/${id}/words`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          english: english.trim(),
          phoneme: phoneme.trim(),
          phonemes: phonemeList,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add word");
      }

      setEnglish("");
      setPhoneme("");
      setPhonemes("");

      await loadWordList();
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "Failed to add word");
    }
  }

  async function addActivity(event: React.FormEvent) {
    event.preventDefault();

    if (!activityName.trim()) {
      setError("Activity name is required");
      return;
    }

    try {
      setError("");

      const settings =
        activityType === "WORD_SEARCH"
          ? JSON.stringify({
              gridSize:
                activityDifficulty === "EASY"
                  ? 7
                  : activityDifficulty === "MEDIUM"
                    ? 8
                    : 9,
              direction: "horizontal",
            })
          : undefined;

      const response = await fetch(`/api/word-lists/${id}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: activityName.trim(),
          type: activityType,
          difficulty: activityDifficulty,
          hint: activityHint,
          settings,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create activity");
      }

      setActivityName("");
      setActivityType("WORD_SEARCH");
      setActivityDifficulty("EASY");
      setActivityHint(true);

      await loadWordList();
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to create activity",
      );
    }
  }

  async function deleteWord(wordId: number) {
    if (!confirm("Delete this word?")) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`/api/word-lists/${id}/words/${wordId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete word");
      }

      await loadWordList();
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to delete word",
      );
    }
  }

  if (loading) {
    return (
      <main className="page-container">
        <p>Loading...</p>
      </main>
    );
  }

  if (!wordList) {
    return (
      <main className="page-container">
        <p>{error || "Word list not found"}</p>

        <button onClick={() => router.push("/word-lists")}>
          Back to Word Lists
        </button>
      </main>
    );
  }

  async function deleteActivity(activityId: number) {
    if (!confirm("Delete this activity?")) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `/api/word-lists/${id}/activities/${activityId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete activity");
      }

      await loadWordList();
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to delete activity",
      );
    }
  }

  return (
    <main className="page-container">
      <button type="button" onClick={() => router.push("/word-lists")}>
        ← Back to Word Lists
      </button>

      <h1>{wordList.name}</h1>

      {wordList.description && <p>{wordList.description}</p>}

      <section className="settings-card">
        <h2>Add Word</h2>

        <form onSubmit={addWord}>
          <label>
            English word
            <input
              type="text"
              value={english}
              onChange={(event) => setEnglish(event.target.value)}
              placeholder="e.g. thin"
            />
          </label>

          <label>
            Phoneme transcription
            <input
              type="text"
              value={phoneme}
              onChange={(event) => setPhoneme(event.target.value)}
              placeholder="e.g. /θɪn/"
            />
          </label>

          <label>
            Individual phonemes
            <input
              type="text"
              value={phonemes}
              onChange={(event) => setPhonemes(event.target.value)}
              placeholder="e.g. /θ/, /ɪ/, /n/"
            />
          </label>

          <button type="submit">Add Word</button>
        </form>
      </section>

      {error && <p>{error}</p>}

      <section>
        <h2>Words</h2>

        {wordList.words.length === 0 ? (
          <p>No words in this list yet.</p>
        ) : (
          <div>
            {wordList.words.map((word) => (
              <article key={word.id} className="settings-card">
                <h3>{word.english}</h3>

                <p>{word.phoneme}</p>

                {word.phonemes.length > 0 && (
                  <p>
                    {word.phonemes
                      .sort((a, b) => a.position - b.position)
                      .map((item) => item.symbol)
                      .join(" · ")}
                  </p>
                )}

                <button type="button" onClick={() => deleteWord(word.id)}>
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="settings-card">
        <h2>Create Activity</h2>

        <form onSubmit={addActivity}>
          <label>
            Activity name
            <input
              type="text"
              value={activityName}
              onChange={(event) => setActivityName(event.target.value)}
              placeholder="e.g. Initial /θ/ Word Search"
            />
          </label>

          <label>
            Activity type
            <select
              value={activityType}
              onChange={(event) =>
                setActivityType(event.target.value as "WORDLE" | "WORD_SEARCH")
              }
            >
              <option value="WORD_SEARCH">Word Search</option>
              <option value="WORDLE">Wordle</option>
            </select>
          </label>

          <label>
            Difficulty
            <select
              value={activityDifficulty}
              onChange={(event) =>
                setActivityDifficulty(
                  event.target.value as "EASY" | "MEDIUM" | "HARD",
                )
              }
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </label>

          <label>
            <input
              type="checkbox"
              checked={activityHint}
              onChange={(event) => setActivityHint(event.target.checked)}
            />
            Allow hints
          </label>

          <button type="submit">Create Activity</button>
        </form>
      </section>

      <section>
        <h2>Activities</h2>

        {wordList.activities.length === 0 ? (
          <p>No activities in this list yet.</p>
        ) : (
          <div>
            {wordList.activities.map((activity) => (
              <article key={activity.id} className="settings-card">
                <h3>{activity.name}</h3>

                <p>
                  {activity.type === "WORD_SEARCH" ? "Word Search" : "Wordle"} ·{" "}
                  {activity.difficulty}
                </p>

                <p>Hints: {activity.hint ? "Enabled" : "Disabled"}</p>

                <button
                  type="button"
                  onClick={() => deleteActivity(activity.id)}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

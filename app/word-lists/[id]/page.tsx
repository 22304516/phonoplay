"use client";

import Link from "next/link";
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

type Activity = {
  id: number;
  name: string;
  type: "WORDLE" | "WORD_SEARCH";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  hint: boolean;
  settings: string | null;
  wordId: number | null;
  word: Word | null;
};

type WordList = {
  id: number;
  name: string;
  description: string | null;
  words: Word[];
  activities: Activity[];
};

export default function WordListPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [wordList, setWordList] = useState<WordList | null>(null);
  const [editingWordList, setEditingWordList] = useState(false);
  const [editWordListName, setEditWordListName] = useState("");
  const [editWordListDescription, setEditWordListDescription] = useState("");

  const [english, setEnglish] = useState("");
  const [phoneme, setPhoneme] = useState("");
  const [phonemes, setPhonemes] = useState("");

  const [editingWordId, setEditingWordId] = useState<number | null>(null);

  const [activityName, setActivityName] = useState("");
  const [activityType, setActivityType] = useState<"WORDLE" | "WORD_SEARCH">(
    "WORD_SEARCH",
  );
  const [activityDifficulty, setActivityDifficulty] = useState<
    "EASY" | "MEDIUM" | "HARD"
  >("EASY");
  const [activityHint, setActivityHint] = useState(true);
  const [activityWordId, setActivityWordId] = useState("");

  const [editingActivityId, setEditingActivityId] = useState<number | null>(
    null,
  );

  const [editActivityName, setEditActivityName] = useState("");
  const [editActivityType, setEditActivityType] = useState<
    "WORDLE" | "WORD_SEARCH"
  >("WORD_SEARCH");
  const [editActivityDifficulty, setEditActivityDifficulty] = useState<
    "EASY" | "MEDIUM" | "HARD"
  >("EASY");
  const [editActivityHint, setEditActivityHint] = useState(true);
  const [editActivityWordId, setEditActivityWordId] = useState("");

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

  function startEditingWordList() {
    if (!wordList) {
      return;
    }

    setEditWordListName(wordList.name);
    setEditWordListDescription(wordList.description || "");
    setEditingWordList(true);
    setError("");
  }

  function cancelEditingWordList() {
    setEditingWordList(false);
    setEditWordListName("");
    setEditWordListDescription("");
  }

  async function updateWordList(event: React.FormEvent) {
    event.preventDefault();

    if (!editWordListName.trim()) {
      setError("Word list name is required");
      return;
    }

    try {
      setError("");

      const response = await fetch(`/api/word-lists/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editWordListName.trim(),
          description: editWordListDescription.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update word list");
      }

      cancelEditingWordList();
      await loadWordList();
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to update word list",
      );
    }
  }

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

  function startEditingWord(word: Word) {
    setEditingWordId(word.id);
    setEnglish(word.english);
    setPhoneme(word.phoneme);
    setPhonemes(
      word.phonemes
        .sort((a, b) => a.position - b.position)
        .map((item) => item.symbol)
        .join(", "),
    );
    setError("");
  }

  function cancelEditingWord() {
    setEditingWordId(null);
    setEnglish("");
    setPhoneme("");
    setPhonemes("");
  }

  async function updateWord(event: React.FormEvent) {
    event.preventDefault();

    if (!editingWordId) {
      return;
    }

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

      const response = await fetch(
        `/api/word-lists/${id}/words/${editingWordId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            english: english.trim(),
            phoneme: phoneme.trim(),
            phonemes: phonemeList,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update word");
      }

      cancelEditingWord();
      await loadWordList();
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to update word",
      );
    }
  }

  async function addActivity(event: React.FormEvent) {
    event.preventDefault();

    if (!activityName.trim()) {
      setError("Activity name is required");
      return;
    }

    if (activityType === "WORDLE" && !activityWordId) {
      setError("Please select a target word for Wordle");
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
          wordId:
            activityType === "WORDLE" ? Number(activityWordId) : undefined,
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
      setActivityWordId("");

      await loadWordList();
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to create activity",
      );
    }
  }

  function startEditingActivity(activity: Activity) {
    setEditingActivityId(activity.id);
    setEditActivityName(activity.name);
    setEditActivityType(activity.type);
    setEditActivityDifficulty(activity.difficulty);
    setEditActivityHint(activity.hint);
    setEditActivityWordId(activity.wordId?.toString() ?? "");
    setError("");
  }

  function cancelEditingActivity() {
    setEditingActivityId(null);
    setEditActivityName("");
    setEditActivityType("WORD_SEARCH");
    setEditActivityDifficulty("EASY");
    setEditActivityHint(true);
    setEditActivityWordId("");
  }

  async function updateActivity(event: React.FormEvent) {
    event.preventDefault();

    if (!editingActivityId) {
      return;
    }

    if (!editActivityName.trim()) {
      setError("Activity name is required");
      return;
    }

    if (editActivityType === "WORDLE" && !editActivityWordId) {
      setError("Please select a target word for Wordle");
      return;
    }

    try {
      setError("");

      const settings =
        editActivityType === "WORD_SEARCH"
          ? JSON.stringify({
              gridSize:
                editActivityDifficulty === "EASY"
                  ? 7
                  : editActivityDifficulty === "MEDIUM"
                    ? 8
                    : 9,
              direction: "horizontal",
            })
          : undefined;

      const response = await fetch(
        `/api/word-lists/${id}/activities/${editingActivityId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editActivityName.trim(),
            type: editActivityType,
            difficulty: editActivityDifficulty,
            hint: editActivityHint,
            wordId:
              editActivityType === "WORDLE" ? Number(editActivityWordId) : null,
            settings,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update activity");
      }

      cancelEditingActivity();
      await loadWordList();
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to update activity",
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

  return (
    <main className="page-container">
      <button type="button" onClick={() => router.push("/word-lists")}>
        ← Back to Word Lists
      </button>

      {editingWordList ? (
        <section className="settings-card">
          <h2>Edit Word List</h2>

          <form onSubmit={updateWordList}>
            <label>
              Name
              <input
                type="text"
                value={editWordListName}
                onChange={(event) => setEditWordListName(event.target.value)}
              />
            </label>

            <label>
              Description
              <textarea
                value={editWordListDescription}
                onChange={(event) =>
                  setEditWordListDescription(event.target.value)
                }
              />
            </label>

            <button type="submit">Save Changes</button>

            <button type="button" onClick={cancelEditingWordList}>
              Cancel
            </button>
          </form>
        </section>
      ) : (
        <>
          <h1>{wordList.name}</h1>

          {wordList.description && <p>{wordList.description}</p>}

          <button type="button" onClick={startEditingWordList}>
            Edit Word List
          </button>
        </>
      )}

      {error && <p>{error}</p>}

      <section className="settings-card">
        <h2>{editingWordId ? "Edit Word" : "Add Word"}</h2>

        <form onSubmit={editingWordId ? updateWord : addWord}>
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

          <button type="submit">
            {editingWordId ? "Save Changes" : "Add Word"}
          </button>

          {editingWordId && (
            <button type="button" onClick={cancelEditingWord}>
              Cancel
            </button>
          )}
        </form>
      </section>

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

                <button type="button" onClick={() => startEditingWord(word)}>
                  Edit
                </button>

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
              onChange={(event) => {
                const type = event.target.value as "WORDLE" | "WORD_SEARCH";

                setActivityType(type);

                if (type === "WORD_SEARCH") {
                  setActivityWordId("");
                }
              }}
            >
              <option value="WORD_SEARCH">Word Search</option>
              <option value="WORDLE">Wordle</option>
            </select>
          </label>

          {activityType === "WORDLE" && (
            <label>
              Target word
              <select
                value={activityWordId}
                onChange={(event) => setActivityWordId(event.target.value)}
              >
                <option value="">Select a word</option>

                {wordList.words.map((word) => (
                  <option key={word.id} value={word.id}>
                    {word.english} — {word.phoneme}
                  </option>
                ))}
              </select>
            </label>
          )}

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
                {editingActivityId === activity.id ? (
                  <form onSubmit={updateActivity}>
                    <h3>Edit Activity</h3>

                    <label>
                      Activity name
                      <input
                        type="text"
                        value={editActivityName}
                        onChange={(event) =>
                          setEditActivityName(event.target.value)
                        }
                      />
                    </label>

                    <label>
                      Activity type
                      <select
                        value={editActivityType}
                        onChange={(event) => {
                          const type = event.target.value as
                            | "WORDLE"
                            | "WORD_SEARCH";

                          setEditActivityType(type);

                          if (type === "WORD_SEARCH") {
                            setEditActivityWordId("");
                          }
                        }}
                      >
                        <option value="WORD_SEARCH">Word Search</option>
                        <option value="WORDLE">Wordle</option>
                      </select>
                    </label>

                    {editActivityType === "WORDLE" && (
                      <label>
                        Target word
                        <select
                          value={editActivityWordId}
                          onChange={(event) =>
                            setEditActivityWordId(event.target.value)
                          }
                        >
                          <option value="">Select a word</option>

                          {wordList.words.map((word) => (
                            <option key={word.id} value={word.id}>
                              {word.english} — {word.phoneme}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                    <label>
                      Difficulty
                      <select
                        value={editActivityDifficulty}
                        onChange={(event) =>
                          setEditActivityDifficulty(
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
                        checked={editActivityHint}
                        onChange={(event) =>
                          setEditActivityHint(event.target.checked)
                        }
                      />
                      Allow hints
                    </label>

                    <button type="submit">Save Changes</button>

                    <button type="button" onClick={cancelEditingActivity}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <h3>{activity.name}</h3>

                    <p>
                      {activity.type === "WORD_SEARCH"
                        ? "Word Search"
                        : "Wordle"}{" "}
                      · {activity.difficulty}
                    </p>

                    {activity.type === "WORDLE" && activity.word && (
                      <p>
                        <strong>Target word:</strong> {activity.word.english} —{" "}
                        {activity.word.phoneme}
                      </p>
                    )}

                    <p>Hints: {activity.hint ? "Enabled" : "Disabled"}</p>

                    {activity.type === "WORDLE" && !activity.word && (
                      <p>
                        This Wordle has no target word. Edit the activity and
                        select a target word before launching it.
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={activity.type === "WORDLE" && !activity.word}
                      onClick={() => {
                        router.push(
                          activity.type === "WORDLE"
                            ? `/wordle?activityId=${activity.id}`
                            : `/word-search?activityId=${activity.id}`,
                        );
                      }}
                    >
                      Launch
                    </button>

                    <button
                      type="button"
                      onClick={() => startEditingActivity(activity)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteActivity(activity.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

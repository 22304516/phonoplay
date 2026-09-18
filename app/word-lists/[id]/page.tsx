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
  const [editActivityGridSize, setEditActivityGridSize] = useState(7);
  const [editActivityDirection, setEditActivityDirection] =
    useState("horizontal");

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
    if (activity.settings) {
      try {
        const settings = JSON.parse(activity.settings);

        if (settings.gridSize) {
          setEditActivityGridSize(settings.gridSize);
        }

        if (settings.direction) {
          setEditActivityDirection(settings.direction);
        }
      } catch (error) {
        console.error("Failed to parse activity settings:", error);
      }
    } else {
      setEditActivityGridSize(7);
      setEditActivityDirection("horizontal");
    }
    setError("");
  }

  function cancelEditingActivity() {
    setEditingActivityId(null);
    setEditActivityName("");
    setEditActivityType("WORD_SEARCH");
    setEditActivityDifficulty("EASY");
    setEditActivityHint(true);
    setEditActivityWordId("");
    setEditActivityGridSize(7);
    setEditActivityDirection("horizontal");
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

    if (editActivityType === "WORD_SEARCH") {
      const gridSize =
        editActivityDifficulty === "EASY"
          ? 7
          : editActivityDifficulty === "MEDIUM"
            ? 8
            : 9;

      const usableWord = wordList?.words.find(
        (word) => word.phonemes.length <= gridSize,
      );

      if (!usableWord) {
        setError(
          `No words in this word list can fit in a ${gridSize} × ${gridSize} grid.`,
        );
        return;
      }
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
              direction: editActivityDirection,
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

        <button
          type="button"
          className="word-list-detail-back-button"
          onClick={() => router.push("/word-lists")}
        >
          ← Back to Word Lists
        </button>
      </main>
    );
  }

  return (
    <main className="word-list-detail-page">
      <Link href="/word-lists" className="word-list-back-link">
        ← Back to Word Lists
      </Link>

      {editingWordList ? (
        <section className="word-list-detail-card word-list-edit-card">
          <div className="word-list-detail-section-heading">
            <h2>Edit Word List</h2>
            <p>Update the name and description for this word list.</p>
          </div>

          <form className="word-list-detail-form" onSubmit={updateWordList}>
            <label>
              <span>Name</span>
              <input
                type="text"
                value={editWordListName}
                onChange={(event) => setEditWordListName(event.target.value)}
              />
            </label>

            <label>
              <span>Description</span>
              <textarea
                value={editWordListDescription}
                onChange={(event) =>
                  setEditWordListDescription(event.target.value)
                }
                rows={3}
              />
            </label>

            <div className="word-list-detail-actions">
              <button type="submit" className="word-list-detail-primary-button">
                Save Changes
              </button>

              <button
                type="button"
                className="word-list-detail-secondary-button"
                onClick={cancelEditingWordList}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : (
        <header className="word-list-detail-header">
          <div>
            <h1>{wordList.name}</h1>
            {wordList.description && <p>{wordList.description}</p>}
          </div>

          <button
            type="button"
            className="word-list-detail-secondary-button"
            onClick={startEditingWordList}
          >
            Edit Word List
          </button>
        </header>
      )}

      {error && <div className="word-list-detail-error">{error}</div>}

      <section className="word-list-detail-card">
        <div className="word-list-detail-section-heading">
          <h2>{editingWordId ? "Edit Word" : "Add Word"}</h2>
          <p>
            {editingWordId
              ? "Update the word and its phoneme information."
              : "Add a word and its individual phonemes to this list."}
          </p>
        </div>

        <form
          className="word-list-detail-form"
          onSubmit={editingWordId ? updateWord : addWord}
        >
          <label>
            <span>English word</span>
            <input
              type="text"
              value={english}
              onChange={(event) => setEnglish(event.target.value)}
              placeholder="e.g. thin"
            />
          </label>

          <label>
            <span>Phoneme transcription</span>
            <input
              type="text"
              value={phoneme}
              onChange={(event) => setPhoneme(event.target.value)}
              placeholder="e.g. /θɪn/"
            />
          </label>

          <label>
            <span>Individual phonemes</span>
            <input
              type="text"
              value={phonemes}
              onChange={(event) => setPhonemes(event.target.value)}
              placeholder="e.g. /θ/, /ɪ/, /n/"
            />
            <small>Separate each phoneme with a comma.</small>
          </label>

          <div className="word-list-detail-actions">
            <button type="submit" className="word-list-detail-primary-button">
              {editingWordId ? "Save Changes" : "Add Word"}
            </button>

            {editingWordId && (
              <button
                type="button"
                className="word-list-detail-secondary-button"
                onClick={cancelEditingWord}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="word-list-detail-section">
        <div className="word-list-detail-section-heading">
          <h2>Words</h2>
          <p>{wordList.words.length} words in this list.</p>
        </div>

        {wordList.words.length === 0 ? (
          <div className="word-list-detail-empty">
            <h3>No words yet</h3>
            <p>Add your first word using the form above.</p>
          </div>
        ) : (
          <div className="word-list-words-grid">
            {wordList.words.map((word) => (
              <article key={word.id} className="word-list-word-card">
                <div>
                  <div className="word-list-word-header">
                    <h3>{word.english}</h3>
                    <span className="word-list-word-phoneme">
                      {word.phoneme}
                    </span>
                  </div>

                  {word.phonemes.length > 0 && (
                    <div className="word-list-phoneme-list">
                      {word.phonemes
                        .sort((a, b) => a.position - b.position)
                        .map((item) => (
                          <span key={item.id}>{item.symbol}</span>
                        ))}
                    </div>
                  )}
                </div>

                <div className="word-list-word-actions">
                  <button
                    type="button"
                    className="word-list-detail-edit-button"
                    onClick={() => startEditingWord(word)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="word-list-detail-delete-button"
                    onClick={() => deleteWord(word.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="word-list-detail-card">
        <div className="word-list-detail-section-heading">
          <h2>Create Activity</h2>
          <p>Create a Wordle or Word Search activity using this word list.</p>
        </div>

        <form className="word-list-detail-form" onSubmit={addActivity}>
          <label>
            <span>Activity name</span>
            <input
              type="text"
              value={activityName}
              onChange={(event) => setActivityName(event.target.value)}
              placeholder="e.g. Initial /θ/ Word Search"
            />
          </label>

          <label>
            <span>Activity type</span>
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
              <span>Target word</span>
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
            <span>Difficulty</span>
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

          {editActivityType === "WORD_SEARCH" && (
            <label>
              <span>Direction</span>
              <select
                value={editActivityDirection}
                onChange={(event) =>
                  setEditActivityDirection(event.target.value)
                }
              >
                <option value="horizontal">Horizontal</option>
              </select>
            </label>
          )}

          <label className="word-list-checkbox-label">
            <input
              type="checkbox"
              checked={activityHint}
              onChange={(event) => setActivityHint(event.target.checked)}
            />
            <span>Allow hints</span>
          </label>

          <div className="word-list-detail-actions">
            <button type="submit" className="word-list-detail-primary-button">
              Create Activity
            </button>
          </div>
        </form>
      </section>

      <section className="word-list-detail-section">
        <div className="word-list-detail-section-heading">
          <h2>Activities</h2>
          <p>{wordList.activities.length} activities in this list.</p>
        </div>

        {wordList.activities.length === 0 ? (
          <div className="word-list-detail-empty">
            <h3>No activities yet</h3>
            <p>Create your first activity using the form above.</p>
          </div>
        ) : (
          <div className="word-list-activities-grid">
            {wordList.activities.map((activity) => (
              <article key={activity.id} className="word-list-activity-card">
                {editingActivityId === activity.id ? (
                  <form
                    className="word-list-detail-form"
                    onSubmit={updateActivity}
                  >
                    <div className="word-list-detail-section-heading">
                      <h3>Edit Activity</h3>
                      <p>Update this activity's settings.</p>
                    </div>

                    <label>
                      <span>Activity name</span>
                      <input
                        type="text"
                        value={editActivityName}
                        onChange={(event) =>
                          setEditActivityName(event.target.value)
                        }
                      />
                    </label>

                    <label>
                      <span>Activity type</span>
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
                        <span>Target word</span>
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
                      <span>Difficulty</span>
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

                    <label className="word-list-checkbox-label">
                      <input
                        type="checkbox"
                        checked={editActivityHint}
                        onChange={(event) =>
                          setEditActivityHint(event.target.checked)
                        }
                      />
                      <span>Allow hints</span>
                    </label>

                    <div className="word-list-detail-actions">
                      <button
                        type="submit"
                        className="word-list-detail-primary-button"
                      >
                        Save Changes
                      </button>

                      <button
                        type="button"
                        className="word-list-detail-secondary-button"
                        onClick={cancelEditingActivity}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="word-list-activity-header">
                      <div>
                        <h3>{activity.name}</h3>

                        <div className="word-list-activity-tags">
                          <span>
                            {activity.type === "WORD_SEARCH"
                              ? "Word Search"
                              : "Wordle"}
                          </span>
                          <span>{activity.difficulty}</span>
                          <span>
                            {activity.hint ? "Hints enabled" : "Hints disabled"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {activity.type === "WORDLE" && activity.word && (
                      <p className="word-list-activity-target">
                        <strong>Target word:</strong> {activity.word.english} —{" "}
                        {activity.word.phoneme}
                      </p>
                    )}

                    {activity.type === "WORDLE" && !activity.word && (
                      <p className="word-list-activity-warning">
                        This Wordle has no target word. Edit the activity and
                        select a target word before launching it.
                      </p>
                    )}

                    <div className="word-list-activity-actions">
                      <button
                        type="button"
                        className="word-list-detail-primary-button"
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
                        className="word-list-detail-edit-button"
                        onClick={() => startEditingActivity(activity)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="word-list-detail-delete-button"
                        onClick={() => deleteActivity(activity.id)}
                      >
                        Delete
                      </button>
                    </div>
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

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type WordList = {
  id: number;
  name: string;
  description: string | null;
  words: {
    id: number;
  }[];
  activities: {
    id: number;
  }[];
};

export default function WordListsPage() {
  const [wordLists, setWordLists] = useState<WordList[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingWordListId, setEditingWordListId] = useState<number | null>(
    null,
  );

  async function loadWordLists() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/word-lists");

      if (!response.ok) {
        throw new Error("Failed to load word lists");
      }

      const data = await response.json();
      setWordLists(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load word lists");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWordLists();
  }, []);

  async function createWordList(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Word list name is required");
      return;
    }

    try {
      setError("");

      const response = await fetch("/api/word-lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create word list");
      }

      setName("");
      setDescription("");

      await loadWordLists();
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to create word list",
      );
    }
  }

  function startEditingWordList(wordList: WordList) {
    setEditingWordListId(wordList.id);
    setName(wordList.name);
    setDescription(wordList.description || "");
    setError("");
  }

  function cancelEditingWordList() {
    setEditingWordListId(null);
    setName("");
    setDescription("");
  }

  async function updateWordList(event: React.FormEvent) {
    event.preventDefault();

    if (!editingWordListId) {
      return;
    }

    if (!name.trim()) {
      setError("Word list name is required");
      return;
    }

    try {
      setError("");

      const response = await fetch(`/api/word-lists/${editingWordListId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update word list");
      }

      cancelEditingWordList();
      await loadWordLists();
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to update word list",
      );
    }
  }

  async function deleteWordList(id: number) {
    if (!confirm("Delete this word list?")) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`/api/word-lists/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete word list");
      }

      await loadWordLists();
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to delete word list",
      );
    }
  }

  return (
    <main className="page-container">
      <h1>Word Lists</h1>
      <p>Create and manage phoneme word lists for your activities.</p>

      <section className="settings-card">
        <h2>{editingWordListId ? "Edit Word List" : "Create Word List"}</h2>
        <form onSubmit={editingWordListId ? updateWordList : createWordList}>
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Initial /θ/ Words"
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional description"
            />
          </label>

          <button type="submit">
            {editingWordListId ? "Save Changes" : "Create Word List"}
          </button>

          {editingWordListId && (
            <button type="button" onClick={cancelEditingWordList}>
              Cancel
            </button>
          )}
        </form>
      </section>

      {error && <p>{error}</p>}

      <section>
        <h2>Your Word Lists</h2>

        {loading ? (
          <p>Loading...</p>
        ) : wordLists.length === 0 ? (
          <p>No word lists yet.</p>
        ) : (
          <div>
            {wordLists.map((wordList) => (
              <article key={wordList.id} className="settings-card">
                <h3>
                  <Link href={`/word-lists/${wordList.id}`}>
                    {wordList.name}
                  </Link>
                </h3>

                {wordList.description && <p>{wordList.description}</p>}

                <p>
                  {wordList.words.length} words · {wordList.activities.length}{" "}
                  activities
                </p>

                <button
                  type="button"
                  onClick={() => startEditingWordList(wordList)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => deleteWordList(wordList.id)}
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

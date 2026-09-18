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
    <main className="word-lists-page">
      <div className="word-lists-header">
        <div>
          <h1>Word Lists</h1>
          <p>Create and manage phoneme word lists for your activities.</p>
        </div>
      </div>

      <section className="word-list-form-card">
        <div className="word-list-section-heading">
          <h2>{editingWordListId ? "Edit Word List" : "Create Word List"}</h2>
          <p>
            {editingWordListId
              ? "Update the details of this word list."
              : "Create a list of words that can be used in your activities."}
          </p>
        </div>

        <form
          className="word-list-form"
          onSubmit={editingWordListId ? updateWordList : createWordList}
        >
          <label>
            <span>Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Initial /θ/ Words"
            />
          </label>

          <label>
            <span>Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </label>

          <div className="word-list-form-actions">
            <button type="submit" className="word-list-primary-button">
              {editingWordListId ? "Save Changes" : "Create Word List"}
            </button>

            {editingWordListId && (
              <button
                type="button"
                className="word-list-secondary-button"
                onClick={cancelEditingWordList}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {error && <div className="word-list-error">{error}</div>}

      <section className="word-lists-section">
        <div className="word-list-section-heading">
          <h2>Your Word Lists</h2>
          <p>Manage your saved phoneme word lists.</p>
        </div>

        {loading ? (
          <div className="word-list-empty-state">
            <p>Loading...</p>
          </div>
        ) : wordLists.length === 0 ? (
          <div className="word-list-empty-state">
            <h3>No word lists yet</h3>
            <p>Create your first word list using the form above.</p>
          </div>
        ) : (
          <div className="word-lists-grid">
            {wordLists.map((wordList) => (
              <article key={wordList.id} className="word-list-card">
                <div className="word-list-card-content">
                  <h3>
                    <Link href={`/word-lists/${wordList.id}`}>
                      {wordList.name}
                    </Link>
                  </h3>

                  {wordList.description ? (
                    <p className="word-list-description">
                      {wordList.description}
                    </p>
                  ) : (
                    <p className="word-list-description muted">
                      No description provided.
                    </p>
                  )}

                  <div className="word-list-stats">
                    <span>
                      <strong>{wordList.words.length}</strong> words
                    </span>

                    <span>
                      <strong>{wordList.activities.length}</strong> activities
                    </span>
                  </div>
                </div>

                <div className="word-list-card-actions">
                  <Link
                    href={`/word-lists/${wordList.id}`}
                    className="word-list-view-button"
                  >
                    Manage
                  </Link>

                  <button
                    type="button"
                    className="word-list-edit-button"
                    onClick={() => startEditingWordList(wordList)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="word-list-delete-button"
                    onClick={() => deleteWordList(wordList.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

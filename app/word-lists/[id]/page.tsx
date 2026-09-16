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
};

export default function WordListPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [wordList, setWordList] = useState<WordList | null>(null);
  const [english, setEnglish] = useState("");
  const [phoneme, setPhoneme] = useState("");
  const [phonemes, setPhonemes] = useState("");
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
    </main>
  );
}

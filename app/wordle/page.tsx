export default function Wordle() {
  return (
    <div>
      <h1>Wordle Activity Builder</h1>

      <p>
        Create a phoneme-based Wordle activity for your classroom.
      </p>

      <h2>Activity Settings</h2>

      <p>Target phoneme word:</p>

      <button>/θ/</button>
      <button>/ɪ/</button>
      <button>/ŋ/</button>

      <p>Difficulty:</p>

      <select>
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
      </select>

      <h2>Preview</h2>

      <p>Your Wordle preview will appear here.</p>

      <button>Generate HTML</button>
    </div>
  );
}
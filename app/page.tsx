import Link from "next/link";

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <p className="assessment-label">
            Assessment 1 · Frontend Design and Usability
          </p>

          <h1>PhonoPlay</h1>

          <h2>Phoneme Activity Builder</h2>

          <p className="hero-description">
            Create interactive phoneme-based classroom activities
            designed for Speech Pathology teachers and students.
          </p>

          <div className="hero-actions">
            <Link href="/wordle" className="primary-button">
              Create Wordle
            </Link>

            <Link href="/word-search" className="secondary-button">
              Create Word Search
            </Link>
          </div>
        </div>
      </section>

      <section className="activities-section">
        <div className="section-heading">
          <h2>Choose an Activity</h2>

          <p>
            Select an activity to configure and preview your
            phoneme-based classroom resource.
          </p>
        </div>

        <div className="activity-grid">
          <article className="activity-card">
            <div className="activity-icon">W</div>

            <h3>Phoneme Wordle</h3>

            <p>
              Create a Wordle-style guessing activity using
              phonemes instead of conventional spelling.
            </p>

            <ul>
              <li>Phoneme-based guessing</li>
              <li>Visual feedback</li>
              <li>English equivalence hints</li>
            </ul>

            <Link
              href="/wordle"
              className="card-button"
            >
              Open Wordle Builder
            </Link>
          </article>

          <article className="activity-card">
            <div className="activity-icon">S</div>

            <h3>Phoneme Word Search</h3>

            <p>
              Build a word search activity that helps students
              connect phoneme representations with English words.
            </p>

            <ul>
              <li>Five phoneme-based words</li>
              <li>Interactive puzzle</li>
              <li>English word equivalents</li>
            </ul>

            <Link
              href="/word-search"
              className="card-button"
            >
              Open Word Search Builder
            </Link>
          </article>
        </div>
      </section>

      <section className="information-section">
        <h2>Designed for Speech Pathology Education</h2>

        <p>
          PhonoPlay provides teachers with a simple interface for
          creating classroom activities focused on phoneme
          recognition and literacy skills.
        </p>

        <Link href="/about" className="text-link">
          Learn more about PhonoPlay →
        </Link>
      </section>
    </div>
  );
}
export default function About() {
  return (
    <div className="about-page">
      <section className="page-header">
        <p className="assessment-label">
          Assessment 1
        </p>

        <h1>About PhonoPlay</h1>

        <p>
          Learn more about the PhonoPlay project and the purpose
          of this assessment.
        </p>
      </section>

      <section className="about-grid">
        <article className="about-card">
          <h2>About the Project</h2>

          <p>
            PhonoPlay is a web-based activity builder designed
            for Speech Pathology teachers and students.
          </p>

          <p>
            The application allows teachers to create and preview
            phoneme-based classroom activities before generating
            a standalone HTML file that can be used in a normal
            web browser.
          </p>
        </article>

        <article className="about-card">
          <h2>Assessment 1</h2>

          <p>
            Assessment 1 focuses on frontend design, usability,
            responsive design and accessibility.
          </p>

          <p>
            This version uses fixed phoneme-based content. Database
            functionality, dynamic word lists and more advanced
            generation features will be introduced in later
            assessments.
          </p>
        </article>
      </section>

      <section className="about-card">
        <h2>Activities</h2>

        <div className="activity-description">
          <h3>Wordle</h3>

          <p>
            The Wordle activity uses phoneme symbols instead of
            conventional spelling. Students select phonemes to
            construct the target word and receive feedback about
            their answer.
          </p>
        </div>

        <div className="activity-description">
          <h3>Word Search</h3>

          <p>
            The Word Search activity provides a small fixed list
            of phoneme-based words. Students identify the English
            equivalents and locate them within an interactive
            puzzle.
          </p>
        </div>
      </section>

      <section className="about-card student-card">
        <h2>Student Information</h2>

        <p>
          <strong>Name:</strong> Maximilian Walker
        </p>

        <p>
          <strong>Student Number:</strong> 22304516
        </p>
      </section>

      <section className="about-card video-card">
        <h2>Assessment Video</h2>

        <p>
          The assessment demonstration and verbal justification
          video will be embedded below.
        </p>

        <div className="video-placeholder">
          <p>Assessment video</p>
          <span>
            Video will be added before submission.
          </span>
        </div>
      </section>
    </div>
  );
}
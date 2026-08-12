import ThemeSelector from "../components/ThemeSelector";
import LayoutSelector from "../components/LayoutSelector";

export default function Settings() {
  return (
    <div className="settings-page">
      <section className="page-header">
        <h1>Settings</h1>

        <p>Customise the PhonoPlay interface to suit your preferences.</p>
      </section>

      <section className="settings-card">
        <ThemeSelector />
      </section>

      <section className="settings-card">
        <h2>Layout</h2>

        <LayoutSelector />
      </section>
    </div>
  );
}

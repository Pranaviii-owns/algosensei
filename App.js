import "./App.css";
import Layout from "./components/Layout";
import { useState } from "react";

function App() {
  const [problemText, setProblemText] = useState("");
  const [codeText, setCodeText] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [isLight, setIsLight] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problemText.trim()) return;

    const entry = {
      title: problemText,
      description: problemText,
      code: codeText,
    };

    try {
      const res = await fetch("http://localhost:5000/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });

      if (!res.ok) {
        console.error("Failed to save problem");
        return;
      }

      const saved = await res.json(); // {_id, title, description, code, topic, difficulty,...}

      const uiItem = {
        id: saved._id,
        problem: saved.description,
        code: saved.code,
        topic: saved.topic,
        difficulty: saved.difficulty,
        timeComplexity: saved.timeComplexity,
        spaceComplexity: saved.spaceComplexity,
        solution: saved.solution || null, // solution may be null initially
      };

      setSubmissions([uiItem, ...submissions]);
      setProblemText("");
      setCodeText("");
    } catch (err) {
      console.error("Error calling API:", err);
    }
  };

  const toggleTheme = () => {
    setIsLight(!isLight);
  };

  // =========================
  // NEW: Generate solution for a problem
  // =========================
  const generateSolution = async (id) => {
    try {
      // Update UI to show loading (optional)
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, solution: "Generating solution..." } : item
        )
      );

      const res = await fetch(`http://localhost:5000/api/problems/${id}/generate`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to generate solution");

      const updated = await res.json(); // {_id, solution, topic, difficulty, ...}

      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...updated } : item
        )
      );
    } catch (err) {
      console.error("Error generating solution:", err);
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, solution: "Failed to generate solution" } : item
        )
      );
    }
  };

  return (
    <Layout onToggleTheme={toggleTheme} isLight={isLight}>
      <section className="center-section">
        <h2 className="page-title">Describe your DSA problem</h2>
        <p className="tagline">
          Paste a problem statement, with or without your code. AlgoSensei will classify and analyze it.
        </p>

        <form className="prompt-form" onSubmit={handleSubmit}>
          <textarea
            className="prompt-input"
            placeholder="Describe the problem you are trying to solve..."
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            rows={4}
          />
          <textarea
            className="code-input"
            placeholder="Optional: paste your code here..."
            value={codeText}
            onChange={(e) => setCodeText(e.target.value)}
            rows={4}
          />
          <button type="submit" className="primary-btn big-btn">
            Analyze Problem
          </button>
        </form>

        <div className="history-card">
          {submissions.length === 0 ? (
            <p className="empty-text">
              No problems analyzed yet. Try entering one above.
            </p>
          ) : (
            submissions.map((item) => (
              <div key={item.id} className="history-item">
                <p className="history-problem">{item.problem}</p>
                {item.code && <pre className="history-code">{item.code}</pre>}
                <p className="history-meta">
                  Topic: {item.topic} · Difficulty: {item.difficulty} · TC: {item.timeComplexity} · SC: {item.spaceComplexity}
                </p>

                {/* =========================
                    NEW: Generate Solution Button
                ========================= */}
                {!item.solution && (
                  <button
                    className="primary-btn small-btn"
                    onClick={() => generateSolution(item.id)}
                  >
                    Generate Solution
                  </button>
                )}

                {/* Display solution if available */}
                {item.solution && (
                  <pre className="history-solution">
                    {item.solution}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </Layout>
  );
}

export default App;


/*import "./App.css";
import Layout from "./components/Layout";
import { useState } from "react";

function App() {
  const [problemText, setProblemText] = useState("");
  const [codeText, setCodeText] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [isLight, setIsLight] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problemText.trim()) return;

    // data to send to backend
    const entry = {
      title: problemText,
      description: problemText,
      code: codeText,
    };

    try {
      const res = await fetch("http://localhost:5000/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });

      if (!res.ok) {
        console.error("Failed to save problem");
        return;
      }

      const saved = await res.json(); // {_id, title, description, code, createdAt}

      const uiItem = {
        id: saved._id,
        problem: saved.description,
        code: saved.code,
        topic: "To be detected",
        difficulty: "To be detected",
        timeComplexity: "To be detected",
        spaceComplexity: "To be detected",
      };

      setSubmissions([uiItem, ...submissions]);
      setProblemText("");
      setCodeText("");
    } catch (err) {
      console.error("Error calling API:", err);
    }
  };

  const toggleTheme = () => {
    setIsLight(!isLight);
  };

  
  
  return (
    <Layout onToggleTheme={toggleTheme} isLight={isLight}>
      <section className="center-section">
        <h2 className="page-title">Describe your DSA problem</h2>
        <p className="tagline">
          Paste a problem statement, with or without your code. AlgoSensei will classify and analyze it.
        </p>

        <form className="prompt-form" onSubmit={handleSubmit}>
          <textarea
            className="prompt-input"
            placeholder="Describe the problem you are trying to solve..."
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            rows={4}
          />
          <textarea
            className="code-input"
            placeholder="Optional: paste your code here..."
            value={codeText}
            onChange={(e) => setCodeText(e.target.value)}
            rows={4}
          />
          <button type="submit" className="primary-btn big-btn">
            Analyze Problem
          </button>
        </form>

        <div className="history-card">
          {submissions.length === 0 ? (
            <p className="empty-text">
              No problems analyzed yet. Try entering one above.
            </p>
          ) : (
            submissions.map((item) => (
              <div key={item.id} className="history-item">
                <p className="history-problem">{item.problem}</p>
                {item.code && <pre className="history-code">{item.code}</pre>}
                <p className="history-meta">
                  Topic: {item.topic} · Difficulty: {item.difficulty} · TC: {item.timeComplexity} · SC:{" "}
                  {item.spaceComplexity}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </Layout>
  );
}

export default App;
*/
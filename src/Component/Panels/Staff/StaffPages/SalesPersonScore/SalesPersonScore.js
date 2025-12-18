import React, { useState, useEffect } from "react";
import { baseurl } from "../../../../BaseURL/BaseURL";
import "./SalesPersonScore.css";

function SalespersonScores() {
  const [scoresData, setScoresData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setLoggedInUser(JSON.parse(userData));
      } catch (err) {
        console.error("Invalid user data");
      }
    }
  }, []);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseurl}/api/salesperson-scores`);
        const data = await res.json();

        if (data.success) {
          setScoresData(data.data || []);
          if (loggedInUser) {
            setFilteredData(
              data.data.filter(
                (p) =>
                  p.id === loggedInUser.id ||
                  p.email === loggedInUser.email
              )
            );
          }
        } else {
          setError("Failed to fetch data");
        }
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [loggedInUser]);

  const formatCurrency = (val) =>
    `₹${Number(val || 0).toLocaleString("en-IN")}`;

  const formatPercent = (val) =>
    `${Number(val || 0).toFixed(1)}%`;

  if (loading) {
    return <div className="sp-loading">Loading performance data...</div>;
  }

  if (error) {
    return <div className="sp-error">{error}</div>;
  }

  if (!filteredData.length) {
    return (
      <div className="sp-no-data">
        No performance data available
      </div>
    );
  }

  return (
    <div className="sp-container">
      <h2 className="sp-title">My Performance Score</h2>

      <div className="sp-card-grid">
        {filteredData.map((person) => (
          <div className="sp-card" key={person.id}>
            {/* Header */}
            <div className="sp-card-header">
              <div className="sp-avatar">
                {person.name?.charAt(0)}
              </div>
              <div>
                <h4 className="sp-name">{person.name}</h4>
                <p className="sp-email">{person.email}</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="sp-metrics">
              <div className="sp-metric">
                <span>Target</span>
                <strong>{formatCurrency(person.target)}</strong>
              </div>

              <div className="sp-metric">
                <span>Current Score</span>
                <strong>{formatCurrency(person.current_score)}</strong>
              </div>

              <div className="sp-metric">
                <span>Achievement</span>
                <strong>{formatPercent(person.achievement_percentage)}</strong>
              </div>
            </div>

            {/* Progress */}
            <div className="sp-progress">
              <div
                className="sp-progress-fill"
                style={{
                  width: `${Math.min(
                    100,
                    Number(person.achievement_percentage || 0)
                  )}%`,
                }}
              />
            </div>

            {/* Score */}
            <div
              className={`sp-score ${
                Number(person.score_marks) >= 50
                  ? "sp-score-good"
                  : "sp-score-low"
              }`}
            >
              Score Marks: {person.score_marks}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SalespersonScores;

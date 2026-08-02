import React, { useEffect, useState } from "react";
import FeedbackForm from "../components/FeedbackForm";
import { getMyFeedback } from "../services/feedbackApi";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await getMyFeedback();
      setFeedbacks(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div style={styles.container}>
      <h1>User Feedback</h1>

      {/* FORM */}
      <FeedbackForm onFeedbackSubmitted={fetchFeedbacks} />

      {/* LIST */}
      <div style={styles.listContainer}>
        <h2>Your Feedback History</h2>

        {loading ? (
          <p>Loading...</p>
        ) : feedbacks.length === 0 ? (
          <p>No feedback submitted yet.</p>
        ) : (
          feedbacks.map((fb) => (
            <div key={fb.id} style={styles.card}>
              <h3>{fb.subject}</h3>
              <p>{fb.message}</p>

              <div style={styles.row}>
                <span>⭐ {fb.rating}</span>
                <span>Status: {fb.status}</span>
              </div>

              {(fb.replies?.length > 0 || fb.admin_reply) && (
                <div style={styles.replySection}>
                  <strong>Conversation:</strong>
                  <div style={styles.replyThread}>
                    <div style={styles.userMessageBox}>
                      <strong>Your Feedback:</strong>
                      <p>{fb.message}</p>
                    </div>

                    {(fb.replies || []).map((reply) => (
                      <div key={reply.id} style={styles.adminReplyBox}>
                        <strong>Admin Reply:</strong>
                        <p>{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "auto",
    padding: "20px",
  },
  listContainer: {
    marginTop: "40px",
  },
  card: {
    border: "1px solid #ddd",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "10px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  replySection: {
    marginTop: "10px",
    padding: "10px",
    background: "#f5f5f5",
    borderRadius: "8px",
  },
  replyThread: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "8px",
  },
  userMessageBox: {
    background: "#e3f2fd",
    padding: "8px",
    borderRadius: "6px",
  },
  adminReplyBox: {
    background: "#fff3e0",
    padding: "8px",
    borderRadius: "6px",
  },
};

export default Feedback;
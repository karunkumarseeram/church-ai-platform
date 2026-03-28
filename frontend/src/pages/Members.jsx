import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function Members() {
  const { userRole, token } = useContext(AuthContext);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // items per page

  // 🔹 Load members with pagination
  const loadMembers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/members?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data.members);
      setTotalPages(Math.ceil(res.data.total / limit));
      setPage(res.data.page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "ADMIN") loadMembers(page);
  }, [userRole, page]);

  const handleApprove = async (id) => {
    try {
      await API.put(`/admin/members/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadMembers(page);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevoke = async (id) => {
    try {
      await API.put(`/admin/members/${id}/revoke`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadMembers(page);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <h3 style={{ padding: 20 }}>Loading members...</h3>;
  if (userRole !== "ADMIN") return <h3 style={{ padding: 20 }}>Access Denied</h3>;

  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ color: "#6A1B9A", marginBottom: 20 }}>Members</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Approved</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
        {members.map((m, index) => (
          <tr key={m.id}>
            {/* Serial number: index + 1 + offset for pagination */}
            <td>{(page - 1) * limit + index + 1}</td>
            <td>{m.name}</td>
            <td>{m.email}</td>
            <td>{m.phone}</td>
            <td>{m.role || "MEMBER"}</td>
            <td>{m.is_approved ? "Yes" : "No"}</td>
            <td>
              {!m.is_approved ? (
                <button style={styles.approveBtn} onClick={() => handleApprove(m.id)}>
                  Approve
                </button>
              ) : (
                <button style={styles.revokeBtn} onClick={() => handleRevoke(m.id)}>
                  Revoke
                </button>
              )}
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>

      {/* 🔹 Pagination */}
      <div style={styles.pagination}>
        <button
          style={styles.pageBtn}
          disabled={page === 1}
          onClick={() => loadMembers(page - 1)}
        >
          Previous
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {page} of {totalPages}
        </span>
        <button
          style={styles.pageBtn}
          disabled={page === totalPages}
          onClick={() => loadMembers(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 800,
  },
  approveBtn: {
    padding: "5px 12px",
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    marginRight: 5,
  },
  revokeBtn: {
    padding: "5px 12px",
    background: "#F44336",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
  pagination: {
    marginTop: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  pageBtn: {
    padding: "5px 12px",
    margin: "0 5px",
    background: "#6A1B9A",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    disabled: { opacity: 0.5, cursor: "not-allowed" },
  },
};
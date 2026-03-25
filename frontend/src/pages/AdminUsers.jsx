// pages/AdminUsers.jsx
import { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get("/admin/users").then(res => setUsers(res.data));
  }, []);

  const approve = async (id) => {
    await API.put(`/admin/approve/${id}`);
  };

  return (
    <div>
      <h2>Pending Users</h2>
      {users.map(u => (
        <div key={u.id}>
          {u.email}
          <button onClick={()=>approve(u.id)}>Approve</button>
        </div>
      ))}
    </div>
  );
}
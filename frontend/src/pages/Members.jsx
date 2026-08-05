import { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Pagination,
  Card,
  CardContent,
  Grid,
  Avatar,
  IconButton,
  Tooltip
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RevokeIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AdminPanelSettings as AdminIcon
} from "@mui/icons-material";
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

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ name: "", email: "", phone: "", role: "MEMBER" });
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

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

  const handleInviteSubmit = async () => {
    if (!inviteData.name || !inviteData.email) {
      setInviteError("Name and email are required");
      return;
    }

    try {
      const res = await API.post("/admin/members/invite", inviteData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInviteSuccess(res.data.message || "Invitation sent");
      setInviteError("");
      setInviteModalOpen(false);
      setInviteData({ name: "", email: "", phone: "", role: "MEMBER" });
      loadMembers(page);
    } catch (err) {
      setInviteError(err.response?.data?.detail || "Failed to send invitation");
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "error";
      case "PASTOR":
        return "warning";
      default:
        return "default";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "ADMIN":
        return <AdminIcon fontSize="small" />;
      case "PASTOR":
        return <PersonIcon fontSize="small" />;
      default:
        return <PersonIcon fontSize="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography variant="h6" color="text.secondary">Loading members...</Typography>
      </Box>
    );
  }

  if (userRole !== "ADMIN") {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography variant="h5" color="error" sx={{ textAlign: 'center' }}>
          Access Denied
          <br />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Only administrators can view this page
          </Typography>
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ color: 'primary.main', fontSize: 30 }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Church Members Management
              </Typography>
            </Box>
            <Button
              variant="contained"
              sx={{ background: '#6A1B9A', '&:hover': { background: '#4B0F72' } }}
              onClick={() => setInviteModalOpen(true)}
            >
              Invite Pastor / Member
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage church members, approve new registrations, and oversee member status.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                    #
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                    Member Details
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                    Contact Information
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                    Role
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                      <Typography variant="h6" color="text.secondary">
                        No members found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member, index) => (
                    <TableRow
                      key={member.id}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                        '&:hover': { backgroundColor: 'action.selected' }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {(page - 1) * limit + index + 1}
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {member.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {member.name}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">{member.email}</Typography>
                          </Box>
                          {member.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">{member.phone}</Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={getRoleIcon(member.role || "MEMBER")}
                          label={member.role || "MEMBER"}
                          color={getRoleColor(member.role || "MEMBER")}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={member.is_approved ? "Approved" : "Pending"}
                          color={member.is_approved ? "success" : "warning"}
                          size="small"
                          variant={member.is_approved ? "filled" : "outlined"}
                        />
                      </TableCell>

                      <TableCell>
                        {!member.is_approved ? (
                          <Tooltip title="Approve Member">
                            <IconButton
                              color="success"
                              onClick={() => handleApprove(member.id)}
                              sx={{ mr: 1 }}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Revoke Approval">
                            <IconButton
                              color="error"
                              onClick={() => handleRevoke(member.id)}
                            >
                              <RevokeIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {inviteModalOpen && (
        <Box sx={inviteStyles.overlay}>
          <Box sx={inviteStyles.modal}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Invite a Member or Pastor
            </Typography>
            {inviteError && (
              <Typography color="error" sx={{ mb: 2 }}>
                {inviteError}
              </Typography>
            )}
            {inviteSuccess && (
              <Typography color="success.main" sx={{ mb: 2 }}>
                {inviteSuccess}
              </Typography>
            )}
            <Box sx={{ display: 'grid', gap: 2 }}>
              <input
                value={inviteData.name}
                onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                placeholder="Name"
                style={inviteStyles.input}
              />
              <input
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                placeholder="Email"
                style={inviteStyles.input}
              />
              <input
                value={inviteData.phone}
                onChange={(e) => setInviteData({ ...inviteData, phone: e.target.value })}
                placeholder="Phone"
                style={inviteStyles.input}
              />
              <select
                value={inviteData.role}
                onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                style={inviteStyles.select}
              >
                <option value="MEMBER">Member</option>
                <option value="PASTOR">Pastor</option>
              </select>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                sx={{ color: '#6A1B9A', borderColor: '#6A1B9A' }}
                onClick={() => setInviteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{ background: '#6A1B9A', '&:hover': { background: '#4B0F72' } }}
                onClick={handleInviteSubmit}
              >
                Send Invite
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

const inviteStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1500,
  },
  modal: {
    width: 420,
    bgcolor: '#fff',
    borderRadius: 3,
    p: 4,
    boxShadow: '0 18px 45px rgba(0,0,0,0.2)',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 15,
  },
  select: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 15,
    background: '#fff',
  },
};

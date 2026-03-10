
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import MovieListCard from "../components/MovieListCard";
import {
  createList,
  deleteList,
  formatApiErrorDetail,
  getMyLists,
  updateListName,
  updateListNote,
} from "../services/userListService";

const EMPTY_FORM = { list_name: "", list_note: "" };

export default function UserLists() {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [activeList, setActiveList] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadLists = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyLists();
      setLists(data || []);
    } catch (err) {
      setError(formatApiErrorDetail(err, "Failed to load your lists."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  const openCreate = () => {
    setModalMode("create");
    setActiveList(null);
    setForm(EMPTY_FORM);
  };

  const openEdit = (list) => {
    setModalMode("edit");
    setActiveList(list);
    setForm({
      list_name: list.list_name || "",
      list_note: list.list_note || "",
    });
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveList(null);
    setForm(EMPTY_FORM);
  };

  const handleCreateOrUpdate = async () => {
    if (!form.list_name.trim()) {
      setError("List name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (modalMode === "create") {
        await createList({
          list_name: form.list_name.trim(),
          list_note: form.list_note.trim(),
        });
      } else if (modalMode === "edit" && activeList) {
        await updateListName(activeList.list_id, form.list_name.trim());
        await updateListNote(activeList.list_id, form.list_note.trim());
      }
      closeModal();
      await loadLists();
    } catch (err) {
      setError(formatApiErrorDetail(err, "Failed to save list."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (listId) => {
    setError("");
    try {
      await deleteList(listId);
      await loadLists();
    } catch (err) {
      setError(formatApiErrorDetail(err, "Failed to delete list."));
    }
  };

  return (
    <Container sx={{ py: 3 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Your Lists</Typography>
        <Button variant="contained" onClick={openCreate}>Create New List</Button>
      </Grid>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2} alignItems={"stretch"}>
          {lists.map((list) => (
            <Grid item xs={12} sm={6} md={3} key={list.list_id}>
              <MovieListCard
                list={list}
                editable
                onEdit={openEdit}
                onDelete={handleDelete}
                onOpenList={(listId) => navigate(`/lists/${listId}`)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={Boolean(modalMode)} onClose={closeModal} fullWidth maxWidth="sm">
        <DialogTitle>{modalMode === "create" ? "Create New List" : "Update List"}</DialogTitle>
        <DialogContent>
          <TextField
            label="List Name"
            fullWidth
            margin="normal"
            value={form.list_name}
            onChange={(event) => setForm((prev) => ({ ...prev, list_name: event.target.value }))}
          />
          <TextField
            label="List Note"
            fullWidth
            margin="normal"
            multiline
            minRows={3}
            value={form.list_note}
            onChange={(event) => setForm((prev) => ({ ...prev, list_note: event.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={handleCreateOrUpdate} variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

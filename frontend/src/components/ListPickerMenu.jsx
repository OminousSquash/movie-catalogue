import { Menu, MenuItem } from "@mui/material";

export default function ListPickerMenu({
  anchorEl, onClose, lists, loading, addingToListId, onSelect
}) {
  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      {loading ? (
        <MenuItem disabled>Loading your lists...</MenuItem>
      ) : lists.length === 0 ? (
        <MenuItem disabled>No lists yet</MenuItem>
      ) : (
        lists.map((list) => (
          <MenuItem
            key={list.list_id}
            onClick={() => onSelect(list.list_id)}
            disabled={addingToListId === list.list_id}
          >
            {addingToListId === list.list_id ? "Adding..." : list.list_name}
          </MenuItem>
        ))
      )}
    </Menu>
  );
}
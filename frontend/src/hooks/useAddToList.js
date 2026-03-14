import { useState } from "react";
import { addMovieToList, formatApiErrorDetail, getMyLists } from "../services/userListService";

export function useAddToList() {
  const [myLists, setMyLists] = useState([]);
  const [listsLoaded, setListsLoaded] = useState(false);
  const [listPickerAnchorEl, setListPickerAnchorEl] = useState(null);
  const [activeMovieTconst, setActiveMovieTconst] = useState(null);
  const [listPickerLoading, setListPickerLoading] = useState(false);
  const [addingToListId, setAddingToListId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleOpenAddMenu = async (event, movie) => {
    setMessage({ type: "", text: "" });
    setActiveMovieTconst(movie.tconst);
    setListPickerAnchorEl(event.currentTarget);
    if (!listsLoaded) {
      setListPickerLoading(true);
      try {
        const lists = await getMyLists();
        setMyLists(lists || []);
        setListsLoaded(true);
      } catch (err) {
        setMessage({ type: "error", text: formatApiErrorDetail(err, "Failed to load your lists.") });
      } finally {
        setListPickerLoading(false);
      }
    }
  };

  const handleCloseAddMenu = () => {
    setListPickerAnchorEl(null);
    setActiveMovieTconst(null);
    setAddingToListId(null);
  };

  const handleAddMovieToList = async (listId) => {
    if (!activeMovieTconst) return;
    setAddingToListId(listId);
    try {
      const result = await addMovieToList(listId, activeMovieTconst);
      setMessage({ type: "success", text: result?.message || "Movie added successfully." });
      handleCloseAddMenu();
    } catch (err) {
      setMessage({ type: "error", text: formatApiErrorDetail(err, "Failed to add movie to list.") });
      setAddingToListId(null);
    }
  };

  return {
    message,
    addingToListId,
    listPickerAnchorEl,
    listPickerLoading,
    myLists,
    handleOpenAddMenu,
    handleCloseAddMenu,
    handleAddMovieToList,
  };
}
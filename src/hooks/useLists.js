import { useState } from "react";
import { supabase } from "../supabaseClient";

export function useLists(session) {
  const [lists, setLists] = useState([]);
  const [currentListId, setCurrentListId] = useState(null);
  const [listStats, setListStats] = useState({});
  const [newListName, setNewListName] = useState("");
  const [editingListId, setEditingListId] = useState(null);
  const [editListName, setEditListName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  async function fetchListStats(listIds) {
    if (!listIds || listIds.length === 0) return;
    const { data, error } = await supabase
      .from('todos')
      .select('list_id, done')
      .in('list_id', listIds);
    if (error) { console.error(error); return; }

    const stats = {};
    data.forEach((t) => {
      if (!stats[t.list_id]) stats[t.list_id] = { total: 0, done: 0 };
      stats[t.list_id].total += 1;
      if (t.done) stats[t.list_id].done += 1;
    });
    setListStats(stats);
  }

  async function fetchLists() {
    const { data: memberRows, error: memberError } = await supabase
      .from('list_members')
      .select('list_id')
      .eq('user_id', session.user.id);

    if (memberError) { console.error(memberError); return; }

    const listIds = memberRows.map((m) => m.list_id);
    if (listIds.length === 0) return;

    const { data: listData, error: listError } = await supabase
      .from('lists')
      .select('*')
      .in('id', listIds);

    if (listError) { console.error(listError); return; }

    setLists(listData);
    fetchListStats(listData.map((l) => l.id));
    if (listData.length > 0 && !currentListId) {
      setCurrentListId(listData[0].id);
    }
  }

  async function createList(onCreated) {
    const name = newListName.trim();
    if (!name) return;
    const { data, error } = await supabase
      .from('lists')
      .insert([{ name, owner_id: session.user.id }])
      .select();
    if (error) { console.error(error); return; }

    await supabase.from('list_members').insert([
      { list_id: data[0].id, user_id: session.user.id, role: 'owner' }
    ]);

    setLists((prev) => [...prev, data[0]]);
    setCurrentListId(data[0].id);
    setNewListName("");
    if (onCreated) onCreated(data[0].id);
  }

  async function renameList(id) {
    const name = editListName.trim();
    if (!name) return;
    const { error } = await supabase.from('lists').update({ name }).eq('id', id);
    if (error) {
      console.error(error);
    } else {
      setLists((prev) => prev.map((l) => (l.id === id ? { ...l, name } : l)));
      setEditingListId(null);
      setEditListName("");
    }
  }

  async function deleteList(id) {
    const { error } = await supabase.from('lists').delete().eq('id', id);
    if (error) {
      console.error(error);
    } else {
      setLists((prev) => prev.filter((l) => l.id !== id));
      if (currentListId === id) setCurrentListId(null);
    }
  }

  return {
    lists, setLists, currentListId, setCurrentListId, listStats,
    newListName, setNewListName, editingListId, setEditingListId,
    editListName, setEditListName, confirmDeleteId, setConfirmDeleteId,
    fetchLists, fetchListStats, createList, renameList, deleteList,
  };
}
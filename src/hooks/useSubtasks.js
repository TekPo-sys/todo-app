import { useState } from "react";
import { supabase } from "../supabaseClient";

export function useSubtasks(session) {
  const [subtasks, setSubtasks] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [newSubtaskText, setNewSubtaskText] = useState("");

  async function fetchSubtasks() {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .order('position', { ascending: true });
    if (error) { console.error(error); return; }

    const grouped = {};
    data.forEach((s) => {
      if (!grouped[s.todo_id]) grouped[s.todo_id] = [];
      grouped[s.todo_id].push(s);
    });
    setSubtasks(grouped);
  }

  async function addSubtask(todoId) {
    const text = newSubtaskText.trim();
    if (!text) return;
    const { data, error } = await supabase
      .from('subtasks')
      .insert([{ todo_id: todoId, text, done: false, user_id: session.user.id }])
      .select();
    if (error) { console.error(error); return; }
    setSubtasks((prev) => ({
      ...prev,
      [todoId]: [...(prev[todoId] || []), data[0]],
    }));
    setNewSubtaskText("");
  }

  async function toggleSubtask(todoId, subtaskId, done) {
    const { error } = await supabase.from('subtasks').update({ done: !done }).eq('id', subtaskId);
    if (error) { console.error(error); return; }
    setSubtasks((prev) => ({
      ...prev,
      [todoId]: prev[todoId].map((s) => (s.id === subtaskId ? { ...s, done: !done } : s)),
    }));
  }

  async function deleteSubtask(todoId, subtaskId) {
    const { error } = await supabase.from('subtasks').delete().eq('id', subtaskId);
    if (error) { console.error(error); return; }
    setSubtasks((prev) => ({
      ...prev,
      [todoId]: prev[todoId].filter((s) => s.id !== subtaskId),
    }));
  }

  return {
    subtasks, expandedId, setExpandedId, newSubtaskText, setNewSubtaskText,
    fetchSubtasks, addSubtask, toggleSubtask, deleteSubtask,
  };
}
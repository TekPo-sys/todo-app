import { useState } from "react";
import { supabase } from "../supabaseClient";

export function useTodos(session, currentListId, fetchListStatsCallback, lists) {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  async function fetchTodos() {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('list_id', currentListId)
      .order('position', { ascending: true });
    if (error) { console.error(error); return; }
    setTodos(data);
  }

  async function addTodo() {
    const text = input.trim();
    if (!text) return;
    const { data, error } = await supabase
      .from('todos')
      .insert([{ text, done: false, user_id: session.user.id, list_id: currentListId }])
      .select();
    if (error) console.error(error);
    else setTodos((prev) => [data[0], ...prev]);
    setInput("");
  }

  async function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    const { error } = await supabase
      .from('todos')
      .update({ done: !todo.done })
      .eq('id', id);
    if (error) console.error(error);
    else {
      fetchTodos();
      fetchListStatsCallback(lists.map((l) => l.id));
    }
  }

  async function updateCategory(id, category) {
    const { error } = await supabase.from('todos').update({ category }).eq('id', id);
    if (error) console.error(error);
    else setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, category } : t)));
  }

  async function cycleColor(id, color) {
    const { error } = await supabase.from('todos').update({ color }).eq('id', id);
    if (error) console.error(error);
    else setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, color } : t)));
  }

  async function deleteTodo(id) {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) console.error(error);
    else setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  async function clearCompleted() {
    const { error } = await supabase.from('todos').delete().eq('done', true);
    if (error) console.error(error);
    else setTodos((prev) => prev.filter((t) => !t.done));
  }

  function startEdit(todo) {
    setEditingId(todo.id);
    setEditText(todo.text);
    setEditDueDate(todo.due_date || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
    setEditDueDate("");
  }

  async function saveEdit(id) {
    const text = editText.trim();
    if (!text) return;
    const { error } = await supabase
      .from('todos')
      .update({ text, due_date: editDueDate || null })
      .eq('id', id);
    if (error) {
      console.error(error);
    } else {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, text, due_date: editDueDate || null } : t))
      );
      cancelEdit();
    }
  }

  function isOverdue(dueDate, done) {
    if (!dueDate || done) return false;
    const today = new Date().toISOString().split("T")[0];
    return dueDate < today;
  }

  const filtered = todos.filter((t) => {
    if (filter === "active" && t.done) return false;
    if (filter === "done" && !t.done) return false;
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    return true;
  });

  return {
    todos, setTodos, input, setInput, filter, setFilter, categoryFilter, setCategoryFilter,
    editingId, editText, setEditText, editDueDate, setEditDueDate,
    fetchTodos, addTodo, toggleTodo, updateCategory, cycleColor, deleteTodo, clearCompleted,
    startEdit, cancelEdit, saveEdit, isOverdue, filtered,
  };
}
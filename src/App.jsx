
import { Plus, Trash2, Check, ListChecks, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


function SortableTodoItem({
  todo, colorOptions, categoryOptions, toggleTodo, cycleColor, deleteTodo,
  editingId, startEdit, saveEdit, cancelEdit, editText, setEditText, editDueDate, setEditDueDate, isOverdue,
  updateCategory, subtasks, expandedId, setExpandedId, newSubtaskText, setNewSubtaskText, addSubtask, toggleSubtask, deleteSubtask,
  allCategories, newCategoryText, setNewCategoryText, addCustomCategory,
  detailsOpenId, setDetailsOpenId,}) {

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const color = colorOptions.find((c) => c.name === todo.color) || colorOptions[0];
  const overdue = isOverdue(todo.due_date, todo.done);
  const isEditing = editingId === todo.id;

  if (isEditing) {
    return (
      <li
        ref={setNodeRef}
        style={style}
        className={`flex flex-col gap-2 px-3 py-3.5 rounded-lg transition border-l-4 ${color.border} ${color.bg}`}
      >
        <input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && saveEdit(todo.id)}
          className="text-base px-3 py-2 rounded-lg border border-stone-300 outline-none focus:border-stone-500 w-full"
          autoFocus
        />
        <input
          type="date"
          value={editDueDate}
          onChange={(e) => setEditDueDate(e.target.value)}
          className="text-sm px-3 py-2 rounded-lg border border-stone-300 outline-none focus:border-stone-500 w-full"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => saveEdit(todo.id)}
            className="flex-1 text-sm bg-emerald-700 text-white px-3 py-2 rounded-lg hover:bg-emerald-800"
          >
            Save
          </button>
          <button
            onClick={cancelEdit}
            className="flex-1 text-sm bg-orange-50 text-stone-500 px-3 py-2 rounded-lg hover:bg-stone-200"
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
  <>
    <li
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 px-3 py-3.5 rounded-lg hover:bg-orange-50/50 transition border-l-4 ${color.border} ${color.bg} hover:brightness-95`}
    >
    {/* Drag handle */}
      <button {...attributes} {...listeners} className="text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none text-lg px-1">
        ⋮⋮
      </button>

      {/* check box */}
      <button
        onClick={() => toggleTodo(todo.id)}
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
          todo.done ? "bg-emerald-700 border-emerald-700" : "border-stone-300 hover:border-stone-500"
        }`}
        aria-label={todo.done ? "Mark as not done" : "Mark as done"}
      >
        {todo.done && <Check size={16} className="text-stone-50" />}
      </button>

      <div className="flex-1 min-w-0">
        <span
          onClick={() => startEdit(todo)}
          className={`text-base cursor-text ${todo.done ? "text-stone-400 line-through" : "text-stone-800"}`}
        >
          {todo.text}
        </span>
        <div
          onClick={() => startEdit(todo)}
          className={`text-sm ${todo.due_date ? (overdue ? "text-red-500 font-medium" : "text-stone-400") : "text-stone-300 italic"}`}
        >
          {todo.due_date
            ? `${overdue ? "Overdue: " : "Due "}${new Date(todo.due_date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
            : "Add due date"}
        </div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {todo.category && todo.category !== "none" && (
            <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-stone-500">
              {todo.category}
            </span>
          )}
          <button
            onClick={() => setDetailsOpenId(detailsOpenId === todo.id ? null : todo.id)}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-orange-50 text-stone-600 hover:bg-stone-200 transition"
          >
            Priority & category
            <span className={`transition-transform ${detailsOpenId === todo.id ? "rotate-180" : ""}`}>▾</span>
          </button>
          <button
            onClick={() => setExpandedId(expandedId === todo.id ? null : todo.id)}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-orange-50 text-stone-600 hover:bg-stone-200 transition"
          >
            {(subtasks[todo.id]?.length || 0) > 0
              ? `${subtasks[todo.id].filter(s => s.done).length}/${subtasks[todo.id].length} subtasks`
              : "Subtasks"}
            <span className={`transition-transform ${expandedId === todo.id ? "rotate-180" : ""}`}>▾</span>
          </button>
        </div>
      </div>
      <button
        onClick={() => deleteTodo(todo.id)}
        className="text-stone-400 active:text-red-500 transition flex-shrink-0"
        aria-label="Delete task"
      >
        <Trash2 size={18} />
      </button>
    </li>

    {detailsOpenId === todo.id && (
  <li className="pl-10 pr-2 pb-3">
    <div className="text-xs text-stone-400 mb-1.5">Priority</div>
    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
      {colorOptions.map((c) => (
        <button
          key={c.name}
          onClick={() => cycleColor(todo.id, c.name)}
          className={`text-sm px-3 py-1.5 rounded-full transition flex items-center gap-1.5 ${
            (todo.color || "none") === c.name
              ? "bg-emerald-700 text-white"
              : "bg-orange-50 text-stone-500 hover:bg-stone-200"
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
          {c.name === "none" ? "No priority" : c.name.charAt(0).toUpperCase() + c.name.slice(1)}
        </button>
      ))}
    </div>

    <div className="text-xs text-stone-400 mb-1.5">Category</div>
    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
      {allCategories.map((c) => (
        <button
          key={c}
          onClick={() => updateCategory(todo.id, c)}
          className={`text-sm px-3 py-1.5 rounded-full transition ${
            (todo.category || "none") === c
              ? "bg-emerald-700 text-white"
              : "bg-orange-50 text-stone-500 hover:bg-stone-200"
          }`}
        >
          {c === "none" ? "No category" : c}
        </button>
      ))}
    </div>

    <div className="flex items-center gap-2">
      <input
        value={newCategoryText}
        onChange={(e) => setNewCategoryText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addCustomCategory()}
        placeholder="New category..."
        className="flex-1 text-sm px-2 py-1.5 rounded-lg border border-orange-100 outline-none focus:border-stone-400"
      />
      <button
        onClick={addCustomCategory}
        className="text-sm bg-orange-50 text-stone-600 px-3 py-1.5 rounded-lg hover:bg-stone-200"
      >
        Add
      </button>
    </div>
  </li>
)}

    {expandedId === todo.id && (
      <li className="pl-10 pr-2 pb-3">
        <div className="space-y-1 mb-2">
          {(subtasks[todo.id] || []).map((s) => (
            <div key={s.id} className="flex items-center gap-2 group/sub">
              <button
                onClick={() => toggleSubtask(todo.id, s.id, s.done)}
                className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                  s.done ? "bg-emerald-700 border-emerald-700" : "border-stone-300"
                }`}
              >
                {s.done && <Check size={10} className="text-stone-50" />}
              </button>
              <span className={`text-sm flex-1 ${s.done ? "text-stone-400 line-through" : "text-stone-700"}`}>
                {s.text}
              </span>
              <button
                onClick={() => deleteSubtask(todo.id, s.id)}
                className="text-stone-300 active:text-red-500"              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={newSubtaskText}
            onChange={(e) => setNewSubtaskText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSubtask(todo.id)}
            placeholder="Add a subtask"
            className="flex-1 text-sm px-2 py-1.5 rounded-lg border border-orange-100 outline-none focus:border-stone-400"
          />
          <button
            onClick={() => addSubtask(todo.id)}
            className="text-sm bg-emerald-700 text-white px-2 py-1.5 rounded-lg hover:bg-emerald-800"
          >
            Add
          </button>
        </div>
      </li>
    )} 
   </> 
  );
}

export default function TodoApp() {

  const [todos, setTodos] = useState([]);
  const [session, setSession] = useState(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [customCategories, setCustomCategories] = useState([]);
  const [newCategoryText, setNewCategoryText] = useState("");
  const [listStats, setListStats] = useState({}); // { listId: { total, done } }
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subtasks, setSubtasks] = useState({}); // { todoId: [subtask, ...] }
  const [expandedId, setExpandedId] = useState(null);
  const [detailsOpenId, setDetailsOpenId] = useState(null);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [lists, setLists] = useState([]);
  const [currentListId, setCurrentListId] = useState(null);
  const [newListName, setNewListName] = useState("");
  const [editingListId, setEditingListId] = useState(null);
  const [editListName, setEditListName] = useState("");

  const [view, setView] = useState("lists"); // "lists" | "tasks"
  const [showCreateList, setShowCreateList] = useState(false);
  const cardColors = [
    "bg-emerald-100 text-emerald-800",
    "bg-rose-100 text-rose-800",
    "bg-sky-100 text-sky-800",
    "bg-amber-100 text-amber-800",
    "bg-violet-100 text-violet-800",
  ];

  const colorOptions = [
  { name: "none", dot: "bg-stone-300", border: "border-l-stone-300", bg: "bg-white" },
  { name: "red", dot: "bg-red-400", border: "border-l-red-500", bg: "bg-red-50" },
  { name: "yellow", dot: "bg-amber-400", border: "border-l-amber-500", bg: "bg-amber-50" },
  { name: "green", dot: "bg-emerald-400", border: "border-l-emerald-500", bg: "bg-emerald-50" },
];

  const categoryOptions = ["none", "Work", "Personal", "Shopping", "Health"];
  const allCategories = ["none", ...categoryOptions.filter((c) => c !== "none"), ...customCategories.map((c) => c.name)];

  function isOverdue(dueDate, done) {
  if (!dueDate || done) return false;
  const today = new Date().toISOString().split("T")[0];
  return dueDate < today;
  }

  const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 5 },
  })
);

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);
    const newOrder = arrayMove(todos, oldIndex, newIndex);

    setTodos(newOrder); // update UI instantly

    // Persist new positions to Supabase
    const updates = newOrder.map((todo, index) =>
      supabase.from('todos').update({ position: index }).eq('id', todo.id)
    );
    await Promise.all(updates);
  }

  useEffect(() => {
    // Check if this page load is from a password recovery link
    if (window.location.hash.includes("type=recovery")) {
      setShowResetForm(true);
    }

  supabase.auth.getSession().then(({ data }) => setSession(data.session));

  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    setSession(session);
    if (event === "PASSWORD_RECOVERY") {
      setShowResetForm(true);
    }
  });

  return () => listener.subscription.unsubscribe();
}, []);

// Load todos from Supabase on first render
  useEffect(() => {
   if (session) {
    fetchLists();
    fetchCustomCategories();
    }
  }, [session]);

  useEffect(() => {
  if (currentListId) fetchTodos();
}, [currentListId]);
  
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

async function fetchCustomCategories() {
  const { data, error } = await supabase
    .from('custom_categories')
    .select('*')
    .order('name', { ascending: true });
  if (error) console.error(error);
  else setCustomCategories(data);
}

async function addCustomCategory() {
  const name = newCategoryText.trim();
  if (!name) return;
  const { data, error } = await supabase
    .from('custom_categories')
    .insert([{ name, user_id: session.user.id }])
    .select();
  if (error) console.error(error);
  else setCustomCategories((prev) => [...prev, data[0]]);
  setNewCategoryText("");
}

async function deleteCustomCategory(id) {
  const { error } = await supabase.from('custom_categories').delete().eq('id', id);
  if (error) console.error(error);
  else setCustomCategories((prev) => prev.filter((c) => c.id !== id));
}

async function fetchTodos() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('list_id', currentListId)
    .order('position', { ascending: true });
  if (error) { console.error(error); return; }
  setTodos(data);

  const { data: subData, error: subError } = await supabase
    .from('subtasks')
    .select('*')
    .order('position', { ascending: true });
  if (subError) { console.error(subError); return; }

  const grouped = {};
  subData.forEach((s) => {
    if (!grouped[s.todo_id]) grouped[s.todo_id] = [];
    grouped[s.todo_id].push(s);
  });
  setSubtasks(grouped);
}
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | done

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
    fetchListStats(lists.map((l) => l.id));
  }
}

async function updateCategory(id, category) {
  const { error } = await supabase.from('todos').update({ category }).eq('id', id);
  if (error) console.error(error);
  else setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, category } : t)));
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

async function deleteTodo(id) {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);
  if (error) console.error(error);
  else setTodos((prev) => prev.filter((t) => t.id !== id));
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

async function clearCompleted() {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('done', true);
  if (error) console.error(error);
  else setTodos((prev) => prev.filter((t) => !t.done));
}

async function cycleColor(id, color) {
  const { error } = await supabase.from('todos').update({ color }).eq('id', id);
  if (error) console.error(error);
  else setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, color } : t)));
}

  const filtered = todos.filter((t) => {
  if (filter === "active" && t.done) return false;
  if (filter === "done" && !t.done) return false;
  if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
  return true;
});

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

async function createList() {
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
  setShowCreateList(false);
  setView("tasks");
}

  const remaining = todos.filter((t) => !t.done).length;
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.done).length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  if (showResetForm) {
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
      <form onSubmit={handlePasswordUpdate} className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-stone-800 mb-4">Set a new password</h1>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2.5 text-sm bg-orange-50/50 rounded-lg border border-orange-100 outline-none focus:border-stone-400"
          required
        />
        <button type="submit" className="w-full bg-emerald-700 text-white rounded-lg py-2.5 text-sm hover:bg-emerald-800 transition-colors">
          Update password
        </button>
      </form>
    </div>
  );
  }

  if (!session) {
  return <Auth onLogin={setSession} />;
  }

async function handlePasswordUpdate(e) {
  e.preventDefault();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    alert(error.message);
  } else {
    alert("Password updated! You're now logged in with your new password.");
    setShowResetForm(false);
    setNewPassword("");
  }
}

  if (view === "lists") {
    return (
      <div className="min-h-screen bg-orange-50 p-4 pb-24 relative">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-3xl font-bold text-stone-800">Tasks</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-stone-400"
          >
            Log out
          </button>
        </div>
         <p className="text-sm text-stone-500 mb-6">Create your List</p>
        <div className="flex flex-col gap-3">
          {lists.map((l, i) => {
            const stats = listStats[l.id] || { total: 0, done: 0 };
            const isEditingThis = editingListId === l.id;

            if (isEditingThis) {
              return (
                <div
                  key={l.id}
                  className={`p-4 rounded-2xl ${cardColors[i % cardColors.length]}`}
                >
                  <input
                    value={editListName}
                    onChange={(e) => setEditListName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && renameList(l.id)}
                    autoFocus
                    className="w-full text-base font-semibold px-2 py-1.5 rounded-lg border border-white/50 bg-white/70 outline-none mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => renameList(l.id)}
                      className="text-sm bg-white/70 px-3 py-1 rounded-lg font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingListId(null); setEditListName(""); }}
                      className="text-sm px-3 py-1 rounded-lg opacity-70"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={l.id}
                className={`flex items-center justify-between p-4 rounded-2xl transition ${cardColors[i % cardColors.length]}`}
              >
                <button
                  onClick={() => { setCurrentListId(l.id); setView("tasks"); }}
                  className="text-left flex-1 active:scale-[0.98] transition"
                >
                  <div className="font-semibold text-lg">{l.name}</div>
                  <div className="text-sm opacity-70">{stats.done} of {stats.total} tasks</div>
                </button>
                <button
                  onClick={() => { setEditingListId(l.id); setEditListName(l.name); }}
                  className="p-2 opacity-60 active:opacity-100"
                  aria-label="Rename list"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(l.id)}
                  className="p-2 opacity-60 active:opacity-100"
                  aria-label="Delete list"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          {lists.length === 0 && (
            <p className="text-sm text-stone-400 text-center py-10">
              No lists yet — tap + to create one.
            </p>
          )}
        </div>

        {/* Floating create button */}
        <button
          onClick={() => setShowCreateList(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-emerald-700 text-white text-2xl flex items-center justify-center shadow-lg active:scale-95 transition"
          aria-label="Create new list"
        >
          <Plus size={28} />
        </button>

        {/* Create list overlay */}
        {showCreateList && (
          <div className="fixed inset-0 bg-black/30 flex items-end justify-center z-50">
            <div className="bg-white rounded-t-2xl p-5 w-full max-w-md">
              <h2 className="text-lg font-semibold text-stone-800 mb-3">New list</h2>
              <input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createList()}
                placeholder="List name..."
                autoFocus
                className="w-full text-base px-3 py-2.5 rounded-lg border border-orange-100 outline-none mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={createList}
                  className="flex-1 bg-emerald-700 text-white py-2.5 rounded-lg text-sm"
                >
                  Create
                </button>
                <button
                  onClick={() => { setShowCreateList(false); setNewListName(""); }}
                  className="flex-1 bg-stone-100 text-stone-600 py-2.5 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
              <h2 className="text-lg font-semibold text-stone-800 mb-2">Delete this list?</h2>
              <p className="text-sm text-stone-500 mb-4">
                This will permanently delete "{lists.find((l) => l.id === confirmDeleteId)?.name}" and all its tasks. This can't be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { deleteList(confirmDeleteId); setConfirmDeleteId(null); }}
                  className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 bg-stone-100 text-stone-600 py-2.5 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 flex items-start justify-center p-3">
      <div className="w-full max-w-md">
        {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setView("lists")}
          className="flex items-center gap-2 text-stone-600"
        >
          <span className="text-xl">‹</span>
          <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">
            {lists.find((l) => l.id === currentListId)?.name || "Tasks"}
          </h1>
        </button>
        <button onClick={() => supabase.auth.signOut()} className="text-sm text-stone-400 hover:text-stone-700 transition-colors">
          Log out
        </button>
      </div>
      
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-stone-500 mb-1.5">
            <span>{completedCount} of {totalCount} done</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-orange-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-2 p-5 border-b border-stone-100">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              placeholder="Add a task and press enter"
              className="flex-1 text-base text-stone-800 placeholder-stone-400 outline-none bg-orange-50/50 rounded-xl px-4 py-3.5 border border-transparent focus:border-stone-300 transition-colors"
            />
            <button
              onClick={addTodo}
              className="w-12 h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 transition flex items-center justify-center flex-shrink-0"
              aria-label="Add task"
            >
              <Plus size={22} className="text-stone-50" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between px-4 pt-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {["all", "active", "done"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-sm px-3.5 py-2 rounded-full capitalize transition ${
                      filter === f
                        ? "bg-emerald-700 text-stone-50"
                        : "text-stone-500 hover:bg-orange-50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-sm px-2 py-1 rounded-full bg-orange-50 text-stone-600 border-none outline-none"
              >
                <option value="all">All categories</option>
                {allCategories.filter((c) => c !== "none").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <span className="text-sm text-stone-400">
              {remaining} left
            </span>
          </div>

          {/* List */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <ul className="p-2">
              {filtered.length === 0 && (
                <li className="text-center text-sm text-stone-400 py-10">
                  {filter === "done"
                    ? "Nothing completed yet."
                    : filter === "active"
                    ? "No active tasks. Nice work."
                    : "Your list is empty. Add something above."}
                </li>
              )}
              {filtered.map((todo) => (
                <SortableTodoItem
                  key={todo.id}
                  todo={todo}
                  colorOptions={colorOptions}
                  categoryOptions={categoryOptions}
                  toggleTodo={toggleTodo}
                  cycleColor={cycleColor}
                  deleteTodo={deleteTodo}
                  editingId={editingId}
                  startEdit={startEdit}
                  saveEdit={saveEdit}
                  cancelEdit={cancelEdit}
                  editText={editText}
                  setEditText={setEditText}
                  editDueDate={editDueDate}
                  setEditDueDate={setEditDueDate}
                  isOverdue={isOverdue}
                  updateCategory={updateCategory}
                  subtasks={subtasks}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  newSubtaskText={newSubtaskText}
                  setNewSubtaskText={setNewSubtaskText}
                  addSubtask={addSubtask}
                  toggleSubtask={toggleSubtask}
                  deleteSubtask={deleteSubtask}
                  allCategories={allCategories}
                  newCategoryText={newCategoryText}
                  setNewCategoryText={setNewCategoryText}
                  addCustomCategory={addCustomCategory}
                  detailsOpenId={detailsOpenId}
                  setDetailsOpenId={setDetailsOpenId}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
          {/* Footer */}
          {todos.some((t) => t.done) && (
            <div className="px-4 py-3 border-t border-stone-100">
              <button
                onClick={clearCompleted}
                className="text-sm text-stone-400 hover:text-stone-700 transition"
              >
                Clear completed
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

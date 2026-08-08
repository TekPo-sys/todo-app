
import { Plus, Trash2, Check, ListChecks } from "lucide-react";
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
            className="flex-1 text-sm bg-stone-900 text-white px-3 py-2 rounded-lg hover:bg-stone-700"
          >
            Save
          </button>
          <button
            onClick={cancelEdit}
            className="flex-1 text-sm bg-stone-100 text-stone-500 px-3 py-2 rounded-lg hover:bg-stone-200"
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
      className={`group flex items-center gap-3 px-3 py-3.5 rounded-lg hover:bg-stone-50 transition border-l-4 ${color.border} ${color.bg} hover:brightness-95`}
    >
    {/* Drag handle */}
      <button {...attributes} {...listeners} className="text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none text-lg px-1">
        ⋮⋮
      </button>

      {/* check box */}
      <button
        onClick={() => toggleTodo(todo.id)}
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
          todo.done ? "bg-stone-900 border-stone-900" : "border-stone-300 hover:border-stone-500"
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
            <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">
              {todo.category}
            </span>
          )}
          <button
            onClick={() => setDetailsOpenId(detailsOpenId === todo.id ? null : todo.id)}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition"
          >
            Priority & category
            <span className={`transition-transform ${detailsOpenId === todo.id ? "rotate-180" : ""}`}>▾</span>
          </button>
          <button
            onClick={() => setExpandedId(expandedId === todo.id ? null : todo.id)}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition"
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
              ? "bg-stone-900 text-white"
              : "bg-stone-100 text-stone-500 hover:bg-stone-200"
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
              ? "bg-stone-900 text-white"
              : "bg-stone-100 text-stone-500 hover:bg-stone-200"
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
        className="flex-1 text-sm px-2 py-1.5 rounded-lg border border-stone-200 outline-none focus:border-stone-400"
      />
      <button
        onClick={addCustomCategory}
        className="text-sm bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg hover:bg-stone-200"
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
                  s.done ? "bg-stone-900 border-stone-900" : "border-stone-300"
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
            className="flex-1 text-sm px-2 py-1.5 rounded-lg border border-stone-200 outline-none focus:border-stone-400"
          />
          <button
            onClick={() => addSubtask(todo.id)}
            className="text-sm bg-stone-900 text-white px-2 py-1.5 rounded-lg hover:bg-stone-700"
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

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subtasks, setSubtasks] = useState({}); // { todoId: [subtask, ...] }
  const [expandedId, setExpandedId] = useState(null);
  const [detailsOpenId, setDetailsOpenId] = useState(null);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [lists, setLists] = useState([]);
  const [currentListId, setCurrentListId] = useState(null);
  const [newListName, setNewListName] = useState("");

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
  else fetchTodos();
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
}

  const remaining = todos.filter((t) => !t.done).length;

  if (showResetForm) {
  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
      <form onSubmit={handlePasswordUpdate} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-stone-900 mb-4">Set a new password</h1>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2.5 text-sm bg-stone-50 rounded-lg border border-stone-200 outline-none focus:border-stone-400"
          required
        />
        <button type="submit" className="w-full bg-stone-900 text-white rounded-lg py-2.5 text-sm hover:bg-stone-700 transition-colors">
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

  return (
    <div className="min-h-screen bg-stone-100 flex items-start justify-center p-3">
      <div className="w-full max-w-md">
        {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center flex-shrink-0">
            <ListChecks size={20} className="text-stone-50" />
          </div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
            To-do list
          </h1>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
        >
          Log out
        </button>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <select
          value={currentListId || ""}
          onChange={(e) => setCurrentListId(Number(e.target.value))}
          className="text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white outline-none w-full"
        >
          {lists.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createList()}
            placeholder="New list name..."
            className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg border border-stone-200 outline-none"
          />
          <button
            onClick={createList}
            className="text-sm bg-stone-900 text-white px-3 py-2 rounded-lg hover:bg-stone-700 flex-shrink-0"
          >
            Create
          </button>
        </div>
      </div>  
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-2 p-5 border-b border-stone-100">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              placeholder="Add a task and press enter"
              className="flex-1 text-base text-stone-800 placeholder-stone-400 outline-none bg-stone-50 rounded-xl px-4 py-3.5 border border-transparent focus:border-stone-300 transition-colors"
            />
            <button
              onClick={addTodo}
              className="w-12 h-12 rounded-xl bg-stone-900 hover:bg-stone-700 active:scale-95 transition flex items-center justify-center flex-shrink-0"
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
                        ? "bg-stone-900 text-stone-50"
                        : "text-stone-500 hover:bg-stone-100"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-sm px-2 py-1 rounded-full bg-stone-100 text-stone-600 border-none outline-none"
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

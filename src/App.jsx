
import { Plus, Trash2, Check, ListChecks } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";



export default function TodoApp() {

  const [todos, setTodos] = useState([]);
  const [session, setSession] = useState(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const colorOptions = [
  { name: "none", dot: "bg-stone-300", border: "border-l-stone-300" },
  { name: "red", dot: "bg-red-400", border: "border-l-red-400" },
  { name: "yellow", dot: "bg-amber-400", border: "border-l-amber-400" },
  { name: "green", dot: "bg-emerald-400", border: "border-l-emerald-400" },
  ];

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
      if (session) fetchTodos();
    }, [session]);

  async function fetchTodos() {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('position', { ascending: true });
    if (error) console.error(error);
    else setTodos(data);
}
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | done

  async function addTodo() {
    const text = input.trim();
    if (!text) return;
    const { data, error } = await supabase
      .from('todos')
      .insert([{ text, done: false, user_id: session.user.id }])
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

async function cycleColor(id, currentColor) {
  const idx = colorOptions.findIndex((c) => c.name === currentColor);
  const next = colorOptions[(idx + 1) % colorOptions.length].name;
  const { error } = await supabase.from('todos').update({ color: next }).eq('id', id);
  if (error) console.error(error);
  else setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, color: next } : t)));
}

async function moveTodo(id, direction) {
  const index = todos.findIndex((t) => t.id === id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= todos.length) return;

  const current = todos[index];
  const target = todos[targetIndex];

  await supabase.from('todos').update({ position: target.position }).eq('id', current.id);
  await supabase.from('todos').update({ position: current.position }).eq('id', target.id);
  fetchTodos();
}

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

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
    <div className="min-h-screen bg-stone-100 flex items-start justify-center p-6 sm:p-10">
      <div className="w-full max-w-md">
        {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center flex-shrink-0">
            <ListChecks size={18} className="text-stone-50" />
          </div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
            To-do list
          </h1>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
        >
          Log out
        </button>
      </div>
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-2 p-4 border-b border-stone-100">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              placeholder="Add a task and press enter"
              className="flex-1 text-sm text-stone-800 placeholder-stone-400 outline-none bg-stone-50 rounded-lg px-3 py-2.5 border border-transparent focus:border-stone-300 transition-colors"
            />
            <button
              onClick={addTodo}
              className="w-9 h-9 rounded-lg bg-stone-900 hover:bg-stone-700 active:scale-95 transition flex items-center justify-center flex-shrink-0"
              aria-label="Add task"
            >
              <Plus size={18} className="text-stone-50" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between px-4 pt-3">
            <div className="flex gap-1">
              {["all", "active", "done"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-2.5 py-1 rounded-full capitalize transition ${
                    filter === f
                      ? "bg-stone-900 text-stone-50"
                      : "text-stone-500 hover:bg-stone-100"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <span className="text-xs text-stone-400">
              {remaining} left
            </span>
          </div>

          {/* List */}
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
          {filtered.map((todo, i) => {
            const color = colorOptions.find((c) => c.name === todo.color) || colorOptions[0];
            return (
              <li
                key={todo.id}
                className={`group flex items-center gap-2 px-2 py-2.5 rounded-lg hover:bg-stone-50 transition border-l-4 ${color.border}`}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition ${
                    todo.done ? "bg-stone-900 border-stone-900" : "border-stone-300 hover:border-stone-500"
                  }`}
                  aria-label={todo.done ? "Mark as not done" : "Mark as done"}
                >
                  {todo.done && <Check size={12} className="text-stone-50" />}
                </button>

                <button
                  onClick={() => cycleColor(todo.id, todo.color)}
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${color.dot}`}
                  aria-label="Cycle priority color"
                  title="Click to change priority color"
                />

                <span className={`flex-1 text-sm ${todo.done ? "text-stone-400 line-through" : "text-stone-800"}`}>
                  {todo.text}
                </span>

                <div className="flex flex-col opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                  <button
                    onClick={() => moveTodo(todo.id, "up")}
                    disabled={i === 0}
                    className="text-stone-400 hover:text-stone-800 disabled:opacity-20 text-xs leading-none"
                    aria-label="Move up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveTodo(todo.id, "down")}
                    disabled={i === filtered.length - 1}
                    className="text-stone-400 hover:text-stone-800 disabled:opacity-20 text-xs leading-none"
                    aria-label="Move down"
                  >
                    ▼
                  </button>
                </div>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-stone-400 hover:text-red-500 transition flex-shrink-0"
                  aria-label="Delete task"
                >
                  <Trash2 size={15} />
                </button>
              </li>
        );
        })}
          </ul>
          {/* Footer */}
          {todos.some((t) => t.done) && (
            <div className="px-4 py-3 border-t border-stone-100">
              <button
                onClick={clearCompleted}
                className="text-xs text-stone-400 hover:text-stone-700 transition"
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

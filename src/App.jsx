import { Plus, ListChecks, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableTodoItem from "./components/SortableTodoItem";
import { useLists } from "./hooks/useLists";
import { useTodos } from "./hooks/useTodos";
import { useSubtasks } from "./hooks/useSubtasks";
import { useCategories } from "./hooks/useCategories";
import ListsView from "./components/ListsView";
import TasksView from "./components/TasksView";

const colorOptions = [
  { name: "none", dot: "bg-stone-300", border: "border-l-stone-300", bg: "bg-white" },
  { name: "red", dot: "bg-red-400", border: "border-l-red-500", bg: "bg-red-50" },
  { name: "yellow", dot: "bg-amber-400", border: "border-l-amber-500", bg: "bg-amber-50" },
  { name: "green", dot: "bg-emerald-400", border: "border-l-emerald-500", bg: "bg-emerald-50" },
];

const cardColors = [
  "bg-emerald-100 text-emerald-800",
  "bg-rose-100 text-rose-800",
  "bg-sky-100 text-sky-800",
  "bg-amber-100 text-amber-800",
  "bg-violet-100 text-violet-800",
];

export default function TodoApp() {
  const [session, setSession] = useState(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [view, setView] = useState("lists");
  const [showCreateList, setShowCreateList] = useState(false);

  const listsHook = useLists(session);
  const {
    lists, currentListId, setCurrentListId, listStats,
    newListName, setNewListName, editingListId, setEditingListId,
    editListName, setEditListName, confirmDeleteId, setConfirmDeleteId,
    fetchLists, fetchListStats, createList, renameList, deleteList,
  } = listsHook;

  const todosHook = useTodos(session, currentListId, fetchListStats, lists);
  const {
    todos, input, setInput, filter, setFilter, categoryFilter, setCategoryFilter,
    editingId, editText, setEditText, editDueDate, setEditDueDate,
    fetchTodos, addTodo, toggleTodo, updateCategory, cycleColor, deleteTodo, clearCompleted,
    startEdit, cancelEdit, saveEdit, isOverdue, filtered,
  } = todosHook;

  const subtasksHook = useSubtasks(session);
  const {
    subtasks, expandedId, setExpandedId, newSubtaskText, setNewSubtaskText,
    fetchSubtasks, addSubtask, toggleSubtask, deleteSubtask,
  } = subtasksHook;

  const categoriesHook = useCategories(session);
  const {
    categoryOptions, allCategories, newCategoryText, setNewCategoryText,
    detailsOpenId, setDetailsOpenId, fetchCustomCategories, addCustomCategory,
  } = categoriesHook;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);
    const newOrder = arrayMove(todos, oldIndex, newIndex);

    const updates = newOrder.map((todo, index) =>
      supabase.from('todos').update({ position: index }).eq('id', todo.id)
    );
    await Promise.all(updates);
    fetchTodos();
  }

  useEffect(() => {
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

  useEffect(() => {
    if (session) {
      fetchLists();
      fetchCustomCategories();
    }
  }, [session]);

  useEffect(() => {
    if (currentListId) {
      fetchTodos();
      fetchSubtasks();
    }
  }, [currentListId]);

  const remaining = todos.filter((t) => !t.done).length;
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.done).length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

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

  if (view === "lists") {
  return (
    <ListsView
      lists={lists}
      listStats={listStats}
      editingListId={editingListId}
      setEditingListId={setEditingListId}
      editListName={editListName}
      setEditListName={setEditListName}
      renameList={renameList}
      setCurrentListId={setCurrentListId}
      setView={setView}
      confirmDeleteId={confirmDeleteId}
      setConfirmDeleteId={setConfirmDeleteId}
      deleteList={deleteList}
      showCreateList={showCreateList}
      setShowCreateList={setShowCreateList}
      newListName={newListName}
      setNewListName={setNewListName}
      createList={createList}
      onLogout={() => supabase.auth.signOut()}
    />
  );
}

return (
  <TasksView
    currentListName={lists.find((l) => l.id === currentListId)?.name}
    setView={setView}
    onLogout={() => supabase.auth.signOut()}
    todos={todos}
    filtered={filtered}
    remaining={remaining}
    totalCount={totalCount}
    completedCount={completedCount}
    progressPercent={progressPercent}
    input={input}
    setInput={setInput}
    addTodo={addTodo}
    filter={filter}
    setFilter={setFilter}
    categoryFilter={categoryFilter}
    setCategoryFilter={setCategoryFilter}
    allCategories={allCategories}
    clearCompleted={clearCompleted}
    fetchTodos={fetchTodos}
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
    newCategoryText={newCategoryText}
    setNewCategoryText={setNewCategoryText}
    addCustomCategory={addCustomCategory}
    detailsOpenId={detailsOpenId}
    setDetailsOpenId={setDetailsOpenId}
  />
);

  // return (
  //   <div className="min-h-screen bg-orange-50 flex items-start justify-center p-3">
  //     <div className="w-full max-w-md">
  //       <div className="flex items-center justify-between mb-6">
  //         <button onClick={() => setView("lists")} className="flex items-center gap-2 text-stone-600">
  //           <span className="text-xl">‹</span>
  //           <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">
  //             {lists.find((l) => l.id === currentListId)?.name || "Tasks"}
  //           </h1>
  //         </button>
  //         <button onClick={() => supabase.auth.signOut()} className="text-sm text-stone-400 hover:text-stone-700 transition-colors">
  //           Log out
  //         </button>
  //       </div>

  //       {totalCount > 0 && (
  //         <div className="mb-4">
  //           <div className="flex items-center justify-between text-sm text-stone-500 mb-1.5">
  //             <span>{completedCount} of {totalCount} done</span>
  //             <span>{progressPercent}%</span>
  //           </div>
  //           <div className="w-full h-2.5 bg-orange-100 rounded-full overflow-hidden">
  //             <div
  //               className="h-full bg-emerald-600 rounded-full transition-all duration-500"
  //               style={{ width: `${progressPercent}%` }}
  //             />
  //           </div>
  //         </div>
  //       )}

  //       <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
  //         <div className="flex items-center gap-2 p-5 border-b border-stone-100">
  //           <input
  //             value={input}
  //             onChange={(e) => setInput(e.target.value)}
  //             onKeyDown={(e) => e.key === "Enter" && addTodo()}
  //             placeholder="Add a task and press enter"
  //             className="flex-1 text-base text-stone-800 placeholder-stone-400 outline-none bg-orange-50/50 rounded-xl px-4 py-3.5 border border-transparent focus:border-stone-300 transition-colors"
  //           />
  //           <button
  //             onClick={addTodo}
  //             className="w-12 h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 transition flex items-center justify-center flex-shrink-0"
  //             aria-label="Add task"
  //           >
  //             <Plus size={22} className="text-stone-50" />
  //           </button>
  //         </div>

  //         <div className="flex items-center justify-between px-4 pt-3 flex-wrap gap-2">
  //           <div className="flex items-center gap-2">
  //             <div className="flex gap-1">
  //               {["all", "active", "done"].map((f) => (
  //                 <button
  //                   key={f}
  //                   onClick={() => setFilter(f)}
  //                   className={`text-sm px-3.5 py-2 rounded-full capitalize transition ${
  //                     filter === f ? "bg-emerald-700 text-stone-50" : "text-stone-500 hover:bg-orange-50"
  //                   }`}
  //                 >
  //                   {f}
  //                 </button>
  //               ))}
  //             </div>

  //             <select
  //               value={categoryFilter}
  //               onChange={(e) => setCategoryFilter(e.target.value)}
  //               className="text-sm px-2 py-1 rounded-full bg-orange-50 text-stone-600 border-none outline-none"
  //             >
  //               <option value="all">All categories</option>
  //               {allCategories.filter((c) => c !== "none").map((c) => (
  //                 <option key={c} value={c}>{c}</option>
  //               ))}
  //             </select>
  //           </div>

  //           <span className="text-sm text-stone-400">{remaining} left</span>
  //         </div>

  //         <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  //           <SortableContext items={filtered.map((t) => t.id)} strategy={verticalListSortingStrategy}>
  //             <ul className="p-2">
  //               {filtered.length === 0 && (
  //                 <li className="text-center text-sm text-stone-400 py-10">
  //                   {filter === "done" ? "Nothing completed yet." : filter === "active" ? "No active tasks. Nice work." : "Your list is empty. Add something above."}
  //                 </li>
  //               )}
  //               {filtered.map((todo) => (
  //                 <SortableTodoItem
  //                   key={todo.id}
  //                   todo={todo}
  //                   colorOptions={colorOptions}
  //                   categoryOptions={categoryOptions}
  //                   toggleTodo={toggleTodo}
  //                   cycleColor={cycleColor}
  //                   deleteTodo={deleteTodo}
  //                   editingId={editingId}
  //                   startEdit={startEdit}
  //                   saveEdit={saveEdit}
  //                   cancelEdit={cancelEdit}
  //                   editText={editText}
  //                   setEditText={setEditText}
  //                   editDueDate={editDueDate}
  //                   setEditDueDate={setEditDueDate}
  //                   isOverdue={isOverdue}
  //                   updateCategory={updateCategory}
  //                   subtasks={subtasks}
  //                   expandedId={expandedId}
  //                   setExpandedId={setExpandedId}
  //                   newSubtaskText={newSubtaskText}
  //                   setNewSubtaskText={setNewSubtaskText}
  //                   addSubtask={addSubtask}
  //                   toggleSubtask={toggleSubtask}
  //                   deleteSubtask={deleteSubtask}
  //                   allCategories={allCategories}
  //                   newCategoryText={newCategoryText}
  //                   setNewCategoryText={setNewCategoryText}
  //                   addCustomCategory={addCustomCategory}
  //                   detailsOpenId={detailsOpenId}
  //                   setDetailsOpenId={setDetailsOpenId}
  //                 />
  //               ))}
  //             </ul>
  //           </SortableContext>
  //         </DndContext>

  //         {todos.some((t) => t.done) && (
  //           <div className="px-4 py-3 border-t border-stone-100">
  //             <button onClick={clearCompleted} className="text-sm text-stone-400 hover:text-stone-700 transition">
  //               Clear completed
  //             </button>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   </div>
  // );
}
import { Plus } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableTodoItem from "./SortableTodoItem";
import { supabase } from "../supabaseClient";

export default function TasksView({
  currentListName, setView, onLogout,
  todos, filtered, remaining, totalCount, completedCount, progressPercent,
  input, setInput, addTodo, filter, setFilter, categoryFilter, setCategoryFilter,
  allCategories, clearCompleted, fetchTodos,
  colorOptions, categoryOptions, toggleTodo, cycleColor, deleteTodo,
  editingId, startEdit, saveEdit, cancelEdit, editText, setEditText, editDueDate, setEditDueDate, isOverdue,
  updateCategory, subtasks, expandedId, setExpandedId, newSubtaskText, setNewSubtaskText, addSubtask, toggleSubtask, deleteSubtask,
  newCategoryText, setNewCategoryText, addCustomCategory,
  detailsOpenId, setDetailsOpenId,
}) {
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

  return (
    <div className="min-h-screen bg-orange-50 flex items-start justify-center p-3">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setView("lists")} className="flex items-center gap-2 text-stone-600">
            <span className="text-xl">‹</span>
            <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">
              {currentListName || "Tasks"}
            </h1>
          </button>
          <button onClick={onLogout} className="text-sm text-stone-400 hover:text-stone-700 transition-colors">
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

        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
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

          <div className="flex items-center justify-between px-4 pt-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {["all", "active", "done"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-sm px-3.5 py-2 rounded-full capitalize transition ${
                      filter === f ? "bg-emerald-700 text-stone-50" : "text-stone-500 hover:bg-orange-50"
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

            <span className="text-sm text-stone-400">{remaining} left</span>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filtered.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <ul className="p-2">
                {filtered.length === 0 && (
                  <li className="text-center text-sm text-stone-400 py-10">
                    {filter === "done" ? "Nothing completed yet." : filter === "active" ? "No active tasks. Nice work." : "Your list is empty. Add something above."}
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

          {todos.some((t) => t.done) && (
            <div className="px-4 py-3 border-t border-stone-100">
              <button onClick={clearCompleted} className="text-sm text-stone-400 hover:text-stone-700 transition">
                Clear completed
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
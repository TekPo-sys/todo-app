import { Trash2, Check } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
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
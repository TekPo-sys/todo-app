import { Plus, Pencil, Trash2 } from "lucide-react";

const cardColors = [
  "bg-emerald-100 text-emerald-800",
  "bg-rose-100 text-rose-800",
  "bg-sky-100 text-sky-800",
  "bg-amber-100 text-amber-800",
  "bg-violet-100 text-violet-800",
];

export default function ListsView({
  lists, listStats, editingListId, setEditingListId, editListName, setEditListName,
  renameList, setCurrentListId, setView, confirmDeleteId, setConfirmDeleteId, deleteList,
  showCreateList, setShowCreateList, newListName, setNewListName, createList,
  onLogout,
}) {
  return (
    <div className="min-h-screen bg-orange-50 p-4 pb-24 relative">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-bold text-stone-800">Tasks</h1>
        <button onClick={onLogout} className="text-sm text-stone-400">
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
              <div key={l.id} className={`p-4 rounded-2xl ${cardColors[i % cardColors.length]}`}>
                <input
                  value={editListName}
                  onChange={(e) => setEditListName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && renameList(l.id)}
                  autoFocus
                  className="w-full text-base font-semibold px-2 py-1.5 rounded-lg border border-white/50 bg-white/70 outline-none mb-2"
                />
                <div className="flex gap-2">
                  <button onClick={() => renameList(l.id)} className="text-sm bg-white/70 px-3 py-1 rounded-lg font-medium">
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
            <div key={l.id} className={`flex items-center justify-between p-4 rounded-2xl transition ${cardColors[i % cardColors.length]}`}>
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

      <button
        onClick={() => setShowCreateList(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-emerald-700 text-white text-2xl flex items-center justify-center shadow-lg active:scale-95 transition"
        aria-label="Create new list"
      >
        <Plus size={28} />
      </button>

      {showCreateList && (
        <div className="fixed inset-0 bg-black/30 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl p-5 w-full max-w-md">
            <h2 className="text-lg font-semibold text-stone-800 mb-3">New list</h2>
            <input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createList(() => { setShowCreateList(false); setView("tasks"); })}
              placeholder="List name..."
              autoFocus
              className="w-full text-base px-3 py-2.5 rounded-lg border border-orange-100 outline-none mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => createList(() => { setShowCreateList(false); setView("tasks"); })}
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
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 bg-stone-100 text-stone-600 py-2.5 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
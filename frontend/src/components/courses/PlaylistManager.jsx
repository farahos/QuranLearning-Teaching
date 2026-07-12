import { useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Lock, Plus, Trash2, Unlock } from "lucide-react";
import { FormField } from "../common/FormField";
import { Button } from "../common/Button";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { SectionManager } from "./SectionManager";

let localPlaylistSeq = 0;
function newPlaylistId() {
  localPlaylistSeq += 1;
  return `playlist-local-${Date.now()}-${localPlaylistSeq}`;
}

export function PlaylistManager({ playlists, onChange }) {
  const [expandedId, setExpandedId] = useState(playlists[0]?.id || null);
  const [draftTitle, setDraftTitle] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  function update(next) {
    onChange(next);
  }

  function addPlaylist() {
    if (!draftTitle.trim()) return;
    const playlist = { id: newPlaylistId(), title: draftTitle.trim(), description: "", order: playlists.length + 1, locked: false, preview: false, sections: [] };
    update([...playlists, playlist]);
    setExpandedId(playlist.id);
    setDraftTitle("");
  }

  function updatePlaylist(id, updates) {
    update(playlists.map((playlist) => (playlist.id === id ? { ...playlist, ...updates } : playlist)));
  }

  function removePlaylist(id) {
    update(playlists.filter((playlist) => playlist.id !== id));
    setPendingDeleteId(null);
  }

  function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= playlists.length) return;
    const next = [...playlists];
    [next[index], next[target]] = [next[target], next[index]];
    update(next.map((playlist, i) => ({ ...playlist, order: i + 1 })));
  }

  return (
    <div className="space-y-3">
      {playlists.map((playlist, index) => {
        const expanded = expandedId === playlist.id;
        return (
          <div key={playlist.id} className="card overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 p-3">
              <div className="flex flex-col text-quran-muted">
                <button type="button" aria-label="Move playlist up" disabled={index === 0} onClick={() => move(index, -1)} className="disabled:opacity-30">
                  <ChevronUp size={14} />
                </button>
                <button type="button" aria-label="Move playlist down" disabled={index === playlists.length - 1} onClick={() => move(index, 1)} className="disabled:opacity-30">
                  <ChevronDown size={14} />
                </button>
              </div>
              <button type="button" onClick={() => setExpandedId(expanded ? null : playlist.id)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-black text-quran-text">
                  {index + 1}. {playlist.title}
                </p>
                <p className="text-xs text-quran-muted">{playlist.sections?.length || 0} lessons</p>
              </button>
              <button
                type="button"
                onClick={() => updatePlaylist(playlist.id, { preview: !playlist.preview })}
                className={`btn-sm ${playlist.preview ? "btn-primary" : "btn-secondary"}`}
                aria-pressed={playlist.preview}
              >
                {playlist.preview ? <Eye size={13} /> : <EyeOff size={13} />} Preview
              </button>
              <button type="button" onClick={() => updatePlaylist(playlist.id, { locked: !playlist.locked })} className="btn-secondary btn-sm" aria-pressed={playlist.locked}>
                {playlist.locked ? <Lock size={13} /> : <Unlock size={13} />} {playlist.locked ? "Locked" : "Unlocked"}
              </button>
              <Button variant="danger" size="sm" iconOnly icon={Trash2} ariaLabel={`Delete playlist ${playlist.title}`} onClick={() => setPendingDeleteId(playlist.id)} />
            </div>
            {expanded && (
              <div className="space-y-3 border-t border-quran-line bg-quran-soft/30 p-3">
                <FormField
                  label="Playlist title"
                  value={playlist.title}
                  onChange={(e) => updatePlaylist(playlist.id, { title: e.target.value })}
                />
                <FormField
                  as="textarea"
                  label="Playlist description"
                  value={playlist.description || ""}
                  onChange={(e) => updatePlaylist(playlist.id, { description: e.target.value })}
                />
                <SectionManager sections={playlist.sections || []} onChange={(sections) => updatePlaylist(playlist.id, { sections })} />
              </div>
            )}
          </div>
        );
      })}
      {!playlists.length && <p className="text-sm text-quran-muted">No playlists yet — create one to start organizing lessons.</p>}

      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-quran-line p-3">
        <FormField label="New playlist title" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} className="min-w-[220px] flex-1" />
        <Button variant="secondary" icon={Plus} type="button" onClick={addPlaylist}>
          Create playlist
        </Button>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Delete playlist?"
        description="This removes the playlist and all of its sections for this session."
        confirmLabel="Delete playlist"
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => removePlaylist(pendingDeleteId)}
      />
    </div>
  );
}

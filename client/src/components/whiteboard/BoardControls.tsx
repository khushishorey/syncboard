import { useBoardStore } from '../../store/boardStore';

interface Props {
  roomName: string;
  onLeave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

const BoardControls = ({ roomName, onLeave, onUndo, onRedo, onClear }: Props) => {
  const { undoStack, redoStack } = useBoardStore();

  return (
    <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4 pointer-events-none">
      {/* Room name — left */}
      <div className="pointer-events-auto bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-3">
        <button
          onClick={onLeave}
          className="text-slate-400 hover:text-white transition text-sm"
          title="Back to dashboard"
        >
          ←
        </button>
        <span className="text-white font-medium text-sm truncate max-w-xs">
          {roomName}
        </span>
      </div>

      {/* Controls — right */}
      <div className="pointer-events-auto flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
        <ControlButton label="↩" title="Undo (Ctrl+Z)" disabled={undoStack.length === 0} onClick={onUndo} />
        <ControlButton label="↪" title="Redo (Ctrl+Y)" disabled={redoStack.length === 0} onClick={onRedo} />
        <div className="w-px h-5 bg-slate-600 mx-1" />
        <ControlButton label="🗑" title="Clear board" disabled={false} onClick={onClear} />
      </div>
    </div>
  );
};

const ControlButton = ({
  label, title, disabled, onClick,
}: {
  label: string; title: string; disabled: boolean; onClick: () => void;
}) => (
  <button
    title={title}
    disabled={disabled}
    onClick={onClick}
    className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
  >
    {label}
  </button>
);

export default BoardControls;
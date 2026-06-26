import { useToolStore, COLORS } from '../../store/toolStore';

const BRUSH_SIZES = [2, 4, 8, 14, 20];

const Toolbar = () => {
  const { activeTool, activeColor, brushSize, setTool, setColor, setBrushSize } =
    useToolStore();

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3 bg-slate-800 border border-slate-700 rounded-2xl p-3 shadow-xl">

      {/* Tool selection */}
      <div className="flex flex-col gap-1">
        <ToolButton
          label="✏️"
          title="Pencil"
          active={activeTool === 'pencil'}
          onClick={() => setTool('pencil')}
        />
        <ToolButton
          label="⬜"
          title="Eraser"
          active={activeTool === 'eraser'}
          onClick={() => setTool('eraser')}
        />
      </div>

      <Divider />

      {/* Color palette */}
      <div className="flex flex-col gap-1.5">
        {COLORS.map((color) => (
          <button
            key={color}
            title={color}
            onClick={() => { setTool('pencil'); setColor(color); }}
            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              backgroundColor: color,
              borderColor: activeColor === color ? '#6366f1' : 'transparent',
              outline: activeColor === color ? '2px solid #6366f1' : 'none',
              outlineOffset: '1px',
            }}
          />
        ))}
      </div>

      <Divider />

      {/* Brush size */}
      <div className="flex flex-col gap-1.5 items-center">
        {BRUSH_SIZES.map((size) => (
          <button
            key={size}
            title={`${size}px`}
            onClick={() => setBrushSize(size)}
            className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-700 transition"
            style={{
              backgroundColor: brushSize === size ? '#4f46e5' : 'transparent',
            }}
          >
            <div
              className="rounded-full bg-white"
              style={{ width: Math.min(size, 20), height: Math.min(size, 20) }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

const ToolButton = ({
  label,
  title,
  active,
  onClick,
}: {
  label: string;
  title: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    title={title}
    onClick={onClick}
    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition"
    style={{ backgroundColor: active ? '#4f46e5' : 'transparent' }}
  >
    {label}
  </button>
);

const Divider = () => (
  <div className="w-full h-px bg-slate-700 my-1" />
);

export default Toolbar;
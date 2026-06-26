import { useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import Konva from 'konva';
import { nanoid } from 'nanoid';
import { throttle } from 'lodash';
import { useBoardStore } from '../../store/boardStore';
import { useToolStore } from '../../store/toolStore';
import { useAuthStore } from '../../store/authStore';
import type { Point, Stroke } from '../../types';

// Install lodash if not already present:
// npm install lodash @types/lodash

interface Props {
  width: number;
  height: number;
  onCursorMove: (x: number, y: number) => void;
  onStrokeCommit: (stroke: Stroke) => void;
}

const Canvas = ({ width, height, onCursorMove, onStrokeCommit }: Props) => {
  const stageRef = useRef<Konva.Stage>(null);
  const isDrawing = useRef(false);

  const { strokes, currentStroke, startStroke, appendPoint, commitStroke, undo, redo } =
    useBoardStore();
  const { activeTool, activeColor, brushSize } = useToolStore();
  const { user } = useAuthStore();

  // Throttled cursor emitter — fires at most every 32ms (~30fps)
  // Local rendering stays at full 60fps
  const throttledCursorEmit = useRef(
    throttle((x: number, y: number) => {
      onCursorMove(x, y);
    }, 32)
  ).current;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const getPointerPosition = (stage: Konva.Stage): Point | null => {
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    return { x: pos.x, y: pos.y };
  };

  const handleMouseDown = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const pos = getPointerPosition(stage);
    if (!pos) return;

    isDrawing.current = true;

    const newStroke: Stroke = {
      id: nanoid(),
      userId: user?.id || 'local',
      tool: activeTool,
      color: activeTool === 'eraser' ? '#000000' : activeColor,
      brushSize: activeTool === 'eraser' ? brushSize * 3 : brushSize,
      points: [pos],
      timestamp: Date.now(),
    };

    startStroke(newStroke);
  }, [activeTool, activeColor, brushSize, user, startStroke]);

  const handleMouseMove = useCallback(() => {
    if (!isDrawing.current) return;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = getPointerPosition(stage);
    if (!pos) return;

    appendPoint(pos);
    throttledCursorEmit(pos.x, pos.y);
  }, [appendPoint, throttledCursorEmit]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    const { currentStroke: stroke } = useBoardStore.getState();
    commitStroke();

    // Notify parent (WhiteboardPage) so it can emit to socket
    if (stroke && stroke.points.length >= 2) {
      onStrokeCommit(stroke);
    }
  }, [commitStroke, onStrokeCommit]);

  const renderStroke = (stroke: Stroke, isCurrent = false) => {
    const flatPoints = stroke.points.flatMap((p) => [p.x, p.y]);
    if (flatPoints.length < 2) return null;

    return (
      <Line
        key={isCurrent ? 'current' : stroke.id}
        points={flatPoints}
        stroke={stroke.color}
        strokeWidth={stroke.brushSize}
        tension={0.4}
        lineCap="round"
        lineJoin="round"
        globalCompositeOperation={
          stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
        }
        listening={false}
      />
    );
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: activeTool === 'eraser' ? 'cell' : 'crosshair' }}
    >
      <Layer>
        {strokes.map((stroke) => renderStroke(stroke))}
      </Layer>
      <Layer>
        {currentStroke && renderStroke(currentStroke, true)}
      </Layer>
    </Stage>
  );
};

export default Canvas;
import { useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import Konva from 'konva';
import { nanoid } from 'nanoid';
import { useBoardStore } from '../../store/boardStore';
import { useToolStore } from '../../store/toolStore';
import { useAuthStore } from '../../store/authStore';
import type { Point, Stroke } from '../../types';

interface Props {
  width: number;
  height: number;
}

const Canvas = ({ width, height }: Props) => {
  const stageRef = useRef<Konva.Stage>(null);
  const isDrawing = useRef(false);

  const { strokes, currentStroke, startStroke, appendPoint, commitStroke } =
    useBoardStore();
  const { activeTool, activeColor, brushSize } = useToolStore();
  const { user } = useAuthStore();

  // Keyboard shortcuts for undo/redo
  const { undo, redo } = useBoardStore();
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
  }, [appendPoint]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    commitStroke();
  }, [commitStroke]);

  // Render a single stroke as a Konva Line
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
        listening={false}   // canvas elements don't need to catch events
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
      onMouseLeave={handleMouseUp}   // treat leaving the canvas as mouse up
      style={{ cursor: activeTool === 'eraser' ? 'cell' : 'crosshair' }}
    >
      {/*
        Two layers:
        1. drawingLayer — all committed strokes (eraser uses destination-out)
        2. currentLayer — the stroke being drawn right now (on top)

        Keeping them separate means the eraser on the bottom layer
        doesn't cut through the currently-drawing stroke preview.
      */}
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
import Board, { IStroke } from '../models/Board';

// Get or create the board for a room
export const getOrCreateBoard = async (roomId: string) => {
  let board = await Board.findOne({ roomId });
  if (!board) {
    board = await Board.create({ roomId, strokes: [] });
  }
  return board;
};

// Load all strokes for a room
export const getBoardStrokes = async (roomId: string): Promise<IStroke[]> => {
  const board = await Board.findOne({ roomId });
  return board?.strokes || [];
};

// Append a new stroke
export const addStrokeToBoard = async (
  roomId: string,
  stroke: IStroke
): Promise<void> => {
  await Board.findOneAndUpdate(
    { roomId },
    { $push: { strokes: stroke } },
    { upsert: true, new: true }  // create if doesn't exist
  );
};

// Remove a stroke by its ID (undo)
export const removeStrokeFromBoard = async (
  roomId: string,
  strokeId: string
): Promise<void> => {
  await Board.findOneAndUpdate(
    { roomId },
    { $pull: { strokes: { id: strokeId } } }
  );
};

// Re-add a stroke (redo)
export const reAddStrokeToBoard = async (
  roomId: string,
  stroke: IStroke
): Promise<void> => {
  await addStrokeToBoard(roomId, stroke);
};

// Wipe all strokes (clear board)
export const clearBoardInDB = async (roomId: string): Promise<void> => {
  await Board.findOneAndUpdate(
    { roomId },
    { $set: { strokes: [] } },
    { upsert: true }
  );
};
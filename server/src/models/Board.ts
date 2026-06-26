import mongoose, { Document, Schema } from 'mongoose';

// Mirrors the Stroke interface on the client
export interface IStroke {
  id: string;
  userId: string;
  tool: 'pencil' | 'eraser';
  color: string;
  brushSize: number;
  points: { x: number; y: number }[];
  timestamp: number;
}

export interface IBoard extends Document {
  roomId: mongoose.Types.ObjectId;
  strokes: IStroke[];
  updatedAt: Date;
}

const PointSchema = new Schema({ x: Number, y: Number }, { _id: false });

const StrokeSchema = new Schema<IStroke>(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    tool: { type: String, enum: ['pencil', 'eraser'], required: true },
    color: { type: String, required: true },
    brushSize: { type: Number, required: true },
    points: [PointSchema],
    timestamp: { type: Number, required: true },
  },
  { _id: false }   // strokes don't need their own Mongo _id
);

const BoardSchema = new Schema<IBoard>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      unique: true,   // one board per room
    },
    strokes: [StrokeSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IBoard>('Board', BoardSchema);
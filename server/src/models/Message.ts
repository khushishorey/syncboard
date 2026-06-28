import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  roomId: mongoose.Types.ObjectId;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,      // we query by roomId frequently
    },
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>('Message', MessageSchema);
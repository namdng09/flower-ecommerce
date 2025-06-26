import mongoose, { Schema, Document } from 'mongoose';

export interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface IQuiz extends Document {
  title: string;
  description: string;
  questions: Question[];
}

const quizSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: String,
    questions: Array<Question>
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IQuiz>('quiz', quizSchema);

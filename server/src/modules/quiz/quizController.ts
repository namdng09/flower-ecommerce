import { Request, Response } from 'express';
import QuizModel from './quizModel';

/**
 * quizController.ts
 *
 * @description :: Server-side logic for managing quizzes.
 */
export default {
  /**
   * quizController.list()
   */
  list: async function (req: Request, res: Response): Promise<Response> {
    try {
      const quizzes = await QuizModel.find();
      return res.json(quizzes);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return res.status(500).json({
        message: 'Error when getting quiz.',
        error: errorMessage
      });
    }
  },

  /**
   * quizController.show()
   */
  show: async function (req: Request, res: Response): Promise<Response> {
    const id = req.params.id;

    try {
      const quiz = await QuizModel.findById(id);

      if (!quiz) {
        return res.status(404).json({
          message: 'No such quiz'
        });
      }

      return res.json(quiz);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return res.status(500).json({
        message: 'Error when creating quiz',
        error: errorMessage
      });
    }
  },

  /**
   * quizController.create()
   */
  create: async function (req: Request, res: Response): Promise<Response> {
    const quiz = new QuizModel({
      title: req.body.title,
      description: req.body.description,
      questions: req.body.questions
    });

    try {
      const savedQuiz = await quiz.save();
      return res.status(201).json(savedQuiz);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return res.status(500).json({
        message: 'Error when creating quiz',
        error: errorMessage
      });
    }
  },

  /**
   * quizController.update()
   */
  update: async function (req: Request, res: Response): Promise<Response> {
    const id = req.params.id;

    try {
      const quiz = await QuizModel.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });
      if (!quiz) {
        return res.status(404).json({
          message: 'No such quiz'
        });
      }
      return res.json(quiz);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return res.status(500).json({
        message: 'Error when updating quiz.',
        error: errorMessage
      });
    }
  },

  /**
   * quizController.remove()
   */
  remove: async function (req: Request, res: Response): Promise<Response> {
    const id = req.params.id;

    try {
      const result = await QuizModel.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).json({
          message: 'No such quiz'
        });
      }
      return res.json({
        message: 'Quiz deleted successfully'
      });
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return res.status(500).json({
        message: 'Error when deleting the quiz.',
        error: errorMessage
      });
    }
  }
};

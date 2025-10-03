import React, { useState, useEffect } from 'react';
import { Quiz, QuizQuestion, QuizAnswer, QuizAttempt } from '../../types';
import { Button } from '../ui/Button';
import { useGamificationStore } from '../../store/gamificationStore';

interface QuizTakingProps {
  quiz: Quiz;
  onComplete: (attempt: QuizAttempt) => void;
  onExit: () => void;
}

export const QuizTaking: React.FC<QuizTakingProps> = ({
  quiz,
  onComplete,
  onExit
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number>('');
  const [timeLeft, setTimeLeft] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [startTime] = useState(Date.now());
  const [showConfirmExit, setShowConfirmExit] = useState(false);

  const { submitQuizAttempt, isLoading } = useGamificationStore();

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string | number) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === '') return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const pointsEarned = isCorrect ? currentQuestion.points : 0;

    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      isCorrect,
      pointsEarned
    };

    setAnswers(prev => [...prev, newAnswer]);
    setSelectedAnswer('');

    if (isLastQuestion) {
      handleSubmitQuiz([...answers, newAnswer]);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // Restore previous answer if it exists
      const previousAnswer = answers[currentQuestionIndex - 1];
      if (previousAnswer) {
        setSelectedAnswer(previousAnswer.userAnswer);
      }
      // Remove the current answer from the answers array
      setAnswers(prev => prev.slice(0, -1));
    }
  };

  const handleSubmitQuiz = async (finalAnswers?: QuizAnswer[]) => {
    const quizAnswers = finalAnswers || answers;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      const attempt = await submitQuizAttempt(quiz.id, quizAnswers, timeSpent);
      onComplete(attempt);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  const handleExit = () => {
    if (answers.length > 0) {
      setShowConfirmExit(true);
    } else {
      onExit();
    }
  };

  const getTimeLeftColor = () => {
    if (!timeLeft || !quiz.timeLimit) return 'text-gray-600';
    const percentLeft = (timeLeft / (quiz.timeLimit * 60)) * 100;
    if (percentLeft <= 10) return 'text-red-600';
    if (percentLeft <= 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedAnswer === index ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {selectedAnswer === index && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-3">
            {['True', 'False'].map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index === 0)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedAnswer === (index === 0)
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedAnswer === (index === 0) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {selectedAnswer === (index === 0) && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        );

      case 'fill_blank':
        return (
          <div>
            <input
              type="text"
              value={selectedAnswer as string}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        );

      case 'essay':
        return (
          <div>
            <textarea
              value={selectedAnswer as string}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              placeholder="Write your essay answer here..."
              rows={6}
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600">{quiz.subject}</p>
            </div>
            <div className="text-right">
              {timeLeft !== null && (
                <div className={`text-lg font-mono ${getTimeLeftColor()}`}>
                  ⏰ {formatTime(timeLeft)}
                </div>
              )}
              <button
                onClick={handleExit}
                className="text-sm text-gray-500 hover:text-gray-700 mt-2"
              >
                Exit Quiz
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-blue-600">
                Question {currentQuestionIndex + 1}
              </span>
              <span className="text-sm text-gray-500">
                {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
              </span>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestion.question}
            </h2>

            {currentQuestion.imageUrl && (
              <img
                src={currentQuestion.imageUrl}
                alt="Question illustration"
                className="mb-6 rounded-lg max-w-md mx-auto block"
              />
            )}
          </div>

          {renderQuestion()}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              onClick={handlePreviousQuestion}
              variant="secondary"
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            <div className="text-sm text-gray-500">
              {selectedAnswer !== '' ? '✓ Answer selected' : 'Select an answer to continue'}
            </div>

            <Button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === '' || isLoading}
              isLoading={isLoading && isLastQuestion}
            >
              {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
            </Button>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showConfirmExit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Exit Quiz?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to exit? Your progress will be lost.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowConfirmExit(false)}
                variant="secondary"
                className="flex-1"
              >
                Continue Quiz
              </Button>
              <Button
                onClick={onExit}
                variant="danger"
                className="flex-1"
              >
                Exit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
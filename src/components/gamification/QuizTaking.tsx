import React, { useState, useEffect, useCallback } from 'react';
import { Quiz, QuizAnswer, QuizAttempt } from '../../types';
import { Button } from '../ui/Button';
import { useGamificationStore } from '../../store/gamificationStore';
import { useBehavioralStore } from '../../store/behavioralStore';

interface QuizTakingProps {
  quiz: Quiz;
  onComplete: (attempt: QuizAttempt) => void;
  onExit: () => void;
}

export const QuizTaking: React.FC<QuizTakingProps> = ({ quiz, onComplete, onExit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number>('');
  const [timeLeft, setTimeLeft] = useState<number | null>(
    quiz?.timeLimit && typeof quiz.timeLimit === 'number' && quiz.timeLimit > 0
      ? quiz.timeLimit * 60
      : null
  );
  const [startTime] = useState(Date.now());
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, QuizAnswer>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizAttempt | null>(null);

  const { submitQuizAttempt, isLoading } = useGamificationStore();
  const { trackEngagement } = useBehavioralStore();

  // Defensive checks
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz Not Available</h2>
          <p className="text-gray-600 mb-4">
            This quiz has no questions available. Please try another quiz.
          </p>
          <Button onClick={onExit}>Go Back</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions?.[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (quiz.questions?.length || 0) - 1;
  const progress =
    quiz.questions && quiz.questions.length > 0
      ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100
      : 0;

  // Safety check for current question
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Question Not Found</h2>
          <p className="text-gray-600 mb-4">
            Unable to load the current question. Please try again.
          </p>
          <Button onClick={onExit}>Go Back</Button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number | null) => {
    if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string | number) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitQuiz = useCallback(
    async (finalAnswers?: QuizAnswer[]) => {
      if (!quiz || !quiz.id) {
        console.error('Quiz or quiz.id is missing');
        return;
      }

      const quizAnswers =
        finalAnswers && Array.isArray(finalAnswers)
          ? finalAnswers
          : answers && Array.isArray(answers)
            ? answers
            : [];
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      try {
        const attempt = await submitQuizAttempt(quiz.id, quizAnswers, timeSpent);
        if (attempt) {
          setQuizResults(attempt);

          // Track quiz completion
          trackEngagement({
            eventType: 'quiz_complete',
            duration: timeSpent,
            metadata: {
              quizId: quiz.id,
              quizTitle: quiz.title,
              score: attempt.percentage || 0,
              totalQuestions: quiz.questions?.length || 0,
            },
          });
        }
      } catch (error) {
        console.error('Failed to submit quiz:', error);
      }
    },
    [quiz, answers, startTime, submitQuizAttempt, trackEngagement]
  );

  // Track quiz start
  useEffect(() => {
    if (quiz?.id) {
      trackEngagement({
        eventType: 'quiz_start',
        metadata: { quizId: quiz.id, quizTitle: quiz.title },
      });
    }
  }, [quiz?.id, trackEngagement]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSubmitQuiz]);

  const handleNextQuestion = async () => {
    if (selectedAnswer === '' || selectedAnswer === null || selectedAnswer === undefined) return;
    if (!currentQuestion || !currentQuestion.id) return;

    // Compare answers using backend's exact logic: case-insensitive string comparison
    // Backend uses: userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
    const userAnswerStr = String(selectedAnswer).toLowerCase().trim();
    const correctAnswerStr = String(currentQuestion.correctAnswer).toLowerCase().trim();

    // Debug logging to help diagnose the issue
    console.log('=== Answer Comparison Debug ===');
    console.log('Question:', currentQuestion.question);
    console.log('Raw selectedAnswer:', selectedAnswer, 'Type:', typeof selectedAnswer);
    console.log(
      'Raw correctAnswer:',
      currentQuestion.correctAnswer,
      'Type:',
      typeof currentQuestion.correctAnswer
    );
    console.log('Processed userAnswerStr:', `"${userAnswerStr}"`, 'Length:', userAnswerStr.length);
    console.log(
      'Processed correctAnswerStr:',
      `"${correctAnswerStr}"`,
      'Length:',
      correctAnswerStr.length
    );
    console.log(
      'Character codes - userAnswer:',
      Array.from(userAnswerStr).map((c) => `${c}(${c.charCodeAt(0)})`)
    );
    console.log(
      'Character codes - correctAnswer:',
      Array.from(correctAnswerStr).map((c) => `${c}(${c.charCodeAt(0)})`)
    );
    console.log('Options:', currentQuestion.options);
    console.log(
      'Options with codes:',
      currentQuestion.options?.map((opt: any) => ({
        value: opt,
        processed: String(opt).toLowerCase().trim(),
        codes: Array.from(String(opt).toLowerCase().trim()).map(
          (c: string) => `${c}(${c.charCodeAt(0)})`
        ),
      }))
    );

    // Direct comparison (matches backend logic exactly)
    let isCorrect = userAnswerStr === correctAnswerStr;
    console.log('Direct comparison result:', isCorrect);

    // If direct comparison fails, check if either value might be an index
    // This handles cases where correctAnswer or userAnswer is stored as an index (0, 1, 2, etc.)
    if (!isCorrect && currentQuestion.options && Array.isArray(currentQuestion.options)) {
      console.log('Direct comparison failed, checking index-based logic...');

      // Check if correctAnswer is a valid index
      const correctAnswerNum = Number(correctAnswerStr);
      console.log(
        'correctAnswerNum:',
        correctAnswerNum,
        'isNaN:',
        isNaN(correctAnswerNum),
        'isInteger:',
        Number.isInteger(correctAnswerNum)
      );
      console.log(
        'Index check:',
        correctAnswerNum >= 0,
        '&&',
        correctAnswerNum < currentQuestion.options.length
      );

      if (
        !isNaN(correctAnswerNum) &&
        Number.isInteger(correctAnswerNum) &&
        correctAnswerNum >= 0 &&
        correctAnswerNum < currentQuestion.options.length
      ) {
        // correctAnswer is an index, get the actual option value and compare
        const correctOptionValue = String(currentQuestion.options[correctAnswerNum])
          .toLowerCase()
          .trim();
        console.log(
          'correctAnswer is index',
          correctAnswerNum,
          '-> option value:',
          `"${correctOptionValue}"`
        );
        isCorrect = userAnswerStr === correctOptionValue;
        console.log('Index-based comparison (correctAnswer as index) result:', isCorrect);
      }

      // If still not correct, check if userAnswer is a valid index
      if (!isCorrect) {
        const userAnswerNum = Number(userAnswerStr);
        console.log(
          'userAnswerNum:',
          userAnswerNum,
          'isNaN:',
          isNaN(userAnswerNum),
          'isInteger:',
          Number.isInteger(userAnswerNum)
        );
        console.log(
          'Index check:',
          userAnswerNum >= 0,
          '&&',
          userAnswerNum < currentQuestion.options.length
        );

        if (
          !isNaN(userAnswerNum) &&
          Number.isInteger(userAnswerNum) &&
          userAnswerNum >= 0 &&
          userAnswerNum < currentQuestion.options.length
        ) {
          // userAnswer is an index, get the actual option value and compare with correctAnswer
          const userOptionValue = String(currentQuestion.options[userAnswerNum])
            .toLowerCase()
            .trim();
          console.log(
            'userAnswer is index',
            userAnswerNum,
            '-> option value:',
            `"${userOptionValue}"`
          );
          isCorrect = userOptionValue === correctAnswerStr;
          console.log('Index-based comparison (userAnswer as index) result:', isCorrect);
        }
      }
    }

    console.log('Final isCorrect:', isCorrect);
    console.log('=== End Debug ===');

    const pointsEarned = isCorrect ? currentQuestion.points || 0 : 0;

    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      isCorrect,
      pointsEarned,
    };

    // Store answer with feedback
    setSubmittedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: newAnswer,
    }));

    // Show immediate feedback
    setShowFeedback(true);

    // Wait 2 seconds to show feedback, then move to next question or submit
    setTimeout(() => {
      setShowFeedback(false);
      setAnswers((prev) => [...prev, newAnswer]);
      setSelectedAnswer('');

      if (isLastQuestion) {
        handleSubmitQuiz([...answers, newAnswer]);
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    }, 2000);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0 && answers && Array.isArray(answers)) {
      setCurrentQuestionIndex((prev) => prev - 1);
      // Restore previous answer if it exists
      const previousAnswer = answers[currentQuestionIndex - 1];
      if (
        previousAnswer &&
        previousAnswer.userAnswer !== null &&
        previousAnswer.userAnswer !== undefined
      ) {
        setSelectedAnswer(previousAnswer.userAnswer);
      } else {
        setSelectedAnswer('');
      }
      // Remove the current answer from the answers array
      setAnswers((prev) => prev.slice(0, -1));
    }
  };

  const handleExit = () => {
    if (answers && Array.isArray(answers) && answers.length > 0) {
      setShowConfirmExit(true);
    } else {
      onExit();
    }
  };

  const getTimeLeftColor = () => {
    if (
      !timeLeft ||
      timeLeft <= 0 ||
      !quiz?.timeLimit ||
      typeof quiz.timeLimit !== 'number' ||
      quiz.timeLimit <= 0
    ) {
      return 'text-gray-600';
    }
    const totalSeconds = quiz.timeLimit * 60;
    if (totalSeconds <= 0) return 'text-gray-600';
    const percentLeft = (timeLeft / totalSeconds) * 100;
    if (percentLeft <= 10) return 'text-red-600';
    if (percentLeft <= 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  const renderQuestion = () => {
    if (!currentQuestion || !currentQuestion.type) {
      return <div className="text-red-600">Error: Question type is missing</div>;
    }

    switch (currentQuestion.type) {
      case 'multiple_choice':
        if (
          !currentQuestion.options ||
          !Array.isArray(currentQuestion.options) ||
          currentQuestion.options.length === 0
        ) {
          return <div className="text-red-600">Error: No options available for this question</div>;
        }

        const submittedAnswer = currentQuestion.id
          ? submittedAnswers[currentQuestion.id]
          : undefined;

        return (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              if (option === null || option === undefined) {
                return null;
              }
              // Handle both index-based and value-based selection
              const isSelected =
                selectedAnswer === index ||
                selectedAnswer === option ||
                String(selectedAnswer) === String(index) ||
                String(selectedAnswer) === String(option) ||
                submittedAnswer?.userAnswer === index ||
                submittedAnswer?.userAnswer === option ||
                String(submittedAnswer?.userAnswer) === String(index) ||
                String(submittedAnswer?.userAnswer) === String(option);
              // Use case-insensitive comparison to match backend logic
              const isCorrectOption =
                String(option).toLowerCase().trim() ===
                String(currentQuestion.correctAnswer).toLowerCase().trim();
              const isUserAnswer = isSelected;
              const isUserCorrect = submittedAnswer?.isCorrect || false;

              // Determine styling based on feedback state
              let buttonClass = 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50';
              if (showFeedback) {
                if (isCorrectOption) {
                  // Always show correct answer in green
                  buttonClass = 'border-green-500 bg-green-50 text-green-900';
                } else if (isUserAnswer && !isUserCorrect) {
                  // Show user's wrong answer in red
                  buttonClass = 'border-red-500 bg-red-50 text-red-900';
                } else {
                  // Other options remain neutral
                  buttonClass = 'border-gray-200 bg-gray-50 text-gray-600';
                }
              } else if (isSelected) {
                // Before feedback, show selected answer in blue
                buttonClass = 'border-blue-500 bg-blue-50 text-blue-900';
              }

              return (
                <button
                  key={index}
                  onClick={() => !showFeedback && handleAnswerSelect(option)}
                  disabled={showFeedback}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${buttonClass} ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                          showFeedback && isCorrectOption
                            ? 'border-green-500 bg-green-500'
                            : showFeedback && isUserAnswer && !isUserCorrect
                              ? 'border-red-500 bg-red-500'
                              : isSelected
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                        }`}
                      >
                        {(isSelected || (showFeedback && isCorrectOption)) && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                    {showFeedback && (
                      <div className="flex items-center">
                        {isCorrectOption && (
                          <span className="text-green-600 font-semibold mr-2">
                            ✓ Great thinking!
                          </span>
                        )}
                        {isUserAnswer && !isUserCorrect && (
                          <span className="text-blue-600 font-semibold mr-2">
                            💡 Learning moment
                          </span>
                        )}
                        {isUserAnswer && isUserCorrect && (
                          <span className="text-green-600 font-semibold mr-2">
                            ✓ Your effort paid off!
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
            {showFeedback &&
              currentQuestion.explanation &&
              typeof currentQuestion.explanation === 'string' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium mb-1">💡 What you're learning:</p>
                  <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
                </div>
              )}
            {showFeedback && !submittedAnswer?.isCorrect && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 font-medium">
                  💪 Remember: Mistakes help your brain grow stronger! Keep going!
                </p>
              </div>
            )}
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-3">
            {['True', 'False'].map((option, index) => {
              const isTrue = index === 0;
              const answerValue = isTrue ? 'true' : 'false';
              const isSelected =
                selectedAnswer === answerValue ||
                selectedAnswer === String(isTrue) ||
                (isTrue && selectedAnswer === 'True') ||
                (!isTrue && selectedAnswer === 'False');

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(answerValue)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
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

  // Show results screen after quiz is submitted
  if (quizResults) {
    // Use score from backend response (quizResults) instead of calculating locally
    const totalPoints =
      quizResults.totalPoints && typeof quizResults.totalPoints === 'number'
        ? quizResults.totalPoints
        : quiz?.questions && Array.isArray(quiz.questions)
          ? quiz.questions.reduce(
              (sum, q) => sum + (q?.points && typeof q.points === 'number' ? q.points : 0),
              0
            )
          : 0;
    const earnedPoints =
      quizResults.score && typeof quizResults.score === 'number'
        ? quizResults.score
        : answers && Array.isArray(answers)
          ? answers.reduce(
              (sum, a) =>
                sum + (a?.pointsEarned && typeof a.pointsEarned === 'number' ? a.pointsEarned : 0),
              0
            )
          : 0;
    const percentage =
      quizResults.percentage && typeof quizResults.percentage === 'number'
        ? quizResults.percentage
        : totalPoints > 0
          ? Math.round((earnedPoints / totalPoints) * 100)
          : 0;

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <div
                className={`text-6xl mb-4 ${percentage >= 70 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-blue-500'}`}
              >
                {percentage >= 70 ? '🎉' : percentage >= 50 ? '💪' : '🌱'}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
              <p className="text-gray-600 mb-3">
                Your Score: {earnedPoints} / {totalPoints} ({percentage}%)
              </p>
              {percentage >= 70 ? (
                <p className="text-green-700 font-medium">
                  Your effort is paying off! Keep challenging yourself! 🚀
                </p>
              ) : percentage >= 50 ? (
                <p className="text-yellow-700 font-medium">
                  You're making progress! Every question helps your brain grow stronger! 💪
                </p>
              ) : (
                <p className="text-blue-700 font-medium">
                  Every mistake is a learning opportunity! Your brain gets stronger when you
                  struggle. What will you focus on next? 🌱
                </p>
              )}
            </div>

            <div className="space-y-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Review Your Answers</h2>
              {quiz?.questions &&
                Array.isArray(quiz.questions) &&
                quiz.questions.map((question, index) => {
                  if (!question || !question.id) {
                    return null;
                  }

                  const answer =
                    answers && Array.isArray(answers)
                      ? answers.find((a) => a && a.questionId === question.id)
                      : undefined;

                  const isCorrect = answer?.isCorrect === true;
                  const userAnswer = answer?.userAnswer;
                  const correctAnswer = question.correctAnswer;

                  return (
                    <div
                      key={question.id}
                      className={`p-6 rounded-lg border-2 ${
                        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-sm font-medium text-gray-600 mr-2">
                              Question {index + 1}
                            </span>
                            {isCorrect ? (
                              <span className="text-green-600 font-semibold">
                                ✓ Correct - Great thinking!
                              </span>
                            ) : (
                              <span className="text-blue-600 font-semibold">
                                💡 Learning Opportunity
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            {question.question || 'Question text not available'}
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {question.options &&
                          Array.isArray(question.options) &&
                          question.options.map((option, optIndex) => {
                            // Check if this option matches the user's answer or correct answer
                            // Use case-insensitive comparison to match backend logic
                            const userAnswerStr =
                              userAnswer !== null && userAnswer !== undefined
                                ? String(userAnswer).toLowerCase().trim()
                                : '';
                            const optionStr = String(option).toLowerCase().trim();
                            const correctAnswerStr =
                              correctAnswer !== null && correctAnswer !== undefined
                                ? String(correctAnswer).toLowerCase().trim()
                                : '';

                            // Check if this is the user's answer (by value or index)
                            const isUserAnswer =
                              userAnswerStr === optionStr || userAnswerStr === String(optIndex);

                            // Check if this is the correct answer (by value or index)
                            let isCorrectOption = correctAnswerStr === optionStr;

                            // Also check if correctAnswer is an index
                            if (!isCorrectOption) {
                              const correctAnswerNum = Number(correctAnswerStr);
                              if (!isNaN(correctAnswerNum) && correctAnswerNum === optIndex) {
                                isCorrectOption = true;
                              }
                            }

                            // Determine styling: prioritize showing green if user's answer is correct
                            let borderClass = 'border-gray-200 bg-white';
                            if (isUserAnswer && isCorrect) {
                              // User selected the correct answer - show green
                              borderClass = 'border-green-500 bg-green-100 text-green-900';
                            } else if (isCorrectOption) {
                              // This is the correct answer (but user didn't select it)
                              borderClass = 'border-green-500 bg-green-100 text-green-900';
                            } else if (isUserAnswer && !isCorrect) {
                              // User selected wrong answer - show red
                              borderClass = 'border-red-500 bg-red-100 text-red-900';
                            }

                            return (
                              <div key={optIndex} className={`p-3 rounded border ${borderClass}`}>
                                <div className="flex items-center justify-between">
                                  <span>{option}</span>
                                  {isCorrectOption && !isUserAnswer && (
                                    <span className="text-green-600 font-semibold">
                                      ✓ Correct Answer
                                    </span>
                                  )}
                                  {isUserAnswer && isCorrect && (
                                    <span className="text-green-600 font-semibold">
                                      ✓ Your Answer (Correct!)
                                    </span>
                                  )}
                                  {isUserAnswer && !isCorrect && (
                                    <span className="text-red-600 font-semibold">
                                      ✗ Your Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {!isCorrect && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900 font-medium mb-2">
                            💡 What did you learn from this question?
                          </p>
                          {question.explanation && typeof question.explanation === 'string' ? (
                            <p className="text-sm text-blue-800">
                              <strong>Key Learning:</strong> {question.explanation}
                            </p>
                          ) : (
                            <p className="text-sm text-blue-800">
                              Remember: Mistakes help your brain grow! The correct answer was:{' '}
                              <strong>{correctAnswer}</strong>
                            </p>
                          )}
                        </div>
                      )}

                      {question.explanation &&
                        typeof question.explanation === 'string' &&
                        isCorrect && (
                          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-900">
                              <strong>Why this is correct:</strong> {question.explanation}
                            </p>
                          </div>
                        )}

                      <div className="mt-3 text-sm text-gray-600">
                        Points:{' '}
                        {answer?.pointsEarned && typeof answer.pointsEarned === 'number'
                          ? answer.pointsEarned
                          : 0}{' '}
                        /{' '}
                        {question.points && typeof question.points === 'number'
                          ? question.points
                          : 0}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-center space-x-4">
              <Button onClick={() => onComplete(quizResults)} variant="primary">
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz?.title || 'Quiz'}</h1>
              <p className="text-gray-600">{quiz?.subject || ''}</p>
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
            <span>
              Question {currentQuestionIndex + 1} of {quiz?.questions?.length || 0}
            </span>
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
                {currentQuestion?.points && typeof currentQuestion.points === 'number'
                  ? currentQuestion.points
                  : 0}{' '}
                point{currentQuestion?.points && currentQuestion.points !== 1 ? 's' : ''}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestion?.question || 'Question text not available'}
            </h2>

            {currentQuestion?.imageUrl && typeof currentQuestion.imageUrl === 'string' && (
              <img
                src={currentQuestion.imageUrl}
                alt="Question illustration"
                className="mb-6 rounded-lg max-w-md mx-auto block"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
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
              {selectedAnswer !== '' && selectedAnswer !== null && selectedAnswer !== undefined
                ? '✓ Answer selected'
                : 'Select an answer to continue'}
            </div>

            <Button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === '' || isLoading || showFeedback}
              isLoading={isLoading && isLastQuestion}
            >
              {showFeedback ? '...' : isLastQuestion ? 'Submit Quiz' : 'Next Question'}
            </Button>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showConfirmExit && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exit Quiz?</h3>
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
              <Button onClick={onExit} variant="danger" className="flex-1">
                Exit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

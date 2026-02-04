'use client'

import { useState, useRef } from 'react'
import { Check, X, Eye, EyeOff } from 'lucide-react'
import QuestionDetailModal from './QuestionDetailModal'

export default function QuizResult({ questionGroups, answers, onQuit }) {
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false)
  const [showOnlyWrong, setShowOnlyWrong] = useState(false)
  const [selectedQuestionForModal, setSelectedQuestionForModal] = useState(null)

  const flatQuestions = questionGroups.flat()
  let correctCount = 0
  
  const results = flatQuestions.map((q, index) => {
    const userAnswer = answers[q.QuestionID];
    const isCorrect = userAnswer === q.CorrectAnswer;
    if (isCorrect) correctCount++;
    return { ...q, userAnswer, isCorrect, displayNum: index + 1 };
  });

  const accuracy = (correctCount / flatQuestions.length) * 100;
  const filteredResults = showOnlyWrong ? results.filter(r => !r.isCorrect) : results;

  const questionRefs = useRef({});

  const scrollToQuestion = (displayNum) => {
    const question = results.find(q => q.displayNum === displayNum);
    if (question) {
      setSelectedQuestionForModal(question);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 relative">
      <QuestionDetailModal 
        question={selectedQuestionForModal}
        onClose={() => setSelectedQuestionForModal(null)}
      />
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">채점 결과</h2>
        <p className="text-4xl font-bold mb-3">
          <span className={accuracy >= 60 ? 'text-green-600' : 'text-red-600'}>
            {accuracy.toFixed(1)}%
          </span>
          <span className="text-xl text-gray-600 dark:text-gray-400">
            ({correctCount} / {flatQuestions.length}개)
          </span>
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onQuit}
            className="px-4 py-2 font-semibold text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            &larr; 홈으로
          </button>
          <button 
            onClick={() => setShowOnlyWrong(!showOnlyWrong)}
            className={`px-4 py-2 font-semibold rounded-lg ${
              showOnlyWrong
                ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white'
            }`}
          >
            {showOnlyWrong ? '전체 문제 보기' : '틀린 문제만'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">
          문제 번호 목록 (클릭하여 확인)
          {showOnlyWrong && <span className="text-sm text-red-600 dark:text-red-400 ml-2">- 틀린 문제만</span>}
        </h3>
        <div className="flex flex-wrap gap-2">
          {filteredResults.map((q) => (
            <button
              key={q.displayNum}
              onClick={() => scrollToQuestion(q.displayNum)}
              className={`w-10 h-10 rounded text-sm font-semibold flex items-center justify-center border transition-colors ${
                q.isCorrect 
                  ? 'bg-green-100 dark:bg-green-900/50 border-green-300 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/70' 
                  : 'bg-red-100 dark:bg-red-900/50 border-red-300 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/70'
              }`}
            >
              {q.displayNum}
            </button>
          ))}
        </div>
        {showOnlyWrong && filteredResults.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
            🎉 모든 문제를 맞췄습니다!
          </p>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import QuestionCard from './QuestionCard'
import QuizResult from './QuizResult'
import { ChevronLeft, ChevronRight, Check, Loader2, XCircle } from 'lucide-react'
import { useAuth } from '../AuthContext'

const ProgressBar = ({ current, total }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default function QuizEngine({ 
  settings, 
  questionGroups, 
  onQuit,
  setQuestions
}) {
  const { supabase, user } = useAuth();
  const userId = user?.id;
  
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [quizState, setQuizState] = useState('solving')
  const [loadingNext, setLoadingNext] = useState(false);
  const [bookmarkSet, setBookmarkSet] = useState(new Set());
  const [showEarlyResult, setShowEarlyResult] = useState(false);

  useEffect(() => {
    if (userId) {
      const fetchBookmarks = async () => {
        const { data: bookmarks, error } = await supabase
          .from('UserBookmarks')
          .select('QuestionID')
          .eq('UserID', userId);
          
        if (error) {
          console.error('북마크 로드 오류:', error);
        } else {
          setBookmarkSet(new Set(bookmarks.map(b => b.QuestionID)));
        }
      };
      fetchBookmarks();
    } else {
      setBookmarkSet(new Set());
    }
  }, [userId, supabase]);

  const saveProblemHistory = async (questionId, selectedOption, isCorrect) => {
    if (!userId) return;

    try {
      await supabase.from('UserProblemHistory')        .upsert({
          UserID: userId,
          QuestionID: questionId,
          IsCorrect: isCorrect,
          LastAttemptedAt: new Date().toISOString(),
        });
    } catch (error) {
      console.error('풀이 기록 저장 오류:', error);
    }
  };

  const handleSelectAnswer = (questionId, optionIndex) => {
    const isOneByOneMode = settings.mode === 'one-by-one';
    if (isOneByOneMode && quizState === 'submitted') return;

    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  }

  const handleConfirmAnswer = () => {
    const currentQuestion = questionGroups[currentGroupIndex]?.[0];
    if (!currentQuestion) return;
    const selectedOption = answers[currentQuestion.QuestionID];
    
    if (selectedOption === undefined) return;

    setQuizState('submitted');
    
    const isCorrect = currentQuestion.CorrectAnswer === selectedOption;
    saveProblemHistory(currentQuestion.QuestionID, selectedOption, isCorrect);
  };

  const handleSubmitQuiz = async () => {
    if (window.confirm('답안을 제출하시겠습니까?')) {
      setQuizState('submitted');
      
      if (userId) {
        const historyData = questionGroups.flat().map(q => {
          const selectedOption = answers[q.QuestionID] || null;
          const isCorrect = selectedOption === q.CorrectAnswer;
          
          return {
            UserID: userId,
            QuestionID: q.QuestionID,
            IsCorrect: isCorrect,
            LastAttemptedAt: new Date().toISOString(),
          };
        });

        try {
          await supabase.from('UserProblemHistory').upsert(historyData);
        } catch (error) {
          console.error('일괄 풀이 기록 저장 오류:', error);
        }
      }
    }
  }

  const handleBookmarkToggle = (questionId, isBookmarked) => {
    setBookmarkSet(prevSet => {
      const newSet = new Set(prevSet);
      if (isBookmarked) {
        newSet.add(questionId);
      } else {
        newSet.delete(questionId);
      }
      return newSet;
    });
  };

  const handleNext = async () => {
    const isOneByOneMode = settings.mode === 'one-by-one';
    
    if (isOneByOneMode && quizState === 'solving') {
      const currentQuestion = questionGroups[currentGroupIndex]?.[0];
      if (currentQuestion) {
        saveProblemHistory(currentQuestion.QuestionID, null, false);
      }
    }

    if (currentGroupIndex < questionGroups.length - 1) {
      setCurrentGroupIndex(i => i + 1);
      setQuizState('solving');
    } else if (isOneByOneMode) {
      setLoadingNext(true);
      try {
        const existingIds = questionGroups.flat().map(q => q.QuestionID);
        const { data, error } = await supabase.rpc('get_random_questions', {
          p_subject: settings.subject,
          p_category: settings.category === 'all' ? null : settings.category,
          p_limit: 1,
          p_exclude_ids: existingIds
        });
        if (error) throw error;
        if (data.length > 0) {
          const newQuestionGroup = [data[0]];
          setQuestions(prevGroups => [...prevGroups, newQuestionGroup]);
          setCurrentGroupIndex(i => i + 1);
          setQuizState('solving');
        } else {
          alert('가져올 문제가 더 없습니다.');
        }
      } catch (err) {
        alert('다음 문제 로드에 실패했습니다.');
      } finally {
        setLoadingNext(false);
      }
    }
  };

  const handlePrev = () => {
    setCurrentGroupIndex(i => Math.max(0, i - 1));
    setQuizState('solving');
  };

  const isOneByOneMode = settings.mode === 'one-by-one';
  const currentQuestions = questionGroups[currentGroupIndex];
  const currentQuestionId = currentQuestions?.[0]?.QuestionID;
  const isAnswerSelected = currentQuestionId ? answers[currentQuestionId] !== undefined : false;

  if (showEarlyResult) {
    const solvedQuestionGroups = questionGroups.slice(0, currentGroupIndex + 1);
    return (
      <QuizResult 
        questionGroups={solvedQuestionGroups} 
        answers={answers}
        onQuit={onQuit}
      />
    )
  }

  if (quizState === 'submitted' && !isOneByOneMode) {
    return (
      <QuizResult 
        questionGroups={questionGroups} 
        answers={answers}
        onQuit={onQuit}
      />
    )
  }
  
  const currentQuestionNumber = questionGroups.slice(0, currentGroupIndex)
    .reduce((acc, group) => acc + group.length, 0) + 1;
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onQuit} className="text-sm text-gray-500 hover:underline">
          &larr; 나가기
        </button>
        <h2 className="text-lg font-bold text-center">
          {settings.title || `${settings.year}년 ${settings.round}회`}
        </h2>
        <span className="text-sm font-semibold text-blue-600 min-w-[80px] text-right">
          {isOneByOneMode 
            ? `${currentGroupIndex + 1}번째 문제` 
            : `${currentGroupIndex + 1} / ${questionGroups.length}`}
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900 p-5 md:p-8 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800">
        {currentQuestions ? (
        <QuestionCard 
          questions={currentQuestions}
            displayQuestionNumber={currentQuestionNumber}
          selectedAnswers={answers}
          onSelectAnswer={handleSelectAnswer}
            isSubmitted={isOneByOneMode && quizState === 'submitted'}
          mode={settings.mode}
            settings={settings}
            userId={userId}
            bookmarkSet={bookmarkSet}
            onBookmarkToggle={handleBookmarkToggle}
        />
        ) : (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePrev}
          disabled={currentGroupIndex === 0}
          className="flex items-center gap-1 px-4 py-2 font-semibold text-gray-700 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow border disabled:opacity-50 w-1/4 justify-center"
        >
          <ChevronLeft size={18} />
          이전
        </button>
        
        <div className="w-1/2 flex justify-center">
          {isOneByOneMode ? (
            <button 
              onClick={() => {
                if (window.confirm('풀이를 중단하고 현재까지의 결과를 보시겠습니까?')) {
                  setShowEarlyResult(true);
                }
              }}
              className="flex items-center gap-1 text-sm text-red-500 hover:underline px-6 py-2"
            >
              <XCircle size={16} />
              그만 풀기
            </button>
          ) : (
            currentGroupIndex === questionGroups.length - 1 && (
          <button
            onClick={handleSubmitQuiz}
            className="flex items-center gap-1.5 px-6 py-2 font-bold text-white bg-green-600 rounded-lg shadow-lg hover:bg-green-700"
          >
            <Check size={18} />
            최종 제출
          </button>
            )
          )}
        </div>
        
        <div className="w-1/4 flex justify-center">
          {isOneByOneMode ? (
            <>
              {quizState === 'solving' && isAnswerSelected ? (
                <button
                  onClick={handleConfirmAnswer}
                  className="flex items-center gap-1.5 px-6 py-2 font-bold text-white bg-green-600 rounded-lg shadow-lg hover:bg-green-700 w-full justify-center"
                >
                  <Check size={18} />
                  확인
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-4 py-2 font-semibold text-gray-700 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow border w-full justify-center"
                >
                  {loadingNext ? <Loader2 className="animate-spin" size={18} /> :
                   (quizState === 'solving' && !isAnswerSelected) ? '스킵' : '다음'} 
                  <ChevronRight size={18} />
                </button>
              )}
            </>
          ) : (
            <>
              {currentGroupIndex < questionGroups.length - 1 && (
        <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-4 py-2 font-semibold text-gray-700 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow border w-full justify-center"
        >
          다음
          <ChevronRight size={18} />
        </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
'use client'

import React, { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from './AuthContext'
import QuizEngine from './components/QuizEngine'
import SearchModal from './components/SearchModal'
import AuthButtons from './components/AuthButtons'
import Link from 'next/link'
import { 
  BookCheck, Search, Bookmark, Target,
  Loader2, AlertTriangle, ArrowLeft, RefreshCw,
  Book, Atom, Brain, Milestone, History, PieChart 
} from 'lucide-react'

import LoginWelcome from './components/home/LoginWelcome'
import NoticeBoard from './components/home/NoticeBoard'
import SubjectGrid from './components/home/SubjectGrid'

const subjectCategories = {
  '국어': ['현대 시', '고전 시가', '현대 소설', '고전 소설', '수필·극', '독서(비문학)', '화법과 작문', '문법'],
  '수학': ['다항식', '방정식과 부등식', '도형의 방정식', '집합과 명제', '함수와 그래프', '순열과 조합'],
  '영어': ['어휘', '내용 일치', '짧은 빈칸 삽입', '긴 빈칸 삽입', '문장 삽입', '의미 파악', '심경 파악', '장소 파악', '주제/목적 파악', '지칭 대상', '장문 독해'],
  '사회': [],
  '과학': [],
};

function HomePageContent() {
  const { supabase, user } = useAuth();
  const [quizSettings, setQuizSettings] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchParams = useSearchParams();

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedExam, setSelectedExam] = useState('');
  const [examList, setExamList] = useState([]);
  const [examListLoading, setExamListLoading] = useState(false);

  useEffect(() => {
    console.log("현재 접속 Origin:", window.location.origin);
  }, []);

  const groupQuestionsByPassage = (questionList) => {
    const newQuestionGroups = [];
    const processedIds = new Set();
    for (const q of questionList) {
      if (processedIds.has(q.QuestionID)) continue;
      if (q.PassageGroup) {
        const group = questionList.filter(item => item.PassageGroup === q.PassageGroup);
        group.forEach(item => processedIds.add(item.QuestionID));
        newQuestionGroups.push(group);
      } else {
        processedIds.add(q.QuestionID);
        newQuestionGroups.push([q]);
      }
    }
    return newQuestionGroups;
  }

  const startOneByOneQuiz = async () => {
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_random_questions', {
        p_subject: selectedSubject,
        p_category: selectedCategory === 'all' ? null : selectedCategory,
        p_limit: 1,
        p_exclude_ids: []
      });
      if (error) throw error;
      if (data.length === 0) {
        alert('해당 분류의 문제가 없습니다.'); return;
      }
      setQuestions(groupQuestionsByPassage(data));
      setQuizSettings({ 
        mode: 'one-by-one',
        title: `${selectedSubject} - 한 문제씩 풀기`,
        subject: selectedSubject,
        category: selectedCategory,
      });
    } catch (err) {
      setError('문제 로드에 실패했습니다.');
    }
  };

  const startBatchQuiz = async (limit = 20, titleSuffix = `${limit}문제 일괄 풀기`) => {
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_random_questions', {
        p_subject: selectedSubject,
        p_category: null,
        p_limit: limit,
        p_exclude_ids: [] 
      });
      
      if (error) throw error;
      if (data.length === 0) {
        alert('해당 과목의 문제가 없습니다.'); return;
      }
      
      setQuestions(groupQuestionsByPassage(data));
      setQuizSettings({ 
        mode: 'batch',
        title: `${selectedSubject} - ${titleSuffix}`,
      });
    } catch (err) {
      setError('문제 로드에 실패했습니다.');
    }
  };

  const startMockExam = async () => {
    if (!selectedExam) {
      alert('풀이할 모의고사를 선택하세요.'); return;
    }
    setError(null);
    const [year, round] = selectedExam.split('-').map(Number);
    try {
      const { data, error } = await supabase
        .from('Questions')
        .select('*')
        .eq('ExamYear', year)
        .eq('ExamRound', round)
        .eq('Subject', selectedSubject)
        .order('QuestionNum', { ascending: true });
      if (error) throw error;
      if (data.length === 0) throw new Error('해당 모의고사 문제를 찾을 수 없습니다.');

      setQuestions(groupQuestionsByPassage(data));
      setQuizSettings({ mode: 'mock', year, round });
    } catch (err) {
      setError('모의고사 문제 로드에 실패했습니다.');
    }
  }
  
  const startRetryQuiz = useCallback(async (questionId) => {
    setError(null);
    try {
      const { data: question, error: qError } = await supabase
        .from('Questions')
        .select('*')
        .eq('QuestionID', questionId)
        .single();
        
      if (qError) throw qError;

      let questionList;
      
      if (question.PassageGroup) {
        const { data: groupData, error: gError } = await supabase
          .from('Questions')
          .select('*')
          .eq('PassageGroup', question.PassageGroup)
          .order('QuestionNum', { ascending: true });
        if (gError) throw gError;
        questionList = groupData;
      } else {
        questionList = [question];
      }
      
      const groupedQuestions = groupQuestionsByPassage(questionList);
      setQuestions(groupedQuestions);
      setQuizSettings({ mode: 'retry', title: '다시 풀기' });

    } catch (err) {
      console.error('다시 풀기 로드 오류:', err);
      setError('문제를 불러오는 데 실패했습니다. 다시 시도해주세요.');
    }
  }, [groupQuestionsByPassage]);

  const handleSearchSubmit = (searchResults) => {
    setQuestions(groupQuestionsByPassage(searchResults));
    setQuizSettings({ mode: 'batch', title: '검색 결과 풀기' });
    setIsSearchOpen(false);
  }

  useEffect(() => {
    if (!selectedSubject) return;

    const fetchExamList = async () => {
      setError(null);
      setExamListLoading(true);
      try {
        const { data, error } = await supabase
          .from('Questions')
          .select('"ExamYear", "ExamRound"')
          .eq('Subject', selectedSubject)
          .order('ExamYear', { ascending: false })
          .order('ExamRound', { ascending: false });
          
        if (error) throw error;
        
        const uniqueExams = Array.from(new Map(data.map(e => [`${e.ExamYear}-${e.ExamRound}`, e])).values());
        
        setExamList(uniqueExams);
        if (uniqueExams.length > 0) {
          setSelectedExam(`${uniqueExams[0].ExamYear}-${uniqueExams[0].ExamRound}`);
        }
      } catch (err) {
        setError('모의고사 목록 로드에 실패했습니다.');
      } finally {
        setExamListLoading(false);
      }
    };
    fetchExamList();
  }, [selectedSubject]);

  useEffect(() => {
    const retryId = searchParams.get('retry_id');
    if (retryId) {
      startRetryQuiz(parseInt(retryId, 10));
    }
  }, [searchParams, startRetryQuiz]);

  if (quizSettings && questions.length > 0) {
    return (
      <QuizEngine 
        settings={quizSettings} 
        questionGroups={questions} 
        setQuestions={setQuestions}
        onQuit={() => {
          setQuizSettings(null);
          setQuestions([]);
          window.history.pushState(null, '', '/'); 
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white">
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onSubmit={handleSearchSubmit} 
      />
      
      <main className="max-w-6xl mx-auto p-4 md:p-6 mt-4">
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg flex items-center gap-3">
            <AlertTriangle className="text-red-600" />
            <span className="text-red-700 dark:text-red-200">{error}</span>
          </div>
        )}

        {!selectedSubject ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 space-y-6">
              {/* PC: 로그인/프로필과 검색이 한 줄, 모바일: 세로 배치 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 order-1 lg:order-1">
                  <LoginWelcome />
                </div>
                <div className="md:col-span-1 order-3 lg:order-2">
                  <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-full w-full flex flex-col items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <Search size={36} className="text-gray-400 mb-3" />
                    <span className="text-xl font-bold">문제 검색</span>
                    <span className="text-sm text-gray-500">키워드로 문제 찾기</span>
                  </button>
                </div>
              </div>
              
              {/* 모바일에서 두 번째: 공지사항 */}
              <div className="order-2 lg:hidden">
                <NoticeBoard />
              </div>
              
              {/* 과목 선택 (PC에서는 아래쪽, 모바일에서는 네 번째) */}
              <div className="order-4 lg:order-3">
                <SubjectGrid onSubjectSelect={setSelectedSubject} />
              </div>
            </div>

            {/* PC에서만 오른쪽에 공지사항 */}
            <div className="lg:col-span-1 hidden lg:block">
              <NoticeBoard />
            </div>
            
          </div>
        ) : (
          <div>
              <button 
              onClick={() => setSelectedSubject(null)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:underline mb-4"
            >
              <ArrowLeft size={16} /> 대시보드로 돌아가기
            </button>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              {selectedSubject} 학습
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Target className="text-green-500" /> 한 문제씩 풀기
                </h3>
                
                <div className="mb-4">
                  <label className="block text-xs font-medium mb-1">대분류 필터</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    disabled={!subjectCategories[selectedSubject]?.length}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                  >
                    <option value="all">전체 분류</option>
                    {(subjectCategories[selectedSubject] || []).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-12">
                  선택한 분류에서 문제를 하나씩 풀고, 즉시 정답과 해설을 확인합니다.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={startOneByOneQuiz} 
                    className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    연습 시작 (1문제씩 채점)
              </button>
              <button 
                    onClick={() => startBatchQuiz(50, '연속 풀기')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold text-green-700 bg-green-100 dark:bg-green-900/50 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50"
                  >
                    <RefreshCw size={16} /> 계속 풀기 (나중에 채점)
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <BookCheck className="text-blue-500" /> 일괄 풀기 (OMR)
                </h3>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    선택한 과목에서 랜덤 문제를 풉니다.<br/>
                    (마지막에 일괄 채점)
                  </p>
                  <button 
                    onClick={() => startBatchQuiz(20)} 
                    className="w-full px-4 py-2 font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                  >
                    20문제 일괄 풀기
              </button>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    선택한 과목의 기출 모의고사를 풉니다.
                  </p>
                  {examListLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <div className="space-y-3">
                      <select
                        value={selectedExam}
                        onChange={(e) => setSelectedExam(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {examList.length === 0 ? (
                          <option>해당 과목의 시험 없음</option>
                        ) : (
                          examList.map(exam => (
                            <option key={`${exam.ExamYear}-${exam.ExamRound}`} value={`${exam.ExamYear}-${exam.ExamRound}`}>
                              {exam.ExamYear}년 {exam.ExamRound}회
                            </option>
                          ))
                        )}
                      </select>
              <button 
                        onClick={startMockExam}
                        disabled={examList.length === 0}
                        className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                        모의고사 시작
              </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Bookmark className="text-orange-500" /> 복습하기
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-16">
                  틀린 문제나 북마크한 문제를 다시 풀거나, 나의 학습 통계를 확인합니다.
                </p>
                <div className="space-y-3">
                  <Link
                    href="/my-page/history?filter=wrong"
                    className="block w-full text-center px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    오답노트 (틀린 문제)
                  </Link>
                  <Link
                    href="/my-page/bookmarks"
                    className="block w-full text-center px-4 py-2 font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600"
                  >
                    북마크
                  </Link>
                  <Link
                    href="/my-page"
                    className="block w-full text-center px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    전체 통계 보기
                  </Link>
                </div>
              </div>
              
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <HomePageContent />
    </Suspense>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Search, X, Loader2, BookOpen, FileText, CheckCircle, Eye, Bookmark } from 'lucide-react'
import { useAuth } from '../AuthContext'
import QuestionDetailModal from './QuestionDetailModal'
import BookmarkButton from './BookmarkButton'

const HighlightText = ({ text, highlight, maxLength = 200 }) => {
  if (!highlight || !text) return text;
  
  const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  const parts = truncatedText.split(new RegExp(`(${highlight})`, 'gi'));
  
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() 
          ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-600 px-0.5 rounded text-black font-medium">{part}</mark>
          : part
      )}
    </span>
  );
};

export default function SearchModal({ isOpen, onClose, onSubmit }) {
  const { supabase, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [bookmarkSet, setBookmarkSet] = useState(new Set());

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const term = `%${searchTerm.trim()}%`;
        let query = supabase
          .from('Questions')
          .select('QuestionID, Subject, Category, SubCategory, PassageGroup, PassageHeader, Passage, QuestionBox, QuestionNum, QuestionText, Option1, Option2, Option3, Option4, CorrectAnswer, Explanation, ExamYear, ExamRound, ImageFileName')
          .limit(30);

        if (searchField === 'all') {
          query = query.or(`PassageGroup.ilike.${term},PassageHeader.ilike.${term},Passage.ilike.${term},QuestionBox.ilike.${term},QuestionText.ilike.${term},Option1.ilike.${term},Option2.ilike.${term},Option3.ilike.${term},Option4.ilike.${term},Explanation.ilike.${term}`);
        } else if (searchField === 'passage') {
          query = query.or(`PassageGroup.ilike.${term},PassageHeader.ilike.${term},Passage.ilike.${term},QuestionBox.ilike.${term}`);
        } else if (searchField === 'question') {
          query = query.ilike('QuestionText', term);
        } else if (searchField === 'options') {
          query = query.or(`Option1.ilike.${term},Option2.ilike.${term},Option3.ilike.${term},Option4.ilike.${term}`);
        } else if (searchField === 'explanation') {
          query = query.ilike('Explanation', term);
        } else if (searchField === 'group') {
          query = query.ilike('PassageGroup', term);
        }

        const { data, error } = await query.order('QuestionID', { ascending: false });

        if (error) throw error;
        setResults(data);
      } catch (error) {
        console.error('문제 검색 오류:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchField, supabase]);

  const handleSubmit = () => {
    if (results.length > 0) {
      onSubmit(results);
    }
  };

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
  };

  const handleBookmarkToggle = (questionId, isBookmarked) => {
    setBookmarkSet(prev => {
      const newSet = new Set(prev);
      if (isBookmarked) {
        newSet.add(questionId);
      } else {
        newSet.delete(questionId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && user) {
      const fetchBookmarks = async () => {
        try {
          const { data: bookmarks, error } = await supabase
            .from('UserBookmarks')
            .select('QuestionID')
            .eq('UserID', user.id);
          
          if (error) {
            console.error('북마크 로드 오류:', error);
          } else {
            setBookmarkSet(new Set(bookmarks.map(b => b.QuestionID)));
          }
        } catch (error) {
          console.error('북마크 로드 오류:', error);
        }
      };
      fetchBookmarks();
    }
  }, [isOpen, user, supabase]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Search size={22} /> 문제 검색하기
          </h3>
          {results.length > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {results.length}개 발견
            </span>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex gap-2 mb-4">
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">전체 검색</option>
            <option value="passage">지문/보기</option>
            <option value="question">문제</option>
            <option value="options">선지</option>
            <option value="explanation">해설</option>
            <option value="group">지문 그룹</option>
          </select>
          
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={
                searchField === 'all' 
                  ? '지문, 문제, 선지, 해설에서 검색...' 
                  : searchField === 'passage'
                  ? '지문과 보기에서 검색...'
                  : searchField === 'question'
                  ? '문제 내용으로 검색...'
                  : searchField === 'options'
                  ? '선지 내용으로 검색...'
                  : searchField === 'explanation'
                  ? '해설 내용으로 검색...'
                  : '지문 그룹으로 검색... (예: [06~07])'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            )}
            {loading && (
              <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
            )}
          </div>
        </div>

        <ul className="list-none p-0 mb-4 overflow-y-auto grow divide-y divide-gray-200 dark:divide-gray-700">
          {loading && (
            <li className="p-3 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
              검색 중...
            </li>
          )}
          {results.map((q) => (
            <li
              key={q.QuestionID}
              className="p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded"
              onClick={() => handleQuestionClick(q)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded font-medium">
                      {q.Subject}
                    </span>
                    {q.Category && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                        {q.Category}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {q.ExamYear}년 {q.ExamRound}회
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {q.QuestionNum}번
                    </span>
                  </div>
                  {q.PassageGroup && (
                    <div className="mb-1">
                      <strong className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <BookOpen size={12} />
                        <HighlightText text={q.PassageGroup} highlight={searchTerm} />
                      </strong>
                    </div>
                  )}
                  {q.PassageHeader && (
                    <p className="mt-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
                      헤더: <HighlightText text={q.PassageHeader} highlight={searchTerm} maxLength={80} />
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle size={10} />
                    {q.QuestionNum}번
                  </span>
                  {user && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <BookmarkButton
                        questionId={q.QuestionID}
                        userId={user.id}
                        initialIsBookmarked={bookmarkSet.has(q.QuestionID)}
                        onToggle={handleBookmarkToggle}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                {q.QuestionText && (
                  <div className="flex items-start gap-2">
                    <FileText size={12} className="text-gray-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      <HighlightText text={q.QuestionText} highlight={searchTerm} maxLength={150} />
                    </p>
                  </div>
                )}
                
                {q.Passage && (
                  <div className="flex items-start gap-2">
                    <BookOpen size={12} className="text-gray-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      <HighlightText text={q.Passage} highlight={searchTerm} maxLength={150} />
                    </p>
                  </div>
                )}
                
                {q.Explanation && searchField === 'explanation' && (
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-400 mt-0.5 shrink-0">💡</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      <HighlightText text={q.Explanation} highlight={searchTerm} maxLength={150} />
                    </p>
                  </div>
                )}
              </div>
            </li>
          ))}
          {!loading && results.length === 0 && searchTerm.length >= 2 && (
            <li className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <p className="font-medium">검색 결과가 없습니다</p>
              <p className="text-xs mt-1">다른 검색어를 시도해보세요</p>
            </li>
          )}
          {!loading && !searchTerm && (
            <li className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-xs">검색어를 2자 이상 입력하세요</p>
            </li>
          )}
        </ul>

        <div className="flex gap-2 mt-auto">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={handleSubmit}
            disabled={results.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            {results.length}개 문제 모두 풀기
          </button>
        </div>
      </div>
      
      {selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
        />
      )}
    </div>
  );
}
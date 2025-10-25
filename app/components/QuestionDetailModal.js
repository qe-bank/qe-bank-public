// app/components/QuestionDetailModal.js
'use client'

import { useState } from 'react'
import { renderText, renderTextWithSplits, FootnoteList, _processFootnotes } from '@/lib/renderText' 
import Image from 'next/image'
import { X, Eye, EyeOff } from 'lucide-react'

export default function QuestionDetailModal({ question, onClose }) {
  const [showExplanation, setShowExplanation] = useState(false);
  
  if (!question) return null;

  const options = [question.Option1, question.Option2, question.Option3, question.Option4];
  
  // admin LivePreview.js와 동일한 방식으로 처리
  const passageBlocks = question.Passage ? question.Passage.split('[PASSAGE_SPLIT]') : [];
  const passageData = passageBlocks.map((block) => _processFootnotes(block));
  const allPassageFootnotes = passageData.flatMap(d => d.localFootnotes);
  const renderedPassageBlocks = passageData.map(d => renderText(d.processedText));
  
  const questionBoxBlocks = question.QuestionBox ? question.QuestionBox.split('[BOX_SPLIT]') : [];
  const questionBoxData = questionBoxBlocks.map((block) => _processFootnotes(block));
  const allQuestionBoxFootnotes = questionBoxData.flatMap(d => d.localFootnotes);
  const renderedQuestionBoxBlocks = questionBoxData.map(d => renderText(d.processedText));
  
  const explanationText = question.Explanation || '';
  const { processedText: processedExplanationText, localFootnotes: allExplanationFootnotes } = _processFootnotes(explanationText);
  const renderedExplanationContent = renderText(processedExplanationText);
  
  const renderedHeader = renderText(question.PassageHeader);

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={`bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col text-gray-900 dark:text-white ${
          showExplanation ? 'max-w-7xl' : 'max-w-4xl'
        }`}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 border-b pb-3 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold">
            {question.ExamYear}년 {question.ExamRound}회 {question.QuestionNum}번 ({question.Subject})
          </h3>
          <div className="flex items-center gap-2">
            {question.Explanation && (
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  showExplanation 
                    ? 'text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50' 
                    : 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                }`}
              >
                {showExplanation ? <EyeOff size={14} /> : <Eye size={14} />}
                <span className="hidden sm:inline">{showExplanation ? '해설 숨기기' : '해설 보기'}</span>
                <span className="sm:hidden">{showExplanation ? '숨기기' : '해설'}</span>
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className={`flex gap-2 sm:gap-4 overflow-hidden ${showExplanation ? 'flex-col lg:flex-row' : 'flex-col'}`}>
          {/* 문제 영역 */}
          <div className={`overflow-y-auto pr-1 sm:pr-2 space-y-3 sm:space-y-4 text-sm leading-relaxed ${showExplanation ? 'w-full lg:w-1/2 max-h-[50vh] lg:max-h-none' : 'w-full max-h-[60vh]'}`}>
            {/* 지문 */}
            {(question.PassageGroup || renderedHeader || passageBlocks.length > 0) && (
              <div className="space-y-2">
                {(question.PassageGroup || renderedHeader) && (
                  <div>
                    {question.PassageGroup && <strong className="mr-1.5 text-blue-600 dark:text-blue-400">[{question.PassageGroup}]</strong>}
                    {renderedHeader}
                  </div>
                )}
                
                {renderedPassageBlocks.map((content, i) => (
                  <div key={i} className={`p-2 border border-gray-200 dark:border-gray-800 rounded bg-transparent ${i > 0 ? 'mt-2' : ''}`}>
                    {content}
                  </div>
                ))}
                
                <FootnoteList localFootnotes={allPassageFootnotes} />
              </div>
            )}

            {/* 문제 */}
            <div className="font-semibold text-base my-3 text-gray-900 dark:text-gray-100">
              {renderText(question.QuestionText)}
            </div>

            {/* 이미지 */}
            {question.ImageFileName && (
              <div className="my-3 max-w-lg mx-auto">
                <Image src={question.ImageFileName} alt="문제 이미지" width={500} height={300} className="w-full h-auto object-contain rounded-md" />
              </div>
            )}
            
            {/* 보기 */}
            {questionBoxBlocks.length > 0 && (
              <div className="my-3 space-y-2">
                {renderedQuestionBoxBlocks.map((content, i) => (
                  <div key={i} className={`p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded shadow-inner ${i > 0 ? 'mt-2' : ''}`}>
                    {content}
                  </div>
                ))}
                <FootnoteList localFootnotes={allQuestionBoxFootnotes} />
              </div>
            )}

            {/* 선지 */}
            <ul className="list-none p-0 space-y-2 my-4">
              {options.map((opt, i) => {
                if (!opt) return null;
                const optionIndex = i + 1;
                const isCorrectAnswer = question.CorrectAnswer === optionIndex;
                const isSelected = question.userAnswer === optionIndex;
                
                let optionClass = 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';
                if (isCorrectAnswer) {
                  optionClass = 'bg-green-100 dark:bg-green-900/50 border-green-500 font-semibold text-green-800 dark:text-green-200'; // 정답 강조
                } else if (isSelected) {
                  optionClass = 'bg-red-100 dark:bg-red-900/50 border-red-500 line-through text-red-600 dark:text-red-400'; // 오답 선택 강조
                }

                return (
                  <li key={i} className={`flex items-start p-3 rounded-lg border text-left ${optionClass}`}>
                    <span className="mr-3 shrink-0 font-medium">{['①', '②', '③', '④'][i]}</span>
                    <span className="grow">{renderText(opt)}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 해설 영역 */}
          {showExplanation && question.Explanation && (
            <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-600 pt-4 lg:pt-0 lg:pl-4 flex flex-col">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 text-base sm:text-lg border-b border-gray-200 dark:border-gray-600 pb-2 mb-3 sm:mb-4">
                해설
              </h4>
              <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 max-h-[40vh] lg:max-h-[60vh]">
                <div className="space-y-2 text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                  {renderedExplanationContent}
                  <FootnoteList localFootnotes={allExplanationFootnotes} />
                </div>
              </div>
              {/* 출처/분류 */}
              <div className="mt-3 sm:mt-4 pt-2 border-t border-dashed border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400">
                <p><b>출처:</b> {question.ExamYear}년 {question.ExamRound}회 {question.QuestionNum}번</p>
                <p><b>분류:</b> {question.Subject} - {question.Category}</p>
                {question.SubCategory && <p><b>소분류:</b> {question.SubCategory}</p>}
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="mt-3 sm:mt-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors self-center text-sm sm:text-base"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
'use client'

import { renderText, renderTextWithSplits, FootnoteList, _processFootnotes } from '../../lib/renderText'
import Image from 'next/image'
import { useState } from 'react'
import BookmarkButton from './BookmarkButton'

export default function QuestionCard({ 
  questions, 
  displayQuestionNumber, 
  selectedAnswers, 
  onSelectAnswer,
  isSubmitted,
  mode,
  userId,
  bookmarkSet,
  onBookmarkToggle,
  settings
}) {
  
  const primaryQuestion = questions[0];
  
  // admin LivePreview.js와 동일한 방식으로 처리
  const passageBlocks = primaryQuestion.Passage ? primaryQuestion.Passage.split('[PASSAGE_SPLIT]') : [];
  const passageData = passageBlocks.map((block) => _processFootnotes(block));
  const allPassageFootnotes = passageData.flatMap(d => d.localFootnotes);
  const renderedPassageBlocks = passageData.map(d => renderText(d.processedText));
  
  const questionBoxBlocks = primaryQuestion.QuestionBox ? primaryQuestion.QuestionBox.split('[BOX_SPLIT]') : [];
  const questionBoxData = questionBoxBlocks.map((block) => _processFootnotes(block));
  const allQuestionBoxFootnotes = questionBoxData.flatMap(d => d.localFootnotes);
  const renderedQuestionBoxBlocks = questionBoxData.map(d => renderText(d.processedText));
  
  const renderedHeader = renderText(primaryQuestion.PassageHeader);
  
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="text-gray-900 dark:text-white leading-relaxed">
      
      {(primaryQuestion.PassageGroup || renderedHeader || passageBlocks.length > 0) && (
        <div className="mb-6 pb-4 border-b dark:border-gray-700 space-y-3">
           {(primaryQuestion.PassageGroup || renderedHeader) && (
             <div>
               {settings.mode === 'mock' && primaryQuestion.PassageGroup && 
                 <strong className="mr-1.5 text-blue-600 dark:text-blue-400">[{primaryQuestion.PassageGroup}]</strong>
               }
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

      {questions.map((q, index) => {
        const currentQNum = displayQuestionNumber + index;
        const selectedOption = selectedAnswers[q.QuestionID];
        const isSelectedCurrently = selectedOption !== undefined;
        const isCorrect = selectedOption === q.CorrectAnswer;
        
        const { processedText: explanationText, localFootnotes: explanationFootnotes } = 
          _processFootnotes(q.Explanation);
        
        const feedback = isSubmitted && (selectedOption !== undefined) ? 
          (isCorrect ? '정답입니다!' : `오답입니다 (정답: ${q.CorrectAnswer}번)`) : '';
          
        return (
          <div key={q.QuestionID} className={`py-4 ${index > 0 ? 'border-t border-dashed dark:border-gray-700 mt-4' : ''}`}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                {currentQNum}. {renderText(q.QuestionText)}
              </h3>
              <BookmarkButton 
                questionId={q.QuestionID}
                userId={userId}
                initialIsBookmarked={bookmarkSet.has(q.QuestionID)}
                onToggle={onBookmarkToggle}
              />
            </div>
            
            {q.ImageFileName && (
              <div className="my-4 max-w-lg mx-auto">
                <Image
                  src={q.ImageFileName}
                  alt="문제 이미지"
                  width={500}
                  height={300}
                  className="w-full h-auto object-contain rounded-md"
                />
              </div>
            )}
            
            {index === 0 && questionBoxBlocks.length > 0 && (
              <div className="my-4 space-y-2">
                {renderedQuestionBoxBlocks.map((content, i) => (
                  <div key={i} className={`p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded shadow-inner ${i > 0 ? 'mt-2' : ''}`}>
                    {content}
                  </div>
                ))}
                <FootnoteList localFootnotes={allQuestionBoxFootnotes} />
              </div>
            )}

            <ul className="list-none p-0 space-y-2 my-4 text-base">
              {[q.Option1, q.Option2, q.Option3, q.Option4].map((opt, i) => {
                if (!opt) return null;
                const optionIndex = i + 1;
                const isCorrectAnswer = q.CorrectAnswer === optionIndex;

                let optionClass = 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800';
                
                if (mode === 'one-by-one') {
                  if (isSubmitted) {
                    if (selectedOption === optionIndex && !isCorrect) {
                      optionClass = 'bg-red-100 dark:bg-red-900/50 border-red-500 ring-2 ring-red-300';
                    } else if (isCorrectAnswer) {
                      optionClass = 'bg-green-100 dark:bg-green-900/50 border-green-500 ring-2 ring-green-400';
                    }
                  } else {
                    if (selectedOption === optionIndex) {
                      optionClass = 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 ring-2 ring-blue-400';
                    }
                  }
                } else {
                  if (selectedOption === optionIndex) {
                    optionClass = 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 ring-2 ring-blue-400';
                  }
                }

                return (
                  <li key={i}>
                    <button
                      onClick={() => onSelectAnswer(q.QuestionID, optionIndex)}
                      disabled={isSubmitted}
                      className={`w-full flex items-start p-3 rounded-lg border text-left transition-all ${optionClass} disabled:cursor-not-allowed`}
                    >
                      <span className="mr-3 shrink-0 font-medium text-gray-700 dark:text-gray-300">{['①', '②', '③', '④'][i]}</span>
                      <span className="grow leading-relaxed">{renderText(opt)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {isSubmitted && mode === 'one-by-one' && (
              <div className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-900/50' : 'bg-red-50 dark:bg-red-900/50'}`}>
                <p className={`font-bold text-lg ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {feedback}
                </p>
                <details className="mt-2" onToggle={(e) => setShowExplanation(e.currentTarget.open)}>
                  <summary 
                    className="cursor-pointer font-semibold text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showExplanation ? '해설 닫기' : '자세한 해설 보기'}
                  </summary>
                  <div className="mt-3 pt-3 border-t dark:border-gray-600 text-sm">
                    {renderText(explanationText)}
                    <FootnoteList localFootnotes={explanationFootnotes} />
                    <div className="mt-4 pt-2 border-t border-dashed dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <p><b>출처:</b> {q.ExamYear}년도 제{q.ExamRound}회 검정고시 {q.QuestionNum}번</p>
                      <p><b>분류:</b> {q.Subject} &gt; {q.Category} {q.SubCategory && `> ${q.SubCategory}`}</p>
                    </div>
                  </div>
                </details>
              </div>
            )}
            
          </div>
        )
      })}
    </div>
  )
}
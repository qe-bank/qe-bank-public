// lib/renderText.js - admin LivePreview.js에서 복사
'use client'

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import React from 'react';

// === admin LivePreview.js에서 그대로 복사한 함수들 ===

const BracketWrapper = ({ content, color }) => {
  const labelText = color === 'A' ? '[A]' : color === 'B' ? '[B]' : '[C]'; 

  return (
    <div className="relative inline-block align-top mr-6"> 
      <div className="inline-block align-top pr-2">
        {content}
      </div>

      <div 
        className="absolute top-0 right-0 w-0.5 rounded-sm"
        style={{ height: '100%', backgroundColor: 'currentColor' }} 
      />
      
      <div 
        className="absolute top-0 right-0" 
        style={{ height: '2px', width: '0.8rem', backgroundColor: 'currentColor' }}
      />
      
      <div 
        className="absolute bottom-0 right-0" 
        style={{ height: '2px', width: '0.8rem', backgroundColor: 'currentColor' }}
      />
      
      <span 
        className="absolute top-1/2 -right-6 font-bold text-xs" 
        style={{ color: 'currentColor', transform: 'translateY(-50%)' }}
      >
        {labelText}
      </span>
    </div>
  );
};

export const _processFootnotes = (text) => {
  let localFootnotes = [];
  let currentCounter = 1;
  
  const processedText = text.replace(/\[\*\s(.*?)]/g, (match, explanation) => {
    const index = currentCounter++;
    localFootnotes.push({ index: index, explanation: explanation });
    return `<sup class="text-blue-600 dark:text-blue-400 font-bold cursor-pointer" title="${explanation}">${index})</sup>`;
  });
  
  return { processedText, localFootnotes };
};

export const FootnoteList = ({ localFootnotes }) => {
  if (localFootnotes.length === 0) return null;
  return (
    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600 text-xs space-y-1">
      {localFootnotes.map((note) => (
        <div key={note.index}>
          <strong className="font-bold mr-1">{note.index})</strong>
          {note.explanation}
        </div>
      ))}
    </div>
  );
};

// admin의 renderTextWithTokens 함수를 그대로 복사
export const renderText = (text) => {
  if (!text) return null;

  let html = text
    .replace(/\[U\]([\s\S]*?)\[\/U\]/g, '<span class="underline">$1</span>')
    .replace(/\[S\]([\s\S]*?)\[\/S\]/g, '<span class="line-through">$1</span>')
    .replace(/\[ALIGN_CENTER\]([\s\S]*?)\[\/ALIGN_CENTER\]/g, '<div class="text-center">$1</div>')
    .replace(/\[ALIGN_RIGHT\]([\s\S]*?)\[\/ALIGN_RIGHT\]/g, '<div class="text-right">$1</div>')
    .replace(/\[TOK_1_CIRCLE\]/g, '①').replace(/\[TOK_2_CIRCLE\]/g, '②')
    .replace(/\[TOK_3_CIRCLE\]/g, '③').replace(/\[TOK_4_CIRCLE\]/g, '④')
    .replace(/\[TOK_5_CIRCLE\]/g, '⑤').replace(/\[TOK_A_UPPER_CIRCLE\]/g, 'Ⓐ')
    .replace(/\[TOK_B_UPPER_CIRCLE\]/g, 'Ⓑ').replace(/\[TOK_C_UPPER_CIRCLE\]/g, 'Ⓒ')
    .replace(/\[TOK_D_UPPER_CIRCLE\]/g, 'Ⓓ').replace(/\[TOK_E_UPPER_CIRCLE\]/g, 'Ⓔ')
    .replace(/\[TOK_A_LOWER_CIRCLE\]/g, 'ⓐ').replace(/\[TOK_B_LOWER_CIRCLE\]/g, 'ⓑ')
    .replace(/\[TOK_C_LOWER_CIRCLE\]/g, 'ⓒ').replace(/\[TOK_D_LOWER_CIRCLE\]/g, 'ⓓ')
    .replace(/\[TOK_E_LOWER_CIRCLE\]/g, 'ⓔ').replace(/\[TOK_GA_CIRCLE\]/g, '㉮')
    .replace(/\[TOK_NA_CIRCLE\]/g, '㉯').replace(/\[TOK_DA_CIRCLE\]/g, '㉰')
    .replace(/\[TOK_RA_CIRCLE\]/g, '㉱').replace(/\[TOK_MA_CIRCLE\]/g, '㉲')
    .replace(/\[TOK_GIYEOG_PAREN\]/g, '㉠').replace(/\[TOK_NIEUN_PAREN\]/g, '㉡')
    .replace(/\[TOK_DIGEUT_PAREN\]/g, '㉢').replace(/\[TOK_RIEUL_PAREN\]/g, '㉣')
    .replace(/\[TOK_MIEUM_PAREN\]/g, '㉤').replace(/\[BLANK_GA\]/g, '(가)')
    .replace(/\[BLANK_NA\]/g, '(나)').replace(/\[BLANK_DA\]/g, '(다)')
    .replace(/\[BLANK_RA\]/g, '(라)').replace(/\[BLANK_MA\]/g, '(마)')
    .replace(/\[BLANK_A_LOWER\]/g, '(a)').replace(/\[BLANK_B_LOWER\]/g, '(b)')
    .replace(/\[BLANK_C_LOWER\]/g, '(c)').replace(/\[BLANK_D_LOWER\]/g, '(d)')
    .replace(/\[BLANK_E_LOWER\]/g, '(e)').replace(/\[BLANK_A_UPPER\]/g, '(A)')
    .replace(/\[BLANK_B_UPPER\]/g, '(B)').replace(/\[BLANK_C_UPPER\]/g, '(C)')
    .replace(/\[BLANK_D_UPPER\]/g, '(D)').replace(/\[BLANK_E_UPPER\]/g, '(E)')
    .replace(/\[BLANK_GIYEOG\]/g, '(ㄱ)').replace(/\[BLANK_NIEUN\]/g, '(ㄴ)')
    .replace(/\[BLANK_DIGEUT\]/g, '(ㄷ)').replace(/\[BLANK_RIEUL\]/g, '(ㄹ)')
    .replace(/\[BLANK_MIEUM\]/g, '(ㅁ)');

  const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\[A_BRACKET\][\s\S]*?\[\/A_BRACKET\]|\[B_BRACKET\][\s\S]*?\[\/B_BRACKET\])/g;
  const parts = html.split(regex);
  
  const renderedParts = parts.map((part, index) => {
    if (part.startsWith('[A_BRACKET]')) {
      const content = part.substring('[A_BRACKET]'.length, part.length - '[/A_BRACKET]'.length);
      return <BracketWrapper key={index} content={renderText(content)} color="A" />;
    } else if (part.startsWith('[B_BRACKET]')) {
      const content = part.substring('[B_BRACKET]'.length, part.length - '[/B_BRACKET]'.length);
      return <BracketWrapper key={index} content={renderText(content)} color="B" />;
    } else if (part.startsWith('[C_BRACKET]')) {
      const content = part.substring('[C_BRACKET]'.length, part.length - '[/C_BRACKET]'.length);
      return <BracketWrapper key={index} content={renderText(content)} color="C" />;
    } else if (part.startsWith('$$') && part.endsWith('$$')) {
      return <BlockMath key={index} math={part.substring(2, part.length - 2)} />;
    } else if (part.startsWith('$') && part.endsWith('$')) {
      return <InlineMath key={index} math={part.substring(1, part.length - 1)} />;
    } else {
      return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br />') }} />;
    }
  });

  return renderedParts;
};

// admin LivePreview.js의 블록 처리 로직을 그대로 복사
export const renderTextWithSplits = (text, splitType = 'PASSAGE_SPLIT') => {
  if (!text) return null;
  
  const blocks = text.split(`[${splitType}]`);
  const passageData = blocks.map((block) => _processFootnotes(block));
  const allFootnotes = passageData.flatMap(d => d.localFootnotes);
  const renderedBlocks = passageData.map(d => renderText(d.processedText));
  
  return {
    blocks: renderedBlocks.map((content, i) => {
      if (splitType === 'PASSAGE_SPLIT') {
        return (
          <div key={i} className={`p-2 border border-gray-200 dark:border-gray-800 rounded bg-transparent ${i > 0 ? 'mt-2' : ''}`}>
            {content}
          </div>
        );
      } else if (splitType === 'BOX_SPLIT') {
        return (
          <div key={i} className={`p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded shadow-inner ${i > 0 ? 'mt-2' : ''}`}>
            {content}
          </div>
        );
      }
      return content;
    }),
    footnotes: allFootnotes
  };
};
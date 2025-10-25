// lib/renderText.js
'use client'

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import React from 'react';

// === 1. 각주 처리 헬퍼 ===
export const _processFootnotes = (text) => {
  if (!text) return { processedText: '', localFootnotes: [] };
  let localFootnotes = [];
  let currentCounter = 1;
  
  const processedText = text.replace(/\[\*\s(.*?)]/g, (match, explanation) => {
    const index = currentCounter++;
    localFootnotes.push({ index: index, explanation: explanation });
    return `<sup class"text-blue-600 dark:text-blue-400 font-bold cursor-pointer hover:text-blue-500" title="${explanation}">${index})</sup>`;
  });
  
  return { processedText, localFootnotes };
};

// === 2. 각주 리스트 컴포넌트 ===
export const FootnoteList = ({ localFootnotes }) => {
  if (!localFootnotes || localFootnotes.length === 0) return null;
  return (
    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600 text-xs space-y-1 text-gray-600 dark:text-gray-400">
      {localFootnotes.map((note) => (
        <div key={note.index}>
          <strong className="font-bold mr-1">{note.index})</strong>
          {note.explanation}
        </div>
      ))}
    </div>
  );
};

// === 3. 괄호 래퍼 컴포넌트 ===
const BracketWrapper = ({ content, color }) => {
  const colorMap = {
    'A': 'text-pink-500', // globals.css 대신 Tailwind 클래스 사용
    'B': 'text-green-500',
    'C': 'text-purple-500',
  };
  const labelText = `[${color}]`;
  const colorClass = colorMap[color] || 'text-gray-500';

  return (
    <span className={`relative inline-block align-top mr-6 ${colorClass}`}> 
      <span className="inline-block align-top pr-2 text-current">
        {content}
      </span>
      {/* 괄호 UI (Tailwind) */}
      <span className="absolute top-0 right-0 w-0.5 rounded-sm h-full bg-current" />
      <span className="absolute top-0 right-0 h-0.5 w-3 bg-current" />
      <span className="absolute bottom-0 right-0 h-0.5 w-3 bg-current" />
      <span className="absolute top-1/2 -right-6 font-bold text-xs -translate-y-1/2 text-current">
        {labelText}
      </span>
    </span>
  );
};

// === 4. 최종 텍스트 렌더러 ===
export const renderText = (text) => {
  if (!text) return null;

  // 1. 커스텀 기호 토큰 처리
  let html = text
    .replace(/\[U\]([\s\S]*?)\[\/U\]/g, '<span class="underline">$1</span>')
    .replace(/\[S\]([\s\S]*?)\[\/S\]/g, '<span class="line-through">$1</span>')
    .replace(/\[ALIGN_CENTER\]([\s\S]*?)\[\/ALIGN_CENTER\]/g, '<div class="text-center">$1</div>')
    .replace(/\[ALIGN_RIGHT\]([\s\S]*?)\[\/ALIGN_RIGHT\]/g, '<div class="text-right">$1</div>')
    .replace(/\[BOX_SPLIT\]([\s\S]*?)\[\/BOX_SPLIT\]/g, '<div class="border border-gray-300 dark:border-gray-600 p-3 my-2 rounded bg-gray-50 dark:bg-gray-800">$1</div>')
    .replace(/\[PASSAGE_SPLIT\]([\s\S]*?)\[\/PASSAGE_SPLIT\]/g, '<div class="border-l-4 border-blue-500 pl-4 my-3 bg-blue-50 dark:bg-blue-900/20 py-2">$1</div>')
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

  // 2. LaTeX, Bracket 토큰 분리
  const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\[A_BRACKET\][\s\S]*?\[\/A_BRACKET\]|\[B_BRACKET\][\s\S]*?\[\/B_BRACKET\]|\[C_BRACKET\][\s\S]*?\[\/C_BRACKET\])/g;
  const parts = html.split(regex).filter(p => p);

  // 3. 분리된 토큰을 React 컴포넌트로 렌더링
  return parts.map((part, index) => {
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
      // 4. 각주 처리 전의 텍스트에서 줄바꿈을 <br>로 변환
      return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br />') }} />;
    }
  });
};
// app/components/Footer.js
'use client'

import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full mt-12 py-8 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Ad Placeholder Section */}
        <div className="mb-6 h-24 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded text-gray-500 text-sm">
          {/* This div is a placeholder for Google Adsense or other ads */}
          [ Future Ad Space ]
        </div>

        {/* Copyright and Developer Info Section */}
        <div className="text-center md:text-left text-xs text-gray-500 dark:text-gray-400 space-y-2">
          <p>
            검정고시 문항의 저작권은 <a href="https://www.kice.re.kr" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">한국교육과정평가원(KICE)</a>에 있습니다. 본 서비스는 교육적 목적으로 해당 문항을 사용합니다.
          </p>
          <p>
            Website Copyright &copy; {new Date().getFullYear()} 쏘가리스튜디오. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
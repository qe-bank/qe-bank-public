'use client'

import { Book, Atom, Brain, Milestone, History } from 'lucide-react'

const subjectDetails = {
  '국어': { icon: Book, color: 'bg-blue-500' },
  '수학': { icon: Brain, color: 'bg-green-500' },
  '영어': { icon: Milestone, color: 'bg-yellow-500' },
  '사회': { icon: History, color: 'bg-orange-500' },
  '과학': { icon: Atom, color: 'bg-purple-500' },
};

export default function SubjectGrid({ onSubjectSelect }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        과목 선택
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(subjectDetails).map(([subject, { icon: Icon, color }]) => (
          <button
            key={subject}
            onClick={() => onSubjectSelect(subject)}
            className={`relative p-6 text-lg font-bold text-white rounded-lg shadow-lg ${color} transition-transform hover:scale-105 overflow-hidden group`}
          >
            <Icon className="absolute -bottom-2 -right-2 opacity-20 group-hover:opacity-30 transition-opacity" size={80} />
            <div className="relative z-10">
              <div className="text-2xl">{subject}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // 초기 테마 설정
    const savedTheme = localStorage.getItem('qe-bank-theme') || 'light'
    const darkMode = savedTheme === 'dark'
    
    setIsDark(darkMode)
    setMounted(true)
    
    // DOM에 테마 클래스 적용 - 강력한 방법
    const html = document.documentElement
    const body = document.body
    
    // 모든 테마 관련 클래스와 속성 제거
    html.classList.remove('dark', 'light')
    body.classList.remove('dark', 'light')
    html.removeAttribute('data-theme')
    html.removeAttribute('style')
    
    // 저장된 테마 적용
    if (darkMode) {
      html.classList.add('dark')
      body.classList.add('dark')
      html.setAttribute('data-theme', 'dark')
      html.style.colorScheme = 'dark'
    } else {
      html.classList.add('light')
      body.classList.add('light')
      html.setAttribute('data-theme', 'light')
      html.style.colorScheme = 'light'
    }
    
    console.log('초기 테마 설정:', savedTheme, 'isDark:', darkMode)
  }, [])

  const handleToggle = () => {
    const newIsDark = !isDark
    const newTheme = newIsDark ? 'dark' : 'light'
    
    console.log('=== 테마 전환 ===')
    console.log('이전:', isDark ? 'dark' : 'light')
    console.log('이후:', newTheme)
    
    setIsDark(newIsDark)
    localStorage.setItem('qe-bank-theme', newTheme)
    
    // DOM 직접 조작 - 더 강력한 방법
    const html = document.documentElement
    const body = document.body
    
    // 모든 테마 관련 클래스와 속성 제거
    html.classList.remove('dark', 'light')
    body.classList.remove('dark', 'light')
    html.removeAttribute('data-theme')
    html.removeAttribute('style')
    
    // 새 테마 적용
    if (newIsDark) {
      html.classList.add('dark')
      body.classList.add('dark')
      html.setAttribute('data-theme', 'dark')
      html.style.colorScheme = 'dark'
    } else {
      html.classList.add('light')
      body.classList.add('light')
      html.setAttribute('data-theme', 'light')
      html.style.colorScheme = 'light'
    }
    
    // 강제 리렌더링
    const event = new Event('themechange')
    window.dispatchEvent(event)
    
    console.log('HTML 클래스:', html.className)
    console.log('Body 클래스:', body.className)
    console.log('HTML data-theme:', html.getAttribute('data-theme'))
    console.log('HTML colorScheme:', html.style.colorScheme)
    console.log('=== 전환 완료 ===')
  }

  if (!mounted) {
    return (
      <div className="p-2 rounded-full bg-gray-200 w-10 h-10 flex items-center justify-center">
        <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <button
      aria-label="Toggle Dark Mode"
      type="button"
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      onClick={handleToggle}
    >
      {isDark ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-blue-600" />}
    </button>
  )
}

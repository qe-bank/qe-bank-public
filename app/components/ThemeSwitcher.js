'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  const applyTheme = (theme) => {
    const html = document.documentElement
    const body = document.body
    const nextTheme = theme === 'dark' ? 'dark' : 'light'

    html.classList.remove('dark', 'light')
    html.classList.add(nextTheme)
    html.setAttribute('data-theme', nextTheme)
    html.style.colorScheme = nextTheme

    if (body) {
      body.classList.remove('dark', 'light')
      body.classList.add(nextTheme)
      body.setAttribute('data-theme', nextTheme)
      body.style.colorScheme = nextTheme
    }
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('qe-bank-theme')
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = savedTheme === 'dark' || savedTheme === 'light'
      ? savedTheme
      : (prefersDark ? 'dark' : 'light')

    setIsDark(initialTheme === 'dark')
    applyTheme(initialTheme)
    setMounted(true)
  }, [])

  const handleToggle = () => {
    const newIsDark = !isDark
    const newTheme = newIsDark ? 'dark' : 'light'

    setIsDark(newIsDark)
    localStorage.setItem('qe-bank-theme', newTheme)

    applyTheme(newTheme)

    const event = new Event('themechange')
    window.dispatchEvent(event)
  }

  if (!mounted) {
    return (
      <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-10 h-10 flex items-center justify-center">
        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
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

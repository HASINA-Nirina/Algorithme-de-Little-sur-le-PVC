import { useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const val = typeof value === 'function' ? value(storedValue) : value
      setStoredValue(val)
      window.localStorage.setItem(key, JSON.stringify(val))
    } catch (e) {
      console.error('localStorage error:', e)
    }
  }

  return [storedValue, setValue]
}
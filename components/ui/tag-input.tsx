"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { X } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  setTags: React.Dispatch<React.SetStateAction<string[]>>
  suggestions: string[]
}

export function TagInput({ tags, setTags, suggestions }: TagInputProps) {
  const [input, setInput] = useState('')
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)
    updateFilteredSuggestions(value)
  }

  const updateFilteredSuggestions = (value: string) => {
    const filtered = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredSuggestions(filtered)
    setShowSuggestions(filtered.length > 0)
    setActiveSuggestionIndex(0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (showSuggestions && filteredSuggestions.length > 0) {
        addTag(filteredSuggestions[activeSuggestionIndex])
      } else if (input) {
        addTag(input)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!showSuggestions) {
        setShowSuggestions(true)
        updateFilteredSuggestions(input)
      } else {
        setActiveSuggestionIndex(prevIndex => 
          (prevIndex + 1) % filteredSuggestions.length
        )
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (showSuggestions) {
        setActiveSuggestionIndex(prevIndex => 
          (prevIndex - 1 + filteredSuggestions.length) % filteredSuggestions.length
        )
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setInput('')
      setFilteredSuggestions([])
      setShowSuggestions(false)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="relative w-full">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md">
        {tags.map(tag => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <X
              className="w-3 h-3 cursor-pointer"
              onClick={() => removeTag(tag)}
            />
          </Badge>
        ))}
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-grow border-none shadow-none focus-visible:ring-0"
          placeholder="Tags"
          aria-label="Tag input"
          aria-autocomplete="list"
          aria-controls="tag-suggestions"
          aria-expanded={showSuggestions}
        />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul
          id="tag-suggestions"
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              className={`px-4 py-2 cursor-pointer ${
                index === activeSuggestionIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
              onClick={() => addTag(suggestion)}
              role="option"
              aria-selected={index === activeSuggestionIndex}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}


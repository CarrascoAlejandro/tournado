import React, { useRef, useState, useEffect } from "react";

interface SuggestionDropdownProps {
  input: string;
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void; // Asegúrate de que sea KeyboardEvent<HTMLInputElement>
}

export function SuggestionDropdown({
  input,
  suggestions,
  onSelect,
  onKeyDown,
}: SuggestionDropdownProps) {
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const filtered = suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setActiveSuggestionIndex(0);
  }, [input, suggestions]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleDropdownKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    // Remove propagation of the event to the parent component
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        onSelect(filteredSuggestions[activeSuggestionIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prevIndex) =>
        (prevIndex + 1) % filteredSuggestions.length
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prevIndex) =>
        (prevIndex - 1 + filteredSuggestions.length) % filteredSuggestions.length
      );
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return showSuggestions && filteredSuggestions.length > 0 ? (
    <ul
      ref={suggestionsRef}
      className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
      role="listbox"
      onKeyDown={handleDropdownKeyDown} // Adjuntar el manejador de teclas aquí
    >
      {filteredSuggestions.map((suggestion, index) => (
        <li
          key={suggestion}
          className={`px-4 py-2 cursor-pointer ${
            index === activeSuggestionIndex ? "bg-gray-100" : "hover:bg-gray-50"
          }`}
          onClick={() => onSelect(suggestion)}
          role="option"
          aria-selected={index === activeSuggestionIndex}
        >
          {suggestion}
        </li>
      ))}
    </ul>
  ) : null;
}

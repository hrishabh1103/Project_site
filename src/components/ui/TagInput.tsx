import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export const TagInput: React.FC<TagInputProps> = ({
  label,
  tags,
  onChange,
  placeholder = 'Add and press Enter...',
  suggestions = [],
}) => {
  const [inputVal, setInputVal] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputVal('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputVal);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-foreground">{label}</label>
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-secondary/60 border border-border focus-within:ring-2 focus-within:ring-primary/40 focus-within:bg-background transition-all">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-card border border-border text-foreground shadow-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputVal.trim()) addTag(inputVal);
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none py-1 px-1"
        />
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 pt-1 text-[11px] text-muted-foreground">
          <span>Quick add:</span>
          {suggestions
            .filter((s) => !tags.includes(s))
            .slice(0, 5)
            .map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => addTag(s)}
                className="px-1.5 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-foreground font-mono transition-colors"
              >
                +{s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

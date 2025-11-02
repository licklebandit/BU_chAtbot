import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

const StableKnowledgeForm = React.memo(({ onSubmit, initialData, isEditing, onCancel }) => {
  const [formState, setFormState] = useState(() => ({
    keyword: initialData?.keyword || '',
    answer: initialData?.answer || ''
  }));

  // If initialData changes (e.g., switching to edit mode), update the internal form state
  useEffect(() => {
    if (initialData) {
      setFormState({ keyword: initialData.keyword || '', answer: initialData.answer || '' });
    } else {
      // when switching out of edit mode clear the form
      setFormState({ keyword: '', answer: '' });
    }
  }, [initialData]);
  const [error, setError] = useState('');

  const keywordRef = useRef(null);
  const answerRef = useRef(null);
  const focusStateRef = useRef({ element: null, start: 0, end: 0 });

  // Save focus/cursor position
  const saveFocusState = useCallback(() => {
    const active = document.activeElement;
    if (active === keywordRef.current || active === answerRef.current) {
      focusStateRef.current = {
        element: active,
        start: active.selectionStart,
        end: active.selectionEnd
      };
    }
  }, []);

  // Restore focus/cursor position
  const restoreFocusState = useCallback(() => {
    const { element, start, end } = focusStateRef.current;
    if (element && (element === keywordRef.current || element === answerRef.current)) {
      requestAnimationFrame(() => {
        try {
          element.focus();
          element.setSelectionRange(start, end);
        } catch (err) {
          console.warn('Cursor restore failed:', err);
        }
      });
    }
  }, []);

  // Handle input change with focus preservation
  const handleChange = useCallback((e) => {
    saveFocusState();
    const { name, value } = e.target;

    setFormState(prev => ({ ...prev, [name]: value }));
    if (error) setError('');

    requestAnimationFrame(() => restoreFocusState());
  }, [error, restoreFocusState, saveFocusState]);

  // Submit handler
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const trimmed = {
      keyword: formState.keyword.trim(),
      answer: formState.answer.trim()
    };

    if (!trimmed.keyword || !trimmed.answer) {
      setError('Both keyword and answer are required.');
      return;
    }

    onSubmit(trimmed);

    if (!isEditing) {
      setFormState({ keyword: '', answer: '' });
      requestAnimationFrame(() => keywordRef.current?.focus());
    }
  }, [formState, isEditing, onSubmit]);

  // Effect: restore focus after re-renders
  useEffect(() => {
    restoreFocusState();
  });

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold text-gray-800 mb-4">
        {isEditing ? 'Edit Knowledge Entry' : 'Add Knowledge Entry'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
            Keyword / Question
          </label>
          <input
            id="keyword"
            name="keyword"
            ref={keywordRef}
            type="text"
            value={formState.keyword}
            onChange={handleChange}
            placeholder="Enter keyword or question..."
            autoComplete="off"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
            Answer / Content
          </label>
          <textarea
            id="answer"
            name="answer"
            ref={answerRef}
            value={formState.answer}
            onChange={handleChange}
            placeholder="Enter answer or content..."
            rows={4}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[100px]"
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!formState.keyword.trim() || !formState.answer.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? 'Update' : 'Add'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormState({ keyword: '', answer: '' });
              // If caller provided an onCancel (e.g., to exit edit mode), call it
              if (onCancel) onCancel();
              keywordRef.current?.focus();
            }}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
});

StableKnowledgeForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    keyword: PropTypes.string,
    answer: PropTypes.string
  }),
  isEditing: PropTypes.bool
};

StableKnowledgeForm.displayName = 'StableKnowledgeForm';

export default StableKnowledgeForm;

import React, { useState, useRef, useCallback, memo } from 'react';

const StableFaqForm = memo(({ onSubmit, onClear }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const questionRef = useRef(null);
  const answerRef = useRef(null);

  const handleQuestionChange = useCallback((e) => {
    const { value, selectionStart } = e.target;
    setQuestion(value);
    // Preserve cursor position after state update
    requestAnimationFrame(() => {
      if (questionRef.current) {
        questionRef.current.selectionStart = selectionStart;
        questionRef.current.selectionEnd = selectionStart;
      }
    });
  }, []);

  const handleAnswerChange = useCallback((e) => {
    const { value, selectionStart } = e.target;
    setAnswer(value);
    // Preserve cursor position after state update
    requestAnimationFrame(() => {
      if (answerRef.current) {
        answerRef.current.selectionStart = selectionStart;
        answerRef.current.selectionEnd = selectionStart;
      }
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!question.trim() || !answer.trim()) return;
    
    await onSubmit({
      question: question.trim(),
      answer: answer.trim()
    });
    
    setQuestion('');
    setAnswer('');
    // Focus back on question field after submission
    questionRef.current?.focus();
  }, [question, answer, onSubmit]);

  const handleClear = useCallback(() => {
    setQuestion('');
    setAnswer('');
    onClear?.();
    // Focus back on question field after clearing
    questionRef.current?.focus();
  }, [onClear]);

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold text-gray-800">Add FAQ</h3>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <input 
              ref={questionRef}
              type="text"
              value={question} 
              onChange={handleQuestionChange}
              placeholder="Enter your question" 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
            <textarea 
              ref={answerRef}
              value={answer} 
              onChange={handleAnswerChange}
              placeholder="Enter the answer" 
              rows={4}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div className="col-span-2 flex gap-2">
            <button 
              onClick={handleSubmit}
              disabled={!question.trim() || !answer.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add FAQ
            </button>
            <button 
              onClick={handleClear}
              className="px-4 py-2 rounded border hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

StableFaqForm.displayName = 'StableFaqForm';

export default StableFaqForm;
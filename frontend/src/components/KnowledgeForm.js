import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const KnowledgeForm = ({ onSubmit, initialData, isEditing }) => {
  const [formData, setFormData] = useState({
    keyword: initialData?.keyword || '',
    answer: initialData?.answer || ''
  });

  const [error, setError] = useState('');

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  }, [error]);

  // Prevent default form submission behavior
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(e);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.keyword.trim() || !formData.answer.trim()) {
      setError('Both keyword and answer are required');
      return;
    }

    // Call parent's onSubmit with form data
    onSubmit(formData);

    // Clear form if not editing
    if (!isEditing) {
      setFormData({
        keyword: '',
        answer: ''
      });
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold text-gray-800 mb-4">
        {isEditing ? 'Edit Knowledge Entry' : 'Add Knowledge Entry'}
      </h3>
      
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
            Keyword/Question
          </label>
          <input
            type="text"
            id="keyword"
            name="keyword"
            value={formData.keyword}
            onChange={handleChange}
            placeholder="Enter a keyword or question..."
            autoComplete="off"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
            Answer/Content
          </label>
          <textarea
            id="answer"
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            placeholder="Enter the answer or content..."
            rows={4}
            autoComplete="off"
            wrap="soft"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[100px]"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isEditing ? 'Update' : 'Add'}
          </button>
          <button
            type="button"
            onClick={() => setFormData({ keyword: '', answer: '' })}
            className="px-4 py-2 rounded border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

KnowledgeForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    keyword: PropTypes.string,
    answer: PropTypes.string
  }),
  isEditing: PropTypes.bool
};

export default KnowledgeForm;

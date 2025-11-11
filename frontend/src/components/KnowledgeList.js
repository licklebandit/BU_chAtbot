// src/components/KnowledgeList.js

import React from 'react';
import PropTypes from 'prop-types';
import { Edit, Trash2, Search, X, AlertTriangle, Loader2 } from 'lucide-react'; 

const KnowledgeList = ({ 
  items, 
  onEdit, 
  onDelete, 
  searchQuery, 
  onSearchChange,
  isLoading = false 
}) => {
  // Filter items based on search query
  const filteredItems = items.filter(item => {
    if (!searchQuery.trim()) return true;
    const search = searchQuery.toLowerCase();
    // item.keyword is mapped from article.title
    // item.answer is mapped from article.content
    return (
      (item.keyword || '').toLowerCase().includes(search) ||
      (item.answer || '').toLowerCase().includes(search)
    );
  });

  // Conditional display for loading and empty states
  if (isLoading && filteredItems.length === 0) {
    return (
        <div className="text-center p-10 flex flex-col items-center justify-center bg-white shadow-lg rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <p className="text-xl text-blue-600 font-medium">Loading knowledge articles...</p>
        </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center p-10 bg-white shadow-md rounded-xl border border-dashed border-gray-300">
        <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
        <p className="text-gray-700 font-medium text-lg">
            {searchQuery 
            ? 'No articles match your search criteria.'
            : 'The Knowledge Base is empty. Click "Add Article" above.'}
        </p>
      </div>
    );
  }
    

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-gray-800">Articles List ({filteredItems.length})</h3>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title or content..."
              className="pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm w-64"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
                <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filteredItems.map((item) => (
          <div
            key={item._id || item.id}
            className="py-4 hover:bg-blue-50 transition-colors flex justify-between items-start"
          >
            <div className="flex-grow pr-4">
              <p className="text-xs font-semibold uppercase text-blue-600 mb-1">Article Title</p>
              <h4 className="font-bold text-gray-800 text-base">{item.keyword}</h4>
              <p className="mt-2 text-xs font-semibold uppercase text-gray-500 mb-1">Content Preview</p>
              <p className="mt-1 text-sm text-gray-700 leading-snug line-clamp-3">
                {item.answer}
              </p>
            </div>
              
            <div className="flex gap-2 flex-shrink-0 mt-2">
              <button
                onClick={() => onEdit(item)}
                className="px-3 py-1 text-sm rounded border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-1 font-medium"
              >
                <Edit className="w-4 h-4"/> Edit
              </button>
              <button
                onClick={() => onDelete(item._id || item.id)}
                className="px-3 py-1 text-sm rounded border border-red-200 text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center gap-1 font-medium"
              >
                <Trash2 className="w-4 h-4"/> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

KnowledgeList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      id: PropTypes.string,
      keyword: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired,
      lastUpdated: PropTypes.string
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default React.memo(KnowledgeList);
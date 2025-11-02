import React from 'react';
import PropTypes from 'prop-types';

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
    return (
      (item.keyword || '').toLowerCase().includes(search) ||
      (item.answer || '').toLowerCase().includes(search)
    );
  });

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Knowledge Base</h3>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search knowledge base..."
              className="pl-3 pr-10 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading knowledge base...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchQuery 
            ? 'No matching entries found'
            : 'No knowledge base entries yet'}
        </div>
      ) : (
        <div className="divide-y">
          {filteredItems.map((item) => (
            <div
              key={item._id || item.id}
              className="py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow pr-4">
                  <h4 className="font-medium text-gray-800">{item.keyword}</h4>
                  <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                    {item.answer}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => onEdit(item)}
                    className="px-3 py-1 text-sm rounded border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item._id || item.id)}
                    className="px-3 py-1 text-sm rounded text-red-600 border border-red-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {item.lastUpdated && (
                <div className="mt-2 text-xs text-gray-400">
                  Last updated: {new Date(item.lastUpdated).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
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

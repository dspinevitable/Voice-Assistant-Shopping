import React, { useState, useEffect } from 'react';
import './Suggestions.css';

const Suggestions = ({ shoppingList }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    generateSuggestions();
  }, [shoppingList]);

  const generateSuggestions = () => {
    // Mock suggestions based on common patterns and seasons
    const commonSuggestions = [
      { name: 'bread', category: 'bakery', reason: 'Frequently purchased' },
      { name: 'eggs', category: 'dairy', reason: 'Essential item' },
      { name: 'bananas', category: 'produce', reason: 'Popular fruit' },
      { name: 'milk', category: 'dairy', reason: 'Daily essential' },
    ];

    const seasonalSuggestions = [
      { name: 'pumpkin', category: 'produce', reason: 'Seasonal favorite' },
      { name: 'apples', category: 'produce', reason: 'In season' },
      { name: 'hot chocolate', category: 'beverages', reason: 'Winter special' },
    ];

    // Filter out items already in the list
    const currentItems = shoppingList.map(item => item.name.toLowerCase());
    const availableSuggestions = [
      ...commonSuggestions,
      ...seasonalSuggestions
    ].filter(suggestion => !currentItems.includes(suggestion.name.toLowerCase()));

    // Get random unique suggestions
    const shuffled = [...availableSuggestions].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 4));
  };

  const addSuggestion = async (suggestion) => {
    try {
      // Create a mock audio blob to trigger voice command processing
      const response = await fetch('/api/items/voice-command', {
        method: 'POST',
        body: createMockFormData(`add ${suggestion.name}`),
      });
      
      const data = await response.json();
      // The parent component will update the list
    } catch (error) {
      console.error('Error adding suggestion:', error);
    }
  };

  const createMockFormData = (command) => {
    // This is a simplified version - in a real app, you'd use the same voice processing
    const formData = new FormData();
    // For text commands, you might want to create a separate endpoint
    formData.append('text', command);
    return formData;
  };

  if (suggestions.length === 0) {
    return (
      <div className="suggestions">
        <h3>💡 Smart Suggestions</h3>
        <div className="no-suggestions">
          <p>Great job! You have all the essential items.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="suggestions">
      <h3>💡 Smart Suggestions</h3>
      <p className="suggestions-subtitle">You might need:</p>
      
      <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="suggestion-item">
            <div className="suggestion-info">
              <span className="suggestion-name">{suggestion.name}</span>
              <span className="suggestion-reason">{suggestion.reason}</span>
            </div>
            <button 
              className="add-suggestion-btn"
              onClick={() => addSuggestion(suggestion)}
            >
              +
            </button>
          </div>
        ))}
      </div>

      <div className="substitutes-section">
        <h4>🔄 Common Substitutes</h4>
        <div className="substitutes-list">
          <div className="substitute">
            <span>Regular milk →</span>
            <span>Almond milk</span>
          </div>
          <div className="substitute">
            <span>White bread →</span>
            <span>Whole wheat</span>
          </div>
          <div className="substitute">
            <span>Butter →</span>
            <span>Olive oil</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suggestions;
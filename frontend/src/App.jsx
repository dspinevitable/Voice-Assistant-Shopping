import React, { useState, useEffect } from 'react'
import VoiceCommand from './components/VoiceCommand'
import './App.css'

function App() {
  const [shoppingList, setShoppingList] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [textCommand, setTextCommand] = useState('')

  useEffect(() => {
    fetchShoppingList()
    fetchSuggestions()
  }, [])

  // UPDATED: Better error handling
  const fetchShoppingList = async () => {
    try {
      const response = await fetch('/api/items');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch shopping list: ${response.status}`);
      }
      
      const data = await response.json();
      setShoppingList(data);
    } catch (error) {
      console.error('Error fetching shopping list:', error);
      setFeedback('Cannot connect to backend server. Please make sure the backend is running.');
    }
  }

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/suggestions')
      const data = await response.json()
      setSuggestions(data)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }

  // UPDATED: Fixed state management
  const handleVoiceCommand = async (command) => {
    if (!command.trim()) return;
    
    setIsLoading(true);
    setFeedback('Processing your voice command...');
    
    try {
      const response = await fetch('/api/items/text-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: command }),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // FIX: Use the full list from server instead of trying to merge locally
      setShoppingList(data.shoppingList || []);
      
      setFeedback(data.response || `Processed: "${command}"`);
      setTextCommand('');
      fetchSuggestions();
      
    } catch (error) {
      console.error('Error sending command:', error);
      setFeedback('Error processing command. Please try again.');
      fetchShoppingList(); // Refresh to get correct list
    } finally {
      setIsLoading(false);
    }
  }

  const handleTextCommand = async (command = textCommand) => {
    await handleVoiceCommand(command)
  }

  const handleSuggestionClick = (suggestion) => {
    handleTextCommand(`add ${suggestion.name}`)
  }

  const clearList = async () => {
    try {
      await fetch('/api/items', { method: 'DELETE' })
      setShoppingList([])
      setFeedback('Shopping list cleared!')
      fetchSuggestions()
    } catch (error) {
      console.error('Error clearing list:', error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTextCommand()
    }
  }

  const clearFeedback = () => {
    setFeedback('')
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🎤 Voice Shopping Assistant</h1>
        <p>Manage your shopping list with voice commands</p>
      </div>
      
      <div className="main-content">
        <VoiceCommand 
          onVoiceCommand={handleVoiceCommand}
          isLoading={isLoading}
          feedback={feedback}
          clearFeedback={clearFeedback}
        />

        <div className="command-section">
          <div className="input-group">
            <input
              type="text"
              value={textCommand}
              onChange={(e) => setTextCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Or type commands like: 'add milk' or 'remove bread'"
              disabled={isLoading}
              className="command-input"
            />
            <button 
              className="send-button"
              onClick={() => handleTextCommand()}
              disabled={isLoading || !textCommand.trim()}
            >
              {isLoading ? '🔄' : '📤'}
            </button>
          </div>
          
          <div className="quick-commands">
            <button onClick={() => handleTextCommand('add milk')}>Add Milk</button>
            <button onClick={() => handleTextCommand('add 2 apples')}>Add Apples</button>
            <button onClick={() => handleTextCommand('add bread')}>Add Bread</button>
          </div>
        </div>

        {feedback && (
          <div className="feedback">
            {feedback}
          </div>
        )}

        <div className="content-grid">
          <div className="list-section">
            <div className="section-header">
              <h2>🛒 Shopping List ({shoppingList.length} items)</h2>
              {shoppingList.length > 0 && (
                <button className="clear-button" onClick={clearList}>
                  Clear All
                </button>
              )}
            </div>

            {shoppingList.length === 0 ? (
              <div className="empty-list">
                <p>Your shopping list is empty</p>
                <p>Use the input above to add items!</p>
              </div>
            ) : (
              <div className="items-container">
                {shoppingList.map(item => (
                  <div key={item.id} className="list-item">
                    <span className="item-name">
                      {item.name}
                      {item.quantity > 1 && (
                        <span className="quantity"> ×{item.quantity}</span>
                      )}
                    </span>
                    <span className="item-category">{item.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="suggestions-section">
            <div className="section-header">
              <h3>💡 Smart Suggestions</h3>
            </div>
            
            {suggestions.length === 0 ? (
              <div className="empty-suggestions">
                <p>Great job! You have all the essential items.</p>
              </div>
            ) : (
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="suggestion-info">
                      <span className="suggestion-name">{suggestion.name}</span>
                      <span className="suggestion-reason">{suggestion.reason}</span>
                    </div>
                    <button className="add-suggestion-btn">+</button>
                  </div>
                ))}
              </div>
            )}

            <div className="features">
              <h4>✨ Features</h4>
              <div className="feature-list">
                <div className="feature">🎤 Voice Command Recognition</div>
                <div className="feature">💡 Smart Suggestions</div>
                <div className="feature">🏷️ Automatic Categorization</div>
                <div className="feature">📱 Mobile-Friendly</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
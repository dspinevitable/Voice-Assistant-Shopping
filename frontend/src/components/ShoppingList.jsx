import React from 'react';
import './ShoppingList.css';

const ShoppingList = ({ items, onListUpdate }) => {
  const categories = {
    dairy: '🥛 Dairy',
    produce: '🥬 Produce', 
    meat: '🍗 Meat',
    bakery: '🍞 Bakery',
    beverages: '🥤 Beverages',
    snacks: '🍪 Snacks',
    household: '🏠 Household',
    other: '📦 Other'
  };

  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const clearList = async () => {
    if (window.confirm('Are you sure you want to clear your entire shopping list?')) {
      try {
        await fetch('/api/items', { method: 'DELETE' });
        onListUpdate();
      } catch (error) {
        console.error('Error clearing list:', error);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="shopping-list">
        <div className="list-header">
          <h2>🛒 Shopping List</h2>
        </div>
        <div className="empty-list">
          <p>Your shopping list is empty</p>
          <p className="empty-hint">Use voice commands to add items!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shopping-list">
      <div className="list-header">
        <h2>🛒 Shopping List ({items.length} items)</h2>
        <button className="clear-button" onClick={clearList}>
          Clear All
        </button>
      </div>

      <div className="categories">
        {Object.entries(groupedItems).map(([categoryKey, categoryItems]) => (
          <div key={categoryKey} className="category">
            <h3 className="category-title">
              {categories[categoryKey] || categories.other}
            </h3>
            <div className="items-list">
              {categoryItems.map(item => (
                <div key={item.id} className="list-item">
                  <span className="item-name">
                    {item.name}
                    {item.quantity > 1 && (
                      <span className="item-quantity">×{item.quantity}</span>
                    )}
                  </span>
                  <span className="item-category-badge">
                    {categoryKey}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingList;
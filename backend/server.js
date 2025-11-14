import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock shopping list data
let shoppingList = [
  { id: 1, name: 'milk', quantity: 1, category: 'dairy' },
  { id: 2, name: 'bread', quantity: 1, category: 'bakery' },
  { id: 3, name: 'apples', quantity: 3, category: 'produce' }
];

// Mock shopping history for suggestions
let shoppingHistory = ['milk', 'bread', 'eggs', 'apples', 'bananas', 'coffee'];

// Routes
app.get('/api/items', (req, res) => {
  res.json(shoppingList);
});

// Text command endpoint - FIXED VERSION
app.post('/api/items/text-command', (req, res) => {
  const { command } = req.body;
  
  if (!command) {
    return res.status(400).json({ error: 'No command provided' });
  }

  const commandLower = command.toLowerCase();
  let action = 'unknown';
  let items = [];
  let response = '';

  // Add command
  if (commandLower.includes('add') || commandLower.includes('need') || commandLower.includes('buy') || commandLower.includes('want')) {
    action = 'add';
    
    const words = commandLower.split(' ');
    const itemIndex = words.findIndex(word => 
      ['add', 'need', 'buy', 'want'].includes(word)
    );
    
    if (itemIndex !== -1) {
      const itemWords = words.slice(itemIndex + 1);
      const itemText = itemWords.join(' ').trim();
      
      // Handle multiple items (e.g., "add milk and eggs")
      const itemNames = itemText.split(/\s+and\s+|\s*,\s*|\s+with\s+/);
      
      itemNames.forEach(itemText => {
        if (itemText.trim()) {
          let quantity = 1;
          let itemName = itemText.trim();
          
          // Extract quantity (e.g., "2 apples" -> quantity: 2, name: "apples")
          const quantityMatch = itemText.match(/^(\d+)\s+(.+)$/);
          if (quantityMatch) {
            quantity = parseInt(quantityMatch[1]);
            itemName = quantityMatch[2].trim();
          }
          
          // Clean up the item name
          itemName = itemName.replace(/[^a-zA-Z\s]/g, '').trim();
          
          if (itemName) {
            const category = getCategory(itemName);
            
            items.push({
              name: itemName,
              quantity: quantity,
              category: category
            });
          }
        }
      });
      
      if (items.length > 0) {
        const itemNames = items.map(item => 
          item.quantity > 1 ? `${item.quantity} ${item.name}` : item.name
        );
        response = `Added ${itemNames.join(', ')} to your shopping list`;
      }
    }
  } 
  // Remove command
  else if (commandLower.includes('remove') || commandLower.includes('delete')) {
    action = 'remove';
    
    const words = commandLower.split(' ');
    const itemIndex = words.findIndex(word => 
      ['remove', 'delete'].includes(word)
    );
    
    if (itemIndex !== -1) {
      const itemWords = words.slice(itemIndex + 1);
      const itemText = itemWords.join(' ').trim();
      
      // Handle multiple items to remove
      const itemNames = itemText.split(/\s+and\s+|\s*,\s*/);
      
      itemNames.forEach(itemName => {
        itemName = itemName.replace(/[^a-zA-Z\s]/g, '').trim();
        if (itemName) {
          items.push({ name: itemName });
        }
      });
      
      if (items.length > 0) {
        response = `Removed ${items.map(item => item.name).join(', ')} from your shopping list`;
      }
    }
  }

  // Execute command - FIXED: Properly update the shopping list
  let updatedList = [...shoppingList]; // Create a copy of the current list
  
  if (action === 'add' && items.length > 0) {
    items.forEach(newItem => {
      const existingItemIndex = updatedList.findIndex(
        item => item.name.toLowerCase() === newItem.name.toLowerCase()
      );
      
      if (existingItemIndex > -1) {
        // Item exists - update quantity
        updatedList[existingItemIndex].quantity += newItem.quantity;
      } else {
        // New item - add to list
        updatedList.push({
          id: Date.now() + Math.random(), // Unique ID
          name: newItem.name,
          quantity: newItem.quantity,
          category: newItem.category,
          addedAt: new Date().toISOString()
        });
      }
    });
  } else if (action === 'remove' && items.length > 0) {
    items.forEach(itemToRemove => {
      updatedList = updatedList.filter(
        item => item.name.toLowerCase() !== itemToRemove.name.toLowerCase()
      );
    });
  }
  
  // Update the global shopping list
  shoppingList = updatedList;

  res.json({
    command: command,
    action: action,
    items: items,
    response: response || `Processed: "${command}"`,
    shoppingList: updatedList // Return the FULL updated list
  });
});

// Get suggestions
app.get('/api/suggestions', (req, res) => {
  const currentItems = shoppingList.map(item => item.name.toLowerCase());
  
  const commonItems = [
    { name: 'eggs', category: 'dairy', reason: 'Frequently purchased' },
    { name: 'bananas', category: 'produce', reason: 'Popular fruit' },
    { name: 'coffee', category: 'beverages', reason: 'Morning essential' },
    { name: 'cheese', category: 'dairy', reason: 'Cooking staple' },
    { name: 'yogurt', category: 'dairy', reason: 'Healthy snack' },
    { name: 'orange juice', category: 'beverages', reason: 'Breakfast favorite' }
  ];
  
  const suggestions = commonItems.filter(
    item => !currentItems.includes(item.name.toLowerCase())
  ).slice(0, 4);

  res.json(suggestions);
});

// Clear list
app.delete('/api/items', (req, res) => {
  shoppingList = [];
  res.json({ message: 'Shopping list cleared', shoppingList });
});

// Helper function to categorize items
function getCategory(itemName) {
  const categories = {
    dairy: ['milk', 'cheese', 'yogurt', 'butter', 'eggs', 'cream'],
    produce: ['apple', 'banana', 'orange', 'lettuce', 'tomato', 'carrot', 'onion', 'potato'],
    bakery: ['bread', 'bagel', 'croissant', 'muffin', 'cake'],
    beverages: ['coffee', 'tea', 'juice', 'soda', 'water'],
    meat: ['chicken', 'beef', 'pork', 'fish', 'bacon'],
    snacks: ['chips', 'cookies', 'crackers', 'chocolate'],
    household: ['soap', 'shampoo', 'toothpaste', 'tissue', 'cleaner']
  };
  
  for (const [category, items] of Object.entries(categories)) {
    if (items.some(item => itemName.toLowerCase().includes(item))) {
      return category;
    }
  }
  
  return 'other';
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Try these test commands:`);
  console.log(`   GET  http://localhost:${PORT}/api/items`);
  console.log(`   POST http://localhost:${PORT}/api/items/text-command`);
  console.log(`   GET  http://localhost:${PORT}/api/suggestions`);
});
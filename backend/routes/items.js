// Add text command endpoint
router.post('/text-command', async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'No command provided' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a shopping list assistant. Process text commands and return JSON with:
          - action: "add", "remove", "search", or "unknown"
          - items: array of objects with name, quantity, category
          - response: friendly confirmation message
          
          Categories: dairy, produce, meat, bakery, beverages, snacks, household, other`
        },
        {
          role: "user",
          content: command
        }
      ],
      response_format: { type: "json_object" }
    });

    const commandData = JSON.parse(completion.choices[0].message.content);
    
    // Execute the command (same logic as voice command)
    let updatedList = [...shoppingList];
    
    switch (commandData.action) {
      case 'add':
        commandData.items.forEach(item => {
          const existingItemIndex = updatedList.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase());
          if (existingItemIndex > -1) {
            updatedList[existingItemIndex].quantity += item.quantity || 1;
          } else {
            updatedList.push({
              id: Date.now() + Math.random(),
              name: item.name,
              quantity: item.quantity || 1,
              category: item.category || 'other',
              addedAt: new Date().toISOString()
            });
          }
        });
        shoppingHistory.push(...commandData.items);
        break;
        
      case 'remove':
        commandData.items.forEach(item => {
          updatedList = updatedList.filter(i => i.name.toLowerCase() !== item.name.toLowerCase());
        });
        break;
    }
    
    shoppingList = updatedList;
    
    res.json({
      command: command,
      action: commandData.action,
      items: commandData.items,
      response: commandData.response,
      shoppingList: updatedList
    });
    
  } catch (error) {
    console.error('Error processing text command:', error);
    res.status(500).json({ 
      error: 'Failed to process command',
      details: error.message 
    });
  }
});
module.exports.register = (app, database) => {
  
    // GET all events
   
    app.get('/api/events', async (req, res) => {
        try {
            const events = await database.query('SELECT * FROM events'); // Fetch all events
            console.log('Fetched events:', events); // Log events to debug
            res.status(200).json({ success: true, events });
        } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch events.', error: error.message });
        }
    });
    

    
    // CREATE a new event
  
    app.post('/api/events', async (req, res) => {
        try {
            const { name, description, fee } = req.body;

            // Validate required fields
            if (!name || !description || fee === undefined) {
                return res.status(400).json({ success: false, message: 'Name, description, and fee are required.' });
            }

            // Validate fee
            if (isNaN(fee) || fee < 0) {
                return res.status(400).json({ success: false, message: 'Fee must be a positive number.' });
            }

            // Insert the new event into the database
            await database.query(
                'INSERT INTO events (name, description, fee, created_at) VALUES (?, ?, ?, NOW())',
                [name, description, fee]
            );

            res.status(201).json({ success: true, message: 'Event created successfully!' });
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(500).json({ success: false, message: 'Failed to create event.', error: error.message });
        }
    });
};

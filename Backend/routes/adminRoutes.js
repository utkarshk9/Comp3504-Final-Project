
module.exports.register = (app, database) => {
    // Admin Login
    app.post('/api/admin/login', async (req, res) => {
        try {
            const { email, password } = req.body;

            // Check if user exists and is admin
            const query = 'SELECT * FROM users WHERE email = ? AND role = ?';
            const [rows] = await database.query(query, [email, 'admin']);

            if (rows.length > 0 && rows[0].password === password) {
                res.json({
                    success: true,
                    admin: {
                        email: rows[0].email,
                        name: rows[0].full_name
                    }
                });
            } else {
                res.status(401).json({ message: 'Invalid admin credentials' });
            }
        } catch (error) {
            console.error('Error during admin login:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Get all events
    app.get('/api/admin/events', async (req, res) => {
        try {
            const query = 'SELECT * FROM events ORDER BY event_type';
            const [rows] = await database.query(query);

            res.json({ events: rows });
        } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).json({ message: 'Error fetching events' });
        }
    });

    // Create new event
    app.post('/api/events', async (req, res) => {
        try {
            const { name, description, event_type, fee, date } = req.body;

            if (!name || fee == null|| event_type == null ) {
                return res.status(400).json({ message: 'Name and fee are required.' });
            }

            const query = `
                INSERT INTO events (name, description, event_type, fee, date)
                VALUES (?, ?, ?, ?, ?)
            `;
            const result = await database.query(query, [name, description, event_type, fee, date]);

            res.status(201).json({
                message: 'Event created successfully',
                event: {
                    event_id: result.insertId,
                    name,
                    description,
                    event_type,
                    fee,
                    date
                }
            });
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(500).json({ message: 'Error creating event' });
        }
    });

    app.put('/api/events/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, event_type, fee, Date } = req.body;
            
            console.log('Received data:', {
                id,
                name,
                description,
                event_type,
                fee,
                Date
            });
    
            // First update the event
            const updateResult = await database.query(`
                UPDATE events
                SET name = ?, description = ?, event_type = ?, fee = ?, Date = ?
                WHERE event_id = ?
            `, [name, description, event_type, fee, Date, id]);
            
            console.log('Update result:', updateResult);
    
            // Then fetch the updated event
            const selectResult = await database.query(`
                SELECT * FROM events WHERE event_id = ?
            `, [id]);
            
            console.log('Select result:', selectResult);
    
            const updatedEvent = selectResult[0];
    
            if (!updatedEvent) {
                return res.status(404).json({ message: 'Event not found' });
            }
    
            res.json({ 
                message: 'Event updated successfully',
                event: updatedEvent
            });
        } catch (error) {
            console.error('Detailed error:', error);
            res.status(500).json({ 
                message: 'Error updating event',
                error: error.message 
            });
        }
    });

    // Delete event
    app.delete('/api/events/:id', async (req, res) => {
        try {
            const { id } = req.params;

            const query = 'DELETE FROM events WHERE event_id = ?';
            const result = await database.query(query, [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Event not found' });
            }

            res.json({ message: 'Event deleted successfully' });
        } catch (error) {
            console.error('Error deleting event:', error);
            res.status(500).json({ message: 'Error deleting event' });
        }
    });
};

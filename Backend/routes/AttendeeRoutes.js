module.exports.register = (app, database) => {
    // Register for an event
   
    app.post('/api/attendee_events', async (req, res) => {
        try {
            const { attendee_id, event_id } = req.body;
    
            // Validate required fields
            if (!attendee_id || !event_id) {
                return res.status(400).json({ success: false, message: 'Attendee ID and Event ID are required.' });
            }
    
            // Check if the event exists
            const event = await database.query('SELECT * FROM events WHERE event_id = ?', [event_id]);
            if (!event || event.length === 0) {
                return res.status(404).json({ success: false, message: 'Event not found.' });
            }
    
            // Check if the attendee is already registered for the event
            const registration = await database.query(
                'SELECT * FROM attendee_events WHERE attendee_id = ? AND event_id = ?',
                [attendee_id, event_id]
            );
            if (registration && registration.length > 0) {
                return res
                    .status(400)
                    .json({ success: false, message: 'Attendee is already registered for this event.' });
            }
    
            // Register attendee for the event
            const result = await database.query(
                'INSERT INTO attendee_events (attendee_id, event_id, created_at) VALUES (?, ?, NOW())',
                [attendee_id, event_id]
            );
    
            if (result.affectedRows > 0) {
                res.status(201).json({ success: true, message: 'User registered for the event successfully!' });
            } else {
                res.status(400).json({ success: false, message: 'Failed to register for the event.' });
            }
        } catch (error) {
            console.error('Error registering attendee for event:', error);
            res.status(500).json({ success: false, message: 'Failed to register for the event.', error: error.message });
        }
    });
    

    // GET all events for an attendee
   
    app.get('/api/attendee_events/:attendee_id', async (req, res) => {
        try {
            const { attendee_id } = req.params;
            console.log('Fetching events for attendee:', attendee_id);

            const events = await database.query(`
                SELECT 
                    e.event_id, 
                    e.name, 
                    e.description, 
                    e.date,
                    e.event_type,
                    e.fee as original_fee,
                    u.role as user_role,
                    CASE 
                        WHEN LOWER(e.event_type) = 'core' AND LOWER(u.role) = 'author' THEN (
                            SELECT COALESCE(base_fee) 
                            FROM fees 
                            WHERE LOWER(role) = 'author' 
                            LIMIT 1
                        )
                        WHEN LOWER(e.event_type) = 'core' AND LOWER(u.role) = 'regular attendee' THEN (
                            SELECT COALESCE(base_fee) 
                            FROM fees 
                            WHERE LOWER(role) = 'regular attendee' 
                            LIMIT 1
                        )
                        WHEN LOWER(e.event_type) = 'optional' THEN COALESCE(e.fee)
                        ELSE COALESCE(e.fee, 100)  -- Default fee for any other case
                    END AS event_fee
                FROM events e
                INNER JOIN attendee_events ae ON e.event_id = ae.event_id
                INNER JOIN users u ON ae.attendee_id = u.user_id
                WHERE ae.attendee_id = ?
                ORDER BY e.event_type, e.date
            `, [attendee_id]);

            console.log('Raw events data:', events.map(event => ({
                name: event.name,
                type: event.event_type,
                original_fee: event.original_fee,
                event_fee: event.event_fee
            })));

            // Ensure we're returning an array and properly format the fees
            const eventArray = Array.isArray(events) ? events : [events];
            const formattedEvents = eventArray.map(event => ({
                ...event,
                fee: parseFloat(event.event_fee || 0),
                event_type: event.event_type?.toLowerCase(),
                debug_info: {  // Add debug info
                    original_fee: event.original_fee,
                    calculated_fee: event.event_fee,
                    event_type: event.event_type
                }
            }));

            console.log('Formatted events with fees:', formattedEvents);

            res.status(200).json({ 
                success: true, 
                events: formattedEvents
            });
        } catch (error) {
            console.error('Error fetching events for attendee:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch events for attendee.', 
                error: error.message 
            });
        }
    });
}    
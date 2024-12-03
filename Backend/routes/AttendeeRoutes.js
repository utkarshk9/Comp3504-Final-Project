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
            const [event] = await database.query('SELECT * FROM events WHERE event_id = ?', [event_id]);
            if (event.length === 0) {
                return res.status(404).json({ success: false, message: 'Event not found.' });
            }

            // Check if the attendee is already registered for the event
            const [registration] = await database.query(
                'SELECT * FROM attendee_events WHERE attendee_id = ? AND event_id = ?',
                [attendee_id, event_id]
            );
            if (registration.length > 0) {
                return res
                    .status(400)
                    .json({ success: false, message: 'Attendee is already registered for this event.' });
            }

            // Register attendee for the event
            await database.query(
                'INSERT INTO attendee_events (attendee_id, event_id, created_at) VALUES (?, ?, NOW())',
                [attendee_id, event_id]
            );

            res.status(201).json({ success: true, message: 'User registered for the event successfully!' });
        } catch (error) {
            console.error('Error registering attendee for event:', error);
            res.status(500).json({ success: false, message: 'Failed to register for the event.', error: error.message });
        }
    });

    // GET all events for an attendee
   
    app.get('/api/attendee_events/:attendee_id', async (req, res) => {
        try {
            const { attendee_id } = req.params;

            // Validate attendee ID
            if (!attendee_id) {
                return res.status(400).json({ success: false, message: 'Attendee ID is required.' });
            }

            // Retrieve events for the attendee
            const [events] = await database.query(
                'SELECT e.* FROM events e INNER JOIN attendee_events ae ON e.event_id = ae.event_id WHERE ae.attendee_id = ?',
                [attendee_id]
            );

            res.status(200).json({ success: true, events });
        } catch (error) {
            console.error('Error fetching events for attendee:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch events for attendee.', error: error.message });
        }
    });
};

module.exports.register = (app, database) => {
  
    // GET all events
   
    app.get('/api/events', async (req, res) => {
        try {
            const query = `
             SELECT 
                e.event_id,
                e.name,
                e.description,
                e.Date,

                e.event_type,
                CASE 
                    WHEN e.event_type = 'core' THEN (
                        SELECT MAX(CASE WHEN f.role = 'Author' THEN f.base_fee ELSE 0 END)
                        FROM fees f
                    )
                    ELSE NULL
                END AS author_fee,
                CASE 
                    WHEN e.event_type = 'core' THEN (
                        SELECT MAX(CASE WHEN f.role = 'Regular Attendee' THEN f.base_fee ELSE 0 END)
                        FROM fees f
                    )
                    ELSE NULL
                END AS regular_fee,
                CASE 
                    WHEN e.event_type = 'optional' THEN e.fee
                    ELSE NULL
                END AS optional_fee
            FROM events e
            ORDER BY e.event_type, e.date;
        `;

            
            const rows = await database.query(query);
            res.json({ events: rows });
        } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).json({ message: 'Error fetching events' });
        }
    });
    
    

    
   
};

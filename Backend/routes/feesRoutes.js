module.exports.register = (app, database) => {
    // GET all fees
    
    app.get('/api/fees', async (req, res) => {
        try {
            const fees = await database.query('SELECT * FROM fees'); // Fetch all fees
            res.status(200).json({ success: true, fees });
        } catch (error) {
            console.error('Error fetching fees:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch fees.', error: error.message });
        }
    });

    // UPDATE a fee by ID
 
    app.put('/api/fees/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { base_fee, role } = req.body;

            // Validate required fields
            if (!base_fee || !role) {
                return res.status(400).json({ success: false, message: 'Base fee and role are required.' });
            }

            // Validate role
            const validRoles = ['Author', 'Regular Attendee'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ success: false, message: `Invalid role. Allowed roles: ${validRoles.join(', ')}.` });
            }

            // Update the fee in the database
            const result= await database.query(
                'UPDATE fees SET base_fee = ?, role = ?, updated_at = NOW() WHERE fee_id = ?',
                [base_fee, role, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Fee not found.' });
            }

            res.status(200).json({ success: true, message: 'Fee updated successfully!' });
        } catch (error) {
            console.error('Error updating fee:', error);
            res.status(500).json({ success: false, message: 'Failed to update fee.', error: error.message });
        }
    });
    app.post('/api/calculate-fee', async (req, res) => {
        try {
            const { role, selectedEvents } = req.body;
            console.log('Calculating fees for:', { role, selectedEvents }); // Debug log
    
    
            // MySQL version of the fee query
            const feeQuery = 'SELECT base_fee FROM fees WHERE LOWER(role) = LOWER(?)';
            const [feeResult] = await database.query(feeQuery, [role]);
    
            // Use default fee if not found in database
            const baseFee = feeResult?.length > 0 
                ? parseFloat(feeResult[0].base_fee)
                : defaultFees[role.toLowerCase()] || 50.00;
    
            // MySQL version of the events fee query
            let optionalEventFee = 0;
            if (selectedEvents && selectedEvents.length > 0) {
                const eventQuery = `
                    SELECT IFNULL(SUM(fee), 0) as total_event_fee 
                    FROM events 
                    WHERE event_id IN (?) 
                    AND event_type = ?
                `;
                const [eventResult] = await database.query(eventQuery, [selectedEvents, 'optional']);
                optionalEventFee = parseFloat(eventResult[0]?.total_event_fee || 0);
            }
    
            // Calculate total fee
            const totalFee = baseFee + optionalEventFee;
    
            console.log('Fee calculation result:', { baseFee, optionalEventFee, totalFee }); // Debug log
            
            res.json({ 
                baseFee: baseFee.toFixed(2),
                optionalEventFee: optionalEventFee.toFixed(2),
                totalFee: totalFee.toFixed(2)
            });
        } catch (error) {
            console.error('Error calculating fee:', error);
            res.status(500).json({ 
                message: 'Error calculating fee',
                error: error.message 
            });
        }
    });
    
};
module.exports.register = (app, database) => {
    // GET all fees
    
    app.get('/api/fees', async (req, res) => {
        try {
            const [fees] = await database.query('SELECT * FROM fees'); // Fetch all fees
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
            const validRoles = ['Author', 'Regular'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ success: false, message: `Invalid role. Allowed roles: ${validRoles.join(', ')}.` });
            }

            // Update the fee in the database
            const [result] = await database.query(
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
};

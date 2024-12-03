const bcrypt = require('bcryptjs');

module.exports.register = (app, database) => {

    app.get('/api', (req, res) => {
        res.status(200).json({ message: 'API is running!' });
    });
    // GET all users
    
    app.get('/api/users', async (req, res) => {
        try {
            const users = await database.query(
                'SELECT user_id, name, email, pronouns, dietary_restrictions, role, created_at FROM users'
            ); // Exclude password
            res.status(200).json({ success: true, users });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch users.', error: error.message });
        }
    });

    // GET a single user by ID
   
    app.get('/api/users/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const [user] = await database.query(
                'SELECT user_id, name, email, pronouns, dietary_restrictions, role, created_at FROM users WHERE user_id = ?',
                [id]
            ); // Exclude password
            if (user.length === 0) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }
            res.status(200).json({ success: true, user: user[0] });
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch user.', error: error.message });
        }
    });


    // CREATE a new user
   
    app.post('/api/registeruser', async (req, res) => {
        try {
            const { name, email, password, pronouns, dietary_restrictions, role } = req.body;

            // Validate required fields
            if (!name || !email || !password || !role) {
                return res.status(400).json({ success: false, message: 'Required fields are missing.' });
            }
            const validRoles = ['Author', 'Regular Attendee'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ success: false, message: `Invalid role. Accepted roles are: ${validRoles.join(', ')}` });
            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await database.query(
                'INSERT INTO users (name, email, password, pronouns, dietary_restrictions, role, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [name, email, hashedPassword, pronouns, dietary_restrictions, role]
            );

            res.status(201).json({ success: true, message: 'User created successfully!' });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ success: false, message: 'Failed to create user.', error: error.message });
        }
    });

    // UPDATE a user
  
    app.put('/api/users/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, password, pronouns, dietary_restrictions, role } = req.body;

            // Hash the password if provided
            let hashedPassword = null;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                hashedPassword = await bcrypt.hash(password, salt);
            }

            // Build the update query dynamically
            const updateFields = [
                { field: 'name', value: name },
                { field: 'email', value: email },
                { field: 'password', value: hashedPassword },
                { field: 'pronouns', value: pronouns },
                { field: 'dietary_restrictions', value: dietary_restrictions },
                { field: 'role', value: role },
            ];

            const updates = updateFields
                .filter(field => field.value !== undefined && field.value !== null)
                .map(field => `${field.field} = ?`);
            const values = updateFields
                .filter(field => field.value !== undefined && field.value !== null)
                .map(field => field.value);

            if (updates.length === 0) {
                return res.status(400).json({ success: false, message: 'No fields to update.' });
            }

            const [result] = await database.query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, [
                ...values,
                id
            ]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }

            res.status(200).json({ success: true, message: 'User updated successfully.' });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ success: false, message: 'Failed to update user.', error: error.message });
        }
    });


    // DELETE a user
    
    app.delete('/api/users/:id', async (req, res) => {
        try {
            const { id } = req.params;

            const [result] = await database.query('DELETE FROM users WHERE user_id = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }

            res.status(200).json({ success: true, message: 'User deleted successfully.' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ success: false, message: 'Failed to delete user.', error: error.message });
        }
    });
};

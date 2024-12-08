;
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
            const result = await database.query(
                'SELECT user_id, name, email, pronouns, dietary_restrictions, role, created_at FROM users WHERE user_id = ?',
                [id]
            );
    
            if (!result || result.length === 0) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }
    
            // Since result is an array, access the first element
            const user = result[0];
    
            res.status(200).json({ success: true, user });
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
            const validRoles = ['Author', 'Regular Attendee','Admin'];
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
    
            // Validate the ID
            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, message: 'Invalid user ID.' });
            }
    
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
    
            // Filter fields with non-null values
            const updates = updateFields
                .filter(field => field.value !== undefined && field.value !== null)
                .map(field => `${field.field} = ?`);
            const values = updateFields
                .filter(field => field.value !== undefined && field.value !== null)
                .map(field => field.value);
    
            // Check if there are any fields to update
            if (updates.length === 0) {
                return res.status(400).json({ success: false, message: 'No fields to update.' });
            }
    
            // Construct and execute the query
            const query = `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`;
            const params = [...values, id];
    
            console.log('Query:', query);
            console.log('Params:', params);
    
            const result = await database.query(query, params);
    
            // Check if the update affected any rows
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }
    
            res.status(200).json({ success: true, message: 'User updated successfully.' });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user.',
                error: error.message,
            });
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
    // Check if user exists
// Check if user exists
app.post('/api/checkUser', async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Received email check request for:', email);

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required.' });
        }

        const [rows] = await database.query('SELECT email FROM users WHERE email = ?', [email]);
        console.log('Raw database response:', rows);

        // Check if rows is a non-null object (RowDataPacket)
        if (rows && typeof rows === 'object' && rows.email) {
            console.log('User found in database');
            return res.status(200).json({ exists: true });
        } else {
            console.log('User not found in database');
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking user existence:', error);
        res.status(500).json({ success: false, message: 'Failed to check user existence.', error: error.message });
    }
});



app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        // Query to find the user by email
        const result = await database.query('SELECT * FROM users WHERE email = ?', [email]);

        // Check if the query returned any results
        if (!result || result.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const user = result[0]; // Extract the first user from the result

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid password.' });
        }

        res.status(200).json({ success: true, message: 'Login successful!', userId: user.user_id, role: user.role });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ success: false, message: 'Failed to log in.', error: error.message });
    }
});



};

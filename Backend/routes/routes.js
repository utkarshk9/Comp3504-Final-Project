module.exports.register = (app, database) => {
    // Test Endpoint
    app.get('/', async (req, res) => {
        res.status(200).send("API is running!").end();
    });

    // GET all users
    app.get('/api/users', async (req, res) => {
        try {
            const query = database.query('SELECT * FROM users');
            const users = await query;
            res.status(200).send(JSON.stringify(users)).end();
        } catch (error) {
            res.status(500).send({ error: error.message }).end();
        }
    });

    // GET a single user by ID
    app.get('/api/users/:id', async (req, res) => {
        try {
            const userId = req.params.id;
            const query = database.query('SELECT * FROM users WHERE user_id = ?', [userId]);
            const user = await query;
            res.status(200).send(JSON.stringify(user)).end();
        } catch (error) {
            res.status(500).send({ error: error.message }).end();
        }
    });

    // CREATE a new user
    app.post('/api/users', async (req, res) => {
        try {
            const { name, email, password, pronouns, dietary_restrictions, role } = req.body;
            const query = database.query(
                'INSERT INTO users (name, email, password, pronouns, dietary_restrictions, role, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [name, email, password, pronouns, dietary_restrictions, role]
            );
            await query;
            res.status(201).send({ message: 'User created successfully!' }).end();
        } catch (error) {
            res.status(500).send({ error: error.message }).end();
        }
    });

    // UPDATE a user
    app.put('/api/users/:id', async (req, res) => {
        try {
            const userId = req.params.id;
            const { name, email, password, pronouns, dietary_restrictions, role } = req.body;
            const query = database.query(
                'UPDATE users SET name = ?, email = ?, password = ?, pronouns = ?, dietary_restrictions = ?, role = ? WHERE user_id = ?',
                [name, email, password, pronouns, dietary_restrictions, role, userId]
            );
            await query;
            res.status(200).send({ message: 'User updated successfully!' }).end();
        } catch (error) {
            res.status(500).send({ error: error.message }).end();
        }
    });

    // DELETE a user
    app.delete('/api/users/:id', async (req, res) => {
        try {
            const userId = req.params.id;
            const query = database.query('DELETE FROM users WHERE user_id = ?', [userId]);
            await query;
            res.status(200).send({ message: 'User deleted successfully!' }).end();
        } catch (error) {
            res.status(500).send({ error: error.message }).end();
        }
    });

    // GET all events
    app.get('/api/events', async (req, res) => {
        try {
            const query = database.query('SELECT * FROM events');
            const events = await query;
            res.status(200).send(JSON.stringify(events)).end();
        } catch (error) {
            res.status(500).send({ error: error.message }).end();
        }
    });

    // Add similar endpoints for the other tables like `fees`, `payments`, and `attendee_events`
};
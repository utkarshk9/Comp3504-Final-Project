const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports.register = (app, database) => {
    console.log('Registering payment routes...');

    // Test route
    app.get('/api/payments/test', async (req, res) => {
        try {
            res.json({ message: 'Payments route is working' });
        } catch (error) {
            console.error('Error in test route:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    
   
    app.post('/api/payments/confirm', async (req, res) => {
        console.log('Payment confirmation endpoint hit:', req.body);
        
        try {
            const { clientSecret } = req.body;
            if (!clientSecret) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Client secret is required' 
                });
            }
    
            // Get payment intent from Stripe
            const paymentIntentId = clientSecret.split('_secret_')[0];
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            
            console.log('Retrieved payment intent:', paymentIntent);
    
            const userId = paymentIntent.metadata.userId;
            const amountPaid = paymentIntent.amount / 100;
    
            // Start transaction
            await database.query('START TRANSACTION');
    
            try {
                // Insert into payments table without destructuring
                const paymentResult = await database.query(
                    `INSERT INTO payments (
                        user_id,
                        amount,
                        currency,
                        transaction_id,
                        payment_method,
                        status,
                        refund_status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        userId,
                        amountPaid,
                        paymentIntent.currency.toUpperCase(),
                        paymentIntentId,
                        'card',
                        'succeeded',
                        'not_requested'
                    ]
                );
    
                console.log('Payment insert result:', paymentResult);
    
                // Update attendee_events
                await database.query(
                    `UPDATE attendee_events 
                     SET created_at = NOW()
                     WHERE attendee_id = ?`,
                    [userId]
                );
    
                // Commit transaction
                await database.query('COMMIT');
    
                // Get the updated events without destructuring
                const eventsResult = await database.query(
                    `SELECT DISTINCT 
                        e.event_id,
                        e.name,
                        e.description,
                        e.fee,
                        e.Date as event_date,
                        e.event_type,
                        ae.attendee_event_id,
                        ae.attendee_id,
                        ae.created_at as registration_date
                    FROM attendee_events ae
                    INNER JOIN events e ON ae.event_id = e.event_id
                    WHERE ae.attendee_id = ? 
                    ORDER BY ae.created_at DESC`,
                    [userId]
                );
    
                // Filter out duplicates by attendee_event_id
                const uniqueEvents = eventsResult.filter((event, index, self) =>
                    index === self.findIndex((e) => e.attendee_event_id === event.attendee_event_id)
                );
    
                // Log the structure to debug
                console.log('Events Result:', JSON.stringify(uniqueEvents, null, 2));
    
                // Format tickets using unique events
                const tickets = uniqueEvents.map(event => ({
                    id: event.attendee_event_id.toString(),
                    eventName: event.name,
                    eventDate: new Date(event.event_date).toLocaleDateString(),
                    eventType: event.event_type,
                    description: event.description,
                    ticketId: `EVT-${event.event_id}-ATT-${event.attendee_event_id}`,
                    price: parseFloat(event.fee).toFixed(2),
                    registrationDate: new Date(event.registration_date).toLocaleDateString(),
                    paymentStatus: 'succeeded'
                }));
    
                res.json({ 
                    success: true, 
                    tickets: tickets,
                    paymentId: paymentIntentId,
                    totalAmount: amountPaid,
                    currency: paymentIntent.currency.toUpperCase(),
                    purchaseDate: new Date().toISOString()
                });
    
            } catch (error) {
                // Rollback transaction if an error occurs
                await database.query('ROLLBACK');
                console.error('Error in payment confirmation:', error);
                res.status(500).json({ 
                    success: false, 
                    error: 'Failed to process payment',
                    details: error.message 
                });
            }
        } catch (error) {
            console.error('Error in payment confirmation:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to process payment',
                details: error.message 
            });
        }
    });
    // Create payment intent
    app.post('/api/payment/create-intent', async (req, res) => {
        console.log('Payment intent route hit:', req.body);
        const { amount, userId } = req.body;

        try {
            const amountInCents = Math.round(amount * 100);
            console.log('Creating payment intent for amount:', { originalAmount: amount, amountInCents });

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'cad',
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    userId: userId.toString()
                }
            });

            res.json({
                clientSecret: paymentIntent.client_secret
            });
        } catch (error) {
            console.error('Error creating payment intent:', error);
            res.status(500).json({ 
                error: 'Failed to create payment intent',
                details: error.message 
            });
        }
    });

    // Record successful payment
    app.post('/api/payment/record', async (req, res) => {
        const { userId, amount, transaction_id, payment_method, status } = req.body;

        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(transaction_id);
            
            if (paymentIntent.status !== 'succeeded') {
                throw new Error('Payment not successful');
            }

            const [existingPayment] = await database.query(
                'SELECT * FROM payments WHERE transaction_id = ?',
                [transaction_id]
            );

            if (existingPayment.length > 0) {
                await database.query(
                    `UPDATE payments 
                    SET status = ?, 
                        payment_attempts = payment_attempts + 1,
                        payment_method = ?
                    WHERE transaction_id = ?`,
                    [status, payment_method, transaction_id]
                );
            } else {
                await database.query(
                    `INSERT INTO payments (
                        user_id, 
                        amount, 
                        currency, 
                        transaction_id, 
                        payment_method, 
                        status
                    ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [userId, amount, 'cad', transaction_id, payment_method, status]
                );
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Error recording payment:', error);
            res.status(500).json({ error: 'Failed to record payment' });
        }
    });

    // Get payment history for a user
    app.get('/api/payment/history/:userId', async (req, res) => {
        try {
            const [payments] = await database.query(
                `SELECT * FROM payments 
                WHERE user_id = ? 
                ORDER BY created_at DESC`,
                [req.params.userId]
            );
            
            res.json({ payments });
        } catch (error) {
            console.error('Error fetching payment history:', error);
            res.status(500).json({ error: 'Failed to fetch payment history' });
        }
    });

    // Webhook to handle Stripe events
    app.post('/api/payment/webhook', async (req, res) => {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );

            // Handle the event
            switch (event.type) {
                case 'payment_intent.succeeded':
                    const paymentIntent = event.data.object;
                    await database.query(
                        `UPDATE payments 
                        SET status = 'succeeded' 
                        WHERE transaction_id = ?`,
                        [paymentIntent.id]
                    );
                    break;
                    
                case 'payment_intent.payment_failed':
                    const failedPayment = event.data.object;
                    await database.query(
                        `UPDATE payments 
                        SET status = 'failed' 
                        WHERE transaction_id = ?`,
                        [failedPayment.id]
                    );
                    break;
            }

            res.json({ received: true });
        } catch (err) {
            console.error('Webhook error:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    });

    // Add debug logging
    console.log('Payment routes registered successfully');
};

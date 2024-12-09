const userRoutes = require('./userRoutes');
const eventRoutes = require('./eventRoutes');
const feeRoutes = require('./feesRoutes');
const attendeeRoutes = require('./AttendeeRoutes');
const adminRoutes = require('./adminRoutes');
const paymentsRoutes = require('./paymentsRoutes');

module.exports.register = (app, database) => {
    userRoutes.register(app, database);
    eventRoutes.register(app, database);
    feeRoutes.register(app, database);
    attendeeRoutes.register(app, database);
    adminRoutes.register(app, database);
    paymentsRoutes.register(app, database);
};

// start-server.js
// Dedicated script to start the server locally

import app from './server.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Tact Secure Server running on port ${PORT}`);
});

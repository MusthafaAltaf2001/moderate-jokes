const express = require('express');
const { ClientTCP } = require('@nestjs/microservices');
const { lastValueFrom } = require('rxjs');
const app = express();
const router = express.Router();
const authMiddleware = require('./authMiddleware');
const authController = require('./authController');
const PORT = process.env.PORT || 3003;
const cors = require('cors');

app.use(cors());
app.use(express.json())

const submitJokes = new ClientTCP({
    host: 'localhost',
    port: 3001,
});

const deliverJokes = new ClientTCP({
    host: 'localhost',
    port: 3002,
});

// Public routes (no authentication)
app.get('/', (req, res) => {
    res.send('Welcome to the Jokes Service!');
});

// Login route (public)
app.post('/login', authController.login); // Login route is public


(async () => {

    await submitJokes.connect();

    app.get('/jokes', authMiddleware, async (req, res) => {
        const pattern = { cmd: 'get-all-jokes' };

        const result = await lastValueFrom(submitJokes.send(pattern, {}))

        res.json(result)
    })

    // Approve the joke in the submit jokes microservice
    // Send the approved joke to the deliver jokes microservice and add it to the database
    app.post('/approveJoke', authMiddleware, async (req, res) => {
        const pattern = { cmd: 'approve-joke' };
        const result = await lastValueFrom(submitJokes.send(pattern, req.body))

        // Add the moderated joke to the deliver joke microservice
        await lastValueFrom(deliverJokes.send({ cmd: 'add-moderated-joke' }, req.body))

        res.json(result)
    })

    // Reject the joke and only add it to the deliver joke microservice
    app.post('/rejectJoke', authMiddleware, async (req, res) => {
        const pattern = { cmd: 'reject-joke' };
        const result = await lastValueFrom(submitJokes.send(pattern, req.body))

        res.json(result)
    })

})();


app.post('/auth', async (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@admin.com' && password === 'admin123') {
        res.json({ success: true })
    } else {
        res.json({ success: false })
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

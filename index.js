const express = require('express');
const { ClientTCP } = require('@nestjs/microservices');
const { lastValueFrom } = require('rxjs');
const app = express();
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


(async () => {

    await submitJokes.connect();

    app.get('/jokes', async (req, res) => {
        const pattern = { cmd: 'get-all-jokes' };

        const result = await lastValueFrom(submitJokes.send(pattern, {}))

        res.json(result)
    })

    app.post('/approveJoke', async (req, res) => {
        const pattern = { cmd: 'approve-joke' };
        const result = await lastValueFrom(submitJokes.send(pattern, req.body.id))

        // Add the moderated joke to the deliver joke microservice
        await lastValueFrom(deliverJokes.send({ cmd: 'add-moderated-joke' }, result.content, result.type))

        res.json(result)
    })

})();


// (async () => {

//     await client.connect();



// })();

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

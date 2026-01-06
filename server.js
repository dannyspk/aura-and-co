const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(__dirname));

// Clean URL routing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/shop', (req, res) => {
    res.sendFile(path.join(__dirname, 'shop.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'checkout.html'));
});

app.get('/order-confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, 'order-confirmation.html'));
});

// Fallback to 404
app.use((req, res) => {
    res.status(404).send('Page not found');
});

app.listen(PORT, () => {
    console.log(`\n✨ Aura & Co Development Server Running!\n`);
    console.log(`🌐 Local:    http://localhost:${PORT}`);
    console.log(`📁 Root:     ${__dirname}\n`);
    console.log(`Available routes:`);
    console.log(`  - http://localhost:${PORT}/`);
    console.log(`  - http://localhost:${PORT}/shop`);
    console.log(`  - http://localhost:${PORT}/checkout`);
    console.log(`  - http://localhost:${PORT}/order-confirmation\n`);
});

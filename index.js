const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51IB7huDaD5goVVmvnEFFu6tKh9PhdPg1foGGZUWrBibo2xqREj6RogMCEKxo9eyZHmps75wV10GJBPiLfmQW9i0p00qCgbXjJM');
const { v4: uuidv4 } = require('uuid');
// uuidv4();

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("It works!");
});

app.post("/payment", (req, res) => {
    const { product, token } = req.body;
    console.log("product: ", product);
    console.log("price: ", product.price);
    const idempotencyKey = uuidv4();

    return stripe.customers.create({
        email: token.email,
        source: token.id
    })
    .then(customer => {
        stripe.charges.create({
            amount: product.price * 100,
            currency: 'usd',
            customer: customer.id,
            receipt_email: token.email,
            description: product.name,
            shipping: {
                name: token.card.name,
                address: {
                    country: token.card.address_country
                }
            }
        }, { idempotencyKey })
    })
    .then(result => res.status(200).json(result))
    .catch(err => console.log(err))
})

app.listen(8282, () => {
    console.log('listening on port 8282');
});
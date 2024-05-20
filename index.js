const express = require('express');
const cors = require('cors');
require('./db/Config')
const user = require('./db/User');
const product = require('./db/Product')
const Jwt = require('jsonwebtoken');
const jwtKey = "e-comm";

const app = express();
app.use(express.json());
app.use(cors());

app.post('/register', async (req, respo) => {
    let use = new user(req.body);
    let result = await use.save();
    result = result.toObject();
    delete result.password
    // respo.send(result)
    Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
            respo.send("something went wron , pless try again letter");
        }
        respo.send({ result, auth: token });
    })
});

app.post('/login', async (req, respo) => {
    console.log(req.body);
    if (req.body.password && req.body.email) {
        let use = await user.findOne(req.body)
        if (use) {
            Jwt.sign({ use }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    respo.send("something went wron , pless try again letter");
                }
                respo.send({ use, auth: token });
            })

        }
        else {
            respo.send("not Found")
        }

    }
    else {
        respo.send("no found")
    }

});

app.post('/add-product', async (req, resp) => {
    let pro = new product(req.body);
    let result = await pro.save();
    resp.send(result)
});

app.get('/products', async (req, resp) => {
    let pro = await product.find();
    if (pro.length > 0) {
        resp.send(pro);
    } else {
        resp.send("no found")
    }
});


app.delete('/producte/:id', async (req, resp) => {

    console.log({ _id: req.params.id })

    let resu = await product.deleteOne({ _id: req.params.id });
    resp.send(resu)
});

app.get('/product/:id', async (req, resp) => {
    let result = await product.findOne({ _id: req.params.id });
    if (result) {
        resp.send(result)
    }
    else {
        resp.send("Error")
    }
});

app.put('/product/:id', async (req, resp) => {
    let result = await product.updateOne(
        { _id: req.params.id },
        { $set: req.body }
    );
    resp.send(result)
});

app.get('/search/:key', async (req, resp) => {
    let result = await product.find(
        {
            "$or": [
                { name: { $regex: req.params.key } },
                { price: { $regex: req.params.key } },
                { company: { $regex: req.params.key } },
                { category: { $regex: req.params.key } },
            ]
        }
    );
    resp.send(result)
})

app.listen(5000);
const express = require('express')
const bodyParser = require('body-parser')
const cote = require('cote')
const axios = require('axios')

const app = express()

app.use(bodyParser.json())

const restaurantsRequester = new cote.Requester({ name: 'restaurants requester', key: 'restaurants' })

const orderRequester = new cote.Requester({ name: 'order requester', key: 'orders' })

const deliveryRequester = new cote.Requester({ name: 'delivery requester', key: 'deliveries' })

app.get('/restaurants', async (req, res) => {
    const restaurants = await restaurantsRequester.send({ type: 'list' })
    res.send(restaurants);
})

app.post('/order', async (req, res) => {
    const order = await orderRequester.send({ type: 'create order', order: req.body })
    const delivery = await deliveryRequester.send({ type: 'create delivery', order })

    res.send({ order, delivery })
})

app.get('/resteraunt/:id', async (req,res)=>{
    
    const restaurantId = parseInt(req.params.id); 

    try {
        const restaurant = await restaurantsRequester.send({ type: 'getById', id: restaurantId }); 
        console.log(restaurant, restaurantId)
        if (restaurant) {
            res.send(restaurant); 
            res.status(404).send({ error: 'Restaurant not found' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Failed to retrieve restaurant' });
    }
})

app.listen(3000, () => console.log('listening'))

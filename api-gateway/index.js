const express = require('express')
const bodyParser = require('body-parser')
const cote = require('cote')
const axios = require('axios')
const winston = require('winston');
const tracer = require('../tracer/tracing');
const path = require('path');


//TODO: Move into Config tile
const { combine, timestamp, printf, colorize, align } = winston.format;

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [new winston.transports.File({filename:'logs.txt'})],
});

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
    const tracer = opentelemetry.trace.getTracer('restaurant-service');
    const span = tracer.startSpan('fetch-restaurant');
    
    try {
        const restaurant = await restaurantsRequester.send({ type: 'getById', id: restaurantId }); 
        if (restaurant) {
            res.send(restaurant); 
            res.status(404).send({ error: 'Restaurant not found' });
        }
    } catch (error) {
        logger.info('Resteraunt id failed');
        span.recordException(error);  
        res.status(500).send({ error: 'Failed to retrieve restaurant' });
    } finally {
        span.end();
    }

})

app.listen(3000, () => console.log('listening'))

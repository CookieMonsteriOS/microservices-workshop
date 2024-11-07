const express = require('express')
const bodyParser = require('body-parser')
const cote = require('cote')
const axios = require('axios')
const winston = require('winston');
const tracer = require('../tracer/tracing');
const path = require('path');
const redis = require('redis');
const client = redis.createClient();
const { restaurantsRequester, orderRequester, deliveryRequester } = require('../services/requesters.js');
const logger = require('../tracer/logger.js');
const { createOrderBreaker, createDeliveryBreaker } = require('../circuit-breaker/circuit-breakers.js');
const orderBreaker = createOrderBreaker(orderRequester);
const deliveryBreaker = createDeliveryBreaker(deliveryRequester);

//TODO Improve readability
orderBreaker.fallback(() => ({ error: 'Order service is currently unavailable.' }));
deliveryBreaker.fallback(() => ({ error: 'Delivery service is currently unavailable.' }));

const app = express()

app.use(bodyParser.json())

app.get('/restaurants', async (req, res) => {
    try {

        client.get('restaurants', async (err, cachedData) => {
            if (err) {
                return res.status(500).send({ error: 'Error accessing cache' });
            }
            
            if (cachedData) {
                return res.send(JSON.parse(cachedData));
            }

            const restaurants = await restaurantsRequester.send({ type: 'list' });

            client.setex('restaurants', 3600, JSON.stringify(restaurants));

            res.send(restaurants);
        });
    } catch (error) {
        console.error('Failed to retrieve restaurants:', error);
        res.status(500).send({ error: 'Failed to retrieve restaurant list' });
    }
});

app.post('/order', async (req, res) => {
    try {
      const order = await orderBreaker.fire({ type: 'create order', order: req.body });
      
      if (order.error) {
        return res.status(503).send({ error: order.error });
      }
  
      const delivery = await deliveryBreaker.fire({ type: 'create delivery', order });
  
      if (delivery.error) {
        return res.status(503).send({ error: delivery.error });
      }
  
      res.send({ order, delivery });
  
    } catch (error) {
      res.status(500).send({ error: 'An unexpected error occurred.' });
    }
  });
  

app.get('/resteraunt/:id', async (req,res)=>{
    
    const restaurantId = parseInt(req.params.id); 
    //const tracer = trace.getTracer('restaurant-service');
    //const span = tracer.startSpan('fetch-restaurant');
    try {
        const restaurant = await restaurantsRequester.send({ type: 'getById', id: restaurantId }); 
        if (restaurant) {
            res.send(restaurant); 
            
        }else{
            res.status(404).send({ error: 'Restaurant not found' });
        }
    } catch (error) {
        logger.info('Resteraunt retrievalfailed');
        //span.recordException(error);  
        res.status(500).send({ error: 'Failed to retrieve restaurant' });
    } finally {
        //span.end();
    }

})

app.listen(3000, () => console.log('listening'))

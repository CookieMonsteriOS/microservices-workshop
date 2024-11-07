const CircuitBreaker = require('opossum');

function createCircuitBreaker(requester) {
  return new CircuitBreaker(async (data) => {
    return await requester.send(data);
  });
}

module.exports = {
  createOrderBreaker: (orderRequester) => createCircuitBreaker(orderRequester),
  createDeliveryBreaker: (deliveryRequester) => createCircuitBreaker(deliveryRequester),
};

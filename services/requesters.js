const cote = require('cote'); 

const restaurantsRequester = new cote.Requester({ 
  name: 'restaurants requester', 
  key: 'restaurants' 
});

const orderRequester = new cote.Requester({ 
  name: 'order requester', 
  key: 'orders' 
});

const deliveryRequester = new cote.Requester({ 
  name: 'delivery requester', 
  key: 'deliveries' 
});

module.exports = {  
  restaurantsRequester,
  orderRequester,
  deliveryRequester
};


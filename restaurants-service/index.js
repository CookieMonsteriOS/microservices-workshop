const cote = require('cote')

const restaurantsResponder = new cote.Responder({ name: 'restaurants responder', key: 'restaurants' })
restaurantsResponder.on('*', req => req.type && console.log(req))

const restaurants = [{
    id: 0,
    name: 'Italian Restaurant',
    menu: [{
        id: 0,
        name: 'Pizza',
        price: 14
    }, {
        id: 1,
        name: 'Pasta',
        price: 12
    }]
}, {
    id: 1,
    name: 'American Restaurant',
    menu: [{
        id: 0,
        name: 'Hamburger',
        price: 10
    }, {
        id: 1,
        name: 'Hot dog',
        price: 10
    }]
},
{
    id: 3,
    name: 'Chinese Restaurant',
    menu: [{
        id: 0,
        name: 'Ramen',
        price: 10
    }, {
        id: 1,
        name: 'Noodles',
        price: 10
    }]
}
]

restaurantsResponder.on(req => req.type && console.log(req))

restaurantsResponder.on('list', req => Promise.resolve(restaurants))

restaurantsResponder.on('getById',(req)=>{
    const restaurant =  restaurants.find(r => r.id === req.id);
    return Promise.resolve(restaurant);
})

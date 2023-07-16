const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
 
const axios = require('axios');
 
// connect to Mongo
main().catch(err => {
    console.log("OH NO!!! MONGO connection error");
    console.log(err);
})
 
 
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
    console.log("MONGO connection open");
}
 
// unsplash collections. 
const collectionOne = '483251'; // woods collection           
const collectionTwo = '3846912'; //campgrounds collection
const collectionThree = '9046579'; //camping
 
// call unsplash and return small image
 
async function seedImg(collection) {
    try {
        const resp = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
                client_id: 'eesHj4vUIhRF7c6Z0Z0p__Gyoa_LpfvmP2U6afINl9g',
                collections: collection,
                count: 30  //max count allowed by unsplash API 
            },
            headers: { Accept: 'application/json', 'Accept-Encoding': 'identity' }
        })
        // console.log(resp.data);  // was garbled data prior to setting headers  11/27/2022
        return resp.data.map((a) => a.urls.small);
 
    } catch (err) {
        console.error(err)
    }
}
 
const seedDB = async () => {
    await Campground.deleteMany({})
    //make 3 API requests to unsplash, 30 images per request 
    const imageSetOne = await seedImg(collectionOne);
    const imageSetTwo = await seedImg(collectionTwo);
    const imageSetThree = await seedImg(collectionThree);
    //spread into one array
    const imgs = [...imageSetOne, ...imageSetTwo, ...imageSetThree]; // 90 random images
    for (let i = 0; i < 50; i++) {
        // setup - get random number based on each arrays length   
        const descriptorsSeed = Math.floor(Math.random() * descriptors.length);
        const placeSeed = Math.floor(Math.random() * places.length);
        const citySeed = Math.floor(Math.random() * cities.length);
        const price = Math.floor(Math.random() * 25) + 10;
        const imgsSeed = Math.floor(Math.random() * imgs.length);
        // seed data into campgrounds collection
        const camp = new Campground({
            author: '64aab3acb13bf3dd239af4f8',
            title: `${descriptors[descriptorsSeed]} ${places[placeSeed]}`,
            location: `${cities[citySeed].city}, ${cities[citySeed].state}`,
            description:
                'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Debitis, nihil tempora vel aspernatur quod aliquam illum! Iste impedit odio esse neque veniam molestiae eligendi commodi minus, beatae accusantium, doloribus quo!',
            price,
            geometry: { type: 'Point', coordinates: [ -115.1391 , 36.1716]},
            images: [
                {
                  url: 'https://res.cloudinary.com/dtpfnth9p/image/upload/v1689518101/YelpCamp/y6qjhlmlnwr4wy2ofgc4.jpg',
                  filename: 'YelpCamp/y6qjhlmlnwr4wy2ofgc4',
                },
                {
                  url: 'https://res.cloudinary.com/dtpfnth9p/image/upload/v1689518101/YelpCamp/ikioiq0xx436uch3usjf.webp',
                  filename: 'YelpCamp/ikioiq0xx436uch3usjf',
                },
                {
                  url: 'https://res.cloudinary.com/dtpfnth9p/image/upload/v1689518102/YelpCamp/mgr9oitbhudjrxmoqxds.webp',
                  filename: 'YelpCamp/mgr9oitbhudjrxmoqxds',
                }
              ]
        })
 
        await camp.save()
    }
}
 
seedDB().then(() => {
    mongoose.connection.close();
})
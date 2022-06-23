const mongoose = require('mongoose');
const Campground = require('../models/campground')
const { places, descriptors }  = require('./seedHelpers')
const cities = require('./cities')
async function main() {
  await mongoose.connect('mongodb://localhost:27017/yelp-camp');
}

main()
  .then(result => {
    console.log('MongoDB Connected',result)
  })
  .catch((err) => {
    console.log('MongoDB NOT Connected',err)
  })

  // arrow function without body braces implies return
const sample = array => array[Math.floor(Math.random() * array.length)]


const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++){
    const random1000 = Math.floor(Math.random() * 1000) + 1
    const price = Math.floor(Math.random() * 20) + 10
    const camp = new Campground({
      // YOUR USER ID
      author: '62a3a9d7367bcca7d025ca1c',
      location: `${cities[random1000].city},${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      price: price,
      geometry: {
        type: 'Point', 
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ]
      },
      images: [{
        "url": "https://yelp-camp-bucket.s3.eu-central-1.amazonaws.com/b66aaac00aa677a004b0939cecb045b2",
        "filename": "KakaoTalk_20220604_192710564.jpg"
      },
      {
        "url": "https://yelp-camp-bucket.s3.eu-central-1.amazonaws.com/b66aaac00aa677a004b0939cecb045b2",
        "filename": "KakaoTalk_20220604_192710564.jpg"
      }
      ],
      description: `Lorem Ipsum is simply dnting and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ip`
    });
    await camp.save();
  }
  
}

// close connection in this file
seedDB().then(() => {
  mongoose.connection.close();
  console.log('connection closed')
});
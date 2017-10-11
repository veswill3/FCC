// some real sample data (location: 'NYC', categories: 'nightlife', limit: 3)
const searchResults = {
  jsonBody: {
    businesses: [
      {
        id: 'rooftop-93-new-york-5',
        name: 'Rooftop 93',
        image_url: 'https://s3-media2.fl.yelpcdn.com/bphoto/ePNrhrwDplKU8jqk35Y8Sg/o.jpg',
        is_closed: false,
        url: 'https://www.yelp.com/biz/rooftop-93-new-york-5?adjust_creative=rLmjHupXGsDfDsD6ErwOVg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=rLmjHupXGsDfDsD6ErwOVg',
        review_count: 120,
        categories: [
          {
            alias: 'lounges',
            title: 'Lounges',
          },
          {
            alias: 'cocktailbars',
            title: 'Cocktail Bars',
          },
        ],
        rating: 4.5,
        coordinates: {
          latitude: 40.7170219,
          longitude: -73.9953842,
        },
        transactions: [],
        price: '$$',
        location: {
          address1: '93 Bowery',
          address2: '',
          address3: '',
          city: 'New York',
          zip_code: '10002',
          country: 'US',
          state: 'NY',
          display_address: [
            '93 Bowery',
            'New York, NY 10002',
          ],
        },
        phone: '+12129669033',
        display_phone: '(212) 966-9033',
        distance: 1291.2682238457999,
      },
      {
        id: 'the-village-underground-new-york',
        name: 'The Village Underground',
        image_url: 'https://s3-media3.fl.yelpcdn.com/bphoto/81l9KO_4N_ZA9f6eLsjnUw/o.jpg',
        is_closed: false,
        url: 'https://www.yelp.com/biz/the-village-underground-new-york?adjust_creative=rLmjHupXGsDfDsD6ErwOVg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=rLmjHupXGsDfDsD6ErwOVg',
        review_count: 249,
        categories: [
          {
            alias: 'danceclubs',
            title: 'Dance Clubs',
          },
          {
            alias: 'lounges',
            title: 'Lounges',
          },
          {
            alias: 'comedyclubs',
            title: 'Comedy Clubs',
          },
        ],
        rating: 4,
        coordinates: {
          latitude: 40.7306935670033,
          longitude: -74.0009226385494,
        },
        transactions: [],
        price: '$$',
        location: {
          address1: '130 W 3rd St',
          address2: '',
          address3: '',
          city: 'New York',
          zip_code: '10012',
          country: 'US',
          state: 'NY',
          display_address: [
            '130 W 3rd St',
            'New York, NY 10012',
          ],
        },
        phone: '+12127777745',
        display_phone: '(212) 777-7745',
        distance: 2862.671622174,
      },
      {
        id: 'raines-law-room-new-york',
        name: 'Raines Law Room',
        image_url: 'https://s3-media2.fl.yelpcdn.com/bphoto/DZlxemV4ZI_HNzi2uq10sg/o.jpg',
        is_closed: false,
        url: 'https://www.yelp.com/biz/raines-law-room-new-york?adjust_creative=rLmjHupXGsDfDsD6ErwOVg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=rLmjHupXGsDfDsD6ErwOVg',
        review_count: 1212,
        categories: [
          {
            alias: 'lounges',
            title: 'Lounges',
          },
          {
            alias: 'cocktailbars',
            title: 'Cocktail Bars',
          },
        ],
        rating: 4.5,
        coordinates: {
          latitude: 40.73869,
          longitude: -73.99462,
        },
        transactions: [
          'restaurant_reservation',
        ],
        price: '$$$',
        location: {
          address1: '48 W 17th St',
          address2: '',
          address3: '',
          city: 'New York',
          zip_code: '10011',
          country: 'US',
          state: 'NY',
          display_address: [
            '48 W 17th St',
            'New York, NY 10011',
          ],
        },
        phone: '',
        display_phone: '',
        distance: 3699.3151846240003,
      },
    ],
    total: 5178,
    region: {
      center: {
        longitude: -73.9942932129,
        latitude: 40.7054448644,
      },
    },
  },
};
// real review results for each
const reviewResultsById = {
  'raines-law-room-new-york': {
    reviews: [
      {
        url: 'https://www.yelp.com/biz/raines-law-room-new-york?hrid=qjT9yl-WN6-jqF_r8Kqdtw&adjust_creative=rLmjHupXGsDfDsD6ErwOVg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_reviews&utm_source=rLmjHupXGsDfDsD6ErwOVg',
        text: "So cool! We came here on a Monday night and it wasn't too busy. You ring the door bell to enter into the completely unsuspecting bar, and so right from the...",
        rating: 5,
        user: {
          image_url: 'https://s3-media2.fl.yelpcdn.com/photo/fGPU-kFPP6phLrAdw8nINg/o.jpg',
          name: 'Tanya D.',
        },
        time_created: '2017-09-12 09:37:54',
      },
      {
        url: 'https://www.yelp.com/biz/raines-law-room-new-york?hrid=1NStN_mmVYEOKsbyJx2gDA&adjust_creative=rLmjHupXGsDfDsD6ErwOVg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_reviews&utm_source=rLmjHupXGsDfDsD6ErwOVg',
        text: "Easily one of my favorite bars in NYC. The ambiance, drinks, and service is just great. I've come here several times, both casually and once for a friend's...",
        rating: 5,
        user: {
          image_url: 'https://s3-media2.fl.yelpcdn.com/photo/2iCGDZqsqdIXkSWjp2753Q/o.jpg',
          name: 'Alka M.',
        },
        time_created: '2017-08-27 22:36:29',
      },
      {
        url: 'https://www.yelp.com/biz/raines-law-room-new-york?hrid=FdhJN9tA06y86SO5y7kAug&adjust_creative=rLmjHupXGsDfDsD6ErwOVg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_reviews&utm_source=rLmjHupXGsDfDsD6ErwOVg',
        text: "one of new york's best kept secrets! it's tiny so be prepared to wait but the cocktail menu is extensive and this place has a neat vibe. i would also say...",
        rating: 5,
        user: {
          image_url: 'https://s3-media2.fl.yelpcdn.com/photo/3CD8rKhzyRu_xTz7Eog6Eg/o.jpg',
          name: 'Emily A.',
        },
        time_created: '2017-08-17 08:41:57',
      },
    ],
    total: 1215,
    possible_languages: [
      'fr',
      'en',
    ],
  },
  'rooftop-93-new-york-5': {
    reviews: [
      {
        url: 'https://www.yelp.com/biz/rooftop-93-new-york-5?hrid=iQ6SX_K2g16qYOutaRgwCg&adjust_creative=rLmjHupXGsDfDsD6ErwOVg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_reviews&utm_source=rLmjHupXGsDfDsD6ErwOVg',
        text: 'Drinks: 4/5\nService: 5/5\nAmbience: 5/5\n\nI was looking for a nice bar/lounge in lower Manhattan for my friends for Happy Hour and I and I happened to stumble...',
        rating: 5,
        user: {
          image_url: 'https://s3-media3.fl.yelpcdn.com/photo/4XQG0LpKDTFnpTSxYEAlgg/o.jpg',
          name: 'Irene W.',
        },
        time_created: '2017-09-25 07:41:41',
      },
      {
        url: 'https://www.yelp.com/biz/rooftop-93-new-york-5?hrid=O26AzWQRQRxKxAtLwTdBZA&adjust_creative=rLmjHupXGsDfDsD6ErwOVg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_reviews&utm_source=rLmjHupXGsDfDsD6ErwOVg',
        text: 'Beautiful view of the Lower East Side and the Empire State off in the distance! I came here for Happy Hour with a girl friend for drinks and the deals were...',
        rating: 3,
        user: {
          image_url: 'https://s3-media2.fl.yelpcdn.com/photo/IixftwIe1DBIRzIYgCXqow/o.jpg',
          name: 'Christine W.',
        },
        time_created: '2017-09-10 18:14:00',
      },
      {
        url: 'https://www.yelp.com/biz/rooftop-93-new-york-5?hrid=GHas0AC41RcQ0h31M9eoyw&adjust_creative=rLmjHupXGsDfDsD6ErwOVg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_reviews&utm_source=rLmjHupXGsDfDsD6ErwOVg',
        text: 'I felt safe walking here, passed up very enticing beer garden on the ground floor, and got to the rooftop bar to find it very small, crowded and loud. This...',
        rating: 4,
        user: {
          image_url: 'https://s3-media2.fl.yelpcdn.com/photo/znl9FmjGm2sm-EL5EXlBqQ/o.jpg',
          name: 'Sandy E.',
        },
        time_created: '2017-09-09 15:59:31',
      },
    ],
    total: 122,
    possible_languages: [
      'en',
    ],
  },
  'the-village-underground-new-york': {
    reviews: [
      {
        url: 'https://www.yelp.com/biz/the-village-underground-new-york?hrid=gk6uxtFmeI9uX2Ix6hXsSg&adjust_creative=rLmjHupXGsDfDsD6ErwOVg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_reviews&utm_source=rLmjHupXGsDfDsD6ErwOVg',
        text: 'The show was great. Me and the hubby went to see Hassan Minaj during our recent trip to NYC.  I actually really like the space at the village underground...',
        rating: 4,
        user: {
          image_url: 'https://s3-media3.fl.yelpcdn.com/photo/xOg0iOhXj23w4ssF48tXrg/o.jpg',
          name: 'Sarama D.',
        },
        time_created: '2017-09-09 03:57:12',
      },
      {
        url: 'https://www.yelp.com/biz/the-village-underground-new-york?hrid=PCGFerk_VGpH3Zmk2cfBEQ&adjust_creative=rLmjHupXGsDfDsD6ErwOVg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_reviews&utm_source=rLmjHupXGsDfDsD6ErwOVg',
        text: 'Went on a Friday night, and it was pretty crowded. The crowd is great. Bartenders are super friendly, servers were awesome! BEST PLACE TO GO!',
        rating: 5,
        user: {
          image_url: 'https://s3-media1.fl.yelpcdn.com/photo/Zdf7fSn2oe6ZcL5MTbaHAw/o.jpg',
          name: 'Tay J.',
        },
        time_created: '2017-10-05 22:30:02',
      },
      {
        url: 'https://www.yelp.com/biz/the-village-underground-new-york?hrid=onya7lj7MIVJvT1AboyzqQ&adjust_creative=rLmjHupXGsDfDsD6ErwOVg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_reviews&utm_source=rLmjHupXGsDfDsD6ErwOVg',
        text: 'Like many other reviewers, I came here for a Comedy Cellar show. The show itself was actually quite good (with the exception of one comic whose humor veered...',
        rating: 2,
        user: {
          image_url: 'https://s3-media2.fl.yelpcdn.com/photo/Q0tBPj2lysL-XJq5_Idn7Q/o.jpg',
          name: 'Lorelei Y.',
        },
        time_created: '2016-12-12 17:07:50',
      },
    ],
    total: 252,
    possible_languages: [
      'fr',
      'en',
    ],
  },
};

module.exports = {
  accessToken: (id, secret) => new Promise((resolve, reject) => {
    if (id === 'fail' || secret === 'fail') {
      return reject('yelp stub failed (on purpose)');
    }
    return resolve({ jsonBody: { access_token: 'fake-token' } });
  }),
  client: () => ({
    search: query => new Promise((resolve, reject) => {
      if (query.location === 'no-data-loc') {
        return reject(new Error('something about nothing found'));
      }
      return resolve(searchResults);
    }),
    business: id => new Promise((resolve, reject) => {
      if (id === 'not-an-id') {
        return reject({ 'some-error': 'info when not found...' });
      }
      return resolve({ name: 'mom and pops pizza' });
    }),
    reviews: id => new Promise((resolve, reject) => {
      if (id === 'not-an-id') {
        return reject({ 'some-error': 'info when not found...' });
      }
      if (id) {
        return resolve({ jsonBody: reviewResultsById[id] });
      }
      return resolve({ jsonBody: reviewResultsById['rooftop-93-new-york-5'] });
    }),
  }),
};

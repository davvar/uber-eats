import * as faker from 'faker';
import fetch from 'node-fetch';

const createRestaurant = (body: any) => fetch('http://localhost:3000/graphql', {
  headers: {
    accept: '*/*',
    'content-type': 'application/json',
    'x-jwt':
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImlhdCI6MTYxMzQ1ODA1MH0.WgpqsqIRzeIWaio0j7EyW2yoAu58ZGlh2BSq88_ipGA',
  },
  body,
  method: 'POST',
});

const categoryNames = [
  'Ethnic',
  'Fast food',
  'Fast casual',
  'Casual dining',
  'Premium casual',
  'Family style',
  'Fine dining',
  'Brasserie and bistro',
];

const data = () => ({
  operationName: null,
  variables: {},
  query: `
  mutation {
    createRestaurant(
      input: {
        name: "${faker.name.title()}",
        address: "${faker.address.streetAddress()}",
        categoryName: "${categoryNames[Math.floor(Math.random() * categoryNames.length - 1)]}",
        coverImg: "${faker.image.food()}"
      }
    ) {
      ok
      error
    }
  }`,
});


export const seeder = () =>
  Promise.all([...Array(50)].map(() => createRestaurant(JSON.stringify(data()))))
    .then(() => console.log('ok'))
    .catch(console.error);
    seeder()

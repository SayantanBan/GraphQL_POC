var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
const fetch = require('node-fetch');

var schema = buildSchema(`
  type Query { 
    getPosts: [Posts],
    getPostsByIds (ids: [Int]) : [Posts]
  }

  type Category {
    id: Int
    categoryName: String
  }
  
  type Posts {
    id: Int
    postName: String
    postDate: String
    lastEdit: String
    postContent: String
    status: Boolean
    allowComment: Boolean
    category: Category
  }`);

// The resolvers
const root = {
  getPosts : async () => {
      const response = await fetch(`https://my-vogue.herokuapp.com/public/posts`);
      return response.json();
  },
  getPostsByIds: async (ids) => {
      let urls = [];
      for(var k in ids){
        if(ids.hasOwnProperty(k)){
          var v = ids[k];
          console.log(ids[k].length);
          console.log(v);
          for(var c in v){
            if(v.hasOwnProperty(c)){
              var val2 = v[c];
              urls.push(`https://my-vogue.herokuapp.com/public/posts/${v[c]}`)
              console.log(val2);
            }
          } 
        }
      }
      console.log(urls);
      let output = '';
      // map every url to the promise of the fetch
      let requests = urls.map(url => fetch(url));

      // Promise.all waits until all jobs are resolved
      output = Promise.all(requests)
          .then(responses => {
            // all responses are resolved successfully
            for(let response of responses) {
              console.log(`${response.url}: ${response.status}`); // shows 200 for every url
            }
            return responses;
          })
          // map array of responses into an array of response.json() to read their content
          .then(responses => Promise.all(responses.map(r => r.json())))
          
      return output;
    }      
  };

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
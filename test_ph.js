import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
fetch("https://api.producthunt.com/v2/api/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.PRODUCT_HUNT_TOKEN}`
  },
  body: JSON.stringify({
    query: `{ posts(first: 50, order: VOTES, postedAfter: "2024-05-01T00:00:00Z", postedBefore: "2024-05-01T23:59:59Z", topic: "artificial-intelligence") { edges { node { name, topics { edges { node { slug } } } } } } }`
  })
}).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)));

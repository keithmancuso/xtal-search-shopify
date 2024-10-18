import fetch from 'node-fetch';

export async function fetchAllProducts(admin) {
  let allProducts = [];
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    const query = `
      query {
        products(first: 250, after: ${cursor ? `"${cursor}"` : null}) {
          edges {
            node {
              id
              title
              description
              images(first: 1) {
                edges {
                  node {
                    src
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    price
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const response = await admin.graphql(query);
    const data = await response.json();
    const products = data.data.products.edges.map(edge => edge.node);
    allProducts.push(...products);

    hasNextPage = data.data.products.pageInfo.hasNextPage;
    cursor = data.data.products.pageInfo.endCursor;
  }

  return allProducts;
}
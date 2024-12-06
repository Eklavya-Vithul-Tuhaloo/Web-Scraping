const express = require('express');
const path = require('path');
const axios = require('axios');  // Using axios to make HTTP requests
const cheerio = require('cheerio');  // For scraping HTML content
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware to enable CORS
app.use(cors()); 

// Serve the index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Scrape Route - Scrape product details from both Fresh Fruits and Butter categories
app.get('/scrape', async (req, res) => {
    const productName = req.query.product;

    if (!productName) {
        return res.status(400).json({ success: false, message: 'Product name is required.' });
    }

    // List of URLs to scrape
    const urls = [
        'https://www.godelivery.mu/product-category/groceries/fresh-chilled/fresh-fruits/',
        'https://www.godelivery.mu/product-category/groceries/fresh-chilled/butter-cream-eggs/butter/',
        'https://www.godelivery.mu/product-category/groceries/fresh-chilled/butter-cream-eggs/cream-butter-cream-eggs/',
        'https://www.godelivery.mu/product-category/groceries/fresh-chilled/cheese/',
        'https://www.godelivery.mu/product-category/groceries/fresh-chilled/coldcuts/',
        'https://www.godelivery.mu/product-category/groceries/fresh-chilled/fresh-meat/',
        'https://www.godelivery.mu/product-category/groceries/fresh-chilled/fresh-burger/',
        'https://www.godelivery.mu/product-category/groceries/fresh-chilled/fresh-chicken/',
        'https://www.godelivery.mu/product-category/groceries/fresh-chilled/fresh-lamb/',
        'https://www.godelivery.mu/product-category/groceries/fresh-chilled/fresh-mince-meat/',
        'https://www.godelivery.mu/product-category/groceries/fresh-chilled/fresh-pasta/',
        'https://www.godelivery.mu/product-category/groceries/fresh-chilled/fresh-salmon/',
        'https://www.godelivery.mu/product-category/groceries/fresh-chilled/fresh-sausage/',
        'https://www.godelivery.mu/product-category/groceries/fresh-chilled/marlin/',
        'https://www.godelivery.mu/product-category/groceries/fresh-chilled/fresh-vegetables/',
        'https://www.godelivery.mu/product-category/groceries/fresh-chilled/meatbox/',
        'https://www.godelivery.mu/product-category/groceries/fresh-chilled/yogurt/'
    ];

    try {
        // Scrape data from all the URLs
        const allProducts = await Promise.all(urls.map(url => scrapeDataFromUrl(url, productName)));
        
        // Flatten the array if needed (since Promise.all returns an array of arrays)
        const products = allProducts.flat();

        if (products.length > 0) {
            return res.json({ success: true, products });
        } else {
            return res.json({ success: false, message: 'No products found.' });
        }
    } catch (err) {
        console.error('Error scraping:', err);
        return res.status(500).json({ success: false, message: 'An error occurred while scraping.' });
    }
});

// Function to scrape data from each URL
async function scrapeDataFromUrl(url, productName) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);  // Load the HTML content into Cheerio

        const products = [];
        $('.product').each((i, element) => {
            const product = {
                name: $(element).find('.woocommerce-loop-product__title').text().trim(),
                price: $(element).find('.price').text().trim(),
            };

            // Check if product name contains the search term (productName)
            if (product.name && product.price && product.name.toLowerCase().includes(productName.toLowerCase())) {
                products.push(product);
            }
        });

        return products;
    } catch (err) {
        console.error(`Error scraping URL: ${url}`, err);
        return [];  // Return an empty array if scraping fails for a URL
    }
}

// Serve static files from public folder (optional if using static files like CSS/JS)
app.use(express.static(path.join(__dirname, '/')));

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

document.addEventListener("DOMContentLoaded", () => {
    navigateTo(window.location.hash);   
});

window.addEventListener("hashchange", () => {
    navigateTo(window.location.hash);   
});

function navigateTo(hash) {
    switch (hash) {
        case "#/scrape":
            loadScrapePage();
            break;
        case "#/results":
            loadResultsPage();
            break;
        default:
            loadHomePage();
            break;
    }
}

function loadHomePage() {
    const homeContent = `
        <div class="text-center my-4">
            <h2>Welcome to the Web Scraper</h2>
            <p>Enter a product name to scrape prices and details from an online grocery store.</p>
            <a href="#/scrape">Start Scraping</a>
        </div>`;
    document.getElementById("app").innerHTML = homeContent;
}

function loadScrapePage() {
    const scrapeContent = `
        <div class="text-center my-4">
            <h2>Scrape Groceries</h2>
            <form id="scrapeForm">
                <input type="text" id="productInput" placeholder="Enter product name" required>
                <button type="submit">Scrape</button>
            </form>
            <div id="scrapeResults"></div>
            <a href="#/">Back to Home</a>
        </div>`;
    document.getElementById("app").innerHTML = scrapeContent;

    document.getElementById("scrapeForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const productName = document.getElementById("productInput").value;
        
        fetch(`/scrape?product=${productName}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const productList = data.products.map(product => `
                        <div>
                            <h4>${product.name}</h4>
                            <p>Price: ${product.price}</p>
                        </div>`).join('');
                    document.getElementById("scrapeResults").innerHTML = productList;
                } else {
                    document.getElementById("scrapeResults").innerHTML = '<p>No products found or error occurred.</p>';
                }
            })
            .catch(err => {
                console.error(err);
                document.getElementById("scrapeResults").innerHTML = 'Error occurred while scraping.';
            });
    });
}

function loadResultsPage() {
    // If you want to create a separate results page, use this section
    // For simplicity, it's left empty here as results are displayed on the scrape page
    const resultsContent = `<div class="text-center my-4"><h2>Scraped Results</h2><a href="#/">Back to Home</a></div>`;
    document.getElementById("app").innerHTML = resultsContent;
}

loadHomePage();  // Default to loading the homepage on load

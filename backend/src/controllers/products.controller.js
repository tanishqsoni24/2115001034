import axios from 'axios';

const BASE_URL = 'http://20.244.56.144/test';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIwNzgzNTU0LCJpYXQiOjE3MjA3ODMyNTQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImJiNDllZjkxLTUyMzYtNDk0Yy1hZjhmLWQ2ZTBkMDdkMDFmNSIsInN1YiI6InRhbmlzaHEuc29uaV9jczIxQGdsYS5hYy5pbiJ9LCJjb21wYW55TmFtZSI6ImV0ZXJuaXR5IiwiY2xpZW50SUQiOiJiYjQ5ZWY5MS01MjM2LTQ5NGMtYWY4Zi1kNmUwZDA3ZDAxZjUiLCJjbGllbnRTZWNyZXQiOiJGRXpsSkVpaU1FT3JqRkdyIiwib3duZXJOYW1lIjoiVGFuaXNocSBTb25pIiwib3duZXJFbWFpbCI6InRhbmlzaHEuc29uaV9jczIxQGdsYS5hYy5pbiIsInJvbGxObyI6IjIxMTUwMDEwMzQifQ._Oeq80xA7x2xR018ff4U54Z3jq-cMJs7pQQcrqumGQM';

const fetchProducts = async (category, minPrice, maxPrice, top) => {
    const companies = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
    const requests = companies.map(company => fetchProductsFromCompany(company, category, minPrice, maxPrice, top));

    try {
        const responses = await Promise.all(requests);
        let products = [];
        responses.forEach(response => {
            products = products.concat(response);
        });
        return products;
    } catch (error) {
        console.error('Error fetching product data:', error);
        return [];
    }
};

const fetchProductsFromCompany = async (company, category, minPrice, maxPrice, top) => {
    try {
        const response = await axios.get(`${BASE_URL}/companies/${company}/categories/${category}/products`, {
            params: {
                top,
                minPrice,
                maxPrice
            },
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching product data from ${company}:`, error);
        return [];
    }
};

const sortProducts = (products, sortBy, sortOrder) => {
    return products.sort((a, b) => {
        if (sortOrder === 'asc') return a[sortBy] - b[sortBy];
        return b[sortBy] - a[sortBy];
    });
};

const getProductsByCategory = async (req, res) => {
    const { categoryname } = req.params;
    const { n = 10, page = 1, sortBy = 'price', sortOrder = 'asc', minPrice = 0, maxPrice = Infinity } = req.query;
    const limit = parseInt(n, 10);
    const offset = (page - 1) * limit;

    let products = await fetchProducts(categoryname, minPrice, maxPrice, limit);
    products = sortProducts(products, sortBy, sortOrder);
    products = products.slice(offset, offset + limit);

    products = products.map((product, index) => ({
        ...product,
        customId: `${categoryname}-${index + offset}`
    }));

    res.json(products);
};

const getProductById = async (req, res) => {
    const { categoryname, productid } = req.params;

    const products = await fetchProducts(categoryname);
    const product = products.find(p => `${categoryname}-${products.indexOf(p)}` === productid);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

export {
    getProductsByCategory,
    getProductById
};

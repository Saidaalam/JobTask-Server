const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = "mongodb+srv://mobileSystem:LXsfE99AtQ4zP2Ik@cluster0.xpkslah.mongodb.net/mobileDB?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);
const db = client.db('productDB');
const productCollection = db.collection('product');
const categoryCollection = db.collection('category');

// Add a new product
app.post('/product', async (req, res) => {
  try {
    const newProduct = req.body;
    const result = await productCollection.insertOne(newProduct);
    res.status(201).json({ message: 'Product added successfully', newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Get all products
app.get('/category', async (req, res) => {
  try {
    const category = await categoryCollection.find().toArray();
    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});


// Get all products with pagination and search
app.get('/product', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6; 
  const search = req.query.search || '';

  try {
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    
    const products = await productCollection.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const totalProducts = await productCollection.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      products,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
app.get('/product/:id', async (req, res) => {
  const id = req.params.id;
  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    const product = await productCollection.findOne({ _id: ObjectId(id) });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.get('/', (req, res) => {
  res.send('Product Hunter is running');
});

// Start server
app.listen(port, () => {
  console.log(`Product Hunter is running on port: ${port}`);
});

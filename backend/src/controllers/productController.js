const Product = require('../models/Product');

const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error en la carga de los productos", error: error.message });
    }
}

const createProduct = async (req, res) => {
    try {
        const { nombre, descripcion, clasificacion, precio, gramaje, stock } = req.body;

        const imagenPath = req.file ? `/uploads/${req.file.filename}` : '';

        const newProduct = new Product({ 
            nombre, 
            descripcion, 
            clasificacion, 
            precio, 
            gramaje, 
            stock, 
            imagen: imagenPath 
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: "Error en la creación del producto", error: error.message });
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (req.file) {
            updateData.imagen = `/uploads/${req.file.filename}`;
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { 
            new: true,           
            runValidators: true  
        });

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.status(200).json({ message: 'Producto actualizado con éxito', updatedProduct });
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el producto', error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
    }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params; 

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json({ message: 'Producto eliminado con éxito', deletedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
  }
};

module.exports = { getProducts, createProduct, updateProduct, getProductById, deleteProduct };
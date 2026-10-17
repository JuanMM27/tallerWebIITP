const Product = require('../models/Product');

const getProducts = async (req, res) =>{
    try{
        const products = await Product.find({});

        res.status(200).json(products);
    } catch (error){
        res.status(500).json({ message: "Error en la carga de los productos", error: error.message});
    }
}

const createProduct = async (req, res) =>{
    try{
        const { nombre, descripcion, clasificacion, precio, gramaje, stock, imagen} = req.body;

        const newProduct = new Product({ nombre, descripcion, clasificacion, precio, gramaje, stock, imagen});

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error){
        res.status(400).json({ message: "Error en la creación del producto", error: error.message});
    }
}

module.exports = { getProducts, createProduct};
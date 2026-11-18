const Product = require('../models/Product');
const getProducts = async (req, res) => {
    try {
        // Mantener el contrato del inicio; el catálogo solicita páginas explícitas.
        if (req.query.pagina === undefined && req.query.limite === undefined) {
            return res.status(200).json(await Product.find({}));
        }
        const paginaSolicitada = Number(req.query.pagina ?? 1);
        const limite = Number(req.query.limite ?? 8);
        const {
            busqueda = '',
            clasificacion = '',
            disponibilidad = 'todos',
            orden = 'ninguno'
        } = req.query;

        const disponibilidadesValidas = ['todos', 'con_stock', 'sin_stock'];
        const ordenesValidos = ['ninguno', 'precio_asc', 'precio_desc'];

        if (!Number.isSafeInteger(paginaSolicitada) || paginaSolicitada < 1 ||
            !Number.isSafeInteger(limite) || limite < 1 || limite > 100 ||
            !Number.isSafeInteger((paginaSolicitada - 1) * limite) ||
            typeof busqueda !== 'string' || busqueda.length > 200 ||
            typeof clasificacion !== 'string' || clasificacion.length > 100 ||
            typeof disponibilidad !== 'string' ||
            !disponibilidadesValidas.includes(disponibilidad) ||
            typeof orden !== 'string' ||
            !ordenesValidos.includes(orden)) {
            return res.status(400).json({ message: 'Parámetros de paginación o filtros inválidos.' });
        }
        const filtro = {};
        if (busqueda.trim()) {
            const texto = busqueda.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filtro.$or = [
                { nombre: { $regex: texto, $options: 'i' } },
                { descripcion: { $regex: texto, $options: 'i' } }
            ];
        }

        if (clasificacion && clasificacion !== 'Todos') {
            filtro.clasificacion = clasificacion;
        }

        if (disponibilidad === 'con_stock') {
            filtro.stock = { $gt: 0 };
        } else if (disponibilidad === 'sin_stock') {
            filtro.stock = 0;
        }

        const ordenamiento = orden === 'precio_asc'
            ? { precio: 1, _id: 1 }
            : orden === 'precio_desc'
                ? { precio: -1, _id: 1 }
                : { _id: 1 };
        
        const [total, clasificaciones] = await Promise.all([
            Product.countDocuments(filtro),
            Product.distinct('clasificacion')
        ]);

        const pagina = Math.min(paginaSolicitada, Math.max(1, Math.ceil(total / limite)));
        const productos = await Product.find(filtro)
            .sort(ordenamiento)
            .skip((pagina - 1) * limite)
            .limit(limite)
            .lean();

        res.status(200).json({
            productos,
            total,
            pagina,
            limite,
            clasificaciones: clasificaciones.sort()
        });
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


const validateStock = async (req, res) => {
  try {
    const items = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Debe enviar una lista de productos.' });
    }

    const ok = [];
    const insuficiente = [];

    for (const item of items) {
      const { productId, cantidad } = item;

      if (!productId || typeof cantidad !== 'number' || cantidad <= 0) {
        return res.status(400).json({ message: 'Cada ítem debe tener un productId y una cantidad mayor a 0.' });
      }

      const esIdValido = /^[a-f\d]{24}$/i.test(productId);
      const producto = esIdValido ? await Product.findById(productId) : null;

      // Si el producto no existe (o fue eliminado) no se puede vender: stock 0.
      const stock = producto ? producto.stock : 0;
      const resultado = { productId, cantidad, stock };

      if (producto && producto.stock >= cantidad) {
        ok.push(resultado);
      } else {
        insuficiente.push(resultado);
      }
    }

    res.status(200).json({ ok, insuficiente });
  } catch (error) {
    res.status(500).json({ message: 'Error al validar el stock', error: error.message });
  }
};

module.exports = { getProducts, createProduct, updateProduct, getProductById, deleteProduct, validateStock };

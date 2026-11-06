const Product = require('../models/Product');
const Order = require('../models/Order');

// Crea un pedido a partir del carrito: valida stock, lo descuenta de forma
// atómica y guarda el pedido. El pago se simula (no hay pasarela real).
const createOrder = async (req, res) => {
  try {
    // El userId sale del token (verifyToken ya lo dejó en req.usuario).
    const userId = req.usuario.id;
    const { productos, total } = req.body || {};

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: 'El carrito está vacío.' });
    }

    for (const item of productos) {
      if (!item.productId || !item.nombre ||
          typeof item.cantidad !== 'number' || item.cantidad < 1 ||
          typeof item.precioUnitario !== 'number') {
        return res.status(400).json({ message: 'Datos del pedido inválidos.' });
      }
    }

    // 1) Verificar que haya stock para todos los productos antes de tocar nada.
    const ids = productos.map(p => p.productId);
    const productosDB = await Product.find({ _id: { $in: ids } });
    const stockPorId = new Map(productosDB.map(p => [p._id.toString(), p.stock]));

    for (const item of productos) {
      const stock = stockPorId.get(item.productId);
      if (stock === undefined) {
        return res.status(404).json({ message: `Producto no encontrado: ${item.nombre}` });
      }
      if (stock < item.cantidad) {
        return res.status(400).json({ message: `Stock insuficiente para ${item.nombre}. Disponible: ${stock}` });
      }
    }

    // 2) Descontar stock de forma atómica. El filtro { stock: { $gte: cantidad } }
    //    garantiza que no se venda más de lo disponible aunque haya concurrencia.
    const descontados = [];
    for (const item of productos) {
      const actualizado = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.cantidad } },
        { $inc: { stock: -item.cantidad } },
        { new: true }
      );

      if (!actualizado) {
        // Rollback: devolvemos lo ya descontado y rechazamos el pedido.
        await Promise.all(descontados.map(d =>
          Product.updateOne({ _id: d.productId }, { $inc: { stock: d.cantidad } })
        ));
        return res.status(400).json({ message: `Stock insuficiente para ${item.nombre}.` });
      }

      descontados.push({ productId: item.productId, cantidad: item.cantidad });
    }

    // 3) Crear el pedido. Estado "Pago" porque el pago se simula en el frontend.
    const nuevoPedido = new Order({
      userId,
      productos: productos.map(p => ({
        productId: p.productId,
        nombre: p.nombre,
        cantidad: p.cantidad,
        precioUnitario: p.precioUnitario
      })),
      total,
      estado: 'Pago'
    });

    const pedidoGuardado = await nuevoPedido.save();
    res.status(201).json(pedidoGuardado);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el pedido', error: error.message });
  }
};

// Historial de pedidos de un usuario.
const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const pedidos = await Order.find({ userId }).sort({ fechaCreacion: -1 });
    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
  }
};

module.exports = { createOrder, getOrdersByUser };

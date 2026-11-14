const Product = require('../models/Product');
const Order = require('../models/Order');

const esIdValido = (id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);

// Crea un pedido a partir del carrito: valida stock, lo descuenta de forma
// atómica y guarda el pedido. El pago se simula (no hay pasarela real).
//
// Seguridad: del frontend solo se toman productId y cantidad. El nombre, el
// precio y el total se calculan con los datos de la base, para que nadie pueda
// mandar un precio inventado desde el navegador.
const createOrder = async (req, res) => {
  try {
    // El userId sale del token (verifyToken ya lo dejó en req.usuario).
    const userId = req.usuario.id;
    const { productos } = req.body || {};
    
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: 'El carrito está vacío.' });
    }

    for (const item of productos) {
      if (!esIdValido(item.productId) ||
          !Number.isInteger(item.cantidad) || item.cantidad < 1) {
        return res.status(400).json({ message: 'Datos del pedido inválidos.' });
      }
    }

    // Si el mismo producto viene repetido, sumamos las cantidades.
    const cantidadPorId = new Map();
    for (const item of productos) {
      cantidadPorId.set(item.productId, (cantidadPorId.get(item.productId) || 0) + item.cantidad);
    }

    // 1) Traer los productos de la base y verificar stock antes de tocar nada.
    const productosDB = await Product.find({ _id: { $in: [...cantidadPorId.keys()] } });
    const productoPorId = new Map(productosDB.map(p => [p._id.toString(), p]));

    const faltantes = [];
    for (const [productId, cantidad] of cantidadPorId) {
      const producto = productoPorId.get(productId);
      if (!producto) {
        faltantes.push({ productId, cantidad, stock: 0 });
      } else if (producto.stock < cantidad) {
        faltantes.push({ productId, cantidad, stock: producto.stock });
      }
    }

    if (faltantes.length > 0) {
      // Devolvemos el detalle para que el frontend pueda ajustar el carrito.
      return res.status(400).json({ message: 'Stock insuficiente para algunos productos.', insuficiente: faltantes });
    }

    // 2) Descontar stock de forma atómica. El filtro { stock: { $gte: cantidad } }
    //    garantiza que no se venda más de lo disponible aunque haya concurrencia.
    const descontados = [];
    for (const [productId, cantidad] of cantidadPorId) {
      const actualizado = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: cantidad } },
        { $inc: { stock: -cantidad } },
        { new: true }
      );

      if (!actualizado) {
        // Rollback: devolvemos lo ya descontado y rechazamos el pedido.
        await Promise.all(descontados.map(d =>
          Product.updateOne({ _id: d.productId }, { $inc: { stock: d.cantidad } })
        ));
        const actual = await Product.findById(productId);
        return res.status(400).json({
          message: 'Stock insuficiente para algunos productos.',
          insuficiente: [{ productId, cantidad, stock: actual ? actual.stock : 0 }]
        });
      }

      descontados.push({ productId, cantidad });
    }

    // 3) Armar el pedido con nombre y precio de la base, y calcular el total acá.
    const itemsPedido = [...cantidadPorId].map(([productId, cantidad]) => {
      const producto = productoPorId.get(productId);
      return {
        productId,
        nombre: producto.nombre,
        cantidad,
        precioUnitario: producto.precio
      };
    });
    const total = itemsPedido.reduce((suma, i) => suma + i.precioUnitario * i.cantidad, 0);

    // Estado "Pago" porque el pago se simula en el frontend.
    const nuevoPedido = new Order({ userId, productos: itemsPedido, total, estado: 'Pago' });

    try {
      const pedidoGuardado = await nuevoPedido.save();
      return res.status(201).json(pedidoGuardado);
    } catch (errorGuardado) {
      // Si no se pudo guardar el pedido, devolvemos el stock descontado.
      await Promise.all(descontados.map(d =>
        Product.updateOne({ _id: d.productId }, { $inc: { stock: d.cantidad } })
      ));
      throw errorGuardado;
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el pedido', error: error.message });
  }
};

// Historial de pedidos de un usuario. Cada usuario solo ve los suyos
// (un admin puede ver los de cualquiera).
const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!esIdValido(userId)) {
      return res.status(400).json({ message: 'Id de usuario inválido.' });
    }

    if (req.usuario.id !== userId && req.usuario.rol !== 'admin') {
      return res.status(403).json({ message: 'No podés ver los pedidos de otro usuario.' });
    }

    const pedidos = await Order.find({ userId }).sort({ fechaCreacion: -1 });
    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
  }
};

module.exports = { createOrder, getOrdersByUser };
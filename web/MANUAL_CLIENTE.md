# Manual de uso: Panel de Administración

Este sistema te permite gestionar todo tu catálogo de productos, recibir pedidos y configurar el envío de notificaciones. A continuación la explicación paso a paso cómo usar cada sección.

## 1. Ingresar al sistema

Para entrar al panel de administración:
1. Andá a `packingcenter.vercel.app/admin` .
2. Ingresá con tu correo y contraseña.
3. Si te equivocás, el sistema te avisará "Email o contraseña incorrectos".

## 2. Categorías

EJ: Bandejas, Vasos, Potes, etc.

- **Crear**: Hacé clic en "Nueva categoría". El "Nombre" es lo que ve el cliente. El "Orden" decide en qué posición aparece (el número 1 va primero).

- **Editar**: Hacé clic en el lápiz.

- **Ocultar**: Si destildás "Visible en la tienda", la categoría desaparece de la página pública pero se mantiene en tu panel.

- ⚠️ **No se puede borrar una categoría si tiene productos asignados**. Si querés eliminarla, primero tenés que mover o borrar los productos que están dentro de ella.

## 3. Productos

- **Crear un producto**:
  1. Hacé clic en "Nuevo producto".
  2. Completá nombre, categoría, descripción y medidas.
  3. Guardá. El producto recién creado no tiene precio ni foto todavía.

- **Agregar fotos**: Una vez creado el producto, en la parte inferior vas a ver "Fotos". Podés subir hasta 5MB por foto. La primera foto será la principal (la que se ve en el catálogo).

- **Presentaciones**: Es cómo se vende el producto. Un vaso se puede vender por "Unidad", "Paquete" o "Caja".
  1. En la sección "Presentaciones", hacé clic en "Agregar".
  2. Elegí el tipo, poné el precio ej: $250 y el stock.
  3. Guardá.

- **Descuentos por cantidad**: Dentro de cada presentación, podés agregar reglas (ej: "Si compra 10 o más paquetes, 5% de descuento").

- ⚠️ **No se puede borrar un producto si tiene presentaciones**. Borrá primero las presentaciones y luego el producto.


## 4. Cupones

Los cupones son códigos que el cliente ingresa en el carrito para obtener un descuento.

- **Crear un cupón**: Elegí un código (ej: `NAVIDAD`). Podés ponerle un límite de usos, fecha de vencimiento o dejarlo ilimitado.

- ⚠️ **El código no se puede cambiar** una vez creado. Si te equivocaste, borrá el cupón y creá uno nuevo.

- **Asignar productos**: Un cupón no sirve hasta que le asignás al menos un producto y presentación. Hacé clic en "Agregar" en la sección "Productos del cupón", elegí a qué producto y presentación aplica, y definí el porcentaje (ej: 15%).

- Un mismo cupón puede aplicarse a varios productos a la vez.
- Si querés quitarle el descuento a un producto, hacé clic en el tacho de basura al lado del mismo.


## 5. Pedidos

Acá ves todas las compras de tus clientes.

- **Pedidos nuevos**: Los pedidos que no abriste aparecen con un cartel azul "NUEVO".

- **Estados**: El flujo normal es: *Pendiente → Pagado → Preparando → Despachado → Entregado*.

  - Si un pago fue con Mercado Pago, el sistema lo marca como **Pagado** automáticamente.
  - Si el pago es en efectivo, te va a quedar como **Pendiente**. Cuando confirmes el pago, tenés que hacer clic en "Confirmar pago".

- **Cancelar**: Si el pedido no se concretó, podés cancelarlo. El stock vuelve automáticamente a la tienda.

- **Eliminar**: Solo podés eliminar un pedido si ya está cancelado.

- **Descargar**: Hacé clic en "Descargar pedido" para bajar una imagen (PNG) con todos los datos.

- **WhatsApp**: Al lado del teléfono del cliente hay un botón de WhatsApp. Al hacer clic, se abre el chat con el prefijo `+598`.


## 6. Configuración y Mails

- **Avisarme por mail**: Si lo activás, cada vez que un cliente compra te llega un correo con los datos del pedido.

- **Enviar confirmación al cliente**: Si lo activás, el cliente recibe un correo con el resumen de su compra (siempre que haya puesto su email).
- Ambas opciones son independientes. Podés tener una, la otra, las dos o ninguna.

- **Mail del proyecto**: Es la dirección a donde te van a llegar los avisos. Por defecto te llegan a tu Gmail.
- Si el sistema te muestra un error al querer activar los mails, avisar para corregir.


## Preguntas

**¿Cómo sé si un cliente ya pagó?**
Si el pedido dice "Pagado" en verde, ya pagó. Si dice "Pendiente", todavía no.

**¿Qué pasa si borro un producto que ya fue comprado?**
El pedido viejo no se rompe. El sistema guardó una "foto" de los datos del producto al momento de la compra.

**¿Cómo sé que el stock está bien?**
El sistema descuenta el stock automáticamente cuando marcás un pedido como "Pagado". Si cancelás el pedido, el stock vuelve.
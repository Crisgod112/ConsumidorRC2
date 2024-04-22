import amqplib from "amqplib";

const initBroker = async () => {
  try {
    let connection = await amqplib.connect("amqp://34.227.19.29");
    let ch = await connection.createChannel();

    const consumeMessage = async () => {
      try {
        await ch.consume("app.initial", async (msg: any) => {
          try {
            const datos = msg.content.toString();
            const headers = {
              "Content-Type": "application/json",
            };
            const datos2 = {
              method: "POST",
              headers,
              body: datos,
            };
            console.log(datos2)
            const response = await fetch("http://44.223.195.54:8000/pago/", datos2);
            if (!response.ok) {
             throw new Error(`Fetch error: ${response.status}`);
            }
             console.log("Respuesta de la API:", response);
            ch.ack(msg);
            consumeMessage();
          } catch (error) {
            console.error("Error al enviar los datos a la API:", error);
            // Reintentar consumir el mensaje después de un intervalo de tiempo
            setTimeout(consumeMessage, 5000); // Reintentar después de 5 segundos
          }
        });
      } catch (error) {
        console.error("Error al consumir el mensaje:", error);
        // Reintentar la conexión después de un intervalo de tiempo
        setTimeout(initBroker, 5000); // Reintentar después de 5 segundos
      }
    };

    consumeMessage();

    console.log("El broker ha iniciado correctamente");
  } catch (error) {
    console.log("Hubo un error al iniciar el broker", error);
  }
};

initBroker();

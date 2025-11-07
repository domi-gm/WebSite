document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connectBtn');
  const arduinoValue = document.getElementById('arduinoValue');

  let port;
  let reader;

  async function connectArduino() {
    try {
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      reader = textDecoder.readable.getReader();

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        if (value) {
          buffer += value; // append incoming data
          let lines = buffer.split("\n"); // split on newline
          buffer = lines.pop(); // last line may be incomplete
          lines.forEach(line => {
            const match = line.match(/Measured Voltage: ([\d.]+)/);
            if (match) {
              arduinoValue.textContent = match[1] + " V";
            }
          });
        }
      }
    } catch (err) {
      console.error('Error connecting to Arduino:', err);
    }
  }

  connectBtn.addEventListener('click', connectArduino);
});
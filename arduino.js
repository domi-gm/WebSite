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
            const trimmed = line.trim();
            if (!trimmed) return;

            // Prefer explicit 'Measured Voltage: <num>' pattern
            const measuredMatch = trimmed.match(/Measured Voltage:\s*([+-]?\d+(?:\.\d+)?)/i);
            if (measuredMatch) {
              const val = parseFloat(measuredMatch[1]);
              arduinoValue.textContent = val.toFixed(2) + " V";
              return;
            }

            // If the sketch sends just a raw number like '0.32', accept that too
            const numOnlyMatch = trimmed.match(/^([+-]?\d+(?:\.\d+)?)$/);
            if (numOnlyMatch) {
              const val = parseFloat(numOnlyMatch[1]);
              arduinoValue.textContent = val.toFixed(2) + " V";
              return;
            }

            // As a fallback, extract the first number found anywhere in the line
            const anyNum = trimmed.match(/([+-]?\d+(?:\.\d+)?)/);
            if (anyNum) {
              const val = parseFloat(anyNum[1]);
              arduinoValue.textContent = val.toFixed(2) + " V";
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
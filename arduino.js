document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connectBtn');
  const arduinoValue = document.getElementById('arduinoValue');

  // Check for Web Serial API support
  if (!('serial' in navigator)) {
    connectBtn.textContent = 'Not Supported';
    connectBtn.disabled = true;
    arduinoValue.textContent = 'Web Serial API not available in this browser.';
    return;
  }

  let port;
  let reader;
  let keepReading = true;

  async function connectArduino() {
    if (port) {
      // If port is already set, this is a disconnect request
      keepReading = false;
      if (reader) {
        await reader.cancel();
      }
      if (port.readable) {
        // The reader stream is already cancelled, just need to close the port
      }
      await port.close();
      port = null;
      connectBtn.textContent = 'Connect Pad';
      arduinoValue.textContent = '-- V';
      return;
    }

    // --- Connection Logic ---
    try {
      port = await navigator.serial.requestPort();
      connectBtn.textContent = 'Connecting...';
      connectBtn.disabled = true;
      await port.open({ baudRate: 9600 });

      connectBtn.textContent = 'Disconnect';
      connectBtn.disabled = false;
      keepReading = true;

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      reader = textDecoder.readable.getReader();

      let buffer = "";

      while (port.readable && keepReading) {
        try {
            const { value, done } = await reader.read();
            if (done) {
              break; // Reader has been released
            }
            if (value) {
              buffer += value; // append incoming data
              let lines = buffer.split("\n"); // split on newline
              buffer = lines.pop() || ""; // last line may be incomplete, ensure buffer is not undefined

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
        } catch (error) {
            // This error might happen if the device is unplugged
            if (error.toString().includes("The device has been lost.")) {
                arduinoValue.textContent = "Device lost";
                if(reader){
                    reader.releaseLock();
                }
                await port.close();
                port = null;
                connectBtn.textContent = 'Connect Pad';
            } else {
                console.error('Error during reading:', error);
                arduinoValue.textContent = "Read Error";
            }
            break; // Exit the loop on error
        }
      }
      
      // Cleanup after loop finishes
      if (reader) {
        reader.releaseLock();
      }
      await readableStreamClosed.catch(() => {}); // Ignore errors on closing

    } catch (err) {
      console.error('Error connecting to Arduino:', err);
      arduinoValue.textContent = err.message.includes("No port selected") ? "Connection cancelled" : "Error";
      port = null; // Reset port on error
      connectBtn.textContent = 'Connect Pad';
      connectBtn.disabled = false;
    }
  }

  connectBtn.addEventListener('click', connectArduino);
});
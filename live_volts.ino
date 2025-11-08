#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// LCD setup
LiquidCrystal_I2C lcd(0x27, 16, 2);  // Change address if needed (0x3F possible)

// Pins
const int sensorPin = A0;    // Voltage divider input
const float R1 = 10000.0;    // Upper resistor value
const float R2 = 1000.0;     // Lower resistor value
const float Vref = 5.0;      // Arduino reference voltage

// Timing / smoothing
const unsigned long sampleInterval = 200; // ms
unsigned long lastMillis = 0;
float lastPrinted = -1.0;
const float printThreshold = 0.01; // volts

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Footstep Energy");
  delay(1500);
  lcd.clear();

  Serial.begin(9600);
}

void loop() {
  unsigned long now = millis();
  if (now - lastMillis < sampleInterval) return;
  lastMillis = now;

  int sensorValue = analogRead(sensorPin);
  float voltageA0 = sensorValue * (Vref / 1023.0);
  float piezoVoltage = voltageA0 * ((R1 + R2) / R2);

  // Update LCD (only when changed enough)
  if (fabs(piezoVoltage - lastPrinted) >= printThreshold) {
    lcd.setCursor(0, 0);
    lcd.print("Volt: ");
    lcd.print(piezoVoltage, 2);
    lcd.print(" V   ");
  }

  // Machine-friendly JSON output (one JSON object per line)
  // Example line: {"v":2.74}
  const float idk = 0.01;
  if(piezoVoltage>idk){
   Serial.print("{\"v\":");
   Serial.print(piezoVoltage);
   Serial.println("}");
  }
 

  lastPrinted = piezoVoltage;
}

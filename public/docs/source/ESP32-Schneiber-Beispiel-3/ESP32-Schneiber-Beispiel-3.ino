#include &lt;Arduino.h&gt;
#include &lt;WiFi.h&gt;
#include &lt;WiFiMulti.h&gt;
#include &lt;HTTPClient.h&gt;
// Importiert die notwendigen Bibliotheken.

WiFiMulti wifiMulti; // Erschaffe eine WiFiMulti variable, die mehrere Netzwerke speichern kann.

void setup() {
  Serial.begin(115200);                               // Starte die Serielle Schnitstelle mit 115200 bits/s.
  for (uint8_t t = 4; t > 0; t--) {                   // Warte ein paar Sekunden.
    Serial.printf("[SETUP] WAIT %d...\n", t);         // Schreibe es auch in die Serielle Schnittstelle.
    Serial.flush();
    delay(1000);
  }
  wifiMulti.addAP("SSID", "PASSWORD");                // Füge ein Netzwerk der Konfiguration hinzu. (SSID = Name, PASSWORD = Passwort)
}

void loop() {

  const uint64_t now = millis();                     // Eine konstante Variable wird mit dem Namen "now" definiert und die derzeitige Zeit seit dem Start des Mikrokontrollers wird eingesetzt.
  static uint64_t last = 0;                          // Eine neue statische Variable "last" wird auch erstellt und mit null initialisiert.

  if (now > (5000 + last)) {                         // Ist "now" größer als die letzte Zeit plus 5000? Wenn Ja, führe den Code in den geschwungenen Klammern aus.
    
    if ((wifiMulti.run() == WL_CONNECTED)) {         // Warte darauf, dass sich der Chip mit dem Netzwerk verbunden hat.

      HTTPClient http;                               // Erstelle eine HTTPClient variable, mit der wir HTTP-Anfragen senden können.

      Serial.print("[HTTP] begin...\n");             // Teile mit, dass eine Anfrage erstellt wird.
      http.begin("http://google.at");                // URL die wir erhalten wollen.

      int httpCode = http.GET();                     // Verbinde dich mit dem Server und sende die Header

      if (httpCode > 0) {                            // httpCode ist negativ, wenn die Anfrage fehl schlägt.
        Serial.printf("[HTTP] GET... code: %d\n", httpCode); // Teile mit, welchen HTTP-Code wir erhalten haben.

        if (httpCode == HTTP_CODE_OK) {             // Wurde die Datei gefunden? (Status 200 ist "Ok, gefunden")
          String payload = http.getString();        // Speichere die Datei in einen String
          Serial.println(payload);                  // Schreibe den Strin in die Serielle Schnittstelle
        }
      } else {
        Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());   // Wenn die Anfrage fehlgeschlagen ist, schicke den Fehler.
      }

      http.end();                                   // Beende die Anfrage
    }

    last = now;                                    // "last" ist "now". Der letzte Zeitpunkt des Aufrufs ist jetzt.
    
  }
}

#include &lt;WiFi.h&gt;
#include &lt;WiFiClient.h&gt;
#include &lt;WebServer.h&gt;
#include &lt;ESPmDNS.h&gt;
// Importiert die notwendigen Bibliotheken

const char* ssid     = "......";    // Das WLan-Netzwerk von bspw. deinem Handy-Hotspot 
const char* password = "......";    // Das Passwort dazu.

WebServer server(80);               // Der Webserver wird auf Port 80 initialisiert.

const int led = 26;                 // Pin der LED

void handleNotFound() {             // Wenn eine "Datei" nicht gefunden wird, wird diese Funktion ausgeführt.
  digitalWrite(led, 1);                                                   // Setze den Ausgang der led High (1)
  String message = "File Not Found\n\n";                                  // Erstelle einen String mit der Fehlermeldung
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i = 0; i < server.args(); i++) {                           // Füge die Argumente der Anfrage hinzu (domain.tld/pfad?argument1=wert1&argument2=wert2)
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);                                // Sende die Antwort als Plaintext und dem HTTP-Statuscode 404. Siehe https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
  digitalWrite(led, 0);                                                   // Setze den Ausgan der led auf Low (0)
}

void setup(void) {                   // Setup, das wird ausgeführt wenn der ESP gestarte/neugestarte wird/wurde.
  pinMode(led, OUTPUT);              // Setze den Ausgan "led" auf OUTPUT
  digitalWrite(led, 0);              // Schreibe 0 auf den Ausgang
  Serial.begin(115200);              // Starte die Serielle Schnitstelle mit 115200 bits/s
  WiFi.begin(ssid, password);        // Setze die Zugansdaten des WLan-Netwerkes
  Serial.println("");

  while (WiFi.status() != WL_CONNECTED) {   // Warte bis sich der ESP mit dem Netzwerk verbunden hat
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to ");           // Schreibe den Namen des Netwerks in die Serielle
  Serial.println(ssid);
  Serial.print("IP address: ");            // Schreibe die IP des ESP aus
  Serial.println(WiFi.localIP());

  if (MDNS.begin("esp32")) {
    Serial.println("MDNS responder started");
  }


  // Wenn der ESP die Anfrage http://&lt;ip&gt;/ erhält antworte mit "Hello world!"
  server.on("/", []() {
    server.send(200, "text/html", "&lt;html&gt;&lt;body&gt;&lt;h1&gt;Hello world!&lt;/h1&gt;&lt;p&gt;Hey this works!&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;");
  });

  // Wenn der ESP eine ungültige Anfrage erhält, antworte mit der "handleNotFound"-Methode
  server.onNotFound(handleNotFound);

  server.begin();                         // Starte den Webserver
  Serial.println("HTTP server started");
}

void loop(void) {
  server.handleClient();                  // Wenn ein Client existiert, verarbeite ihn
}

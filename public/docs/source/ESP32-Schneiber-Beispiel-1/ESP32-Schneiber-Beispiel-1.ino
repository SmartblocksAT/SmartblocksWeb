#define LEDPIN 26                         // Pin an der die LED angeschlossen ist.
#define FREQUENCY 1000                    // Zeit zwischen dem Umschalten der LED in Millisekunden (Sekunde/1000)

void setup() {
  pinMode(LEDPIN, OUTPUT);                // Der Pin für die LED wird als Ausgang definiert.
}

void Task() {                             // Hier ist die Hauptmethode definiert, sie beinhaltet den

  bool ledOutput = digitalRead(LEDPIN);   // Lese den Wert des "LEDPIN"-Pins ein und speichere es in einer bool'schen Variable.
  digitalWrite(LEDPIN, !ledOutput);       // Setze den Wert des "LEDPIN"-Pins auf das gegenteil der bool-Variable.
}

void loop() {
  const uint64_t now = millis();          // Eine konstante Variable wird mit dem Namen "now" definiert und die derzeitige Zeit seit dem Start des Mikrokontrollers wird eingesetzt.
  static uint64_t last = 0;               // Eine neue statische Variable "last" wird auch erstellt und mit null initialisiert.

  if (now > (FREQUENCY + last)) {         // Ist "now" größer als die letzte Zeit plus der Frequenz? Wenn Ja, führe den Code in den geschwungenen Klammern aus.
    Task();                               // Die Methode "Task" wird aufgerufen.
    last = now;                           // "last" ist "now". Der letzte Zeitpunkt des Aufrufs ist jetzt.
  }
}

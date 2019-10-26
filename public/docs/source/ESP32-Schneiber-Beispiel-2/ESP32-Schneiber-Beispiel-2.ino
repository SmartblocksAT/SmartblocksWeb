#define BUTTONPIN 13                      // Pin an der die LED angeschlossen ist.
#define LEDPIN 26                         // Pin an der der Taster angeschlossen ist.
#define FREQUENCY 10                      // Frequenz mit dem der Task ausgeführt werden.

void setup() {
  pinMode(BUTTONPIN, INPUT);              // Der Pin für den Taster wird als Eingang definiert.
  pinMode(LEDPIN, OUTPUT);                // Der Pin für die LED wird als Ausgang definiert.
}

void Task() {                             // Hier ist die Hauptmethode definiert, sie beinhaltet den

  bool buttonInput = digitalRead(BUTTONPIN);   // Lese den Wert des "BUTTONPIN"-Pins ein und speichere es in einer bool'schen Variable.
  digitalWrite(LEDPIN, buttonInput);           // Setze den Wert des "LEDPIN"-Pins auf das der bool-Variable.
}

void loop() {
  const uint64_t now = millis();          // Eine konstante Variable wird mit dem Namen "now" definiert und die derzeitige Zeit seit dem Start des Mikrokontrollers wird eingesetzt.
  static uint64_t last = 0;               // Eine neue statische Variable "last" wird auch erstellt und mit null initialisiert.

  if (now > (FREQUENCY + last)) {         // Ist "now" größer als die letzte Zeit plus der Frequenz? Wenn Ja, führe den Code in den geschwungenen Klammern aus.
    Task();                               // Die Methode "Task" wird aufgerufen.
    last = now;                           // "last" ist "now". Der letzte Zeitpunkt des Aufrufs ist jetzt.
  }
}

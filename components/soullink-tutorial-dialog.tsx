import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ChevronRight,
  Download,
  Gamepad2,
  Shuffle,
  Link,
  Users,
} from "lucide-react";

const SoullinkTutorialDialog = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Was ist ein Pokemon Soullink?",
      icon: <Link className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Ein Pokemon Soullink ist eine besondere Herausforderung für zwei
            Spieler, die zeitgleich Pokemon-Spiele spielen.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Grundregeln:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Beide Spieler spielen zur gleichen Zeit</li>
              <li>Gefangene Pokemon werden "gelinkt" (verbunden)</li>
              <li>Stirbt ein Pokemon, stirbt auch sein Partner</li>
              <li>Nur ein Pokemon pro Route/Gebiet fangen</li>
              <li>Alle Pokemon müssen Spitznamen erhalten</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "Emulator herunterladen",
      icon: <Download className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Für Pokemon Soullink benötigst du einen Emulator, um die Spiele auf
            deinem Computer zu spielen.
          </p>
          <div className="space-y-3">
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold text-green-700">
                Game Boy Advance (Empfohlen)
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Für Pokemon Ruby, Sapphire, Emerald, FireRed, LeafGreen
              </p>
              <div className="mt-2 text-sm">
                <strong>Empfohlene Emulatoren:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>VisualBoy Advance</li>
                  <li>mGBA (sehr stabil)</li>
                  <li>No$GBA</li>
                </ul>
              </div>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold text-blue-700">Nintendo DS</h4>
              <p className="text-sm text-gray-600 mt-1">
                Für Pokemon Diamond, Pearl, Platinum, HeartGold, SoulSilver
              </p>
              <div className="mt-2 text-sm">
                <strong>Empfohlene Emulatoren:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>DeSmuME</li>
                  <li>melonDS</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Hinweis:</strong> Du benötigst eine legale ROM-Datei des
              Spiels, das du besitzt.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "ROMs beschaffen",
      icon: <Gamepad2 className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-semibold text-red-700 mb-2">
              ⚠️ Wichtiger Hinweis zur Legalität
            </h4>
            <p className="text-sm text-red-600">
              ROMs sollten nur von Spielen erstellt werden, die du bereits
              physisch besitzt. Das Herunterladen von ROMs aus dem Internet kann
              Urheberrechtsverletzungen darstellen.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Legale Methoden:</h4>
            <div className="space-y-2">
              <div className="border rounded-lg p-3">
                <h5 className="font-medium">
                  1. ROM von eigener Cartridge erstellen
                </h5>
                <p className="text-sm text-gray-600 mt-1">
                  Mit spezieller Hardware (Flashkarten, Dumping-Geräte) kannst
                  du ROMs von deinen eigenen Spielen erstellen.
                </p>
              </div>
              <div className="border rounded-lg p-3">
                <h5 className="font-medium">2. Digitale Käufe</h5>
                <p className="text-sm text-gray-600 mt-1">
                  Einige Pokemon-Spiele sind legal über digitale Plattformen
                  erhältlich.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Tipp:</strong> Beliebte Soullink-Kombinationen sind
              Ruby/Sapphire, FireRed/LeafGreen, oder Diamond/Pearl.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Randomizer verwenden",
      icon: <Shuffle className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Ein Randomizer macht das Soullink noch spannender, indem er
            Pokemon-Positionen, Movesets und mehr zufällig verändert.
          </p>

          <div className="space-y-3">
            <h4 className="font-semibold">Beliebte Randomizer:</h4>
            <div className="space-y-2">
              <div className="border rounded-lg p-3">
                <h5 className="font-medium text-green-700">
                  Universal Pokemon Randomizer ZX
                </h5>
                <p className="text-sm text-gray-600 mt-1">
                  Der beste Randomizer für die meisten Pokemon-Spiele (Gen 1-7)
                </p>
                <div className="mt-2 text-sm">
                  <strong>Funktionen:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Wild Pokemon randomisieren</li>
                    <li>Trainer Pokemon anpassen</li>
                    <li>Movesets und Fähigkeiten ändern</li>
                    <li>Items und TMs randomisieren</li>
                  </ul>
                </div>
              </div>
            </div>

            <h4 className="font-semibold mt-4">Anwendung:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Randomizer herunterladen und starten</li>
              <li>ROM-Datei auswählen</li>
              <li>
                Gewünschte Einstellungen wählen:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>
                    <strong>Wild Pokemon:</strong> Komplett zufällig oder
                    ähnliche Stärke
                  </li>
                  <li>
                    <strong>Starter Pokemon:</strong> Zufällige Starter
                  </li>
                  <li>
                    <strong>Trainer:</strong> Zufällige Teams für Trainer
                  </li>
                </ul>
              </li>
              <li>
                Beide Spieler verwenden denselben Seed für identische
                Randomisierung
              </li>
              <li>Randomisierte ROM speichern</li>
            </ol>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>Soullink-Tipp:</strong> Verwendet denselben
              Randomizer-Seed, damit beide Welten identisch sind!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Spiel starten & Regeln",
      icon: <Users className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold">Vorbereitung:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Beide Spieler starten zur gleichen Zeit</li>
            <li>Kommunikation über Discord/Teamspeak einrichten</li>
            <li>Entscheiden, welche Pokemon gelinkt werden</li>
            <li>Tracker/Spreadsheet für gefangene Pokemon erstellen</li>
          </ol>

          <h4 className="font-semibold mt-4">Erweiterte Regeln:</h4>
          <div className="space-y-2">
            <div className="border rounded-lg p-3">
              <h5 className="font-medium">Link-Methoden:</h5>
              <ul className="text-sm list-disc list-inside ml-2">
                <li>
                  <strong>Encounter-Link:</strong> Pokemon aus derselben Route
                  werden gelinkt
                </li>
                <li>
                  <strong>Level-Link:</strong> Pokemon ähnlicher Level werden
                  gelinkt
                </li>
                <li>
                  <strong>Type-Link:</strong> Pokemon gleichen Typs werden
                  gelinkt
                </li>
              </ul>
            </div>

            <div className="border rounded-lg p-3">
              <h5 className="font-medium">Zusätzliche Herausforderungen:</h5>
              <ul className="text-sm list-disc list-inside ml-2">
                <li>Set-Kampfmodus (keine Vorschau auf Gegner-Pokemon)</li>
                <li>Keine Items im Kampf verwenden</li>
                <li>Level-Cap basierend auf nächstem Gym-Leader</li>
                <li>Keine Doppelgänger-Pokemon</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <h5 className="font-medium text-purple-700">Erfolgsgeheimnis:</h5>
            <p className="text-sm text-purple-600 mt-1">
              Kommunikation ist alles! Plant gemeinsam eure Strategien und passt
              aufeinander auf.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-transparent"
        >
          <BookOpen className="h-4 w-4" />
          Tutorial
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Pokemon Soullink Tutorial
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Navigation */}
          <div className="flex flex-wrap gap-2 border-b pb-4">
            {tutorialSteps.map((step, index) => (
              <Button
                key={index}
                variant={currentStep === index ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentStep(index)}
                className="flex items-center gap-2 text-xs"
              >
                {step.icon}
                Schritt {index + 1}
              </Button>
            ))}
          </div>

          {/* Current Step Content */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                {tutorialSteps[currentStep].icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {tutorialSteps[currentStep].title}
              </h3>
            </div>

            <div className="pl-0">{tutorialSteps[currentStep].content}</div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              size="sm"
            >
              Zurück
            </Button>

            <span className="text-sm text-gray-500">
              {currentStep + 1} von {tutorialSteps.length}
            </span>

            <Button
              onClick={() =>
                setCurrentStep(
                  Math.min(tutorialSteps.length - 1, currentStep + 1)
                )
              }
              disabled={currentStep === tutorialSteps.length - 1}
              size="sm"
              className="flex items-center gap-1"
            >
              Weiter
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SoullinkTutorialDialog;

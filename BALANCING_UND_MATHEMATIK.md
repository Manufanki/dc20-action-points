# Mathematische Analyse & Balancing-Guide: DC20-Kampfsystem in D&D 5e

Dieses Dokument analysiert mathematisch, warum klassische D&D 5e Monster in deinem **DC20-inspirierten Action-Point-System** zu schwach sind, wie viel Schaden deine Spieler pro Runde (DPR = *Damage Per Round*) tatsächlich verursachen und mit welchen **exakten Umrechnungsformeln und Regel-Anpassungen** du das System perfekt ausbalancierst.

---

## 1. Mathematische Grundlagen deines Systems

### 1.1 Trefferwahrscheinlichkeiten mit der Multiple Check Penalty (MCP)
Es sei $T = \text{AC} - \text{Angriffsbonus}$ der benötigte Mindestwurf auf dem W20 (Standard in D&D 5e nach *Bounded Accuracy*: **$T = 8$**, also **65 % Grundtrefferchance**).

Wenn ein Spieler in einem Zug mehrfach angreift, würfelt er beim $k$-ten Angriff mit $k$ W20 und nimmt den **niedrigsten** Wert ($k=1$: Normal, $k=2$: 1× Nachteil, $k=3$: 2× Nachteil, $k=4$: 3× Nachteil).

Die Wahrscheinlichkeit, dass das Ergebnis **mindestens $x$** beträgt, lautet:
$$P_{\text{Nachteil}}(W \ge x) = \left(\frac{21 - x}{20}\right)^k$$

Hat der Spieler hingegen $v$-fachen **Vorteil** (würfelt $k = v + 1$ W20 und nimmt den **höchsten** Wert), lautet die Formel:
$$P_{\text{Vorteil}}(W \ge x) = 1 - \left(\frac{x - 1}{20}\right)^{v+1}$$

Damit teilen sich die Treffergrade für $T = 8$ (65 % Grundtrefferchance) wie folgt auf:

| Wurf-Modus | Gesamt-Trefferchance ($\ge 8$) | Normaler Treffer ($8\text{–}12$) | Heavy Hit ($13\text{–}17$) | Brutal Hit ($18\text{–}19$) | Kritisch ($\text{Nat } 20$) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **2× Vorteil** (3W20 hoch) | **95,7 %** | 17,3 % | 39,8 % | 24,3 % | **14,3 %** |
| **1× Vorteil** (2W20 hoch) | **87,8 %** | 23,8 % | 36,3 % | 18,0 % | **9,8 %** |
| **1. Angriff (Normal, 1W20)** | **65,0 %** | 25,0 % | 25,0 % | 10,0 % | **5,0 %** |
| **2. Angriff (1× Nachteil, 2W20)** | **42,3 %** | 26,3 % | 13,8 % | 2,0 % | **0,25 %** |
| **3. Angriff (2× Nachteil, 3W20)** | **27,5 %** | 21,1 % | 6,1 % | 0,3 % | **0,01 %** |
| **4. Angriff (3× Nachteil, 4W20)** | **17,9 %** | 15,3 % | 2,5 % | 0,05 % | **0,00 %** |

---

### 1.2 Statischer Schaden vs. D&D 5e Würfelschaden (Einzelangriff)
In Vanilla D&D 5e macht ein Würfel mit Maximum $D_{\max}$ im Schnitt $\frac{D_{\max} + 1}{2}$ Schaden (z. B. $1\text{W}8 = 4{,}5$; $2\text{W}6 = 7{,}0$).
In deinem System hängt der Schaden vom Wurf ab:
- **Normal ($T$ bis $T+4$):** $0{,}5 \cdot D_{\max} + M$
- **Heavy ($T+5$ bis $T+9$):** $\lceil 0{,}75 \cdot D_{\max} \rceil + M$
- **Brutal ($T+10$ bis $19$):** $1{,}0 \cdot D_{\max} + M$
- **Kritisch ($\text{Nat } 20$):** $1{,}5 \cdot D_{\max} + M$

Für einen **Einzelangriff bei Standard-AC ($T = 8$)** ergibt sich folgender Erwartungswert:
$$E(\text{Schaden}) = 0{,}25 \cdot (0{,}5 D_{\max} + M) + 0{,}25 \cdot (0{,}75 D_{\max} + M) + 0{,}10 \cdot (D_{\max} + M) + 0{,}05 \cdot (1{,}5 D_{\max} + M)$$
$$E(\text{Schaden}) = \mathbf{0{,}4875 \cdot D_{\max} + 0{,}65 \cdot M}$$

Zum Vergleich in **Vanilla D&D 5e ($2\text{W}6$, $D_{\max}=12$)**:
$$E_{\text{Vanilla}}(\text{Schaden}) = 0{,}60 \cdot (7 + M) + 0{,}05 \cdot (14 + M) = \mathbf{0{,}4083 \cdot D_{\max} + 0{,}65 \cdot M}$$

> **Erkenntnis 1:** Schon ein einzelner normaler Angriff macht durch die Heavy/Brutal-Stufen im Schnitt **ca. +14 % bis +20 % mehr Schaden** als in Vanilla D&D 5e – und bei Vorteil sogar **+35 % bis +45 % mehr Schaden**, weil Vorteil überproportional viele *Heavy*, *Brutal* und *Critical Hits* erzeugt!

---

## 2. Spieler-Schaden pro Runde (DPR-Vergleich)

### 2.1 Beispiel 1: Zweihand-Kämpfer / Barbar ($2\text{W}6 + 3$, z. B. Großschwert auf Level 1–3)
- **Schadenswerte pro Treffergrad:**
  - Normal: $6 + 3 = 9$
  - Heavy: $9 + 3 = 12$
  - Brutal: $12 + 3 = 15$
  - Kritisch: $18 + 3 = 21$

#### Erwartungswert pro Angriff gegen Standard-AC ($T = 8$, z. B. AC 13 bei $+5$ Angriff):
1. **1. Angriff (Normal):** $0{,}25(9) + 0{,}25(12) + 0{,}10(15) + 0{,}05(21) = \mathbf{7{,}80\text{ Schaden}}$
2. **2. Angriff (1× Nachteil):** $0{,}2625(9) + 0{,}1375(12) + 0{,}0200(15) + 0{,}0025(21) = \mathbf{4{,}37\text{ Schaden}}$
3. **3. Angriff (2× Nachteil):** $0{,}2106(9) + 0{,}0606(12) + 0{,}0033(15) + 0{,}0001(21) = \mathbf{2{,}67\text{ Schaden}}$
4. **4. Angriff (3× Nachteil):** $0{,}1529(9) + 0{,}0251(12) + 0{,}0005(15) = \mathbf{1{,}68\text{ Schaden}}$
- *Sonderfall 1. Angriff mit 1× Vorteil:* $0{,}2375(9) + 0{,}3625(12) + 0{,}1800(15) + 0{,}0975(21) = \mathbf{11{,}24\text{ Schaden}}$

#### Vergleich der kompletten Runde (Level 1–4):

| Aktion / Strategie (4 AP) | Erwarteter Schaden pro Runde (DPR) | Vergleich zu Vanilla 5e |
| :--- | :---: | :---: |
| **Vanilla D&D 5e** (Bewegung + 1 Angriff) | **6,85 DPR** | 100 % (Basis) |
| **Homebrew: 1 AP Bewegen + 2 Angriffe + 1 AP Vorteil** | **15,60 DPR** | **+128 %** ($2{,}28\times$) |
| **Homebrew: 1 AP Bewegen + 3 Angriffe** | **14,84 DPR** | **+117 %** ($2{,}17\times$) |
| **Homebrew: Im Stand 4 Angriffe** | **16,52 DPR** | **+141 %** ($2{,}41\times$) |
| **Homebrew: 4 Angriffe mit Vorteil-Quelle** *(z. B. Barbar „Rücksichtsloser Angriff“ oder liegender Gegner)* | **26,08 DPR** | **+281 %** ($3{,}81\times$ vs. Basis / $2{,}67\times$ vs. Vanilla-Barbar) |

---

### 2.2 Beispiel 2: Einhandwaffe / Fernkampf / Zaubertrick ($1\text{W}8 + 3$, Level 1–3)
- **Schadenswerte pro Treffergrad:** Normal: $7$ | Heavy: $9$ | Brutal: $11$ | Kritisch: $15$
- **Einzelangriffe ($T=8$):**
  - 1. Angriff (Normal): **5,85** | 2. Angriff (Nachteil 1): **3,33** | 3. Angriff (Nachteil 2): **2,06** | 4. Angriff (Nachteil 3): **1,30**

| Aktion / Strategie (4 AP) | Erwarteter Schaden pro Runde (DPR) | Vergleich zu Vanilla 5e |
| :--- | :---: | :---: |
| **Vanilla D&D 5e** (Bewegung + 1 Angriff) | **5,10 DPR** | 100 % (Basis) |
| **Homebrew: 1 AP Bewegen + 3 Angriffe** | **11,24 DPR** | **+120 %** ($2{,}20\times$) |
| **Homebrew: Im Stand 4 Angriffe** *(z. B. Bogenschütze / Feuerpfeil)* | **12,54 DPR** | **+146 %** ($2{,}46\times$) |
| **Homebrew: 4 Angriffe mit Vorteil-Quelle** | **19,43 DPR** | **+281 %** ($3{,}81\times$) |

---

### 2.3 Die „Niedrige-AC-Falle“ (Warum Oger, Zombies & Bestien sofort platzen)
Viele D&D 5e Monster haben absichtlich eine **niedrige AC (AC 8 bis 12)** und gleichen das in Vanilla 5e durch mehr Trefferpunkte aus (z. B. **Oger**: AC 11, 59 HP; **Zombie**: AC 8, 22 HP).

In deinem System passiert bei niedriger AC ein **doppelter Multiplikator-Effekt**:
1. Selbst Angriffe mit 2-fachem oder 3-fachem Nachteil treffen noch sehr häufig.
2. Fast jeder normale Treffer wird automatisch zu einem **Heavy Hit ($AC+5$)** oder **Brutal Hit ($AC+10$)** hochgestuft!

**Rechenbeispiel: Großschwert ($2\text{W}6+3$, Angriff $+5$) gegen einen Oger (AC 11, also $T = 6$, 75 % Trefferchance):**
- **1. Angriff (Normal):** **9,30 Schaden** *(45 % aller Würfe sind Heavy, Brutal oder Krit!)*
- **2. Angriff (1× Nachteil):** **6,02 Schaden** *(56,3 % Trefferchance)*
- **3. Angriff (2× Nachteil):** **4,22 Schaden** *(42,2 % Trefferchance)*
- **4. Angriff (3× Nachteil):** **3,05 Schaden** *(31,6 % Trefferchance)*
- **Gesamtschaden (1 Spieler, 4 AP):** **22,59 DPR** (statt **7,85 DPR** in Vanilla 5e = **+188 % Schaden!**).

> **Folge im Spiel:** Eine Gruppe aus 4 Spielern auf Level 2 verursacht gegen einen Oger (AC 11, 59 HP) in einer einzigen Runde **ca. 75 bis 90 Schaden**. Der Oger stirbt in Runde 1, oft noch bevor der 4. Spieler überhaupt am Zug war!

---

### 2.4 Gruppen-DPR nach Stufen (4 Spieler insgesamt)

| Charakter-Stufe | Vanilla 5e (4 Spieler DPR) | Dein System aktuell (4 Spieler DPR) | Verhältnis (Faktor) |
| :---: | :---: | :---: | :---: |
| **Stufe 1–2** | 22 – 28 DPR | **50 – 75 DPR** | **ca. 2,3× bis 2,7×** |
| **Stufe 3–4** | 30 – 40 DPR | **65 – 95 DPR** | **ca. 2,2× bis 2,4×** |
| **Stufe 5–8** *(ohne Extra-Attack-Anpassung)* | 65 – 90 DPR | **90 – 140 DPR** | **ca. 1,4× bis 1,6×** |
| **Stufe 5–8** *(mit Zauber-Spam / Vorteil)* | 65 – 90 DPR | **130 – 190 DPR** | **ca. 2,0×** |

---

## 3. Die 6 Schwachstellen im aktuellen Regelwerk (Warum Monster zu schwach sind)

Neben dem reinen Waffenschaden gibt es **6 strukturelle Gründe**, warum D&D-Monster in deinem System untergehen:

### Problem 1: Angriff-Spamming auf Stufe 1–4
In D&D 5e sind Monster der Herausforderungsgrade (CR) 1/4 bis 4 darauf ausgelegt, dass Helden **1 Angriff pro Runde** haben. Durch 4 AP ab Stufe 1 greifen deine Helden schon auf Stufe 1 **3 bis 4 Mal pro Runde** an (insbesondere Fernkämpfer, die sich nicht bewegen müssen).

### Problem 2: Zaubertricks (Cantrips) & Zauber mit Rettungswürfen umgehen das System
- In deinem Beispiel 1 kostet der Zaubertrick *Feuerpfeil* nur **1 AP**. Ein Magier oder Hexenmeister kann im Stand also **4 Zaubertricks pro Runde** abfeuern! Ab Stufe 5 skaliert ein Zaubertrick in D&D 5e automatisch auf 2 Schadenswürfel ($2\text{W}10$), wodurch 4 Zaubertricks völlig eskalieren.
- **Rettungswurf-Zauber umgehen die Multiple Check Penalty:** Da bei Zaubern wie *Feuerball*, *Brennende Hände* oder *Heilige Flamme* **das Monster** würfelt (und nicht der Zauberwirkende), greift die Multiple Check Penalty nicht! Ein Magier kann für $2\text{ AP} + 2\text{ AP}$ **zwei Feuerbälle in derselben Runde** werfen ($2 \times 8\text{W}6$).

### Problem 3: Was passiert mit „Zusätzlicher Angriff“ (Extra Attack) ab Stufe 5?
In D&D 5e bekommen Kämpfer, Barbaren, Paladine, Waldläufer und Mönche auf Stufe 5 das Feature *Extra Attack*. In einem 4-AP-System führt das zu einem Dilemma:
- Wenn *Extra Attack* nichts tut, fühlen sich Kämpfer auf Stufe 5 betrogen, während Magier Stufe-3-Zauber bekommen.
- Wenn *Extra Attack* 2 Angriffe für 1 AP erlaubt, machen Kämpfer bis zu 8 Angriffe pro Runde.

### Problem 4: Die „Bewegungs-Steuer“ für Nahkampf-Monster
Die meisten D&D-Monster sind reine Nahkämpfer. Wenn ein Monster **1 AP für Bewegung** ausgeben muss, bleiben ihm nur 3 AP – und seine Folgeangriffe leiden unter der Multiple Check Penalty, während es in Vanilla D&D 5e **kostenlos laufen UND seinen vollen Mehrfachangriff (Multiattack) ohne Nachteil** ausführen durfte!

### Problem 5: Niedrige Monster-AC führt zu permanenten Heavy & Brutal Hits
Die Schwellenwerte **AC+5 (Heavy)** und **AC+10 (Brutal)** funktionieren nur dann fair, wenn die AC des Ziels zum Angriffsbonus der Helden passt. Gegen Monster mit AC 8–12 ist fast jeder Treffer automatisch ein Heavy oder Brutal Hit.

### Problem 6: „Death's Door“ nimmt Monstern den Druck
In Vanilla D&D 5e verliert eine Gruppe sofort 25 % ihrer Feuerkraft + Heilungs-Aktionen, sobald ein Held auf 0 HP fällt.
In deinem System bleibt der Held bei 0 HP stehen, hat noch **1 AP** und kann damit seinen **1. Angriff (ohne Nachteil!)** ausführen. Da der 1. Angriff über 50 % des gesamten Rundenschadens ausmacht, verliert ein Held auf 0 HP kaum Kampfkraft und heilt sich bei einem Death Save von 15+ zu Zugbeginn sogar kostenlos selbst!

---

## 4. Konkrete Anpassung für normale D&D 5e Monster (Umrechnungs-Guide)

Damit du jedes beliebige Monster aus dem *Monster Manual* sofort in Foundry VTT / am Spieltisch nutzen kannst, ohne es komplett neu zu schreiben, verwende diese **4 Faustregeln**:

### 4.1 Monster-HP anpassen (HP-Multiplikator)
Da deine Spieler auf Stufe 1–4 mehr als doppelt so viel Schaden machen, müssen die Trefferpunkte der Monster skaliert werden:

| Monster-Kategorie | Stufe 1–4 (Tier 1) | Stufe 5–10 (Tier 2) | Stufe 11+ (Tier 3–4) |
| :--- | :---: | :---: | :---: |
| **Schergen / Minions** *(Goblins, Kobolde, Skelette)* | **$\times 1{,}5$ HP** | **$\times 1{,}5$ HP** | **$\times 1{,}25$ HP** |
| **Standard-Monster** *(Orks, Wölfe, Banditen, Kultisten)* | **$\times 2{,}0$ HP** | **$\times 1{,}75$ HP** | **$\times 1{,}5$ HP** |
| **Elite-Monster / Brutes** *(Oger, Eulenbären, Trolle, Riesen)* | **$\times 2{,}25$ HP** | **$\times 2{,}0$ HP** | **$\times 1{,}75$ HP** |
| **Solo-Bosse / Legendäre Monster** *(Drachen, Endgegner)* | **$\times 2{,}5$ bis $\times 3{,}0$ HP** | **$\times 2{,}5$ HP** | **$\times 2{,}0$ HP** |

> **Schnell-Tipp für Foundry VTT:** Statt bei jedem Monster zu rechnen, nimm bei normalen Monstern einfach den **maximalen HP-Wert ihrer Trefferwürfel** (z. B. ein Oger mit $7\text{W}10 + 21$ hat standardmäßig 59 HP $\rightarrow$ mit vollen Würfeln hat er **$7 \times 10 + 21 = 91\text{ HP}$**, was exakt dem Faktor $\times 1{,}55$ entspricht) oder verdopple die Standard-HP direkt.

---

### 4.2 Monster-AC-Untergrenze (Schutz vor Brutal-Hit-Spam)
Um zu verhindern, dass Monster mit niedriger AC (Oger, Zombies, Bestien, Schleime) bei jedem Schlag Brutal Hits kassieren, gilt eine von zwei Lösungen:

- **Option A (AC-Anhebung):** Jedes Monster (außer völlig unbeweglichen Objekten/Schleimen) erhält einen **Mindest-AC von $12 + \frac{\text{CR}}{2}$** (oder pauschal **+2 AC** für alle „Brute“-Monster mit AC unter 13).
- **Option B (Zähe Haut / Unarmored Toughness):** Monster mit natürlicher AC von 12 oder niedriger (Zombies, Oger, Riesen, Bestien) besitzen passiv die Eigenschaft **„Massiger Körper“**: *Angriffe gegen diese Kreatur können nur durch eine natürliche 19 oder 20 zu einem Brutal Hit werden (Heavy Hits bei AC+5 sind weiterhin normal möglich).*

---

### 4.3 Wie Monster ihre AP und ihren Schaden nutzen
Monster sollten **ebenfalls deine statische Schadenstabelle** gegen die Spieler nutzen! Dadurch werden hohe Angriffswürfe der Monster sofort bedrohlich.

Damit Nahkampf-Monster nicht durch Bewegung und Multiple Check Penalty verkrüppelt werden, gelten für Monster folgende **Monster-AP-Regeln**:

1. **Monster-Mehrfachangriff (Multiattack) = Keine Multiple Check Penalty!**
   Wenn im D&D 5e Statblock eines Monsters **„Mehrfachangriff (Multiattack)“** steht (z. B. *„Der Bär führt zwei Angriffe aus: einen mit seinem Biss und einen mit seinen Klauen“*), erleidet das Monster für die Angriffe, die Teil seines normalen *Multiattacks* sind, **KEINE Multiple Check Penalty**! Erst wenn das Monster mit übrigen AP *weitere* Angriffe über seinen Multiattack hinaus macht, greift die Strafe.
2. **Monster-Sturmangriff (Aggressive Bewegung):**
   Nahkampf-Monster dürfen **1× pro Zug bis zu ihrer halben Bewegungsrate (z. B. 15 ft / 4,5 m) kostenlos laufen**, wenn sie sich direkt auf einen Feind zubewegen. Nur wenn sie ihre volle Bewegungsrate brauchen, zahlen sie 1 AP.
3. **AP-Pool nach Monster-Rang:**
   Nicht jedes Monster sollte 4 AP haben (das macht Kämpfe mit 8 Goblins extrem langsam und Bosse zu schwach). Nutze stattdessen diese Staffelung (kompatibel mit deinem Foundry-Modul `dc20-action-points`!):
   - **Minions (Kleinvieh):** **2 AP** pro Runde.
   - **Standard-Monster:** **3 bis 4 AP** pro Runde.
   - **Elite-Monster:** **4 bis 5 AP** pro Runde.
   - **Solo-Bosse:** **4 AP pro Zug**, aber der Boss erhält **2 bis 3 eigene Initiative-Züge pro Kampfrunde** (nutze dafür direkt den **Duplicate-Button** in deinem Foundry-Modul `dc20-action-points`!).

---

### 4.4 Monster-Angriffsschaden anpassen
Auf niedrigen Stufen (CR 1/4 bis CR 2) haben Monster oft nur $1\text{W}6 + 2$ Schaden (Normaler Treffer in deinem System: $3 + 2 = 5$ Schaden). Da Spieler auf *Death's Door* weiterkämpfen können, sind 5 Schaden zu wenig.

- **Anpassung für Monster-Schaden:**
  - Verwende für Monster **immer die statische Schadenstabelle** (Normal = $1/2$, Heavy = $3/4$, Brutal = Max).
  - **Brute-Monster** (Oger, Orks, Minotauren, Riesen) erhalten auf ihren ersten Angriff im Zug automatisch den Effekt **„Wuchtiger Hieb“**: *Ein normaler Treffer zählt bei ihrem ersten Angriff im Zug bereits als Heavy Hit ($3/4$ Schaden), sofern sie sich zuvor bewegt haben oder 2 AP für den Schlag ausgeben.*
  - **Rettungswurf-Effekte gegen Spieler (z. B. Drachenodem, Fallen, Zauber):** Da Spieler bei Rettungswürfen selbst würfeln, gilt die umgekehrte Stufentabelle für den Schaden des Monsters:
    - **Rettungswurf geschafft:** Halber *Normaler* Schaden ($1/4$ des Maximalwürfels).
    - **Rettungswurf um 1–4 verfehlt:** *Normaler Treffer* ($1/2$ des Maximalwürfels).
    - **Rettungswurf um 5–9 verfehlt:** *Heavy Hit* ($3/4$ des Maximalwürfels).
    - **Rettungswurf um 10+ verfehlt oder Nat 1:** *Brutal Hit* (Voller Maximalwürfel!).

---

## 5. Empfohlene Regel-Verbesserungen für dein Spieler-Dokument

Hier sind **5 gezielte Regel-Ergänzungen**, die du direkt in dein Homebrew-Dokument übernehmen kannst, um die größten Balancing-Lücken bei den Spielern zu schließen:

### Patch 1: Zauber & Zaubertricks richtig bepreisen (Kritisch!)
Wenn Zaubertricks 1 AP kosten und ab Stufe 5 auf $2\text{W}10$ skalieren, sind sie doppelt so stark wie Waffen. Zudem darf man nicht zwei große Zauber (wie 2× *Feuerball*) in einer Runde wirken.
> **Neue Regel – Zaubern im AP-System:**
> - **Zaubertricks (Cantrips):** Kosten **1 AP**, verwenden aber immer ihren **Basis-Schadenswürfel von Stufe 1** (z. B. $1\text{W}10$ für *Feuerpfeil*). Du kannst beim Wirken **1 zusätzlichen AP** ausgeben (Gesamtkosten 2 AP), um den Zaubertrick auf deine aktuelle Charakterstufe hochzustufen (z. B. $2\text{W}10$ ab Stufe 5, $3\text{W}10$ ab Stufe 11).
> - **Gezielte Zauber (1. Grad oder höher):** Kosten wie gehabt **2 AP** (bzw. **1 AP** für Bonusaktions-Zauber).
> - **Mana-Überlastung (Maximal 1 Großer Zauber):** Du kannst pro eigenem Zug **nur einen einzigen Zauber des 1. Grades oder höher** wirken, der 2 oder mehr AP kostet. Willst du im selben Zug einen zweiten gelevelten Zauber wirken, musst du dafür **+1 zusätzlichen AP** zahlen und einen Konzentrations-/Arkana-Check (SG $10 + \text{Zaubergrad}$) bestehen.
> - **Rettungswurf-Zauber & Multiple Check Penalty:** Wenn du in einem Zug mehrfach offensive Effekte erzwingst, die einen **Rettungswurf** erfordern, erhält das Ziel beim 2. Mal **Vorteil** (und beim 3. Mal **doppelten Vorteil**) auf seinen Rettungswurf!

### Patch 2: Wie „Zusätzlicher Angriff“ (Extra Attack) ab Stufe 5 funktioniert
Damit Kämpfer, Barbaren, Paladine und Waldläufer auf Stufe 5 ihre Identität behalten, ohne 8-mal pro Runde zu würfeln:
> **Neue Regel – Kampferprobung (Ersetzt „Zusätzlicher Angriff / Extra Attack“ ab Stufe 5):**
> Klassen, die auf Stufe 5 das Merkmal *Zusätzlicher Angriff* erhalten, schalten stattdessen **Kampferprobung** frei:
> - Dein **zweiter Waffenangriff** in deinem Zug ignoriert die erste Stufe der *Multiple Check Penalty* (du würfelst also deinen **1. und 2. Angriff beide normal** ohne Nachteil, der 3. Angriff hat 1× Nachteil, der 4. Angriff hat 2× Nachteil!).
> - *(Für Kämpfer ab Stufe 11 mit 3× Extra Attack gilt: Auch der 3. Angriff ignoriert eine Stufe Nachteil.)*

### Patch 3: Scharfschützen / Fernkampf im Stand begrenzen
Ein Bogenschütze muss sich selten bewegen und hat daher fast jede Runde 4 volle AP für Angriffe, während Nahkämpfer 1 AP für Bewegung zahlen müssen.
> **Neue Regel – Nachladen / Zielen im Fernkampf:**
> Fernkampfwaffen (Bögen, Armbrüste, Wurfwaffen) erfordern nach dem **2. Fernkampfangriff** in einem Zug eine *Minor Action* (Sehne ziehen / Pfeil nachlegen), um weiterzuschießen.

### Patch 4: Klassen-Ressourcen pro Zug (Sneak Attack & Göttliches Niederstrecken)
> **Neue Regel – Fokus-Treffer:**
> - **Hinterhältiger Angriff (Schurke):** Kann weiterhin maximal **1× pro Zug** ausgelöst werden. Wenn du dir selbst über AP Vorteil erkaufst (ohne versteckt zu sein oder einen Verbündeten am Ziel zu haben), musst du mindestens **effektiven Vorteil** beim Wurf haben, um *Sneak Attack* auszulösen (nicht nur Nachteil ausgleichen).
> - **Göttliches Niederstrecken (Paladin):** Das Auslösen von *Divine Smite* bei einem Treffer kostet **keinen AP beim ersten Mal im Zug**, aber jedes weitere *Divine Smite* im selben Zug kostet **1 AP**.

### Patch 5: „Death's Door“ spannender & gefährlicher machen
Aktuell verliert ein Spieler auf 0 HP kaum Offensivkraft, weil sein einzelner verbleibender AP keinen Nachteil hat.
> **Ergänzung zu Death's Door:**
> - Solange du dich auf *Death's Door* befindest, stehen dir wie gehabt nur **1 AP pro Runde** (und maximal **1 Minor Action**) zur Verfügung.
> - **Blutverlust:** Alle deine Angriffs- und Fähigkeitswürfe während *Death's Door* unterliegen den normalen **Erschöpfungs-Abzügen** (Empfehlung aus DC20 / OneD&D: **Jede Stufe Erschöpfung gibt $-1$ auf alle W20-Würfe und senkt deine Zauber-SG um $-1$**).
> - **Selbstheilung beim Death Save (15+):** Wenn du beim Death Save eine 15–19 würfelst, stabilisierst du dich auf **1 HP**, verbrauchst dafür aber für diese Runde deinen **1 AP** (du richtest dich mühsam wieder auf). Nur bei einer **Natürlichen 20** stehst du mit 5 HP UND deinen vollen 4 AP sofort wieder kampfbereit da!

---

## 6. Kurz-Spickzettel für den Spielleiter (GM Cheat Sheet)

| Situation | Schnell-Anpassung am Spieltisch |
| :--- | :--- |
| **Normales Monster aus dem Buch** | **HP $\times 2$** (oder maximale Trefferwürfel-HP nehmen). |
| **Monster hat AC $\le 12$** *(Oger, Zombie, Biest)* | **AC auf 13 erhöhen** ODER *Brutal Hits* gegen dieses Monster nur bei Nat 19–20 erlauben. |
| **Monster hat „Multiattack“** | Alle Angriffe des *Multiattacks* kosten je 1 AP, erleiden aber **keine Multiple Check Penalty**. |
| **Nahkampf-Monster muss zum Spieler laufen** | Erste **4,5 m (15 ft) Bewegung auf einen Feind zu sind kostenlos** (0 AP). |
| **Monster greift Spieler an** | Nutzt ebenfalls die **statische Schadenstabelle** (Normal / Heavy $+5$ / Brutal $+10$). |
| **Bosskampf (Solo-Monster)** | **HP $\times 2{,}5$ bis $\times 3$** und im Foundry-Tracker **2–3 Initiative-Züge** geben (`Duplicate`-Button im AP-Tracker). |

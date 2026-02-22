 Futbola simulācija: Dziļā Q-mācīšanās (DQL)

Pašnovērtējuma portfolio sadaļa


Ievads un darbības principi
Šajā projekta daļā es koncentrējos uz kognitīvo mācīšanās metodi, izmantojot Dziļo Q-mācīšanos (DQL). Atšķirībā no tradicionālās programmēšanas, kur aģentam tiek dotas gatavas instrukcijas, šeit es izveidoju sistēmu, kurā aģents pats ģenerē neironu tīklu. Šis tīkls analizē datu modeļus - spēlētāju, bumbas un vārtu koordinātas - un mēģina prognozēt, kura darbība attiecīgajā brīdī sniegs vislielāko labumu. Darba gaitā es novēroju, kā aģents no haotiskām kustībām pāriet uz mērķtiecīgu spēli, pateicoties pastāvīgai neironu svaru korekcijai, kas balstīta uz kļūdu minimizēšanu.

Kritiskā domāšana un problēmrisināšana
Izstrādājot šo simulāciju, es saskāros ar nopietnu izaicinājumu - aģentu "iestigšanu" lokālajos optimumos, kad tie iemācās vienkāršāko, bet ne efektīvāko uzvedību. Tas prasīja no manis kritisku pieeju: es ne tikai pārskatīju kodu, bet sistēmiski analizēju apbalvošanas funkcijas (Reward function) struktūru. Rezultātā es ieviesu starpstadiju apbalvojumus par bumbas kontroli un tuvumu vārtiem. Šis process pierādīja manu spēju identificēt problēmas cēloni un rast matemātiski pamatotu risinājumu, kas ir būtisks kritiskās domāšanas aspekts.

Pašvadīta mācīšanās un digitālā pratība
Šis projekts prasīja ievērojamu patstāvīgu darbu, apgūstot tēmas, kas pārsniedz vidusskolas programmēšanas kursu. Es patstāvīgi izpētīju Bellmana vienādojumu un gradienta lejupejas (Gradient Descent) principus. Turklāt es apzināti izvēlējos neizmantot gatavas bibliotēkas, piemēram, TensorFlow, bet gan realizēju visu neironu tīkla arhitektūru "tīrā" JavaScript valodā. Tas ļāva man ne tikai saprast tehnoloģiju darbību visdziļākajā līmenī, bet arī vizualizēt neironu "veselības" rādītājus reāllaikā, kas apliecina manu digitālo pratību un spēju radīt sarežģītus tehnoloģiskus rīkus no nulles.

Noslēguma pašvērtējums
Atskatoties uz darba procesu, vislielāko gandarījumu sniedza brīdis, kad aģents pirmo reizi "saprata" bumbas virzīšanas loģiku - tā bija vizuāli redzama matemātiskās modeļa uzvara. Tomēr visgrūtākais posms bija tīkla destabilizācija ilgstošas mācīšanās laikā, ko es mēģināju novērst, normalizējot ieejas datus. Ja es sāktu projektu no jauna, es noteikti ieviestu "mērķa tīkla" (Target Network) mehānismu, lai vēl vairāk stabilizētu mācīšanās līkni. Šis process man iemācīja, ka mākslīgais intelekts nav maģija, bet gan rūpīgi izsvērts stimulu un aprēķinu kopums.



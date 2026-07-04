# Brief design — Bankee (version complète)

## Le produit
Bankee est une app mobile (Android/iOS, React Native/Expo) qui sert de **carnet de
dettes numérique**. Deux publics :
- des **particuliers** qui prêtent de l'argent à leurs proches et veulent garder le fil
- des **petits commerçants** qui font crédit à leurs clients

L'utilisateur note qui lui doit combien, avec échéances, historique des modifications,
et peut envoyer un rappel par WhatsApp. Toutes les données vivent en local sur
l'appareil (SQLite), avec une sauvegarde en ligne optionnelle.

## Identité de marque
- Nom : **Bankee**
- Logo actuel : monogramme "B" blanc, carré à coins arrondis, sur fond vert émeraude
- **Toutes les icônes de l'app doivent être des icônes SVG** (pas d'images bitmap,
  pas d'émoji comme seule icône fonctionnelle — les émoticônes restent acceptées en
  complément décoratif, comme sur l'écran Premium, mais chaque icône d'action/statut
  doit être un vrai SVG vectoriel)
- Le vrai logo WhatsApp (le logo de marque officiel, reconnaissable) doit être utilisé
  partout où on propose un rappel WhatsApp — pas une bulle de chat générique

## Système de thèmes (important, à bien respecter)
Le thème n'est **pas** "clair/sombre = un choix parmi d'autres". Le clair/sombre est
un **mode** qui s'applique à n'importe quelle couleur choisie. Il y a :
- **5 couleurs de thème** : Vert, Blanc, Bleu, Violet, Rose
- **2 modes** pour chacune : Light et Dark

Soit 5 × 2 = 10 combinaisons possibles. Exemple : si l'utilisateur choisit "Rose", il
peut ensuite basculer entre "Rose clair" et "Rose sombre" — les deux existent et
gardent la même identité rose, juste avec un fond clair ou sombre.
Merci de fournir, pour chacune des 5 couleurs, la palette complète en mode Light ET
en mode Dark (fond, surface, bordure, texte, texte atténué, couleur primaire,
primaire adoucie).

## Fonctionnalités complètes de l'app

### Carnets (multi-instance)
- Le terme correct est **"Carnet"** (pas "espace"). Un carnet = un contexte de suivi
  indépendant (ex: un carnet "Mon épicerie" et un carnet "Perso").
- L'utilisateur peut créer plusieurs carnets **selon son forfait** (le nombre de
  carnets gratuits est limité, débloquer plus de carnets fait partie de l'offre payante).
- Chaque carnet a un type fixé à la création : **Professionnel** ou **Particulier**
  (ne peut plus changer ensuite).
- On peut renommer et supprimer un carnet (sauf s'il n'en reste qu'un seul).

### Suivi des personnes et des dettes
- Liste des personnes d'un carnet, avec solde ("X me doit" / "ne doit rien"),
  recherche, filtre "Doit de l'argent" / "Tous"
- Total dû affiché en haut, **toujours en USD**
- Fiche personne : solde détaillé, historique complet des transactions
- Ajouter une **dette** ou un **remboursement**
- Bouton "Solder maintenant" : rembourse le solde total en un tap
- **Échéance obligatoire** pour toute dette
- **Historique des modifications** (audit log) : si un champ d'une transaction est
  modifié après coup (montant, date, échéance, canal, note), on garde une trace de
  l'ancienne et de la nouvelle valeur, avec motif si pertinent (ex: pourquoi
  l'échéance a changé)

### Moyens de paiement (canaux)
Liste complète des canaux disponibles à la saisie d'une dette ET d'un remboursement :
- **Espèces**
- **Virement bancaire**
- **Mobile money**
- **Chèque**
- **Autre** — avec un champ texte libre qui apparaît pour que l'utilisateur précise
  lui-même le canal (ex: "Troc", "Crypto", etc.)

### Rappels et notifications
- Bouton d'envoi de rappel par **WhatsApp** (vrai logo WhatsApp), qui ouvre une
  conversation pré-remplie avec le message de rappel
- Notifications locales programmées : rappel avant/le jour/après l'échéance
  (délai configurable dans les paramètres), notification quotidienne du total à
  encaisser

### Onboarding (premier lancement, plusieurs écrans)
1. Choix du profil : **Professionnel** ou **Particulier** (deux grandes cartes avec
   icône et description)
2. Nom (si Particulier) ou nom de l'entreprise (si Professionnel)
3. Choix du pays : liste recherchable d'environ 140 pays, chacun avec son drapeau et
   sa devise — ce choix fixe la devise de base (modifiable plus tard dans les
   paramètres)

### Paramètres
- Profil : type de compte (affiché, non modifiable), nom modifiable, bouton "Revoir
  l'onboarding"
- Devise de base (sélecteur avec recherche par pays, drapeaux)
- Sélecteur de thème : les 5 couleurs, chacune avec bascule Light/Dark
- Notifications : activer/désactiver, tester, choisir le délai de rappel
- Compte : Sauvegarde en ligne (connexion par email + mot de passe, statut connecté/
  non connecté, date de dernière sauvegarde, bouton "Sauvegarder maintenant",
  déconnexion)
- Carte de mise en avant Premium (si non premium)

### Sauvegarde en ligne (compte utilisateur)
- Écran de connexion / création de compte (email + mot de passe)
- Une fois connecté : sauvegarde et restauration automatique sur un nouvel appareil

### Monétisation — RÈGLE IMPORTANTE
**Un seul modèle : le paiement unique (à vie). Aucun abonnement, jamais.**
Ne propose PAS de choix mensuel/annuel, ni de tarif récurrent. Il n'y a qu'**un seul
prix, payé une fois**, qui débloque : carnets illimités (au-delà de la limite
gratuite), sauvegarde en ligne, tous les thèmes. Montant affiché **en USD**.
L'écran Premium doit rester dans le style déjà validé : bandeau dégradé en tête avec
icône de l'app + émoticônes décoratives, liste de fonctionnalités avec icône colorée
distincte par carte, carte de prix unique, bouton "Débloquer", bouton "Restaurer les
achats", liens Conditions/Confidentialité.

## Liste complète des écrans à designer
1. **Onboarding** — les 3 étapes décrites ci-dessus
2. **Liste des personnes** (accueil) — sélecteur de carnet, total en USD, filtres,
   recherche, liste des personnes
3. **Sélecteur de carnets** (modal) — liste, renommer, supprimer, créer
4. **Fiche d'une personne** — solde, actions, historique, rappel WhatsApp
5. **Formulaire nouvelle/modifier personne** — champs + section dette initiale
   (avec les canaux de paiement complets ci-dessus)
6. **Formulaire nouvelle transaction** — dette ou remboursement, tous les champs
7. **Détail/édition d'une transaction** — tous les champs modifiables + historique
   des modifications
8. **Paramètres** — toutes les sections listées ci-dessus
9. **Connexion / sauvegarde en ligne** — email + mot de passe
10. **Écran Premium** — paiement unique uniquement, pas d'abonnement

## Contrainte technique
Le code final est implémenté en **React Native (Expo)**. Merci de penser à des
composants réalistes pour du mobile : pas de survol/hover, cibles tactiles assez
grandes, pas d'effets impossibles à reproduire en React Native (pas de filtres CSS
complexes, pas de position sticky avancée). Icônes en SVG uniquement.

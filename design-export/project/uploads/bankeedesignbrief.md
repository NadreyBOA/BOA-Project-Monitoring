# Brief design — Bankee

## Le produit
Bankee est un carnet de dettes numérique (app mobile Android/iOS) pour deux publics :
- des particuliers qui prêtent de l'argent à leurs proches
- des petits commerçants qui font crédit à leurs clients

L'app permet de noter qui doit combien, avec échéances, historique des modifications,
et rappels envoyés par WhatsApp.

## Identité de marque
- Nom : **Bankee**
- Couleur primaire : vert émeraude **#1F8F5C**
- Logo actuel : monogramme "B" blanc, carré à coins arrondis, fond vert émeraude
- 4 thèmes disponibles dans l'app : Clair (vert, #1F8F5C), Sombre (fond quasi-noir,
  accent turquoise #4FD1A5), Violet (#7C5CFC), Rose (#E85D8A)

## Ton recherché
Moderne, chaleureux et "vivant" — pas froid ni corporate. On veut des touches
d'émoticônes, des dégradés doux, des cartes arrondies avec de la couleur (pas juste
du blanc/gris). Référence directe : l'écran Premium actuel a un bandeau dégradé vert
en tête avec l'icône de l'app et des émoticônes décoratives (✨💸🎉), puis une liste
de fonctionnalités avec une icône colorée différente par carte (violet, rose, orange,
menthe) plutôt qu'une simple coche verte répétée.

## Ce qu'on cherche à produire
Un design system réutilisable (composants + tokens) pour une app React Native/Expo :
- **Couleurs** : palette pour chacun des 4 thèmes (fond, surface, bordure, texte,
  texte atténué, couleur primaire, primaire adoucie)
- **Typographie** : échelle de tailles, poids (titres, corps, labels)
- **Composants** :
  - Bouton principal (plein, arrondi)
  - Carte de fonctionnalité (icône colorée + titre + description, comme sur l'écran Premium)
  - Carte de prix / mise en avant
  - Champ de saisie (texte, date, montant)
  - Chip de sélection (canal de paiement, filtre)
  - Badge (code pays/devise)
  - Ligne de liste (personne avec solde, historique de transaction)

## Écrans où appliquer ce système (par ordre de priorité)
1. Liste des personnes (écran d'accueil) — total dû, filtre, recherche, liste
2. Fiche d'une personne — solde, actions (dette/remboursement), historique
3. Formulaire d'ajout de personne / de transaction
4. Paramètres (profil, devise, thèmes, sauvegarde en ligne, premium)
5. Écran Premium (déjà bien avancé — garder cohérent avec le reste plutôt que refaire)

## Contrainte technique
Le code final sera implémenté en React Native (Expo) — merci de penser à des
composants réalistes pour du mobile (pas de survol/hover, cibles tactiles assez
grandes, pas d'effets impossibles en RN comme les filtres CSS complexes).

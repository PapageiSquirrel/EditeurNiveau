# ENSS
Editeur de niveau créé en Javascript à l'aide du framework createjs (easeljs)
accompagné d'une Game Engine pour tester les mondes créés dans l'éditeur.

# Editeur

L'éditeur permet de créer un monde qui se décompose en écran de 40x30 cases.
Sur chaque écran, on peut ajouter des objets de type :
- Plateforme
- Décor
- Objet activable / ramassable
- Ennemi

Tout en permettant à l'utilisateur de donner un sprite particulier (ou non) à l'objet et/ou une couleur (ou non).

A chacun de ses objets, on peut ajouter des propriétés, comme par exemple :
- Affecté un mouvement à une plateforme
- Mettre du texte sur un décor

Avec la possibilité de modifier certaines variables lié à ses propriétés spécifiques à chaque type d'objets.

# Game Engine

La GE permet de gérer la position du personnage, d'exécuter les propriétés des objets, ainsi que de calculer les collisions, etc...
La majorité des variables de la GE sont configurables.

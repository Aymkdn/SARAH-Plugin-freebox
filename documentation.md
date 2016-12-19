# Configurer le plugin

Vous aurez besoin **d'avoir le code télécommande**. Pour le découvrir, voir ci-dessous :

## 1. Trouver le code télécommande

### Freebox Revolution

Dans l'univers Freebox, allez complètement à gauche dans la section **Réglages**, puis descendez jusqu'à **Système**, puis dans **Informations Freebox Player et Server**.

Dans le premier onglet vous trouverez votre **code télécommande réseau**.

### Freebox v5

Dans l'univers Freebox, allez dans **Paramètres**, puis **Informations Générales**, et vous aurez le **code télécommande**.

## 2. Lancer la configuration

Pour configurer le plugin pour la première fois, dites : `Sarah configurer la Freebox`.

## 3. Aller plus loin

### Autres paramètres

D'autres paramètres peuvent être configurés.

#### `search_path`

La commande `SARAH trouve un dossier Freebox` vous permet de demander à SARAH de se déplacer dans un dossier de `Mes Vidéos`. Par défaut SARAH va chercher tous les dossiers présents dans `Mes Vidéos`, ce qui peut être problématique si vous avez beaucoup de dossiers !

Pour réduire la zone de recherche, vous pouvez configurer le champs `search_path` en vous rendant sur [l'interface Web de SARAH](http://127.0.0.1:8080/home) (se reporter à [la documentation de SARAH](http://jpencausse.github.io/SARAH-Documentation/?page=getting_started_v3#configuration-plugins)).

Par exemple, supposons que vous voulez seulement une recherche parmis vos séries télé qui sont stockées dans `Perso/Mes Séries/`, alors vous pourrez remplacer `/Disque dur/Vidéos/` par `/Disque dur/Vidéos/Perso/Mes Séries/`.

À noter qu'il faudra prononcer le nom des dossiers *à la française* car c'est ainsi que SARAH va les comprendre. Par exemple pour `Game of Throne` il faudra prononcer quelque chose comme `guame off trone`.

#### `use_Mon_Bouquet`

À mettre à `true` si vous souhaitez que SARAH aille plutôt dans "Mon Bouquet" (vos chaines favorites) ou dans "Freebox TV" lorsque vous dites `allume la télé` ou `mets la télé`.

### Modifier les chaines TV

Les chaines de TV sont automatiquement récupérées depuis le site de Free au démarrage de SARAH puis elles sont écrites dans le fichier `freebox.xml`. Cependant il peut arriver que SARAH comprenne mal votre prononcation de certaines chaines.

Par exemple si vous dites `zappe sur France 5 ` et que SARAH ne vous comprend pas, vous pouvez lui dire qu'elle utilise plutôt `France cinq`. Ou si vous dites `zappe sur AB1` et qu'elle ne comprend pas, vous pouvez remplacer par `ah bé un`.

Pour cela, ouvrir le fichier `replace_chaine.json` et s'inspirer des exemples présents.

# Commandes Vocales

  - `configurer la freebox` : pour la configuration initiale du plugin

- `allume la freebox`
- `allume la télé` : allume la Freebox et va en plus mettre la TV
- `éteint la freebox`
- `éteint la télé` : éteint la Freebox
- `mets la télé` : se déplacer dans `Freebox TV`
- `coupe le son de la freebox`
- `remets le son de la freebox`
- `baisse légèrement le son de la freebox`
- `monte légèrement le son de la freebox`
- `baisse le son de la freebox`
- `monte le son de la freebox`
- `augmente le son de la freebox`
- `mets la freebox sur pause`
- `mets le programme sur pause`
- `remets la freebox en lecture`
- `remets le programme en lecture`
- `reviens au direct` : lorsque la Freebox TV a été mise sur pause
- `va dans mes enregistrements` : SARAH va ouvrir "Mes Enregistrements" sur la télé
- `va dans mes vidéos` : SARAH va ouvrir "Mes Vidéos" sur la télé
- `trouve un dossier freebox` : parcourt tous les dossiers dans `Mes Vidéos` afin de trouver le dossier souhaité

Autre commandes :
- `freebox OK` : simule l'appui sur la touche "OK" de la télécommande
- `freebox menu` : simule l'appui sur la touche "Free" de la télécommande
- `freebox droit` : simule l'appui sur la touche "flèche droite" de la télécommande
- `freebox gauche` : simule l'appui sur la touche "flèche gauche" de la télécommande
- `freebox haut` : simule l'appui sur la touche "flèche du haut" de la télécommande
- `freebox bas` : simule l'appui sur la touche "flèche du bas" de la télécommande
- `freebox retour` : simule l'appui sur la touche "rouge" de la télécommande

Mode spécial :
- `active le mode freebox` / `passe en mode freebox` : permet de dire plusieurs commandes vocales à la suite sans énoncer avant `SARAH Freebox` ; les commandes sont :
 - "OK", "Menu Freebox", "gauche", "droite", "retour", "descend", "bas", "monte", "haut", "chaine précédente", "chaine suivante"
 - utiliser la commande `Merci ça sera tout` pour sortir de ce mode

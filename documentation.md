(documentation pour la version v5 pas encore disponible)

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

### Modifier les chaines TV

Les chaines de TV sont automatiquement récupérées depuis le site de Free au démarrage de SARAH puis elles sont écrites dans le fichier `freebox.xml`. Cependant il peut arriver que SARAH comprenne mal votre prononcation de certaines chaines.

Par exemple si vous dites `zappe sur France 5 ` et que SARAH ne vous comprend pas, vous pouvez lui dire qu'elle utilise plutôt `France cinq`. Ou si vous dites `zappe sur AB1` et qu'elle ne comprend pas, vous pouvez remplacer par `ah bé un`.

Pour cela, ouvrir le fichier `replace_chaine.json` et s'inspirer des exemples présents.



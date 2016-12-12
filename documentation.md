(documentation pour la version v5 pas encore disponible)

# Configurer le plugin

Vous aurez besoin **d'avoir le code télécommande**. Pour le découvrir, voir ci-dessous :

## Trouver le code télécommande

### Freebox Revolution

Dans l'univers Freebox, allez complètement à gauche dans la section **Réglages**, puis descendez jusqu'à **Système**, puis dans **Informations Freebox Player et Server**.

Dans le premier onglet vous trouverez votre **code télécommande réseau**.

### Freebox v5

Dans l'univers Freebox, allez dans **Paramètres**, puis **Informations Générales**, et vous aurez le **code télécommande**.

## Maintenant

Pour configurer le plugin dites : `Sarah configurer la Freebox`.

## Aller plus loin

### Modifier les chaines

Les chaines de TV sont automatiquement récupérées depuis le site de Free au démarrage de SARAH puis elles sont écrites dans le fichier `freebox.xml`. Cependant il peut arriver que SARAH comprenne mal la prononcation de certaines chaines.

Par exemple si vous dites `zappe sur France 5 ` et que SARAH ne vous comprend pas, vous pouvez lui dire qu'elle utilise plutôt `France cinq`. Ou si vous dites `zappe sur AB1` et qu'elle ne comprend pas, vous pouvez remplacer par `ah bé un`.

Pour cela, ouvrir le fichier `replace_chaine.json` et s'inspirer des exemples présents.

Il est aussi possible d'ignorer une chaine (donc qui ne sera pas ajoutée au fichier XML) en indiquant `""` pour son équivalent.



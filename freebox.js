var freeboxPlugin = function(data, callback, config, SARAH) {
  var _this=this;
  // On récupère la config
  _this.config = config.modules.freebox;
  _this.data = data;
  _this.callback = callback;
  _this.SARAH = SARAH;
  // url pour accéder au Freebox Server
  _this.serverURL = "http://mafreebox.freebox.fr/api/v3/";
  // url pour accéder au Freebox Player
  _this.playerURL = 'http://'+(_this.config.box_to_control||"hd1")+'.freebox.fr/pub/remote_control?code='+_this.config.code_telecommande;
  // commandes spéciales pour les actions sur le player
  _this.commands = {
    'on'      : { key: 'power',       tts: "j'allume la fribox"},
    'off'     : { key: 'power',       tts: "j'éteint la fribox"},
    'etat'    : { key: 'etat',       tts: "je te dis ça tout de suite"},
    'tv'      : { key: (_this.config.use_Mon_Bouquet==false?'home|right|left|red|ok':'home|right|left|red|up|up|up|ok'), tts: "je mets la télé"},
    'tvOn'    : { key: 'power',       tts: "j'allume la télé", 
                  after: { key: (_this.config.use_Mon_Bouquet==false?'home|right|left|red|ok':'home|right|left|red|up|up|up|ok'), tts: "la télé est allumée", delay: 7000 }
                },
    'mute'    : { key: 'mute',        tts: "je coupe le son"},
    'muteOff' : { key: 'mute',        tts: "je remet le son"},  
    'soundDownLight' : { key: 'vol_dec*10', tts: "je baisse légèrement le son"},
    'soundUpLight'   : { key: 'vol_inc*10', tts: "je monte légèrement le son"},
    'soundDown'      : { key: 'vol_dec*20', tts: "je baisse le son"},
    'soundUp'        : { key: 'vol_inc*20', tts: "je monte le son"},
    'programUp'      : { key: 'prgm_inc', tts: "Chaine suivante"},
    'programDown'    : { key: 'prgm_dec', tts: "Chaine précédente"},
    'info'    : { key: 'ok|ok',       tts: "voici les infos du programme"},
    'infoOff' : { key: 'red|red',     tts: "j'enlève les infos"},
    'ok'      : { key: 'ok',          tts: "OK"},
    'home'    : { key: 'home|red',        tts: "Retour sur la home de la Fribox"},
    'up'      : { key: 'up',          tts: "Voilà"},
    'down'    : { key: 'down',        tts: "Voilà"},
    'right'   : { key: 'right',       tts: "Voilà"},
    'left'    : { key: 'left',        tts: "Voilà"},
    'back'    : { key: 'red',         tts: "Retour"},
    'pause'   : { key: 'play',        tts: "je mets sur pause le programme"},
    'play'    : { key: 'play',        tts: "je remets en lecture le programme"},
    'enregistrements': { key: 'home|right|left|red|up|ok', tts: "je vais dans Mes Enregistrements"},
    'videos'  : { key: 'home|right|left|red|right|ok', tts: "je vais dans Mes Vidéos"},
    'direct'  : { key: 'green|ok|red',     tts: "je remets le direct"}
  };
  // pour le Freebox Server
  _this.freeboxServer = {
    app_id:"sarah.plugin.freebox",
    app_name:"Plugin Freebox pour SARAH",
    logged_in:false,
    challenge:"",
    password:"",
    session_token:""
  }
  // pour les requests
  _this.request = require("request");

  // récupération des entities
  var fs = require('fs');
  _this.htmlEntities = JSON.parse(fs.readFileSync(__dirname + '\\entities.json', 'utf8'));
}

/**
 * Ce doit être lancé qu'au lancement de SARAH
 */
freeboxPlugin.prototype.init=function() {
  var _this=this;
  // on récupère les chaines Free pour reformer le fichier XML
  console.log("[PLUGIN 'Freebox'] Récupération des chaines sur free.fr...");
  _this.request('http://www.free.fr/freebox/js/datas/tv/jsontv.js?callback=majinboo&_='+Date.now(), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // on va lire le fichier replace_chaine.json qui permet de substituer certaines chaines
      var fs = require('fs');
      var substitution = JSON.parse(fs.readFileSync(__dirname + '\\replace_chaine.json').toString());

      // puis on s'occupe de la réponse du serveur
      var body = body.slice(9).replace(/\)\W+$/,"");
      body = JSON.parse(body);
      var i, chaines=[], nom, canal, slash;
      for (i=0, len=body.chaines.length; i<len; i++) {
        nom = _this.decodeEntities(body.chaines[i].nom);
        // on remplace certains noms
        nom = nom.replace(/ la chaine/,"").replace(/\+/g," plus ").replace(/&/g," et ").replace(/\!/g,"").trim();
        slash = nom.indexOf('/');
        if (slash > -1) nom = nom.slice(0,slash);
        // on fait la substitution
        if (substitution[nom]) nom=substitution[nom];
        if (!nom) continue;
        canal = body.chaines[i].canal;
        chaines.push('      <item>zappe sur '+nom+'<tag>out.action.key="'+canal+'";out.action.msg="je zappe sur '+nom+'"</tag></item>');
      }

      // maintenant on va modifier freebox.xml
      var fileContent = fs.readFileSync(__dirname + '\\freebox.xml').toString().split("\r\n");
      var start, end;
      for (i=0, len=fileContent.length; i<len; i++) {
        // on cherche "-chainesStart-" et "-chainesEnd-"
        if (/-chainesStart-/.test(fileContent[i])) {
          start=i+1;
        }
        if (/-chainesEnd-/.test(fileContent[i])) {
          end=i;
        }
      }
      if (start && end) {
        fileContent.splice.apply(fileContent, [start, end-start].concat(chaines));
        //fileContent.splice(start, end-start, '<item>zappe sur W neuf<tag>out.action.key="9";out.action.msg="je zappe sur wéééé"</tag></item>');
      }
      // on écrit le fichier
      try {
        fs.writeFileSync(__dirname + '\\freebox.xml', fileContent.join("\r\n"), 'utf8');
      } catch(e) {
        console.log("[PLUGIN 'Freebox'] Erreur lors de l'écriture du fichier freebox.xml => "+e);
      }
      console.log("[PLUGIN 'Freebox'] Récupération des chaines sur free.fr terminée !");
    } else {
      console.log("[PLUGIN 'Freebox'] Impossible de récupérer la liste des chaines");
    }
  });
}

/**
 * Permet de convertir des caractères HTML en leur équivalent (par exemple "&eacute;"" devient "é")
 *
 * @param  {String} str
 * @return {String} Le résultat
 */
freeboxPlugin.prototype.decodeEntities=function(str) {
  var _this=this;
  var mtch = str.match(/&([^;]+);/g);
  if (mtch) {
    mtch.forEach(function(s) {
      var res = s.slice(1,-1);
      if (res.charAt(0) !== "#") res=_this.htmlEntities[res];
      else res = String.fromCharCode(res.slice(1));
      var regex = new RegExp(s, "g")
      str = str.replace(regex,res);
    })
  }
  return str;
}

/**
 * Va effectuer des vérifications dans la configuration
 *
 * @return {Boolean} True si c'est bon, False sinon
 */
freeboxPlugin.prototype.checkConfiguration=function() {
  var _this=this;
  
  if (_this.config.plugin_init===false) {
    var exec = require('child_process').exec;
    var process = 'start %CD%\\\\plugins\\\\freebox\\\\documentation.url';
    var child = exec(process, function (error, stdout, stderr) {
      if (error !== null) console.log("[PLUGIN 'Freebox'] Erreur lors de l'ouverture de la documentation — Erreur retournée : " + error);
    });
    _this.SARAH.speak("Le pluguïn Freebox a besoin d'être configuré. La documentation a été ouverte dans une nouvelle page de votre navigateur.");
    return false;
  }

  // on regarde si le code télécommande a été fourni
  if (!_this.config.code_telecommande) {
    console.log("[PLUGIN 'Freebox'] Erreur: le code télécommande n'a pas été fourni.");
    _this.SARAH.speak('Le code de la télécommande est manquant pour le plugin Freebox. ');
    return false;
  }
  
  if (_this.config.freebox_v5 === "true")  _this.config.freebox_v5 = true;
  if (_this.config.freebox_v5 === "false") _this.config.freebox_v5 = false;

  return true; 
}

/**
 * Sauvegarde la configuration dans le fichier custom.prop
 */
freeboxPlugin.prototype.saveConfig=function() {
  var _this = this;
  var config = _this.SARAH.ConfigManager.getConfig();
  config.modules.freebox = _this.config;
  _this.SARAH.ConfigManager.save(config);
}

/**
 * Construit l'URL qui doit être utilisée pour communiquer avec la Freebox
 *
 * @param {String} keys La ou les clés à utiliser dans la commande
 * @return {Array|Boolean} On va retourner un tableau d'URL à utiliser (FALSE s'il y a eu un problème)
 */
freeboxPlugin.prototype.buildPlayerURL=function(keys){
  var url = this.playerURL+"&key=";
  if (keys.length <= 0) {
    console.log("[PLUGIN 'Freebox'] Erreur: appel de buildPlayerURL avec keys.length=0. Debug de `keys`=",keys);
    this.callback({'tts' : "Je n'ai pas compris"});
    return false;
  }
  // si la commande contient des '*' ça veut dire qu'on a plusieurs occurences pour la commande ciblée
  if (keys.indexOf('*') > -1) {
    keys=keys.replace(/([a-z_]+)(\*[0-9]+)(\|)?/g, function(all,a,b,c) {
      var i=1*b.slice(1),str=a,c=c||"";
      while (i>1) {
        str+="|"+a;
        i--;
      }
      return str+c;
    });
  }
  // si la commande contient des '|' alors on envoie plusieurs requêtes à la box
  var spl = keys.split('|');
  var len = spl.length;
  if (len > 0) {
    var rUrl = [];
    for (var i=0; i < len; i++) {
      rUrl.push(url+spl[i]+(this.config.freebox_v5==true?'&long='+(i+1 < len):''))
    }
    return rUrl
  } else return [ url+keys+(this.config.freebox_v5==true?'&long=false':'') ]
}

/**
 * Appelle une URL
 * @param {String} url L'URL qu'on va appeler
 * @param {String} tts Le message qui sera lu une fois la requête faite
 * @param {Function} [after] La fonction qui sera lancée une fois la requête terminée avec deux arguments: {Boolean}success, {String}errorMessage
 */
freeboxPlugin.prototype.requestURL=function(url, tts, after) {
  var u=url.shift();
  var _this=this;
  console.log("[PLUGIN 'Freebox' DEBUG] URL appelée => "+u);
  _this.request({ 'uri': u }, function (err, response, json){
    if (err || response.statusCode != 200) {
      after.call(_this, false, err);
      _this.callback({});
      return;
    }

    setTimeout(function() {
      if (url.length>0) _this.requestURL(url, tts, after)
      else {
        if (after) {
          after.call(_this, true)
        } else {
          if (tts) _this.callback({})
          else _this.callback()
        }
      }
    }, (u.match(/vol_dec|vol_inc|key=[0-9]/) ? 5 : 1000)); // pas de délai pour vol_dec et vol_inc
  });
}

/**
 * Permet de configurer le plugin
 */
freeboxPlugin.prototype.configure=function() {
  var _this=this;

  // pour le code télécommande
  var chiffres = {
    "corriger":"corriger",
    "zéro":"0",
    "un":"1",
    "deux":"2",
    "trois":"3",
    "quatre":"4",
    "cinq":"5",
    "six":"6",
    "sept":"7",
    "huit":"8",
    "neuf":"9"
  };
  for (var i=0; i<10; i++) chiffres[""+i]=""+i;
  var code_telecommande = [];
  var getChiffreCodeTelecommande=function(phrase, ensuite) {
    _this.SARAH.askme(phrase, chiffres, 0, function(answer, end) {
      if (answer === "corriger") {
        var pop=code_telecommande.pop();
        getChiffreCodeTelecommande("Je supprime "+pop+". Redis moi le chiffre");
      } else {
        code_telecommande.push(answer);
        if (code_telecommande.length < 8) {
          getChiffreCodeTelecommande(answer+", Ensuite ?");
        } else {
          // on vérifie le dernier chiffre
          _this.SARAH.askme("Le dernier chiffre est "+answer+". Dis, corriger, pour le modifier, ou dis, continuer.", {
            "corriger":"corriger",
            "continuer":"continuer"
          }, 0, function(answer, end) {
            if (answer == "corriger") {
              var pop=code_telecommande.pop();
              getChiffreCodeTelecommande("Je supprime "+pop+". Redis moi le chiffre");
            } else {
              _this.SARAH.askme("Le code est : "+code_telecommande.join(", ")+". Dis, valider, pour l'accepter, ou dis, corriger, pour recommencer.", {
                "valider":"valider",
                "corriger":"corriger"
              }, 0, function(answer, end) {
                if (answer === "corriger") {
                  // on recommence
                  code_telecommande=[];
                  getChiffreCodeTelecommande("Donne moi les chiffres les uns après les autres. C'est à toi, dis un chiffre de zéro, à neuf");
                } else {
                  _this.config.code_telecommande = code_telecommande.join("");
                  _this.SARAH.speak("Code télécommande configuré.", function() {
                    _this.saveConfig();
                    _this.SARAH.speak("Recherche de la Freebox...", getVersionFreebox);
                  });
                }
                end();
              })
            }

            end();
          });
        }
      }
      end();
    })
  };

  // On demande la version de la freebox
  var getVersionFreebox = function() {
    _this.requestURL(["http://mafreebox.freebox.fr/api_version"], "", function(success, errorMessage) {
      if (!success) {
        _this.SARAH.speak("J'ai détecté une Freebox vé cinq. Le pluguïn est maintenant configuré.");
        _this.config.freebox_v5=true;
        _this.saveConfig();
      } else {
        _this.SARAH.speak("J'ai détecté une Freebox Révolution", function() {
          _this.config.freebox_v5=false;
          _this.saveConfig();
          getAutorization();
        });
      }
    })
  }

  // on configure la Freebox Révolution
  var getAutorization = function() {
    _this.SARAH.speak("Vous devez maintenant approuver le pluguïn en allant sur l'écran LCD de votre Freebox Serveur et en utilisant la flèche de droite sur celui-ci.");
    var options = {
      url:_this.serverURL+"login/authorize/",
      method:"POST",
      json: {
        "app_id"     : _this.freeboxServer.app_id,
        "app_name"   : _this.freeboxServer.app_name,
        "app_version": _this.config.version,
        "device_name": "SARAH"
      },
      encode: "utf-8"
    };
    _this.request(options, function (err, response, body) {
      if (err || response.statusCode != 200) {
        _this.SARAH.speak("La configuration du Freebox Serveur a échoué.")
        console.log("[PLUGIN 'Freebox'] Erreur : "+err);
        return callback({});
      }

      if (body.success === true) {
        _this.config.app_token = body.result.app_token;
        _this.saveConfig();
        pendingAutorization(body.result.track_id);
      } else {
        _this.SARAH.speak("Il y a eu un problème... Redites : SARAH, configurer la Freebox");
        console.log("[PLUGIN 'Freebox'] Erreur : ", body);
      }
    });
  }

  var pendingAutorization = function(track_id) {
    var options = {
      url:_this.serverURL+"login/authorize/"+track_id,
      method:"GET"
    };
    _this.request(options, function (err, response, body) {
      if (err || response.statusCode != 200) {
        return callback({});
      }
      body = JSON.parse(body);
      
      // on vérifie le statut
      switch (body.result.status) {
        case "pending": {
          setTimeout(function() { pendingAutorization(track_id) }, 1000);
          break;
        }
        case "granted": {
          _this.SARAH.speak("C'est bon, le pluguïn est configuré ! Vous pouvez commencer à l'utiliser.");
          _this.config.plugin_init=true;
          _this.saveConfig();
          break;
        }
        default: {
          _this.SARAH.speak("L'opération a échoué, vous devez recommencer.", getAutorization);
          break;
        }
      }
    });
  }

  // on démarre
  if (!_this.config.code_telecommande) {
    _this.SARAH.speak("Commençons par configurer le code télécommande. Donne moi les chiffres les uns après les autres. Tu peux dire, corriger, pour modifier le dernier chiffre donné.", function() {
        getChiffreCodeTelecommande("C'est à toi, dis un chiffre de zéro, à neuf");
      }
    );
  } else {
    getVersionFreebox();
  }

  _this.callback({});
}

/**
 * Permet de créer une session sur le Freebox Server
 *
 * @param  {Function} after La fonction a appelé dès que la session est ouverte
 */
freeboxPlugin.prototype.requestSession=function(after) {
  var crypto  = require("crypto");
  var _this = this;
  if (_this.logged_in) {
    console.log("[PLUGIN 'Freebox'] Session ouverte.");
    after.call(_this);
  }
  else {
    _this.request(_this.serverURL+"login/", function (error, response, body) {
      if (!error && response.statusCode == 200) {
        body = JSON.parse(body);
        _this.freeboxServer.logged_in = body.result.logged_in; 
        _this.freeboxServer.challenge = body.result.challenge; 
        //generation du password
        _this.freeboxServer.password = crypto.createHmac('sha1', _this.config.app_token).update(_this.freeboxServer.challenge).digest('hex'); 
        // si logué
        if (_this.freeboxServer.logged_in) {
          after.call(_this);
        } else {
          //POST app_id & password
          var options = {
            url:_this.serverURL+"login/session/",
            method:"POST",
            json: {
             "app_id"     : _this.freeboxServer.app_id,
             "app_version": _this.config.version,
             "password"   : _this.freeboxServer.password,
            },
            encode:"utf-8"
          };

          _this.request(options, function(error, response, body) {
            if (!error && (response.statusCode == 200 || response.statusCode == 403)) {
              _this.freeboxServer.challenge = body.result.challenge; 
              if (response.statusCode == 200) { 
                _this.freeboxServer.session_token = body.result.session_token; 
                _this.freeboxServer.logged_in     = true; 
                _this.freeboxServer.permissions   = body.result.permissions;
                console.log("[PLUGIN 'Freebox'] Ouverture de session.");
                after.call(_this);
              } else if(response.statusCode == 403) { 
                _this.freeboxServer.logged_in = false; 
                console.log("[PLUGIN 'Freebox'] Erreur lors de l'ouverture de session : "+body.msg);
              }
            } else {
              console.log("[PLUGIN 'Freebox'] Erreur dans la requête : "+error);
            }
          });
        }
      } else {
        console.log("[PLUGIN 'Freebox'] Erreur dans la requête : "+error);
      }
    })
  }
}

/**
 * Détecte si la Freebox est éteinte ou allumée
 *
 * @param {Function} after La fonction qui est appelé avec TRUE si allumé, FALSE sinon
 */
freeboxPlugin.prototype.isPlayerOn=function(after) {
  var debut=new Date().getTime();
  var _this = this;
  if (_this.config.freebox_v5) {
    after.call(_this, true);
    return;
  }
  _this.requestSession(function() {
    var options = {
      url:_this.serverURL+"airmedia/receivers/Freebox%20Player/",
      headers:{
        "X-Fbx-App-Auth": _this.freeboxServer.session_token
      }, 
      method:"POST",
      json: {
        "action":"stop",
        "media_type":"video"
      },
      encode:"utf-8"
    };
    var request = require("request");
    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        // Freebox allumée
        console.log("[PLUGIN 'Freebox'] Durée de la vérification de la Freebox allumée : "+((new Date()).getTime() - debut)+"ms");
        after.call(_this, body.success);
      } else {
        console.log("[PLUGIN 'Freebox'] Erreur dans la requête : ",error);
      }
    });
  })
}

freeboxPlugin.prototype.toBase64=function(str) { return new Buffer(str).toString('base64') }
freeboxPlugin.prototype.fromBase64=function(str) { return new Buffer(str, 'base64').toString() }

/**
 * Trouve un dossier dans path
 * @param {String} path Le path à explorer
 * @param {Number} [total] C'est utilisé par la récursivité pour savoir le total des dossiers
 * @param {Array} [res] C'est utilisé par la récursivité pour stocker tous les dossiers trouvés
 */
freeboxPlugin.prototype.findFolder=function(path, total, res) {
  var _this=this;
  var b64path = _this.toBase64(path);
  res = res || [];
  _this.requestSession(function() {
    var options = {
      url:_this.serverURL+"fs/ls/"+b64path+"?countSubFolder=1&onlyFolder=1&removeHidden=1",
      headers : {
        'X-Fbx-App-Auth' : _this.freeboxServer.session_token
      },
      method:"GET"
    };
    _this.request(options, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        var listFolders = {}, foldername, folderpath;
        body = JSON.parse(body);
        if (body.result) {
          if (!total) total=body.result.length
          for (var i=0, stop=body.result.length; i<stop; i++) {
            if (!body.result[i].hidden && body.result[i].type === "dir") {
              foldername = body.result[i].name;
              folderpath = _this.fromBase64(body.result[i].path);
              res.push({
                'foldername':foldername,
                'path64':body.result[i].path,
                'path':folderpath
              });

              if (body.result[i].foldercount > 0) {
                total += body.result[i].foldercount;
                _this.findFolder(folderpath, total, res)
              }
            }
          }
        }

        // on a terminé
        if (res.length === total) {
          // on crée la grammaire
          for (var j=0; j<total; j++) listFolders[res[j].foldername] = j;
          _this.SARAH.askme("Quel est le nom du dossier ?", listFolders, 0, function(answer, end) {
            _this.isPlayerOn(function(etat) {
              if (etat === false) {
                _this.SARAH.speak("La Freebox est actuellement éteinte.");
              } else {
                _this.SARAH.speak("Je vais dans le dossier "+res[answer].foldername+"...");
                // on se déplace dans Mes Vidéos
                var url = _this.buildPlayerURL(_this.commands["videos"].key);
                _this.requestURL(url, "", function() {
                  // puis dans le répertoire
                  setTimeout(function() {
                    _this.goToFolder(res[answer].path64);
                  }, 2500)
                })
              }
            })

            end();
          })
        }

      } else {
        console.log("[PLUGIN 'Freebox'] Erreur dans findFolder() : ", body);
      }
    });
  })
}

/**
 * SARAH va se déplacer jusque dans le dossier spécificer
 * @param  {String} b64path La version base64 du path
 */
freeboxPlugin.prototype.goToFolder=function(b64path) {
  var _this=this;
  var path = _this.fromBase64(b64path);
  var folders = path.split("/").slice(3);
  _this.requestSession(function() {
    // on fouille
    var deeper=function(folder, currentPath) {
      var options = {
        url:_this.serverURL+"fs/ls/"+_this.toBase64(currentPath),
        headers : {
          'X-Fbx-App-Auth' : _this.freeboxServer.session_token
        },
        method:"GET"
      };
      _this.request(options, function (err, response, body) {
        if (!err && response.statusCode == 200) {
          var listFolders = {}, oFolders={}, folderName;
          var commands = [];
          body = JSON.parse(body);
          for (var i=0, stop=body.result.length; i<stop; i++) {
            if (!body.result[i].hidden) {
              if (body.result[i].type === "dir" && body.result[i].name === folder) {
                // on l'a trouvé
                commands.push("ok");
                commands = commands.join("|");
                // on entre dedans
                _this.requestURL(_this.buildPlayerURL(commands), "", function() {
                  if (folders.length === 0) {
                    _this.SARAH.speak("C'est bon !");
                  } else {
                    deeper(folders.shift(), currentPath+"/"+folder)
                  }
                });
                break;
              } else {
                // on descend
                commands.push("down");
              }
            }
          }
        }
      })
    };

    deeper(folders.shift(), "/Disque dur/Vidéos");
  })
}

/**
 * Va comparer data.key à freeboxPlugin.commands et va executer l'action associée
 *
 * @param {Boolean} [etat=false] À TRUE si la Freebox est allumée
 */
freeboxPlugin.prototype.executeCommand=function(etat) {
  var url, _this=this;
  var cmd = _this.commands[_this.data.key];

  // différentes actions selon si la Freebox est allumée ou éteinte
  // on regarde si la tv est allumée
  if (etat === undefined) {
    _this.isPlayerOn(_this.executeCommand)
    _this.callback({})
    return
  }
  if (etat === false && _this.data.key !== "tvOn" && _this.data.key !== "on") {
    _this.SARAH.speak("La Freebox n'est pas allumée.");
    _this.callback({})
    return;
  }

  if (etat === true) {
    switch (_this.data.key) {
      case "on":{
        _this.SARAH.speak("La Freebox est déjà allumée.");
        _this.callback({})
        return;
      }
      case "tvOn":{
        _this.data.key = "tv";
        break;
      }
    }
  }

  // on regarde s'il s'agit d'une commande spéciale comme "allume la Freebox"
  if (cmd) {
    url = _this.buildPlayerURL(cmd.key);
    _this.SARAH.speak(cmd.tts);
    _this.requestURL(url, cmd.tts, function() {
      // si 'after' est défini, alors on aura une seconde commande en différé
      if (cmd.after) {
        setTimeout(function() {
          url = _this.buildPlayerURL(cmd.after.key);
          _this.requestURL(url, cmd.after.tts, function() {
            _this.SARAH.speak(cmd.after.tts);
            if (_this.data.key === "tvOn") {
              // on coupe le son pour éviter des interférences et bien comprendre la possible réponse
              url = _this.buildPlayerURL("mute")
              _this.requestURL(url);

              // on récupère les règles XML pour l'allumage de la TV
              var xmlChaines = {};
              var fs = require('fs'), xml2js = require('xml2js');
              var parser = new xml2js.Parser({trim: true});
              var path, i, phrase;
              fs.readFile(__dirname + '\\freebox.xml', function(err, xml) {
                parser.parseString(xml, function(err, result) {
                  path=result.grammar.rule[0]["one-of"][0].item;
                  for (i=0, len=path.length; i<len; i++) {
                    if (/^zappe/.test(path[i]._)) {
                      key = path[i].tag[0].replace(/out.action.key="(\d+)";out.action.msg=".*"/,"$1");
                      phrase = "Oui "+path[i]._;
                      xmlChaines[phrase] = key;
                    }
                  }

                  // et on ajoute quelques phrases clés
                  xmlChaines["Non c'est bon"] = "non";
                  xmlChaines["Non merci"] = "non";
                  xmlChaines["Non ça ira merci"] = "non";

                  // pour tvOn on ajoute un askMe
                  _this.SARAH.askme("Veux-tu que je zappe sur une chaine ?", xmlChaines, 8000, function(answer, end){
                    // on remet le son
                    url = _this.buildPlayerURL("mute");
                    _this.requestURL(url)
                    // on regarde la réponse
                    if (answer === "non" || !answer) {
                      _this.SARAH.speak("Très bien", end);
                    } else {
                      _this.SARAH.speak("Je zappe sur la "+answer);
                      url = _this.buildPlayerURL(answer.split('').join('|'));
                      setTimeout(function() { _this.requestURL(url, end) }, 1200);
                    }
                    end();
                  });
                });
              });
            }
          });
        }, cmd.after.delay||5000)
      }
      _this.callback({})
    });
    return;
  }

  // si data.key est un chiffre
  if (!isNaN(_this.data.key)) {
    // on désire zapper sur une chaine
    url = _this.buildPlayerURL(_this.data.key.split('').join('|'));
    if (_this.data.msg) _this.SARAH.speak(_this.data.msg)
    _this.requestURL(url, (_this.data.msg?'':'Voilà'))
  }
}

exports.action = function(data, callback, config, SARAH) {
  var fp = new freeboxPlugin(data, callback, config, SARAH);
  if (data.key === "configuration") {
    fp.configure();
    callback({});
    return;
  }
  if (data.key === "test") {
    callback({tts:"Test effectué"});
    return
  }
  if (data.key === "findFolder") {
    fp.foldersFound = [];
    SARAH.speak("Chargement des dossiers en cours...", function() {
      fp.findFolder(fp.config.search_path);
    });
    callback({});
    return
  }
  if (!fp.checkConfiguration()) return;

  // Si aucune "key" n'est passée, ça veut dire qu'on n'a pas reçu d'ordre
  if (!data.key){
    callback({ 'tts': '' });
    return;
  }

  fp.executeCommand();
}

exports.init = function(SARAH) {
  // au démarrage du plugin on veut vérifier la configuration
  var config = SARAH.ConfigManager.getConfig();
  var data = null;
  var callback = function(){};
  var fp = new freeboxPlugin(data, callback, config, SARAH);
  fp.init();
  fp.checkConfiguration();
}

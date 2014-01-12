// Les actions un peu spéciales
var commands = {
  'on'      : { key: 'power',       tts: "j'allume la fribox"},
  'off'     : { key: 'power',       tts: "j'éteint la fribox"},
  'tv'      : { key: 'home|right|left|red|ok', tts: "je mets la télé"},
  'tvOn'    : { key: 'power',       tts: "j'allume la télé", 
                after: { key: 'ok', tts: "la télé est allumée", delay: 5000 }
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
}

exports.action = function(data, callback, config, SARAH){
  // On récupère la config
  config = config.modules.freebox;
  if (!config.code_telecommande){
    callback({ 'tts': 'Vous devez configurer le plugin Freebox avec le code de la télécommande' });
    return;
  }
  
  // Si aucune "key" n'est passée, ça veut dire qu'on n'a pas reçu d'ordre
  if (!data.key){
    callback({ 'tts': '' });
    return;
  }

  // URL qui permet de discuter avec la Freebox
  var _url = 'http://hd1.freebox.fr/pub/remote_control?code='+config.code_telecommande;
  var url;
  var cmd = commands[data.key];
  // si on envoie une commande spéciale comme "allume la Freebox"
  if (cmd) {
    url = buildURL(_url+'&key=', cmd.key);
    requestURL(url, cmd.tts, callback, function() {
      // si 'after' est défini, alors on aura une seconde commande en différé
      if (cmd.after) {
        setTimeout(function() {
          url = buildURL(_url+"&key=", cmd.after.key);
          requestURL(url, cmd.after.tts, function(j) {
            SARAH.speak(j.tts)
            if (data.key === "tvOn") {
              // on coupe le son pour éviter des interférences et bien comprendre la possible réponse
              url = buildURL(_url+"&key=", "mute")
              requestURL(url);
            
              // pour tvOn on ajoute un askMe
              SARAH.askme("Veux-tu que je zappe sur une chaine ?", {
                "Oui zappe sur Ah Bé 1": "39",
                "Oui zappe sur Arté": "7",
                "Oui zappe sur BFM TV": "15",
                "Oui zappe sur Canal plus": "4",
                "Oui zappe sur Chérie": "25",
                "Oui zappe sur Clubbing TV": "73",
                "Oui zappe sur D17": "17",
                "Oui zappe sur D8": "8",
                "Oui zappe sur Disney Channel": "48",
                "Oui zappe sur Euronews": "82",
                "Oui zappe sur L'équipe": "21",
                "Oui zappe sur France 2": "2",
                "Oui zappe sur France 24": "95",
                "Oui zappe sur France 3": "3",
                "Oui zappe sur France 4": "14",
                "Oui zappe sur France 5": "5",
                "Oui zappe sur France O": "19",
                "Oui zappe sur Game One": "118",
                "Oui zappe sur Game One plus un": "66",
                "Oui zappe sur Gulli": "18",
                "Oui zappe sur H dé un": "20",
                "Oui zappe sur IDée F 1": "214",
                "Oui zappe sur I-Télé": "16",
                "Oui zappe sur LCP": "13",
                "Oui zappe sur La Chaine Parlementaire": "13",
                "Oui zappe sur M6": "6",
                "Oui zappe sur 6 ter": "22",
                "Oui zappe sur No Life": "123",
                "Oui zappe sur NRJ 12": "12",
                "Oui zappe sur NRJ Hits": "65",
                "Oui zappe sur NT1": "11",
                "Oui zappe sur Numéro 23": "23",
                "Oui zappe sur RMC": "40",
                "Oui zappe sur RMC Découverte": "40",
                "Oui zappe sur RTL9": "28",
                "Oui zappe sur TF1": "1",
                "Oui zappe sur TMC": "10",
                "Oui zappe sur TV5": "79",
                "Oui zappe sur Vivolta": "38",
                "Oui zappe sur W 9": "9",
                "Non c'est bon" : "non",
                "Non merci": "non",
                "non ça ira merci": "non"
              }, 8000, function(answer, end){
                // on remet le son
                url = buildURL(_url+"&key=", "mute");
                requestURL(url)
                // on regarde la réponse
                if (answer === "non" || !answer) {
                  SARAH.speak("Très bien", end);
                } else {
                  SARAH.speak("Je zappe sur la "+answer);
                  url = buildURL(_url+'&key=', answer.split('').join('|'));
                  requestURL(url, null, end)
                }
              });
            }
          });
        }, cmd.after.delay||5000)
      }
      callback()
    });
    return;
  }
  
  // Lorsqu'on désire zapper sur une chaine
  url = buildURL(_url+'&long=true&key=', data.key.split('').join('|'));
  if (data.msg) SARAH.speak(data.msg)
  requestURL(url, (data.msg?'':'Voilà'), callback)
}

// Construit l'URL qui doit être utilisée pour communiquer avec la Freebox
//
// @param {String} url L'URL de base qui doit être utilisée avec le CODE télécommande
// @param {String} keys La ou les clés à utiliser dans la commande
// @return {Array} On va retourner un tableau d'URL à utiliser
var buildURL = function(url, keys){
  if (keys.length <= 0) { callback({'tts' : "Je n'ai pas compris"}); return; }
  // si la commande contient des '*' ça veut dire qu'on a plusieurs occurences pour la commande ciblée
  if (keys.indexOf('*') > -1) {
    keys=keys.replace(/([a-z_]+)(\*[0-9]+)(\|)?/g,function(all,a,b,c) {
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
    for (var i=0; i < len; i++) rUrl.push(url+spl[i])
    return rUrl
  } else return [ url+keys ]
}

// Appelle une URL
//
// @param {String} url L'URL qu'on va appeler
// @param {String} tts Le message qui sera lu une fois la requête faite
// @param {Function} callback La fonction de callback qui va lire le message de 'tts'
// @param {Function} [after] La fonction qui sera lancée une fois la requête terminée
var requestURL = function(url, tts, callback, after){
  var request = require('request');
  var u=url.shift();
  console.log("url="+u)
  request({ 'uri': u }, function (err, response, json){
    if (err || response.statusCode != 200) {
      callback({'tts': "L'action a échoué"});
      return;
    }
    
    if (url.length>0) requestURL(url, tts, callback, after)
    else {
      if (callback) {
        if (tts) callback({ 'tts': tts })
        else callback()
      }
      if (after) after.call(this)
    }
  });
}

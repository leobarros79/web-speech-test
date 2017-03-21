// Crio e retorno um objeto WebSpeechRecognition.
function WebSpeechRecognition() {
  var r = this;
  r.continuous = false;
  r.lang = '';
  r.maxAlternatives = 1;
  r.status_array = status_array_ptBR;
  r.image_array = image_array_mic;
  var recognizing = false;
  var ignore_onend;

  // Retorno false se a api nao esta disponivel
  // navegador nao suporta, geralmente
  r.supported = function() {
    return !!r.recognition;
  };

  
  r.statusText = function(id) {
    r.status_elem = r.getElem(id);
    r.refreshState();
  };

  
  r.statusImage = function(id) {
    r.image_elem = r.getElem(id);
    r.refreshState();
  };

  
  r.finalResults = function(id) {
    r.final_results = r.getElem(id);
  };

  
  r.interimResults = function(id) {
    r.interim_results = r.getElem(id);
  };

  
  r.inProgress = function() {
    return recognizing;
  };

  // Inicio o reconhecimento.
  r.start = function() {
    recognizing = true;
    ignore_onend = false;
    r.final_transcript = '';
    r.setText(r.final_results, '');
    r.setText(r.interim_results, '');
    r.recognition.continuous = r.continuous;
    r.recognition.interimResults = !!r.interim_results;
    r.recognition.maxAlternatives = r.maxAlternatives;
    if (r.lang != '') {
      r.recognition.lang = r.lang;
    }
    r.recognition.start();
    r.onState('allow');
  };

  // Finalizo.
  r.stop = function() {
    recognizing = false;
    r.recognition.stop();
  };

  r.toggleStartStop = function() {
    if (reco.inProgress()) {
      reco.stop();
    } else {
      reco.start();
    }
  };


  r.onState = function(key) {
    r.onStatusChange(key);
    r.onImageChange(key);
    r.currentState = key;
  };

  r.refreshState = function() {
    r.onState(r.currentState);
  };

  r.onStatusChange = function(key) {
    if (!!r.status_elem) {
      var s = r.status_array[key];
      if (s) {
        r.setText(r.status_elem, s);
        r.status_elem.style.visibility = 'visible';
      } else {
        r.status_elem.style.visibility = 'hidden';
      }
    }
  };

  r.onImageChange = function(key) {
    if (!!r.image_elem) {
      var f = r.image_array[key];
      if (!f) {
        f = r.image_array['disable'];
      }
      r.image_elem.src = f;
    }
  };

  r.setText = function(elem, text) {
    if (elem) {
      if (elem.nodeName == 'INPUT') {
        elem.value = text;
      } else {
      elem.innerHTML = r.linebreak(text);
      }
    }
  };

  r.getElem = function(id) {
    if (typeof(id) == 'string') {
      return document.getElementById(id);
    }
    return id;
  };

  var two_line = /\n\n/g;
  var one_line = /\n/g;
  r.linebreak = function(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
  };

  var first_char = /\S/;
  r.capitalize = function(s) {
    return s.replace(first_char, function(m) { return m.toUpperCase(); });
  };

  if (!('webkitSpeechRecognition' in window)) {
    r.onState('upgrade');
  } else {
    r.recognition = new webkitSpeechRecognition();
    r.final_transcript = '';
    r.interim_transcript = '';
    r.onState('ready');
    r.onEnd = null;

    r.recognition.onstart = function() {
      recognizing = true;
      r.onState('active');
    };

    r.recognition.onerror = function(event) {
      if (event.error == 'no-speech' ||
          event.error == 'audio-capture' ||
          event.error == 'not-allowed') {
        r.onState(event.error);
        ignore_onend = true;
      }
    };

    r.recognition.onend = function() {
      recognizing = false;
      if (ignore_onend) {
        return;
      }
      if (r.final_transcript == '') {
        r.onState('ready');
        return;
      }
      r.onState('complete');
      if (!!r.onEnd) {
        r.onEnd();
      }
    };

    r.recognition.onresult = function(event) {
      r.interim_transcript = '';
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          r.final_transcript += event.results[i][0].transcript;
        } else {
          r.interim_transcript += event.results[i][0].transcript;
        }
      }
      r.final_transcript = r.capitalize(r.final_transcript);
      r.setText(r.final_results, r.final_transcript);
      r.setText(r.interim_results, r.interim_transcript);
      if (!!r.onResult) {
        r.onResult();
      }
    };
  }
}

var status_array_ptBR = {
  'ready' : 'Clique no ícone do microfone e comece a falar.',
  'active' : 'Fale agora.',
  'no-speech' : 'Nenhuma fala foi detectada. Talvez você precise ajustar a ' +
      '<a href="//support.google.com/chrome/bin/answer.py?hl=en&amp;answer=1407892">' +
      ' configuração do microfone</a>.',
  'audio-capture' :
      'Microfone não encontrado. Certifique-se de que o microfone está instalado e corretamente ' +
      '<a href="//support.google.com/chrome/bin/answer.py?hl=en&amp;answer=1407892">' +
      ' configurado</a>.',
  'allow' : 'Clique em "Allow" para habilitar o seu microfone.',
  'not-allowed' : 'Permissão para utilizar o microfone negada. Para alterar, vá até ' +
      'chrome://settings/contentExceptions#media-stream',
  'upgrade' : 'Speech Web API não é suportado por este browser. Atualize-o ' +
      '<a href="//www.google.com/chrome">Chrome</a>.'
};

var image_array_mic = {
  'ready' : 'mic.gif',
  'complete' : 'mic.gif',
  'active' : 'mic-animate.gif',
  'no-speech' : 'mic.gif',
  'disable' : 'mic-slash.gif'
};



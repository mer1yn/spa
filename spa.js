// variable global app
var app = null;

// cluster
(function() {

  // new App
  app = new App();

  // estructura de nuestra app
  function App() {
    this.controllers = {}; // inicializamos los controladores
    this.routes = {}; // inicializamos todas las rutas
    this.configurations = [];
    // metodo para definir un nuevo controlador
    this.controller = function(name, behavior) {
      this.controllers[name] = new Controller(name, behavior);
    }
    // metodo para definir una nueva ruta
    this.route = function(route) {
      this.routes[route.url] = new Route(route);
    }
    this.defaultRoute = '/';
    // metodo para definir una nueva configuracion
    this.config = function(behavior) {
      this.configurations.push(behavior)
    }
  }

  // estructura de un controlador
  function Controller(name, behavior) {
    this.name = name;
    this.behavior = behavior;

    this.execute = function() {
      this.behavior(new Util());
    }
  }

  function Route(route) {
    this.name = route.name;
    this.url = route.url;
    this.template = '';
    this.templateURL = route.templateURL;
    this.controller = route.controller;
  }

    function Util() {
      // selector $()
      var self = function(selector) {
        return document.querySelector(selector)
      }
      // cosas de http
      self.http = new Http();
      // create element
      self.createElement = function createElement() {
        var element = document.createElement(arguments[0])
        element.className = arguments[1]
        element.innerHTML = arguments[2]
        for (var i = 3; i < arguments.length; i++) {
          element.appendChild(arguments[i])
        }
        return element
      }
      return self;
    }

    function Http() {
      var xhttp = new XMLHttpRequest()
      this.getHTML = function(url) {
        return requestHTML(url);
      }
      this.get = function(url, id) {
        return request('GET', url, id);
      }
      this.post = function(url, params) {
        return request('POST', url, null, params);
      }
      this.put = function(url, id, params) {
        return request('PUT', url, id, params);
      }
      this.delete = function(url, id) {
        return request('DELETE', url, id)
      }
      function request(method, url, id, params) {
        return new Promise(function(resolve, reject) {
          xhttp.open(method, url + (id ? '/' + id : ''), true);
          xhttp.setRequestHeader('Content-type','application/json; charset=utf-8');
          xhttp.onload = function() {
            resolve(JSON.parse(xhttp.responseText));
          }
          xhttp.send(JSON.stringify(params))
        })
      }

      function requestHTML(url) {
        return new Promise(function(resolve, reject) {
          xhttp.open('GET', url, true);
          xhttp.onload = function() {
            resolve(xhttp.responseText);
          }
          xhttp.send();
        })
      }
    }

  // esperamos a que cargue el contenido de la pagina
  window.onload = function() {
    // objetemos <app></app>
    var container = document.querySelector('app');
    // config
    for (config of app.configurations) {
      config() // ejecutamos las configuraciones
    }

    handleHash()
    window.onhashchange = function() { // escuchamos cuando la url cambie
      handleHash() // y tambien manejamos el hash cuando cambie
    }
    function handleHash() { // manejamos el hash
      var hash = window.location.hash.split('#')[1];
      var route = app.routes[hash]
      if (route) {
        // container.innerHTML = route.template
        console.log(window.location.origin + route.templateURL);
        var http = new Http();
        http.getHTML(window.location.origin + route.templateURL).then(function(data) {
          route.template = data;
          container.innerHTML = data;
          var ctrl = app.controllers[route.controller]
          if (ctrl) {
            ctrl.execute()
          } else {
            throw 'controller no encontrado para la ruta ' + route.name
          }
        })
      } else {
        console.warn('ruta no encontrada, yendo al main')
        window.location.hash = '#' + app.defaultRoute
      }
    }
  }

})();

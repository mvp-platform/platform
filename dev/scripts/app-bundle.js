define('app',['exports', './todo'], function (exports, _todo) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.App = undefined;
  class App {
    constructor() {
      this.heading = 'Todos';
      this.todos = [];
      this.todoDescription = '';
    }

    addTodo() {
      if (this.todoDescription) {
        this.todos.push(new _todo.Todo(this.todoDescription));
        this.todoDescription = '';
      }
    }

    removeTodo(todo) {
      let index = this.todos.indexOf(todo);
      if (index !== -1) {
        this.todos.splice(index, 1);
      }
    }

  }
  exports.App = App;
});
define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  //Configure Bluebird Promises.
  Promise.config({
    warnings: {
      wForgottenReturn: false
    }
  });

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(() => aurelia.setRoot());
  }
});
define('todo',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    class Todo {
        constructor(description) {
            this.description = description;
            this.done = false;
        }

    }
    exports.Todo = Todo;
});
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {
    //config.globalResources([]);
  }
});
define('text!style.css', ['module'], function(module) { module.exports = "body {\n   background-image: url('../images/main_background.jpg');\n}\nsection {\n    float: left;\n    width: 60%;\n    height: 800px;\n    background: lightgray;\n    border: 1px solid gray;\n    border-radius: 5px;\n    margin: 10px;\n}\naside {\n    float: left;\n    width: auto;\n    min-width: 25%;\n    height: 800px;\n    background: lightgray;\n    border: 1px solid gray;\n    border-radius: 5px;\n    margin: 10px;\n}\n#bookView div {\n    width: 100%;\n    height: auto;\n    min-height: 500px;\n    background-color: white;\n}\n#scrapView div {\n    width: 100%;\n    height: auto;\n}"; });
define('text!app.html', ['module'], function(module) { module.exports = "<template><require from=\"style.css\"></require><section><div id=\"bookView\"><h1>${heading}</h1><form submit.trigger=\"addTodo()\"><input type=\"text\" value.bind=\"todoDescription\"> <button type=\"submit\">Add Todo</button></form><ul><li repeat.for=\"todo of todos\"><input type=\"checkbox\" checked.bind=\"todo.done\"> <span css=\"text-decoration: ${todo.done ? 'line-through' : 'none'}\">${todo.description} </span><button click.trigger=\"removeTodo(todo)\">Remove</button></li></ul></div><div id=\"scrapView\"><p>Another section</p></div></section><aside><p><span>words</span></p></aside></template>"; });
//# sourceMappingURL=app-bundle.js.map
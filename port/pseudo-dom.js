const hexToRgba = function(hex, a) {
  if (hex.charAt(0) !== '#') {
    return hex;
  }
  const fixHex = (hex) => {
    let newHex = hex.startsWith('#') ? hex.slice(1) : hex;

    if (newHex.length === 3) {
      newHex = `${newHex.slice(0, 1)}${newHex.slice(0, 1)}${newHex.slice(1, 2)}${newHex.slice(1, 2)}${newHex.slice(2, 3)}${newHex.slice(2, 3)}`;
    }


    return newHex;
  };

  const newHex = fixHex(hex);
  const r = parseInt(newHex.substring(0, 2), 16);
  const g = parseInt(newHex.substring(2, 4), 16);
  const b = parseInt(newHex.substring(4, 6), 16);

  let o;
  if (newHex.length === 8) {
    o = +((parseInt(newHex.substring(6, 8), 16)/255).toFixed(2));
  }
  o = isNumeric(a) ? a : o;

  return isNumeric(o) ? `rgba(${r}, ${g}, ${b}, ${o})` : `rgb(${r}, ${g}, ${b})`;
};

const isNumeric = n => !isNaN(parseFloat(n)) && isFinite(n);


var navigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
}

var KEBAB_REGEX = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g;
var REVERSE_REGEX = /-[a-z\u00E0-\u00F6\u00F8-\u00FE]/g;
var kebabCache = {};
function kebabCase(str) {
  if (!kebabCache[str]) {
    kebabCache[str] = str.replace(KEBAB_REGEX, function (match) {
  		return '-' + match.toLowerCase();
  	});
  }
	return kebabCache[str];
};


var imageId = 0;

function EventAdapter(callback) {
  return function(e) {
    e.currentTarget = document._ids[e.currentTarget];
    e.srcElement = document._ids[e.srcElement];
    e.target = document._ids[e.target];
    e.toElement = document._ids[e.toElement];
    e.eventPhase = document._ids[e.eventPhase];
    e.preventDefault = ()=>{};
    callback(e);
  }
}


class Image {
  set src(value) {
    this._src = value;
    asyncImageLoad(this._imgId, this._src , function(result) {
      this.naturalWidth =  result.naturalWidth;
      this.naturalHeight =  result.naturalHeight;
      this.src =  result.src;
      if (typeof this.onload === 'function') {
        this.onload();
      }
    }.bind(this), this.onerror);
  }
  get src() {
    return this._src;
  }
	constructor() {
		imageId++;
		this._imgId = imageId;
		this.src = '';
		this.onload = '';
		this.onerror = '';
    this.node =  document.createElement('img');
    this.node.src = this.src;
    return this;
	}
}



class Element {
  set innerHTML(value) {
    this._removeChildren();

    this._innerHTML = value;

    if (String(value).trim().length === 0) {
      return;
    }

    if (value.indexOf('>')==-1) {
      this.textContent = value;
      asyncSendMessage({action:'setTextContent',id:this.id,textContent:this.textContent});
      this._syncDom();

      return;
      // return;
    }

    if (value.indexOf('<style>')>-1) {
      // this.appendChild(this._root.createElement('style'));
      // return;
    }

    value  = value.replace('</br>','<br/>')

    // var nodes = this._root.htmlParser.parse(value);
    // console.log('textContent',nodes);
    // return;
    // if (!nodes.childNodes.length) {
      this.textContent =value;
        // console.log('textContent',this.textContent);
        asyncSendMessage({action:'setHTML',id:this.id,html:this.textContent});
        // asyncSendMessage({action:'setTextContent',id:this.id,textContent:this.textContent});
        this._syncDom();
    // }
    // nodes.childNodes.forEach(node=>{
      // console.log('uppend',node);
      // if (node) {
        // this.appendChild(this._root.createElement(node.nodeName));
      // }
    // });
  }
  select() {
    console.log('select',arguments);
  }
  blur() {
    console.log('blur',arguments);
  }
  get className() {
    return this._classes.join(' ');
  }
  set className(value) {
    // console.log('setclassName',value,this.id ,this.tagName);
    asyncSendMessage({action:'setClassName',id:this.id,name:value});
    this._syncDom();
    return this._classes = value.split(' ');
  }
  get innerHTML() {
    return this._innerHTML;
  }
  set type(value) {
    this._type = value;
  }
  get type() {
    return this._type;
  }
  serialize() {
    return '';
  }
  getComputedStyle() {
    console.log('getComputedStyle',this.style);
    return this.style;
  }
  setParentNode(parent) {
      this.parentNode = parent;
  }
  _removeChildren() {
    asyncSendMessage({action:'setHTML',id:this.id,html:''});
    this.children.forEach(el=>{
      el.remove();
    });
    this.children = [];
  }
  removeNode() {
    this.parentNode.removeChild(this);
  }
  get firstChild() {
    return this.children[0] || null;
  }
  get lastChild() {
    return this.children[this.children.length-1] || null;
  }
  insertBefore(newElement, referenceElement) {
    var index = this.children.indexOf(referenceElement);
    if (index < 0) {
      index = 0;
    }
    newElement.setParentNode(this);
    this.children.splice( index, 0, newElement );
  }
  remove() {
    this._removeChildren();
    // delete this = undefined;
  }
  removeChild(child) {
    this.children = this.children.filter(el=>el!==child);
    child.remove();
  }
  pause() {

  }
  play() {

  }
  set id(value) {
    this._root._ids[value] = this;
    this._id = value;
  }
  get display() {
    console.log('get display');
    return true;
  }
  set display(value) {
    console.log('set display',value);
    return true;
  }
  get id() {
    return this._id;
  }
  setAttribute(key, value) {
    if (key === 'id') {
      this._id = value;
    }
    if (key === 'style') {
      value.split(';').forEach(e=>{
        let [key,v] = e.split(':');
        if (key && typeof v !== 'undefined') {
          if (key === 'background-color') {
            v = hexToRgba(v);
          }
          this._style[key.trim()] = v.trim();
        }
      });
    }
    this._attributes[key] = value;
    asyncSendMessage({action:'setAttribute',id:this.id,attribute:key,value:value});
    this._syncDom();
  }
  _syncDom() {
    if (!this.offsetHeight) {
        const offHeight = parseInt(this._style.height, 10);
        // console.log(this._style.height);
        if (isNaN(offHeight)) {
          this.offsetHeight = 15;
        } else {
          this.offsetHeight = offHeight;
        }
    }
    if (!this.offsetWidth) {
      const offWidth = parseInt(this._style.width, 10);
      if (isNaN(offWidth)) {
        this.offsetWidth = 16;
      } else {
        this.offsetWidth = offWidth;
      }
      // console.log('offWidth',offWidth);
      // console.log('ewe',this._style.width);
      // this.offsetWidth = this.style.width;
    }
    asyncSendMessage({action:'getElementById',id:this.id}).then(result=>{
      var node = result.result;
      if (!result.result.style) {
        console.log(result.result);
        return;
      }
      // console.log(result.result);
      this.clientWidth = node.clientWidth;
      this.clientHeight = node.clientHeight;
      this.scrollWidth = node.scrollWidth;
      this.scrollHeight = node.scrollHeight;
      this.offsetWidth = node.offsetWidth;
      this.offsetHeight = node.offsetHeight;
      this.innerWidth = node.innerWidth;
      this.innerHeight = node.innerHeight;
      this.scrollTop = node.scrollTop;
      this.scrollLeft = node.scrollLeft;
      this.scrollY = node.scrollY;
      for (var el in node.style) {
        // console.log(el,'"'+node.style[el]+'"');
        this._style[el] = node.style[el];
      }

    });
  }
  get childNodes() {
    return this.children;
  }
  getAttribute(key) {
    return this._attributes[key];
  }
  cloneNode() {
    return this._root.createElement(this.nodeName);
  }
  constructor(nodeName) {
    // if (!nodeName) {
      // return undefined;
      // debugger;
    // }
    var _this = this;

    this._attributes = {};
    this.children = [];
    this._classes = [];
    this.parentNode = null;
    this._style = {
      opacity: 1,
      node: this,
    };
    this.style = new Proxy(this._style, styleProxy);
    this.clientWidth = 1280;
    this.clientHeight = 800;


    this.scrollWidth = 0;
    this.scrollHeight = 0;
    this.offsetWidth = 0;
    this.offsetHeight = 0;
    this.innerWidth = 0;
    this.innerHeight = 0;
    this.scrollTop = 0;
    this.scrollLeft = 0;
    this.scrollY = 0;


    this.nodeName = String(nodeName).toUpperCase();
    this.tagName = this.nodeName;
    this.type = 'node';


    this.styleSheet = {
      addRule(selector,rule) {

          asyncSendMessage({action:'styleSheetAddRule',id:_this.id,selector:selector,rule:rule});
          // console.log('addRule',_this,arguments);
      }
    }

    this.classList = {
        add(name) {
          _this._classes.push(name);
          _this.className = _this._classes.join(' ');
        },
        remove(name) {
          _this.className = _this._classes.filter(e=>e!==name);
          _this.className = _this._classes.join(' ');
        }

    }

    return this;
  }
  _appendChild(element) {
    // console.log('append');
    element.setParentNode(this);
    asyncSendMessage({action:'appendChild',id:this.id,childrenId:element.id});
    this._syncDom();
    this.children.push(element);
  }
  removeEventListener(name, callback) {
    if (!name) {
      return;
    }
    // asyncSendMessage({action:'addEventListener',id:this.id,name:name,callback:callback)});
    console.log('removeEventListener',arguments);
  }
  addEventListener(name, callback) {
    // console.log('addEventListener',name,this);
    if (!name) {
      return;
    }
    asyncSendMessage({action:'addEventListener',id:this.id,name:name,callback:EventAdapter(callback)});
  }
  appendChild(children) {
    if (children.type === 'fragment') {
      console.log('appendFragment',children);
      children.children.forEach((el) => {
        this._appendChild(el);
      });
    } else {
      this._appendChild(children);
    }
  }
}

class DocumentFragment extends Element {
  constructor(data) {
    super(data);
    this.type = 'fragment';
    return this;
  }
}

class TextNode {
  constructor(data) {
    this.innerHTML = data;
    return this;
  }
}

var styleProxy = {
  get(target, prop) {
    // console.log('getStyle',target, prop,kebabCase(prop));
    return target[kebabCase(prop)] || '';
  },
  set(target, prop, value) {
    var kebabProp = kebabCase(prop);
    if (kebabProp === 'css-text') {

      value.split(';').forEach(e=>{
        let [key,v] = e.split(':');
        if (key && typeof v !== 'undefined') {
          if (key === 'background-color') {
            // console.log(v);
            v = hexToRgba(v);
          }
          // console.log(key,v);
            target[key.trim()] = v.trim();
        }
      });
      target.node.setAttribute('style',value);
      console.log(target);
      return true;
    }

    var val = value;

    if (kebabProp === 'background-color') {

      val = hexToRgba(val);
      console.log(val);

    }

    // if (String(value).indexOf(';')>-1) {
    //     console.log('setStyle',target, prop,kebabCase(prop),value);
    // }

    if (isNaN(val)) {
      return true;
    }

    // if (prop === 'opacity') {
      // val = 1;
    // }
    asyncSendMessage({action:'setStyle',id:target.node.id,attribute:kebabProp,value:val});

    // console.log('target.id',target);

    // console.log('setStyle',target, prop, value);
    target[kebabProp] = val;
    target.node._syncDom();
    return true;
  }
}

var windowProxy = {
  get(target, prop) {
    // if (target.tagName) {
          // console.log('get',target, prop);
    // }

    return target[prop];
  },
  set(target, prop, value) {
    // console.log('set',target, prop, value);
    target[prop] = value;
    return true;
  }
}

class Document {
  _syncDom(id) {
    if (!id) {
      return;
    }
    this._ids[id]._syncDom();
  }
  getElementsByTagName(tagName) {
      if (tagName === '*') {
        var els = [];
        for (i in this.taggedElements) {
          this.taggedElements[i].forEach(e=>els.push(e));
        }
        return els;
      }
      return this.taggedElements[tagName.toUpperCase()];
  }
  _createElement(name,textContent) {
      this.nodeCounter++;
      var elementName = String(name).toUpperCase();
      var node = new Element(elementName);
      node._root = this;
      if (!this.taggedElements[elementName]) {
        this.taggedElements[elementName] = [];
      }
      this.taggedElements[elementName].push(node);
      this.allNodes.push(node);
      node.textContent = textContent;
      if (elementName === 'BODY') {
          node.id = 'body-node';
      } else if (elementName === 'HEAD') {
          node.id = 'head-node';
      } else {
        node.id = this.nodeCounter;
      }
      asyncSendMessage({action:'createNode',id:node.id,tag:node.tagName,textContent:textContent||''});
      // console.log('elementName',elementName);
      return node;
  }
  get htmlParser() {
    return htmlParser;
  }
  constructor() {
    this.taggedElements = {};
    // this.htmlParser = htmlParser;
    this._ids = {};
    this.allNodes = [];
    this.nodeCounter = 0;
    this.head = this._createElement('head');
    this.head.setParentNode(this);
    this.body = this._createElement('body');
    this.body.setParentNode(this);
    this.documentElement = this._createElement('html');
    this.parentNode =  this.documentElement;
  }
  getElementById(id) {
    // console.log('getElementById',id);
    return this._ids[id] || this.body;
  }
  createElementNS(ns, nodeName) {
    // console.log('createElement',nodeName,arguments);
    return this._createElement(nodeName);
  }
  createElement(nodeName) {
    // console.log('createElement',nodeName,arguments);
    return new Proxy(this._createElement(nodeName),windowProxy);
  }
  createTextNode(data) {
    return new TextNode(data);
  }
  createDocumentFragment() {
    return new DocumentFragment();
  }
}

var window = new Proxy({},windowProxy);
window.requestAnimationFrame = requestAnimationFrame;
var _localStorage = {};
window.localStorage = {
	setItem: function(key,value) {
		_localStorage[key] = value;
	},
	getItem: function(key) {
		_localStorage[key];
	},
};

function getComputedStyle() {
  console.log('getComputedStyle');
}
var document = new Proxy(new Document(),windowProxy);
window.history = {};
window.history.state = [];
window.history.pushState = function(state, title, url) {
  asyncSendMessage({action:'pushState',id:Date.now(),state:state,title:title,url:url});
  console.log('pushState',arguments);
}
window.screen = {
    width: 1280,
    height: 720
}
window.scrollTo = function() {
  console.log(arguments);
    // asyncSendMessage({action:'scrollTo',id:'window'});
  // console.log('scrollTo', arguments);
}
window.addEventListener = function(name, callback) {
  if (name === 'load') {
    setTimeout(callback, 200);
  }
  asyncSendMessage({action:'addEventListener',id:'window',name:name,callback:EventAdapter(callback)});
}

window.document = document;

function cancelAnimationFrame(id) {
  clearTimeot(id);
}

function requestAnimationFrame(callback) {
  console.log('requestAnimationFrame');
	var id = setTimeout(function(){
		callback(performance.now());
	},100);
  return id;
}

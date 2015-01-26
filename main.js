(function (root, factory) {
    if (typeof define === 'function' && define.amd) define([], factory);
    else if (typeof exports === 'object') module.exports = factory();
    else root.Logger = factory();
}(this, function(){

var ARRAY_SLICE = Array.prototype.slice,
    ARRAY_PUSH = Array.prototype.push,
    DEFAULT_PRINTER = console && console.log ? console.log.bind(console) : function(){},
    PRINTER = DEFAULT_PRINTER;

var LEVELS = [
    'DBG',
    'INF',
    'WRN',
    'ERR',
    'OFF'
].reduce(function(p, e, i, o){
    p.toNumber[e] = i;
    p.toString[i] = e;
    return p;
}, {
    toNumber: {},
    toString: {}
});

var gLevel = LEVELS.toNumber.INF,
    gCounter = 0,
    lCounter = 0,
    gNameFilter,
    gStart;

/**
 * Constructor
 */
function Logger(name){
    this.id = lCounter++;
    this.name = name || "Logger " + this.id;
    this.hasGivenName = !!name;
    this.level = LEVELS.toNumber.DBG;
    this.counter = 0;
    this.start = null;
}

/**
 * Filterting rules:
 * 1. Should be at least as severe as the global level
 * 2. Should be at least as severe as the local level
 * 3. logger's name should pass name filter
 */
function allow(logger, level){
    if (level < gLevel) return false;
    if (level < logger.level) return false;
    if (gNameFilter && !gNameFilter.test(logger.name)) return false;
    return true;
}

function _print(logger, level, args){
    if (!allow(logger, level)) return;
    if (!gStart) gStart = Date.now();
    if (!logger.start) logger.start = Date.now();
    args = ARRAY_SLICE.apply(args);
    var msgs = [
        "[" + (gCounter++) + " " + (Date.now() - gStart) + "]",
        "[" + logger.name + "]",
        "[" + (logger.counter++) + " " + (Date.now() - logger.start) + "]",
        "[" + LEVELS.toString[level] + "]"
    ];
    ARRAY_PUSH.apply(msgs, args);
    PRINTER.apply(null, msgs);
    return args.join(" ");
}

Logger.prototype.log = Logger.prototype.info = Logger.prototype.inf = function(){
    return _print(this, LEVELS.toNumber.INF, arguments);
};

Logger.prototype.debug = function(){
    return _print(this, LEVELS.toNumber.DBG, arguments);
};

Logger.prototype.warn = function(){
    return _print(this, LEVELS.toNumber.WRN, arguments);
};

Logger.prototype.error = Logger.prototype.err = function(){
    return _print(this, LEVELS.toNumber.ERR, arguments);
};

Logger.prototype.off = function(){
    this.level = LEVELS.toNumber.OFF;
};

Logger.prototype.setDebug = function(){
    this.level = LEVELS.toNumber.DBG;
};

Logger.prototype.setInfo = Logger.prototype.setInf = Logger.prototype.setLog = function(){
    this.level = LEVELS.toNumber.INF;
};

Logger.prototype.setWarn = function(){
    this.level = LEVELS.toNumber.WRN;
};

Logger.prototype.setError = Logger.prototype.setErr = function(){
    this.level = LEVELS.toNumber.ERR;
};

Logger.off = function(){
    gLevel = LEVELS.toNumber.OFF;
};

Logger.setDebug = function(){
    gLevel = LEVELS.toNumber.DBG;
};

Logger.setInfo = Logger.setInf = Logger.setLog = function(){
    gLevel = LEVELS.toNumber.INF;
};

Logger.setWarn = function(){
    gLevel = LEVELS.toNumber.WRN;
};

Logger.setError = Logger.setErr = function(){
    gLevel = LEVELS.toNumber.ERR;
};

Logger.filterName = function(filter){
    if (!(filter instanceof RegExp))
        if (typeof filter == 'string' || filter instanceof String)
            filter = new RegExp("^" + filter + "$");
        else throw Error("'filter' must be a RegExp or a string");
    gNameFilter = filter;
};

Logger.setPrinter = function(printer){
    if (!printer) PRINTER = DEFAULT_PRINTER;
    else if (typeof(printer) !== 'function') throw Error("'printer' must be a function");
    else PRINTER = printer;
};

return Logger;

}));

codeHelperJS = {
    setArrayValue: function (array, path, value) {
        if (typeof (array) == 'undefined') {
            return false;
        }
        if (!Array.isArray(path)) {
            path = path.split('/');
        }

        if (path.length > 0) {
            var field = path.shift();
            if (typeof (array[field]) == 'undefined') {
                if (path.length == 0) {
                    array[field] = value;
                } else {
                    array[field] = {};
                    codeHelperJS.setArrayValue(array[field], path, value);
                }
            } else {
                if (path.length == 0) {
                    array[field] = value;
                } else {
                    codeHelperJS.setArrayValue(array[field], path, value);
                }
            }
        }
    },

    getArrayValue: function(array, path) {
        if (typeof (array) == 'undefined') {
            return false;
        }
        if (!Array.isArray(path)) {
            path = path.split('/');
        }
        if (path.length > 0) {
            var field = path.shift();
            if (typeof (array[field]) == 'undefined') {
                return false;
            }
            if (path.length == 0) {
                return array[field];
            } else {
                return codeHelperJS.getArrayValue(array[field], path);
            }
        }
    },

    storageHelper: function(root) {
        get = function() {
            var data = JSON.parse(
                (localStorage[root] !== undefined && localStorage[root] != "undefined") ? localStorage[root] : '{}'
            );
            return codeHelperJS.getArrayValue(data, codeHelperJS.path);
        };
        set = function(path, value) {
            var data = JSON.parse(
                (localStorage[root] !== undefined && localStorage[root] != "undefined") ? localStorage[root] : '{}'
            );
            codeHelperJS.setArrayValue(data, path, value);
            localStorage[root] = JSON.stringify(data);
        };
        return self;
    },

    storageAccess: function(root) {
        codeHelperJS.storage = this.storageHelper(root);
        codeHelperJS.path = [];
        return new Proxy(function() {}, handler = {
            get(arg, name) {
                codeHelperJS.path.push(name);
                return new Proxy(function() {}, handler);
            },
            set(target, prop, value) {
                codeHelperJS.path.push(prop);
                codeHelperJS.storage.set(codeHelperJS.path, value);
                codeHelperJS.path = [];
                return true;
            },
            apply(arg, thisArg, argumentsList) {
                var last = codeHelperJS.path.splice(-1,1);
                if (last == 'get') {
                    result = codeHelperJS.storage.get();
                    codeHelperJS.path = [];
                    return result;
                } else if (last == 'set') {
                    codeHelperJS.storage.set(codeHelperJS.path, argumentsList[0]);
                    codeHelperJS.path = [];
                    return true;
                }
            }
        });
    }
};




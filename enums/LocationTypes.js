const enumValue = (key, value) => Object.freeze({
    toString: () => `LocationTypes.${key}`,
    value,
    equals: (other) => other.value == value
});

const LocationTypes = Object.freeze({
    TREASURE: enumValue('TREASURE', 0),
    POLICE_STATION: enumValue('POLICE_STATION', 1),

    values: function () {
        const data = [];

        for (const [key, obj] of Object.entries(this)) {
            if (key != "values" && key != "getByValue") data.push(obj.value);
        }

        return data;
    },

    getByValue: function (value) {
        for (const [key, obj] of Object.entries(this)) {
            if (obj.value == value) return obj;
        }

        return null;
    },
});

module.exports.LocationTypes = LocationTypes;
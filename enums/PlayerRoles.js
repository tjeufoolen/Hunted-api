const enumValue = (key, value) => Object.freeze({
    toString: () => `PlayerRoles.${key}`,
    value,
    equals: (other) => other.value == value
});

const PlayerRoles = Object.freeze({
    POLICE: enumValue('POLICE', 0),
    THIEF: enumValue('THIEF', 1),

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

module.exports.PlayerRoles = PlayerRoles;
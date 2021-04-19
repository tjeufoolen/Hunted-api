const enumValue = (key, value) => Object.freeze({
    toString: () => `PlayerRoles.${key}`,
    value
});

const PlayerRoles = Object.freeze({
    POLICE: enumValue('POLICE', 0),
    THIEF: enumValue('THIEF', 1),

    values: function () {
        const data = [];

        for (const [key, obj] of Object.entries(this)) {
            if (key != "values") data.push(obj.value);
        }

        return data;
    }
});

module.exports.PlayerRoles = PlayerRoles;
import {CONVERT} from './convert.js';

export const v5 = {
	convertActivation: function (data) {
		if (!data.system.activation) {
			return;
		}

		if (data.flags.obsidian.active === 'passive') {
			data.system.activation.type = 'none';
		} else if (data.flags.obsidian.active) {
			data.system.activation.type = CONVERT.activation[data.flags.obsidian.action];
		}
	},

	convertProficiencies: function (data) {
		const traits = data.system.traits;
		const flags = data.flags.obsidian.traits.profs.custom;

		[['weaponProf', 'weapons'], ['armorProf', 'armour'], ['languages', 'langs']]
			.forEach(([prop, flag]) => {
				const prof = getProperty(traits, `${prop}.value`);
				if (!Array.isArray(prof)) {
					return;
				}

				const convert = CONVERT.profs[prop];
				traits[prop].value = prof.map(prof => convert.get(prof.toLowerCase())).filter(_ => _);

				if (!traits[prop].custom?.length) {
					traits[prop].custom = '';
				}

				const custom = [];
				if (traits[prop].custom.length) {
					custom.push(...traits[prop].custom.split(';'));
				}

				custom.push(...prof.filter(prof => !convert.get(prof.toLowerCase())));
				traits[prop].custom = custom.join(';');
				flags[flag] = custom;
			});
	}
};

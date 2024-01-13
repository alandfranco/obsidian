import {ObsidianDialog} from './dialog.js';

export class ObsidianSensesDialog extends ObsidianDialog {
	static get defaultOptions () {
		const options = super.defaultOptions;
		options.width = 250;
		options.title = game.i18n.localize('OBSIDIAN.EditSenses');
		return options;
	}

	get template () {
		return 'modules/obsidian/html/dialogs/senses.html';
	}

	/**
	 * @param {JQuery} html
	 * @return undefined
	 */
	activateListeners (html) {
		super.activateListeners(html);
		html.find('.obsidian-add-passive').click(this._onAddPassive.bind(this));
		html.find('.obsidian-rm-passive').click(this._onRemovePassive.bind(this));
		ObsidianDialog.recalculateHeight(html);
	}

	async getData () {
		const data = await super.getData();
		data.senses = game.dnd5e.config.senses;
		return data;
	}

	/**
	 * @private
	 * @param {JQuery.TriggeredEvent} evt
	 */
	async _onAddPassive (evt) {
		evt.preventDefault();
		const passives = duplicate(this.parent.actor.flags.obsidian.skills.passives);
		const passive =
			Object.keys(this.parent.actor.system.skills).filter(id => !passives.includes(id))[0];

		if (passive !== undefined) {
			passives.push(passive);
			await this.parent.actor.update({'flags.obsidian.skills.passives': passives});
			this.render(false);
		}
	}

	/**
	 * @private
	 * @param {JQuery.TriggeredEvent} evt
	 */
	async _onRemovePassive (evt) {
		evt.preventDefault();
		const passives = duplicate(this.parent.actor.flags.obsidian.skills.passives);
		const row = parseInt($(evt.currentTarget).data('row-id'));
		passives.splice(row, 1);
		await this.parent.actor.update({'flags.obsidian.skills.passives': passives});
		this.render(false);
	}

	/**
	 * @private
	 */
	async _updateObject (event, formData) {
		const passives = [];
		this.element.find('select').each((i, el) => {
			const id = $(el).val();
			if (!passives.includes(id)) {
				passives.push(id);
			}
		});

		formData['flags.obsidian.skills.passives'] = passives;
		return super._updateObject(event, formData);
	}
}

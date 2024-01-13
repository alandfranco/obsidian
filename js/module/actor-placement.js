import {OBSIDIAN} from '../global.js';
import {Summons} from './summons.js';

export default class ObsidianActorPlacement extends Token {
	static async fromUUID (uuid) {
		const actor = await fromUuid(uuid);
		if (!actor || actor.documentName !== 'Actor') {
			return null;
		}

		const tokenData = game.actors.fromCompendium(actor).prototypeToken;
		tokenData.actorLink = false;
		tokenData.effects = [];

		const doc = new CONFIG.Token.documentClass(tokenData, {parent: canvas.scene});
		const object = new this(doc);
		object.actorUUID = uuid;

		return object;
	}

	place (amount, options) {
		if (!amount) {
			amount = 1;
		}

		const initialLayer = canvas.activeLayer;
		this.draw();
		this.layer.activate();
		this.layer.preview.addChild(this);
		this._activatePreviewListeners(initialLayer, amount, options);
		this.visible = true;
	}

	_activatePreviewListeners (initialLayer, amount, options) {
		const handlers = {};
		let moveTime = 0;

		const cancel = () => {
			OBSIDIAN.cancelActorPlacement = null;
			this.layer.preview.removeChildren().forEach(c => c.destroy({children: true}));
			canvas.stage.off('mousemove', handlers.mm);
			canvas.stage.off('mousedown', handlers.lc);
			canvas.app.view.oncontextmenu = null;
			initialLayer.activate();
		};

		handlers.rc = cancel;
		handlers.mm = evt => {
			evt.stopPropagation();
			const now = Date.now();
			if (now - moveTime <= 20) {
				return;
			}

			const centre = evt.data.getLocalPosition(this.layer);
			const snapped = canvas.grid.getSnappedPosition(centre.x, centre.y, 2);
			this.document.x = snapped.x - this.w / 2;
			this.document.y = snapped.y - this.h / 2;
			try {this.refresh();} catch {}
			moveTime = now;
		};

		handlers.lc = () => {
			cancel();
			const dest = canvas.grid.getSnappedPosition(this.document.x, this.document.y, 2);
			this.document.x = dest.x;
			this.document.y = dest.y;
			Summons.summon(this.actorUUID, amount, dest.x, dest.y, options);
		};

		canvas.stage.on('mousemove', handlers.mm);
		canvas.stage.on('mousedown', handlers.lc);
		canvas.app.view.oncontextmenu = handlers.rc;
		OBSIDIAN.cancelActorPlacement = cancel;
	}
};

export function patchOnEscape () {
	KeyboardManager.prototype._onEscape = (function () {
		const cached = KeyboardManager.prototype._onEscape;
		return function () {
			if (typeof OBSIDIAN.cancelActorPlacement === 'function') {
				OBSIDIAN.cancelActorPlacement();
				return;
			}

			cached.apply(this, arguments);
		};
	})();
}

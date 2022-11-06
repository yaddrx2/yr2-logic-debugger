var overrideList = {
	class: [],
	block: {},
}

global.override = {
	class: (blockClass, def, func) => {
		overrideList.class.push([blockClass, def, func]);
	},
	block: (blockName, def) => {
		if (overrideList.block[blockName]) overrideList.block[blockName].push(def);
		else overrideList.block[blockName] = [def];
	}
}

Events.on(ContentInitEvent, () => {
	overrideList.class.forEach(blockType => {
		Vars.content.blocks().each(instance => {
			if (instance instanceof blockType[0]) {
				global.override.block(instance.name, blockType[1]);
				if (blockType[2]) blockType[2](instance);
			}
		})
	})
	for (let blockName in overrideList.block) {
		const instance = Vars.content.getByName(ContentType.block, blockName);
		const conflate = {};
		for (var def of overrideList.block[blockName])
			Object.assign(conflate, def);
		const blockClass = instance.buildType.get().class;
		instance.buildType = () => extend(blockClass, instance, conflate);
	};
	overrideList = null;
});

require("yr2-logic-debugger/proc");
require("yr2-logic-debugger/mem");
var overrideTable = {
	blockList: {},
	classList: [],
}

global.override = (blockClass, def, func) => {
	const overrideList = blockClass instanceof Block ? overrideTable.blockList[blockClass.name] : overrideTable.classList;
	const overrideItem = blockClass instanceof Block ? def : [blockClass, def, func];
	if (overrideList) overrideList.push(overrideItem);
	else overrideTable.blockList[blockClass] = overrideItem;
}

Events.on(ContentInitEvent, () => {
	overrideTable.classList.forEach(blockType => {
		Vars.content.blocks().each(instance => {
			if (instance instanceof blockType[0]) {
				global.override(instance, blockType[1]);
				if (blockType[2]) blockType[2](instance);
			}
		})
	})
	for (let blockType in overrideTable.blockList) {
		const instance = Vars.content.getByName(ContentType.block, blockType);
		const conflate = {};
		Object.assign(conflate, overrideTable.blockList[blockType]);
		const blockClass = instance.buildType.get().class;
		instance.buildType = () => extend(blockClass, instance, conflate);
	};
	overrideTable = null;
});

require("yr2-logic-debugger/proc");
require("yr2-logic-debugger/mem");
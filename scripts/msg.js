global.override.class(MessageBlock, {
    buildConfiguration(table) {
		if (this.block.accessible())
			this.super$buildConfiguration(table);
        const editTable = new Table(null, t => {
            t.button(Icon.copy, Styles.cleari, () => {
                Core.app.setClipboardText(this.message.toString());
            }).size(40);
            if (table.cells.size > 0) {
                t.add(table.cells.get(0).get()).minWidth(40).height(40);
                t.button(Icon.download, Styles.cleari, () => {
                    this.configure(Core.app.getClipboardText().replace(/\r/g, ''));
                }).size(40);
            }
        });
		table.clear();
		table.top().background(null);
		table.add(editTable);
	}
});
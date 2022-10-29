global.override(LogicBlock, {

	buildConfiguration(table) {
		this.super$buildConfiguration(table);

		this.yr2Setting.codeAdd = false;
		this.yr2Lists.codes = this.code.split('\n');
		this.yr2Lists.codeAddLine = this.yr2Lists.codes.length - 1;

		this.yr2TableBuild();

		const editTable = new Table(null, t => {
			t.add(table.cells.get(0).get()).minWidth(40).height(40);
			t.button(Icon.settings, Styles.cleari, () => {
				this.yr2Setting.yr2table = !this.yr2Setting.yr2table;
				this.yr2TableBuild();
			}).size(40);
		});

		const settingTable = new Table(null, t => {
			for (let i = 1; i < table.cells.size; i++) {
				t.add(table.cells.get(i).get());
				t.row();
			}
		});

		table.clear();
		table.top().background(null);
		table.add(editTable);
		table.row();
		table.add(settingTable);
		table.row();
		table.add(this.yr2Table);
	},

	yr2Setting: {
		yr2table: false,
		step: false,
		lock: false,
		vars: false,
		editor: false,
		codeAdd: false,
		jump: false,
	},

	yr2Lists: {
		codes: [],
		codeAddLine: 0,
		codeAdd: '',
		constants: {},
		links: [],
		counter: 0,
		forward: false,
		stop: false,
		fC: null,
	},

	yr2Table: new Table(),

	yr2TableBuild() {
		this.yr2Table.clear();
		if (this.yr2Setting.yr2table) {
			this.yr2Table.table(null, t => {
				t.button(Icon.rotate, Styles.cleari, () => {
					if (this.executor.vars[0] !== undefined)
						this.executor.vars[0].numval = 0;
				}).size(40);

				t.button(Icon.trash, Styles.cleari, () => {
					this.updateCode(this.code);
					if (this.yr2Setting.lock && this.executor.vars[0] !== undefined)
						this.executor.vars[0].numval = NaN;
					this.yr2Lists.counter = 0;
					if (this.yr2Lists.fC !== null)
						this.yr2Lists.fC.setText('' + this.yr2Lists.counter);
					this.yr2TableBuild();
				}).size(40);

				t.button(Icon.host, Styles.cleari, () => {
					this.yr2Setting.step = !this.yr2Setting.step;
					this.yr2TableBuild();
				}).size(40);

				t.button(Icon.downOpen, Styles.cleari, () => {
					this.yr2Setting.vars = !this.yr2Setting.vars;
					this.yr2TableBuild();
				}).size(40);

				t.button(Icon.menu, Styles.cleari, () => {
					this.yr2Setting.editor = !this.yr2Setting.editor;
					this.yr2TableBuild();
				}).size(40);
			});
			this.yr2Table.row();
			this.yr2Table.table(Styles.black6, t => {
				if (this.yr2Setting.step) {
					t.table(null, tt => {
						tt.table(null, ttt => {
							ttt.check('', this.yr2Setting.lock, c => {
								this.yr2Setting.lock = c;
								if (c) {
									this.yr2Lists.forward = false;
									if (this.executor.vars[0].numval > this.code.split('\n').length - 2 || !this.executor.vars[0].numval > 0)
										this.yr2Lists.counter = 0;
									else this.yr2Lists.counter = this.executor.vars[0].numval + 0;
									this.yr2Lists.fC.setText('' + this.yr2Lists.counter);
								}else this.executor.vars[0].numval = this.yr2Lists.counter + 0;
							}).size(40);
							this.yr2Lists.fC = ttt.field('' + this.yr2Lists.counter, v => {
								this.yr2Lists.counter = v - '';
							}).width(75).get();
							ttt.button(Icon.left, Styles.cleari, () => {
								this.yr2Lists.forward = true;
							}).size(40);
						}).top().height(50);;
						tt.row();
						tt.pane(p => {
							this.yr2Lists.codes = this.code.split('\n');
							for (let line in this.yr2Lists.codes) {
								if (this.yr2Lists.codes[line] == '') break;
								p.table(null, ttt => {
									const lwLine = line;
									const lwP = ttt.labelWrap('').width(20).get();
									lwP.update(() => {
										if (this.yr2Setting.lock) lwP.setText(lwLine == this.yr2Lists.counter ? '[green]>>' : '');
										else lwP.setText(this.executor.vars[0] !== undefined && lwLine == this.executor.vars[0].numval ? '>>' : '');
									});
									ttt.labelWrap(line).width(50);
									ttt.labelWrap(this.yr2Lists.codes[line]).width(430);
								}).left().height(40);
								p.row();
							}
						}).maxHeight(600).width(500).padLeft(10).left();
					}).top().get().update(() => {
						if (this.yr2Setting.lock) {
							if (this.yr2Lists.stop) {
								if (this.executor.vars[0].numval != this.yr2Lists.counter) {
									this.yr2Lists.counter = this.executor.vars[0].numval + 0;
									if (this.yr2Lists.counter > this.code.split('\n').length - 2) {
										this.yr2Lists.counter = 0;
										this.yr2TableBuild();
									}
									this.executor.vars[0].numval = NaN;
									this.yr2Lists.stop = false;
									this.yr2Lists.fC.setText('' + this.yr2Lists.counter);
								}
							}else if (this.yr2Lists.forward) {
								this.yr2Lists.forward = false;
								this.yr2Lists.stop = true;
								this.executor.vars[0].numval = this.yr2Lists.counter + 0;
							} else if (this.executor.vars[0] !== undefined)
								this.executor.vars[0].numval = NaN;
						}
					});
				}
				if (this.yr2Setting.vars) {
					t.table(null, tt => {
						tt.pane(p => {
							this.yr2Lists.links = [];
							for (let v of this.executor.vars) {
								const yr2Var = v;
								let yr2VarText = this.yr2VarsText(yr2Var);
								let yr2VarTime = 0;
								const yr2VarColor = () => {
									if (this.yr2VarsText(yr2Var) + '' != yr2VarText) {
										yr2VarText = this.yr2VarsText(yr2Var);
										yr2VarTime = Time.time;
									}
									if (Time.time < yr2VarTime + 5) return '[green]';
									else return '';
								}
								if (!yr2Var.constant) {
									p.table(null, ttt => {
										const lwN = ttt.labelWrap('').width(200).get();
										const lwV = ttt.labelWrap('').width(300).get();
										lwN.update(() => {
											lwN.setText(yr2VarColor() + yr2Var.name);
										});
										lwV.update(() => {
											lwV.setText(yr2VarColor() + this.yr2VarsText(yr2Var));
										});
									}).minHeight(35);
									p.row();
								} else if (yr2Var.name.startsWith('@')) {
									this.yr2Lists.constants[yr2Var.name] = yr2Var;
								} else if (!yr2Var.name.startsWith('___')) {
									this.yr2Lists.links.push([yr2Var.name, this.yr2VarsText(yr2Var)]);
								}
							}
							this.yr2VarsAdd(p, '@this');
							this.yr2VarsAdd(p, '@unit');
							this.yr2VarsAdd(p, '@ipt');
							this.yr2VarsAdd(p, '@thisx');
							this.yr2VarsAdd(p, '@thisy');
							this.yr2VarsAdd(p, '@mapw');
							this.yr2VarsAdd(p, '@maph');
							this.yr2VarsAdd(p, '@links');

							for (let v in this.yr2Lists.links) {
								p.table(null, ttt => {
									ttt.labelWrap('[' + v + ']' + this.yr2Lists.links[v][0]).width(200);
									const yr2Var = this.yr2Lists.links[v][1];
									const lw = ttt.labelWrap(yr2Var).width(300).get();
									lw.update(() => {
										lw.setText(yr2Var);
									});
								}).minHeight(35);
								p.row();
							}
						}).maxHeight(650).width(500).padLeft(10).left();
					}).top();
				}

				if (this.yr2Setting.editor) {
					t.table(null, tt => {
						tt.table(null, ttt => {
							ttt.check('', this.yr2Setting.jump, c => {
								this.yr2Setting.jump = c;
							}).size(40);
							ttt.button(Icon.refresh, Styles.cleari, () => {
								this.yr2Setting.codeAdd = false;
								this.yr2Lists.codeAddLine = this.yr2Lists.codes.length - 1;
								this.yr2TableBuild();
							}).size(40);
							ttt.button(Icon.link, Styles.cleari, () => {
								if (this.yr2Lists.codeAdd != '') {
									if (this.yr2Setting.jump)
										for (let i in this.yr2Lists.codes)
											if (this.yr2Lists.codes[i].startsWith('jump')) {
												let words = this.yr2Lists.codes[i].split(' ');
												words[1] -= -1 * (words[1] >= this.yr2Lists.codeAddLine);
												this.yr2Lists.codes[i] = words.join(' ');
											}
									this.yr2Lists.codes.splice(this.yr2Lists.codeAddLine, 0, this.yr2Lists.codeAdd);
									this.yr2Lists.codeAdd = '';
								}
								if (this.yr2Setting.jump)
									this.yr2CodeJump(this.yr2Lists.codes.length);
								let code = '';
								for (let v of this.yr2Lists.codes)
									if (v != '')
										code += v + '\n';
								this.updateCode(code);
								this.yr2Setting.codeAdd = false;
								this.yr2TableBuild();
							}).size(40);
							ttt.field(this.yr2Lists.codeAddLine, v => {
								this.yr2Lists.codeAddLine = v;
							}).width(75);
							ttt.button(Icon.add, Styles.cleari, () => {
								this.yr2Setting.codeAdd = true;
								this.yr2TableBuild();
							}).size(40);
							ttt.button(Icon.download, Styles.cleari, () => {
								let clipboard = Core.app.getClipboardText().replace("\r\n", "\n").replace("\n ", "\n").split('\n');
								if (this.yr2Setting.jump)
									for (let i in this.yr2Lists.codes)
										if (this.yr2Lists.codes[i].startsWith('jump')) {
											let words = this.yr2Lists.codes[i].split(' ');
											words[1] -= -1 * (words[1] >= this.yr2Lists.codeAddLine) * clipboard.length;
											this.yr2Lists.codes[i] = words.join(' ');
										}
								for (let i in clipboard)
									this.yr2Lists.codes.splice(this.yr2Lists.codeAddLine - '' + (i - ''), 0, clipboard[i]);
								if (this.yr2Setting.jump)
									this.yr2CodeJump(this.yr2Lists.codes.length);
								let code = '';
								for (let v of this.yr2Lists.codes)
									if (v != '')
										code += v + '\n';
								this.updateCode(code);
								this.yr2TableBuild();
							}).size(40);
						}).top().height(50);
						tt.row();
						const pC = tt.pane(p => {
							this.yr2Lists.codes = this.code.split('\n');
							for (let line in this.yr2Lists.codes) {
								if (this.yr2Setting.codeAdd && line == this.yr2Lists.codeAddLine) {
									p.table(null, ttt => {
										ttt.labelWrap('+').width(50);
										ttt.field(this.yr2Lists.codeAdd, f => {
											this.yr2Lists.codeAdd = f;
										}).width(450);
									}).left().height(50);
									p.row();
								}
								p.table(null, ttt => {
									ttt.labelWrap(line).width(50);
									const fieldLine = line;
									ttt.field(this.yr2Lists.codes[fieldLine], f => {
										this.yr2Lists.codes[fieldLine] = f;
									}).width(450);
								}).left().height(50);
								p.row();
							}
						}).maxHeight(600).width(500).padLeft(10).left().get();
					}).top();
				}
			});
		}
	},


	yr2VarsText: v => {
		if (v.isobj)
			if (typeof (v.objval) == 'string') return '"' + v.objval + '"';
			else if (v.objval + '' == 'null') return 'null';
			else return '[' + this.LExecutor.PrintI.toString(v.objval) + ']\n' + v.objval;
		else return '' + v.numval;
	},

	yr2VarsAdd(table, name) {
		const yr2Var = this.yr2Lists.constants[name];
		let yr2VarText = this.yr2VarsText(yr2Var);
		let yr2VarTime = 0;
		const yr2VarColor = () => {
			if (this.yr2VarsText(yr2Var) + '' != yr2VarText) {
				yr2VarText = this.yr2VarsText(yr2Var);
				yr2VarTime = Time.time;
			}
			if (Time.time < yr2VarTime + 5) return '[green]';
			else return '';
		}
		table.table(null, t => {
			const lwN = t.labelWrap('').width(200).get();
			const lwV = t.labelWrap('').width(300).get();
			lwN.update(() => {
				lwN.setText(yr2VarColor() + yr2Var.name);
			});
			lwV.update(() => {
				lwV.setText(yr2VarColor() + this.yr2VarsText(yr2Var));
			});
		}).minHeight(35);
		table.row();
	},

	yr2CodeJump(jumpLine) {
		for (let i in this.yr2Lists.codes) {
			if (this.yr2Lists.codes[i] == '') {
				this.yr2Lists.codes.splice(i, 1);
				this.yr2CodeJump(i);
			}
			if (this.yr2Lists.codes[i] && this.yr2Lists.codes[i].startsWith('jump')) {
				let words = this.yr2Lists.codes[i].split(' ');
				words[1] -= words[1] >= jumpLine;
				this.yr2Lists.codes[i] = words.join(' ');
			}
		}
	}
});



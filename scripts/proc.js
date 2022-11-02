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
		break: false,
		forward: false,
		stop: false,
		skip: false,
		link: false,
	},

	yr2Lists: {
		codes: [],
		codeAddLine: 0,
		codeAdd: '',
		constants: {},
		links: [],
		counter: 0,
		fC: null,
		breakPoint: [],
	},

	yr2Table: new Table(),

	yr2TableBuild() {
		this.yr2Table.clear();
		if (this.yr2Setting.yr2table) {
			this.yr2Table.table(null, t => {
				t.button(Icon.rotate, Styles.cleari, () => {
					if (this.executor.vars[0] !== undefined)
						if (this.yr2Setting.lock) {
							this.executor.vars[0].numval = NaN;
							this.yr2Lists.counter = 0;
							this.yr2TableBuild();
						}else this.executor.vars[0].numval = 0;
				}).size(40);

				t.button(Icon.trash, Styles.cleari, () => {
					this.updateCode(this.code);
					if (this.yr2Setting.lock && this.executor.vars[0] !== undefined)
						this.executor.vars[0].numval = NaN;
					this.executor.textBuffer.setLength(0);
					this.yr2Lists.counter = 0;
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
									this.yr2Setting.skip = false;
									this.yr2Setting.forward = false;
									if (this.executor.vars[0].numval > this.code.split('\n').length - 2 || !this.executor.vars[0].numval > 0)
										this.yr2Lists.counter = 0;
									else this.yr2Lists.counter = this.executor.vars[0].numval + 0;
									this.yr2Lists.fC.setText('' + this.yr2Lists.counter);
								}else {
									this.executor.vars[0].numval = this.yr2Lists.counter + 0;
									this.yr2Setting.break = false;
									this.yr2TableBuild();
								}
							}).size(40);
							ttt.button(Icon.trash, Styles.cleari, () => {
								this.yr2Lists.breakPoint = [];
							}).size(40);
							ttt.button(Icon.add, Styles.cleari, () => {
								if (this.yr2Lists.breakPoint.indexOf(this.yr2Lists.counter) == -1)
									this.yr2Lists.breakPoint.push(this.yr2Lists.counter);
								else this.yr2Lists.breakPoint.splice(this.yr2Lists.breakPoint.indexOf(this.yr2Lists.counter), 1);
							}).size(40);
							this.yr2Lists.fC = ttt.field('' + this.yr2Lists.counter, v => {
								this.yr2Lists.counter = v - '';
							}).width(75).get();
							ttt.button(Icon.left, Styles.cleari, () => {
								this.yr2Setting.forward = true;
							}).size(40);
							ttt.button(Icon.undo, Styles.cleari, () => {
								this.yr2Setting.skip = true;
								this.yr2Setting.forward = true;
							}).size(40);
							ttt.check('', this.yr2Setting.break, c => {
								this.yr2Setting.break = c;
							}).size(40);
						}).top().height(50);;
						tt.row();
						const p = tt.pane(p => {
							this.yr2Lists.codes = this.code.split('\n');
							for (let line in this.yr2Lists.codes) {
								if (this.yr2Lists.codes[line] == '') break;
								p.table(null, ttt => {
									const lwLine = line - '';
									const lwP = ttt.labelWrap('').width(25).get();
									lwP.update(() => {
										if (this.yr2Setting.lock)
											if (lwLine == this.yr2Lists.counter)
												if (this.yr2Lists.breakPoint.indexOf(lwLine) != -1)
													if (this.yr2Setting.break)
														lwP.setText('[green]>[red]> ');
													else lwP.setText('[green]>[gray]> ');
												else lwP.setText('[green]>> ');
											else if (this.yr2Lists.breakPoint.indexOf(lwLine) != -1)
												if (this.yr2Setting.break)
													lwP.setText('[red]> ');
												else lwP.setText('[gray]> ');
											else lwP.setText('');
										else if (this.executor.vars[0] !== undefined && lwLine == this.executor.vars[0].numval || lwLine == 0 && this.executor.vars[0].numval > this.code.split('\n').length - 2)
											if (this.yr2Lists.breakPoint.indexOf(lwLine) != -1)
												if (this.yr2Setting.break) {
													if (this.executor.vars[0].numval > this.code.split('\n').length - 2 || !this.executor.vars[0].numval > 0)
														this.yr2Lists.counter = 0;
													else this.yr2Lists.counter = this.executor.vars[0].numval + 0;
													this.yr2Setting.lock = true;
													lwP.setText('>[red]> ');
													this.yr2TableBuild();
												}
												else lwP.setText('>[gray]> ');
											else lwP.setText('>> ');
										else if (this.yr2Lists.breakPoint.indexOf(lwLine) != -1)
											if (this.yr2Setting.break)
												lwP.setText('[red]> ');
											else lwP.setText('[gray]> ');
										else lwP.setText('');
									}).alignment = Align.right;
									ttt.labelWrap(line).width(50);
									ttt.labelWrap(this.yr2Lists.codes[line]).width(425);
									ttt.touchable = Touchable.enabled;
									ttt.tapped(() => {
										if (this.yr2Lists.breakPoint.indexOf(lwLine) == -1)
											this.yr2Lists.breakPoint.push(lwLine);
										else this.yr2Lists.breakPoint.splice(this.yr2Lists.breakPoint.indexOf(lwLine), 1);
									});
								}).left().height(40);
								p.row();
							}
						}).maxHeight(600).width(500).padLeft(10).left().get();
						p.setupFadeScrollBars(0.5, 0.25);
						p.setFadeScrollBars(true);
					}).top().get().update(() => {
						if (this.yr2Setting.lock) {
							if (this.yr2Setting.stop) {
								if (this.executor.vars[0].numval != this.yr2Lists.counter) {
									if (this.yr2Lists.counter > this.code.split('\n').length - 2)
										this.yr2Lists.counter = 0;
									else this.yr2Lists.counter = this.executor.vars[0].numval + 0;
									if (!this.yr2Setting.skip || !this.yr2Lists.breakPoint.length || this.yr2Lists.breakPoint.indexOf(this.yr2Lists.counter) != -1) {
										this.executor.vars[0].numval = NaN;
										this.yr2Setting.forward = false;
										this.yr2Setting.stop = false;
										this.yr2Setting.skip = false;
										this.yr2Lists.fC.setText('' + this.yr2Lists.counter);
									}
								}
							}else if (this.yr2Setting.forward) {
								this.yr2Setting.stop = true;
								this.executor.vars[0].numval = this.yr2Lists.counter + 0;
							} else if (this.executor.vars[0] !== undefined)
								this.executor.vars[0].numval = NaN;
						}
					});
				}
				if (this.yr2Setting.vars) {
					t.table(null, tt => {
						const p = tt.pane(p => {
							this.yr2Lists.constants = {};
							this.yr2Lists.links = [];
							for (let v of this.executor.vars) {
								const yr2Var = v;
								let yr2VarText = this.yr2VarsText(yr2Var);
								let yr2VarTime = 0;
								let yr2DrawTime = 0;
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
										ttt.table().width(5);
										const lwV = ttt.labelWrap('').width(295).get();
										lwN.update(() => {
											lwN.setText(yr2VarColor() + yr2Var.name);
										});
										lwV.update(() => {
											lwV.setText(yr2VarColor() + this.yr2VarsText(yr2Var));
										});
										ttt.touchable = Touchable.enabled;
										ttt.tapped(() => {
											yr2DrawTime = Time.time;
										});
									}).minHeight(35).update(() => {
										if (this.yr2Setting.link || Time.time < yr2DrawTime + 32)
											if (yr2Var.objval instanceof Building) {
												Drawf.select(yr2Var.objval.x, yr2Var.objval.y, yr2Var.objval.block.size * 4, Color.valueOf("ff0000"));
												Drawf.line(Color.valueOf("ff0000"), this.x, this.y, yr2Var.objval.x, yr2Var.objval.y);
											} else if (yr2Var.objval instanceof Unit) {
												Drawf.select(yr2Var.objval.x, yr2Var.objval.y, yr2Var.objval.type.hitSize, Color.valueOf("ff0000"));
												Drawf.line(Color.valueOf("ff0000"), this.x, this.y, yr2Var.objval.x, yr2Var.objval.y);
											}
									});
									p.row();
								} else if (yr2Var.name.startsWith('@')) {
									this.yr2Lists.constants[yr2Var.name] = yr2Var;
								} else if (!yr2Var.name.startsWith('___')) {
									this.yr2Lists.links.push(yr2Var);
								}
							}
							if (this.yr2Lists.constants['@this']) {
								let yr2TextBuffer = this.executor.textBuffer + '';
								let yr2TextTime = 0;
								const yr2TextColor = () => {
									if (this.executor.textBuffer + '' != yr2TextBuffer) {
										yr2TextBuffer = this.executor.textBuffer + '';
										yr2TextTime = Time.time;
									}
									if (Time.time < yr2TextTime + 5) return '[green]';
									else return '';
								}
								p.table(null, ttt => {
									const lwN = ttt.labelWrap('').width(200).get();
									ttt.table().width(5);
									const lwT = ttt.labelWrap('').width(295).get();
									lwN.update(() => {
										lwN.setText(yr2TextColor() + 'textBuffer');
									});
									lwT.update(() => {
										lwT.setText(yr2TextColor() + '"' + this.executor.textBuffer + '"');
									});
								})
								this.yr2VarsAdd(p, '@this');
								this.yr2VarsAdd(p, '@unit');
								this.yr2VarsAdd(p, '@ipt');
								this.yr2VarsAdd(p, '@thisx');
								this.yr2VarsAdd(p, '@thisy');
								this.yr2VarsAdd(p, '@mapw');
								this.yr2VarsAdd(p, '@maph');
								this.yr2VarsAdd(p, '@links');
							}
							for (let v in this.yr2Lists.links) {
								const yr2Var = this.yr2Lists.links[v];
								let yr2DrawTime = 0;
								p.table(null, ttt => {
									ttt.labelWrap('[' + v + ']' + yr2Var.name).width(200);
									ttt.table().width(5);
									const lwL = ttt.labelWrap('').width(295).get();
									lwL.update(() => {
										lwL.setText(this.yr2VarsText(yr2Var));
									});
									ttt.touchable = Touchable.enabled;
									ttt.tapped(() => {
										yr2DrawTime = Time.time;
									});
								}).minHeight(35).update(() => {
									if (this.yr2Setting.link || Time.time < yr2DrawTime + 32)
										if (yr2Var.objval instanceof Building) {
											Drawf.select(yr2Var.objval.x, yr2Var.objval.y, yr2Var.objval.block.size * 4, Color.valueOf("ff0000"));
											Drawf.line(Color.valueOf("ff0000"), this.x, this.y, yr2Var.objval.x, yr2Var.objval.y);
										} else if (yr2Var.objval instanceof Unit) {
											Drawf.select(yr2Var.objval.x, yr2Var.objval.y, yr2Var.objval.type.hitSize, Color.valueOf("ff0000"));
											Drawf.line(Color.valueOf("ff0000"), this.x, this.y, yr2Var.objval.x, yr2Var.objval.y);
										}
								});;
								p.row();
							}
						}).maxHeight(650).width(500).padLeft(10).left().get();
						p.setupFadeScrollBars(0.5, 0.25);
						p.setFadeScrollBars(true);
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
							ttt.check('', this.yr2Setting.link, c => {
								this.yr2Setting.link = c;
							}).size(40);
						}).top().height(50);
						tt.row();
						const p = tt.pane(p => {
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
						p.setupFadeScrollBars(0.5, 0.25);
						p.setFadeScrollBars(true);
					}).top();
				}
			});
		}
	},


	yr2VarsText: v => {
		if (v.isobj)
			if (typeof (v.objval) == 'string') return '"' + v.objval + '"';
			else if (v.objval + '' == 'null') return 'null';
			else if (v.objval instanceof Unit)
				return '[' + v.objval.type.name + '#' + v.objval.id + ']\n[' + v.objval.flag + ']';
			else if (v.objval instanceof Building)
				return v.objval.block.name + '#' + v.objval.id;
			else return '' + v.objval;
		else return '' + v.numval;
	},

	yr2VarsAdd(table, name) {
		const yr2Var = this.yr2Lists.constants[name];
		let yr2VarText = this.yr2VarsText(yr2Var);
		let yr2VarTime = 0;
		let yr2DrawTime = 0;
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
			t.table().width(5);
			const lwV = t.labelWrap('').width(295).get();
			lwN.update(() => {
				lwN.setText(yr2VarColor() + yr2Var.name);
			});
			lwV.update(() => {
				lwV.setText(yr2VarColor() + this.yr2VarsText(yr2Var));
			});
			t.touchable = Touchable.enabled;
			t.tapped(() => {
				yr2DrawTime = Time.time;
			});
		}).minHeight(35).update(() => {
			if (this.yr2Setting.link || Time.time < yr2DrawTime + 32)
				if (yr2Var.objval instanceof Building) {
					Drawf.select(yr2Var.objval.x, yr2Var.objval.y, yr2Var.objval.block.size * 4, Color.valueOf("ff0000"));
					Drawf.line(Color.valueOf("ff0000"), this.x, this.y, yr2Var.objval.x, yr2Var.objval.y);
				} else if (yr2Var.objval instanceof Unit) {
					Drawf.select(yr2Var.objval.x, yr2Var.objval.y, yr2Var.objval.type.hitSize, Color.valueOf("ff0000"));
					Drawf.line(Color.valueOf("ff0000"), this.x, this.y, yr2Var.objval.x, yr2Var.objval.y);
				}
		});;
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



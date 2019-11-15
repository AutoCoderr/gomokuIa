function IA() {
	this.tree = null;
	this.profondeurMax = 2;
	this.distanceFromUsedCase = 1;

	this.startIa = function(profondeurMax, distanceFromUsedCase,callback) {
		this.profondeurMax = profondeurMax;
		this.distanceFromUsedCase = distanceFromUsedCase;
		this.tree = {branchs: [], gomoku: gomoku, p: 0, parent: null, toKeep: null};
		this.genTreeMinMax(copyTab(gomoku), 0, this.tree, currentPlayer, (l,c) => {
			console.log(this.tree);
			if (callback != null) {
				callback(l,c);
			}
		});
	};

	this.genTreeMinMax = async function(gomoku, p, node, player, callback = null) {
		let elagage = false;
		let alreadyFound = {};
		let branchs = node.branchs;
		for (let l=0;l<gomoku.length;l++) {
			for (let c=0;c<gomoku[l].length;c++) {
				if (gomoku[l][c] !== 0) {
					for (let i=0;i<arroundsCase.length;i++) {
						let nb = 1;
						while(nb <= this.distanceFromUsedCase && existCell(l+(nb*arroundsCase[i].l),c+(nb*arroundsCase[i].c),gomoku)) {
							if (gomoku[l+(nb*arroundsCase[i].l)][c+(nb*arroundsCase[i].c)] === 0 &&
								typeof(alreadyFound[(l+(nb*arroundsCase[i].l))+"-"+(c+(nb*arroundsCase[i].c))]) === "undefined") {

								alreadyFound[(l+(nb*arroundsCase[i].l))+"-"+(c+(nb*arroundsCase[i].c))] = true;

								let gomokub = copyTab(gomoku);
								gomokub[l+(nb*arroundsCase[i].l)][c+(nb*arroundsCase[i].c)] = player;
								branchs.push({gomoku: gomokub, p: p+1,
											l: l+(nb*arroundsCase[i].l), c: c+(nb*arroundsCase[i].c), parent: node, toKeep: null});
								let lastBranch = branchs[branchs.length-1];
								let eval = evalScoreOrGetWinner(gomokub);
								if (typeof(eval.winner) !== "undefined") {
									if (eval.winner === currentPlayer) {
										lastBranch.score = 1000;
									} else if (eval.winner === (currentPlayer === 1 ? 2 : 1)) {
										lastBranch.score = -1000;
									}
								} else if (p < this.profondeurMax) {
									lastBranch.branchs = [];
									await this.genTreeMinMax(gomokub, p+1, lastBranch, player === 1 ? 2 : 1);
								} else {
									lastBranch.score = eval[currentPlayer]-eval[currentPlayer === 1 ? 2 : 1];
								}
								if (node.toKeep == null) {
									node.toKeep = lastBranch;
								} else if ((p%2 === 0 && node.toKeep.score < lastBranch.score) ||
									       (p%2 === 1 && node.toKeep.score > lastBranch.score)) {
									node.toKeep = lastBranch;
								}
								if (node.parent != null) {
									if(node.parent.toKeep != null) {
										if ((p%2 === 1 && lastBranch.score < node.parent.toKeep.score) ||
											(p%2 === 0 && lastBranch.score > node.parent.toKeep.score)) {
											elagage = true;
											break;
										}
									}
								}
							} else {
								break;
							}
							nb += 1;
						}
						if (elagage) break;
					}
					if (elagage) break;
				}
			}
			if (elagage) break;
		}
		node.score = node.toKeep == null ? 0 : node.toKeep.score;
		if (p === 0) {
			if (node.toKeep != null) {
				node.l = node.toKeep.l;
				node.c = node.toKeep.c;
			} else {
				node.l = Math.round(Math.random()*(gomoku.length-1));
				node.c = Math.round(Math.random()*(gomoku[0].length-1));
			}
			callback(node.l,node.c);
		}
	};
}

function copyTab(tab) {
	let tab2 = [];
	for (let l=0;l<tab.length;l++) {
		tab2.push([]);
		for (let c=0;c<tab[l].length;c++) {
			tab2[l].push(tab[l][c]);
		}
	}
	return tab2;
}

async function getStringOfTree(tree, callback, p=0) {
	for (let i=0;i<tree.branchs.length;i++) {
		tree.branchs[i].parent = null;
		if (typeof(tree.branchs[i].branchs) == "object") {
			await getStringOfTree(tree.branchs[i],null, p + 1);
		}
	}
	if (p === 0) {
		callback(JSON.stringify(tree));
	}
}
